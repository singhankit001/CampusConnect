-- 1. StudentPerformanceView
CREATE OR REPLACE VIEW "StudentPerformanceView" AS
SELECT 
    s.id AS "student_id",
    s."userId" AS "user_id",
    s."rollNo" AS "roll_no",
    u."firstName" AS "first_name",
    u."lastName" AS "last_name",
    d.name AS "department_name",
    d.code AS "department_code",
    s.batch,
    s.cgpa,
    COUNT(DISTINCT e.id) AS "total_courses_enrolled",
    COUNT(DISTINCT CASE WHEN e.status = 'COMPLETED' THEN e.id END) AS "courses_completed",
    COUNT(DISTINCT CASE WHEN e.status = 'ACTIVE' THEN e.id END) AS "courses_active",
    COALESCE(AVG(sub."marksObtained" / NULLIF(a."maxMarks", 0) * 100), 0) AS "average_assignment_percentage",
    COALESCE(AVG(e."attendanceRate"), 0) AS "average_attendance_rate"
FROM "Student" s
JOIN "User" u ON s."userId" = u.id
JOIN "Department" d ON s."departmentId" = d.id
LEFT JOIN "Enrollment" e ON s.id = e."studentId"
LEFT JOIN "AssignmentSubmission" sub ON s.id = sub."studentId"
LEFT JOIN "Assignment" a ON sub."assignmentId" = a.id
GROUP BY s.id, u.id, d.id;

-- 2. CourseAnalyticsView
CREATE OR REPLACE VIEW "CourseAnalyticsView" AS
SELECT 
    c.id AS "course_id",
    c.code AS "course_code",
    c.title AS "course_title",
    c.credits AS "course_credits",
    d.code AS "department_code",
    CONCAT(u."firstName", ' ', u."lastName") AS "assigned_faculty",
    COUNT(DISTINCT e.id) AS "total_enrolled_students",
    COALESCE(AVG(e."attendanceRate"), 0) AS "average_class_attendance",
    COALESCE(AVG(sub."marksObtained"), 0) AS "average_assignment_marks",
    COUNT(DISTINCT a.id) AS "total_assignments"
FROM "Course" c
JOIN "Department" d ON c."departmentId" = d.id
LEFT JOIN "CourseAssignment" ca ON c.id = ca."courseId"
LEFT JOIN "Faculty" f ON ca."facultyId" = f.id
LEFT JOIN "User" u ON f."userId" = u.id
LEFT JOIN "Enrollment" e ON c.id = e."courseId"
LEFT JOIN "Assignment" a ON c.id = a."courseId"
LEFT JOIN "AssignmentSubmission" sub ON a.id = sub."assignmentId"
GROUP BY c.id, d.id, u.id;

-- 3. PlacementStatisticsView
CREATE OR REPLACE VIEW "PlacementStatisticsView" AS
SELECT 
    comp.id AS "company_id",
    comp.name AS "company_name",
    comp.industry,
    comp.website,
    COUNT(DISTINCT i.id) AS "total_internships_posted",
    COUNT(DISTINCT app.id) AS "total_applications_received",
    COUNT(DISTINCT CASE WHEN app.status = 'OFFERED' THEN app.id END) AS "total_offers_extended",
    CASE 
        WHEN COUNT(DISTINCT app.id) > 0 THEN 
            ROUND((COUNT(DISTINCT CASE WHEN app.status = 'OFFERED' THEN app.id END)::DECIMAL / COUNT(DISTINCT app.id)::DECIMAL) * 100, 2)
        ELSE 0 
    END AS "selection_rate_percentage",
    COALESCE(AVG(i.stipend), 0) AS "average_stipend"
FROM "Company" comp
LEFT JOIN "Internship" i ON comp.id = i."companyId"
LEFT JOIN "Application" app ON i.id = app."internshipId"
GROUP BY comp.id;

-- 4. ClubParticipationView
CREATE OR REPLACE VIEW "ClubParticipationView" AS
SELECT 
    cl.id AS "club_id",
    cl.name AS "club_name",
    cl.category,
    CONCAT(u."firstName", ' ', u."lastName") AS "president_name",
    COUNT(DISTINCT m.id) AS "total_members",
    COUNT(DISTINCT CASE WHEN m.role = 'COORDINATOR' THEN m.id END) AS "coordinator_count",
    COUNT(DISTINCT ev.id) AS "total_events_organized",
    COUNT(DISTINCT reg.id) AS "total_event_registrations"
FROM "Club" cl
JOIN "Student" s ON cl."presidentId" = s.id
JOIN "User" u ON s."userId" = u.id
LEFT JOIN "ClubMember" m ON cl.id = m."clubId"
LEFT JOIN "Event" ev ON cl.id = ev."clubId"
LEFT JOIN "EventRegistration" reg ON ev.id = reg."eventId"
GROUP BY cl.id, u.id;
