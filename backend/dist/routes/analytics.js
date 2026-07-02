"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANALYTICAL_QUERIES = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Ensure authenticated
router.use(auth_1.authenticateToken);
// =========================================================================
// SECTION 1: ROLE-SPECIFIC DASHBOARD ANALYTICS ENDPOINTS
// =========================================================================
// Student Dashboard Stats
router.get('/student-dashboard/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
        // 1. Fetch Student general details using the View
        const performanceView = await prisma.$queryRawUnsafe(`SELECT * FROM "StudentPerformanceView" WHERE student_id = $1`, studentId);
        const studentInfo = performanceView[0] || {};
        // 2. Fetch Active Enrollments
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId, status: 'ACTIVE' },
            include: { course: true }
        });
        // 3. Fetch Pending Assignments (due date in future, and no submission exists)
        const pendingAssignments = await prisma.$queryRawUnsafe(`SELECT a.id, a.title, a."dueDate", c.code AS "courseCode"
       FROM "Assignment" a
       JOIN "Course" c ON a."courseId" = c.id
       JOIN "Enrollment" e ON c.id = e."courseId"
       LEFT JOIN "AssignmentSubmission" s ON a.id = s."assignmentId" AND s."studentId" = $1
       WHERE e."studentId" = $1 
         AND e.status = 'ACTIVE' 
         AND a."dueDate" > NOW()
         AND s.id IS NULL
       ORDER BY a."dueDate" ASC`, studentId);
        // 4. Upcoming Club Events (registered or not, date in future)
        const upcomingEvents = await prisma.event.findMany({
            where: { date: { gte: new Date() } },
            include: { club: true },
            take: 5,
            orderBy: { date: 'asc' }
        });
        // 5. Active Applications
        const applications = await prisma.application.findMany({
            where: { studentId },
            include: { internship: { include: { company: true } } }
        });
        return res.json({
            summary: studentInfo,
            activeCoursesCount: enrollments.length,
            pendingAssignments,
            upcomingEvents,
            applications
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Faculty Dashboard Stats
router.get('/faculty-dashboard/:facultyId', async (req, res) => {
    const { facultyId } = req.params;
    try {
        // 1. Get Course Assignments for the faculty
        const courseAssignments = await prisma.courseAssignment.findMany({
            where: { facultyId },
            include: { course: true }
        });
        const courseIds = courseAssignments.map(ca => ca.courseId);
        // 2. Fetch Course Analytics from View for their courses
        let coursesAnalytics = [];
        if (courseIds.length > 0) {
            const placeholders = courseIds.map((_, i) => `$${i + 1}`).join(',');
            coursesAnalytics = await prisma.$queryRawUnsafe(`SELECT * FROM "CourseAnalyticsView" WHERE course_id IN (${placeholders})`, ...courseIds);
        }
        // 3. Count total students taught
        const studentCountResult = await prisma.enrollment.count({
            where: { courseId: { in: courseIds } }
        });
        // 4. Retrieve recent submissions for their courses
        const recentSubmissions = await prisma.assignmentSubmission.findMany({
            where: { assignment: { courseId: { in: courseIds } } },
            include: {
                student: { include: { user: true } },
                assignment: { include: { course: true } }
            },
            take: 6,
            orderBy: { submissionDate: 'desc' }
        });
        return res.json({
            assignedCourses: courseAssignments,
            analytics: coursesAnalytics,
            totalStudentsTaught: studentCountResult,
            recentSubmissions
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Recruiter Dashboard Stats
router.get('/recruiter-dashboard/:companyId', async (req, res) => {
    const { companyId } = req.params;
    try {
        // 1. Get company placements analytics from View
        const statsView = await prisma.$queryRawUnsafe(`SELECT * FROM "PlacementStatisticsView" WHERE company_id = $1`, companyId);
        const stats = statsView[0] || {
            total_internships_posted: 0,
            total_applications_received: 0,
            total_offers_extended: 0,
            selection_rate_percentage: 0,
            average_stipend: 0
        };
        // 2. Get active internship postings
        const activePostings = await prisma.internship.findMany({
            where: { companyId },
            orderBy: { deadline: 'asc' }
        });
        // 3. Application funnel breakdown
        const funnel = await prisma.$queryRawUnsafe(`SELECT app.status, COUNT(app.id) as count
       FROM "Application" app
       JOIN "Internship" i ON app."internshipId" = i.id
       WHERE i."companyId" = $1
       GROUP BY app.status`, companyId);
        // 4. Recent applicant profiles
        const recentApplicants = await prisma.application.findMany({
            where: { internship: { companyId } },
            include: {
                student: { include: { user: true, department: true } },
                internship: true
            },
            take: 5,
            orderBy: { applicationDate: 'desc' }
        });
        return res.json({
            summary: stats,
            activePostings,
            funnel,
            recentApplicants
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Admin Dashboard Stats
router.get('/admin-dashboard', async (req, res) => {
    try {
        const studentCount = await prisma.student.count();
        const facultyCount = await prisma.faculty.count();
        const recruiterCount = await prisma.recruiter.count();
        const clubCount = await prisma.club.count();
        const eventCount = await prisma.event.count();
        // Calculate university placement rate (offered vs total applicants)
        const apps = await prisma.application.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        const totalApps = apps.reduce((acc, curr) => acc + curr._count.id, 0);
        const offeredApps = apps.find(a => a.status === 'OFFERED')?._count.id || 0;
        const placementRate = totalApps > 0 ? parseFloat(((offeredApps / totalApps) * 100).toFixed(2)) : 0.0;
        // Placements by department
        const deptPlacements = await prisma.$queryRawUnsafe(`SELECT d.code AS department, 
              COUNT(app.id) AS total_applications,
              COUNT(CASE WHEN app.status = 'OFFERED' THEN 1 END) AS hires
       FROM "Student" s
       JOIN "Department" d ON s."departmentId" = d.id
       LEFT JOIN "Application" app ON s.id = app."studentId"
       GROUP BY d.id, d.code`);
        // Feedbacks count and class sizes
        const ratingSummary = await prisma.feedback.aggregate({
            _avg: { rating: true },
            _count: { id: true }
        });
        return res.json({
            counts: {
                students: studentCount,
                faculty: facultyCount,
                recruiters: recruiterCount,
                clubs: clubCount,
                events: eventCount
            },
            placementRate,
            deptPlacements,
            feedback: {
                averageRating: ratingSummary._avg.rating ? parseFloat(ratingSummary._avg.rating.toFixed(2)) : 0.0,
                totalFeedback: ratingSummary._count.id
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// SECTION 2: 15 ANALYTICAL SQL QUERIES DEFINITIONS AND RUNNER
// =========================================================================
exports.ANALYTICAL_QUERIES = [
    {
        id: 1,
        title: 'INNER JOIN: Student profile details with Department',
        purpose: 'Joins the Student, User, and Department tables to produce a unified roster of student profiles containing names, emails, and department descriptions.',
        sql: `SELECT s.id AS student_id, s."rollNo" AS roll_no, u."firstName" AS first_name, u."lastName" AS last_name, d.name AS department_name
FROM "Student" s
JOIN "User" u ON s."userId" = u.id
JOIN "Department" d ON s."departmentId" = d.id
LIMIT 5;`,
        explanation: 'Uses INNER JOINs to link Student to User via userId and Student to Department via departmentId. Filters out users who are not students. Limits results to 5 rows for display.'
    },
    {
        id: 2,
        title: 'LEFT JOIN: Course schedule assignments to Faculty staff',
        purpose: 'Displays all courses registered in the curriculum and maps their assigned faculty members, including courses that have no assigned faculty (unassigned sections).',
        sql: `SELECT c.code, c.title, CONCAT(u."firstName", ' ', u."lastName") AS faculty_name
FROM "Course" c
LEFT JOIN "CourseAssignment" ca ON c.id = ca."courseId"
LEFT JOIN "Faculty" f ON ca."facultyId" = f.id
LEFT JOIN "User" u ON f."userId" = u.id
ORDER BY c.code;`,
        explanation: 'Employs a LEFT OUTER JOIN starting from Course to CourseAssignment, ensuring every course is listed. It then performs subsequent joins to Faculty and User. Unassigned courses will display NULL (or empty) for faculty name.'
    },
    {
        id: 3,
        title: 'RIGHT JOIN: Recruiter and Company relations',
        purpose: 'Maps active recruiters to their employing companies. Uses a RIGHT JOIN to guarantee all partner companies are displayed even if they do not have active recruiters registered.',
        sql: `SELECT comp.name AS company_name, u."firstName" AS recruiter_name, r.designation
FROM "Recruiter" r
JOIN "User" u ON r."userId" = u.id
RIGHT JOIN "Company" comp ON r."companyId" = comp.id;`,
        explanation: 'A RIGHT OUTER JOIN with Company ensures companies without recruiters are not dropped. Companies without matching Recruiter rows display NULL values for recruiter fields.'
    },
    {
        id: 4,
        title: 'GROUP BY + HAVING: High Attendance Class Roster',
        purpose: 'Filters courses with high enrollment that average a high student attendance percentage (e.g. above 80% with at least 3 students enrolled).',
        sql: `SELECT c.code, c.title, COUNT(e.id) AS student_count, ROUND(AVG(e."attendanceRate")::numeric, 2) AS avg_attendance
FROM "Course" c
JOIN "Enrollment" e ON c.id = e."courseId"
GROUP BY c.id, c.code, c.title
HAVING COUNT(e.id) >= 3 AND AVG(e."attendanceRate") > 80.0;`,
        explanation: 'Aggregates enrollment counts and averages course attendanceRates using GROUP BY. Uses HAVING to filter grouped course records based on class size (>= 3) and attendance (> 80%).'
    },
    {
        id: 5,
        title: 'SCALAR SUBQUERY: Academic Valedictorian Roster',
        purpose: 'Identifies the student(s) holding the absolute maximum CGPA across the entire university.',
        sql: `SELECT s.id, s."rollNo", u."firstName", u."lastName", s.cgpa
FROM "Student" s
JOIN "User" u ON s."userId" = u.id
WHERE s.cgpa = (SELECT MAX(cgpa) FROM "Student");`,
        explanation: 'Calculates the highest CGPA value via a nested scalar subquery `(SELECT MAX(cgpa) FROM "Student")`. The main query then filters students whose CGPA matches this maximum.'
    },
    {
        id: 6,
        title: 'CORRELATED SUBQUERY: Departmental High Performers',
        purpose: 'Finds students who score higher than the average CGPA of their specific department, which highlights department-relative high performers.',
        sql: `SELECT s.id, s."rollNo", u."firstName" AS first_name, d.code AS dept_code, s.cgpa
FROM "Student" s
JOIN "User" u ON s."userId" = u.id
JOIN "Department" d ON s."departmentId" = d.id
WHERE s.cgpa > (
    SELECT AVG(sub.cgpa) 
    FROM "Student" sub 
    WHERE sub."departmentId" = s."departmentId"
)
ORDER BY dept_code, s.cgpa DESC
LIMIT 5;`,
        explanation: 'A correlated subquery evaluates the average CGPA for the current student\'s departmentId dynamically. The outer query compares each student\'s CGPA to their department average.'
    },
    {
        id: 7,
        title: 'NESTED SUBQUERY IN HAVING: Popular Club Finder',
        purpose: 'Finds clubs whose active membership count exceeds the average membership size across all clubs.',
        sql: `SELECT c.name, COUNT(m.id) AS member_count
FROM "Club" c
JOIN "ClubMember" m ON c.id = m."clubId"
GROUP BY c.id, c.name
HAVING COUNT(m.id) > (
    SELECT AVG(member_cnt)
    FROM (
        SELECT COUNT(id) AS member_cnt
        FROM "ClubMember"
        GROUP BY "clubId"
    ) AS club_sizes
);`,
        explanation: 'First, it calculates the sizes of all clubs, and averages them in a nested subquery. The outer query groups club memberships and uses HAVING to keep those larger than this average.'
    },
    {
        id: 8,
        title: 'WINDOW FUNCTION (RANK): Intra-Departmental Ranks',
        purpose: 'Ranks students within each department independently based on their CGPA score, highlighting class rankings.',
        sql: `SELECT s."rollNo", u."firstName", u."lastName", d.code AS dept_code, s.cgpa,
       RANK() OVER (PARTITION BY s."departmentId" ORDER BY s.cgpa DESC) as cgpa_rank
FROM "Student" s
JOIN "User" u ON s."userId" = u.id
JOIN "Department" d ON s."departmentId" = d.id
LIMIT 8;`,
        explanation: 'Uses the `RANK()` window function. The `PARTITION BY` clause isolates calculations to each department separately, sorting by cgpa descending to assign ranks.'
    },
    {
        id: 9,
        title: 'WINDOW FUNCTION (LAG): Assignment Time Gaps',
        purpose: 'Calculates the schedule pacing by finding the gap in days between the current assignment due date and the previous assignment due date within the same course.',
        sql: `SELECT c.code AS course_code, a.title AS assignment_title, a."dueDate"::date,
       LAG(a."dueDate"::date) OVER (PARTITION BY a."courseId" ORDER BY a."dueDate" ASC) AS prev_due_date,
       a."dueDate"::date - LAG(a."dueDate"::date) OVER (PARTITION BY a."courseId" ORDER BY a."dueDate" ASC) AS days_between
FROM "Assignment" a
JOIN "Course" c ON a."courseId" = c.id
ORDER BY course_code, a."dueDate"
LIMIT 8;`,
        explanation: 'Uses the `LAG()` window function to retrieve the due date of the previous assignment within the same course group (partitioned by courseId), then calculates the date difference.'
    },
    {
        id: 10,
        title: 'WINDOW FUNCTION (COUNT OVER): Event Registration Pacing',
        purpose: 'Calculates a cumulative sum (running total) of event registrations chronologically to analyze signup velocity.',
        sql: `SELECT e.title AS event_title, r."registrationDate"::date, u.email,
       COUNT(r.id) OVER (PARTITION BY r."eventId" ORDER BY r."registrationDate" ASC) AS cumulative_registrations
FROM "EventRegistration" r
JOIN "Event" e ON r."eventId" = e.id
JOIN "User" u ON r."userId" = u.id
LIMIT 8;`,
        explanation: 'Uses `COUNT(id) OVER (PARTITION BY eventId ORDER BY registrationDate ASC)` to perform a rolling sum of registration entries over time, grouped by each event.'
    },
    {
        id: 11,
        title: 'VIEW QUERY: Student Performance Dashboard Summary',
        purpose: 'Queries the `StudentPerformanceView` to immediately isolate students with low attendance (below 85%) for advisory letters.',
        sql: `SELECT student_id, roll_no, first_name, last_name, round(average_attendance_rate::numeric, 2) AS attendance, total_courses_enrolled
FROM "StudentPerformanceView"
WHERE average_attendance_rate < 85.0
LIMIT 5;`,
        explanation: 'Queries the pre-compiled `StudentPerformanceView`. This abstracts complex multi-table joins and calculations (enrollments, grading, attendance averages) into a simple select statement.'
    },
    {
        id: 12,
        title: 'VIEW QUERY: Course Analytics Class Average Metrics',
        purpose: 'Queries the `CourseAnalyticsView` to analyze syllabus performance by reviewing course enrollment and class averages.',
        sql: `SELECT course_code, course_title, total_enrolled_students, round(average_class_attendance::numeric, 2) AS avg_attendance, round(average_assignment_marks::numeric, 2) AS avg_marks
FROM "CourseAnalyticsView"
ORDER BY average_class_attendance ASC;`,
        explanation: 'Queries the pre-compiled `CourseAnalyticsView` which pulls data from Course, Faculty, Enrollment, and AssignmentSubmission tables, sorted by lowest attendance.'
    },
    {
        id: 13,
        title: 'VIEW QUERY: Recruiter and Company Placements Statistics',
        purpose: 'Queries the `PlacementStatisticsView` to fetch selection rates and stipend payouts for partner industries.',
        sql: `SELECT company_name, industry, total_internships_posted, total_applications_received, selection_rate_percentage, average_stipend
FROM "PlacementStatisticsView"
ORDER BY selection_rate_percentage DESC;`,
        explanation: 'Reads from the `PlacementStatisticsView` which joins Company, Internship, and Applications. Sorts companies based on their selection/offer conversion rates.'
    },
    {
        id: 14,
        title: 'COMPLEX COMBINED QUERY: Departmental Resource Count',
        purpose: 'Performs multiple sub-aggregations to present a total inventory summary of students, faculty, and courses offered in each department.',
        sql: `SELECT d.name AS dept_name, d.code AS dept_code,
       (SELECT COUNT(*) FROM "Student" s WHERE s."departmentId" = d.id) AS student_count,
       (SELECT COUNT(*) FROM "Faculty" f WHERE f."departmentId" = d.id) AS faculty_count,
       (SELECT COUNT(*) FROM "Course" c WHERE c."departmentId" = d.id) AS course_count
FROM "Department" d;`,
        explanation: 'Utilizes independent scalar subqueries embedded in the SELECT list, each matching on `departmentId` relative to the outer Department table, giving department counts.'
    },
    {
        id: 15,
        title: 'CONDITIONAL AGGREGATION / PIVOT: Recruitment Stages Funnel',
        purpose: 'Displays a matrix grid breakdown of application counts in each recruitment step (Applied, Screening, Interview, Offered, Rejected) for each posted internship.',
        sql: `SELECT i.title AS internship_title, comp.name AS company_name,
       COUNT(app.id) AS total_applications,
       SUM(CASE WHEN app.status = 'APPLIED' THEN 1 ELSE 0 END) AS status_applied,
       SUM(CASE WHEN app.status = 'SCREENING' THEN 1 ELSE 0 END) AS status_screening,
       SUM(CASE WHEN app.status = 'INTERVIEW' THEN 1 ELSE 0 END) AS status_interview,
       SUM(CASE WHEN app.status = 'OFFERED' THEN 1 ELSE 0 END) AS status_offered,
       SUM(CASE WHEN app.status = 'REJECTED' THEN 1 ELSE 0 END) AS status_rejected
FROM "Internship" i
JOIN "Company" comp ON i."companyId" = comp.id
LEFT JOIN "Application" app ON i.id = app."internshipId"
GROUP BY i.id, i.title, comp.name
ORDER BY total_applications DESC;`,
        explanation: 'Uses conditional sum expressions (`SUM(CASE WHEN status = ... THEN 1 ELSE 0 END)`) alongside GROUP BY to pivot individual status rows into columns per internship posting.'
    }
];
// GET list of all query definitions
router.get('/queries', (req, res) => {
    return res.json(exports.ANALYTICAL_QUERIES.map(q => ({ id: q.id, title: q.title, purpose: q.purpose, sql: q.sql, explanation: q.explanation })));
});
// POST to execute a specific query by ID
router.post('/queries/:id/run', async (req, res) => {
    const queryId = parseInt(req.params.id);
    const qDef = exports.ANALYTICAL_QUERIES.find(q => q.id === queryId);
    if (!qDef) {
        return res.status(404).json({ error: 'Query definition not found.' });
    }
    try {
        const results = await prisma.$queryRawUnsafe(qDef.sql);
        return res.json({
            id: qDef.id,
            title: qDef.title,
            purpose: qDef.purpose,
            sql: qDef.sql,
            explanation: qDef.explanation,
            results
        });
    }
    catch (err) {
        return res.status(500).json({ error: `Query failed to execute: ${err.message}` });
    }
});
exports.default = router;
