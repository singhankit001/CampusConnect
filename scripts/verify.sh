#!/bin/bash
set -e

DB_NAME="campusconnect_db"
DB_USER="ankitsingh"
DB_PORT="5432"
DB_HOST="localhost"

echo "========================================================================="
echo "                CampusConnect DBMS Engine Verification System"
echo "========================================================================="

run_query() {
    local num=$1
    local title=$2
    local query=$3
    
    echo ""
    echo "-------------------------------------------------------------------------"
    echo "Query #$num: $title"
    echo "-------------------------------------------------------------------------"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$query"
}

# 1. INNER JOIN
run_query "1" "INNER JOIN - Fetch Student details with Department names" \
"SELECT s.id AS student_id, s.\"rollNo\" AS roll_no, u.\"firstName\" AS first_name, u.\"lastName\" AS last_name, d.name AS department_name
FROM \"Student\" s
JOIN \"User\" u ON s.\"userId\" = u.id
JOIN \"Department\" d ON s.\"departmentId\" = d.id
LIMIT 5;"

# 2. LEFT JOIN
run_query "2" "LEFT JOIN - List courses and their assigned faculty (including unassigned)" \
"SELECT c.code, c.title, CONCAT(u.\"firstName\", ' ', u.\"lastName\") AS faculty_name
FROM \"Course\" c
LEFT JOIN \"CourseAssignment\" ca ON c.id = ca.\"courseId\"
LEFT JOIN \"Faculty\" f ON ca.\"facultyId\" = f.id
LEFT JOIN \"User\" u ON f.\"userId\" = u.id
ORDER BY c.code;"

# 3. RIGHT JOIN
run_query "3" "RIGHT JOIN - Recruiter and company associations, tracking companies without active recruiters" \
"SELECT comp.name AS company_name, u.\"firstName\" AS recruiter_name, r.designation
FROM \"Recruiter\" r
JOIN \"User\" u ON r.\"userId\" = u.id
RIGHT JOIN \"Company\" comp ON r.\"companyId\" = comp.id;"

# 4. GROUP BY + HAVING
run_query "4" "GROUP BY + HAVING - Courses with average attendance above 80% and at least 3 students" \
"SELECT c.code, c.title, COUNT(e.id) AS student_count, ROUND(AVG(e.\"attendanceRate\")::numeric, 2) AS avg_attendance
FROM \"Course\" c
JOIN \"Enrollment\" e ON c.id = e.\"courseId\"
GROUP BY c.id, c.code, c.title
HAVING COUNT(e.id) >= 3 AND AVG(e.\"attendanceRate\") > 80.0;"

# 5. SCALAR SUBQUERY
run_query "5" "SCALAR SUBQUERY - Retrieve details of student with the highest GPA" \
"SELECT s.id, s.\"rollNo\", u.\"firstName\", u.\"lastName\", s.cgpa
FROM \"Student\" s
JOIN \"User\" u ON s.\"userId\" = u.id
WHERE s.cgpa = (SELECT MAX(cgpa) FROM \"Student\");"

# 6. CORRELATED SUBQUERY
run_query "6" "CORRELATED SUBQUERY - Students scoring above average GPA in their respective department" \
"SELECT s.id, s.\"rollNo\", u.\"firstName\" AS first_name, d.code AS dept_code, s.cgpa
FROM \"Student\" s
JOIN \"User\" u ON s.\"userId\" = u.id
JOIN \"Department\" d ON s.\"departmentId\" = d.id
WHERE s.cgpa > (
    SELECT AVG(sub.cgpa) 
    FROM \"Student\" sub 
    WHERE sub.\"departmentId\" = s.\"departmentId\"
)
ORDER BY dept_code, s.cgpa DESC
LIMIT 5;"

# 7. NESTED QUERY
run_query "7" "NESTED QUERY - List clubs with active memberships exceeding the average club size" \
"SELECT c.name, COUNT(m.id) AS member_count
FROM \"Club\" c
JOIN \"ClubMember\" m ON c.id = m.\"clubId\"
GROUP BY c.id, c.name
HAVING COUNT(m.id) > (
    SELECT AVG(member_cnt)
    FROM (
        SELECT COUNT(id) AS member_cnt
        FROM \"ClubMember\"
        GROUP BY \"clubId\"
    ) AS club_sizes
);"

# 8. WINDOW FUNCTION (RANK)
run_query "8" "WINDOW FUNCTION (RANK) - Rank students by CGPA within their departments" \
"SELECT s.\"rollNo\", u.\"firstName\", u.\"lastName\", d.code AS dept_code, s.cgpa,
       RANK() OVER (PARTITION BY s.\"departmentId\" ORDER BY s.cgpa DESC) as cgpa_rank
FROM \"Student\" s
JOIN \"User\" u ON s.\"userId\" = u.id
JOIN \"Department\" d ON s.\"departmentId\" = d.id
LIMIT 8;"

# 9. WINDOW FUNCTION (LEAD/LAG)
run_query "9" "WINDOW FUNCTION (LAG) - Time gaps between consecutive assignments in a course" \
"SELECT c.code AS course_code, a.title AS assignment_title, a.\"dueDate\"::date,
       LAG(a.\"dueDate\"::date) OVER (PARTITION BY a.\"courseId\" ORDER BY a.\"dueDate\" ASC) AS prev_due_date,
       a.\"dueDate\"::date - LAG(a.\"dueDate\"::date) OVER (PARTITION BY a.\"courseId\" ORDER BY a.\"dueDate\" ASC) AS days_between
FROM \"Assignment\" a
JOIN \"Course\" c ON a.\"courseId\" = c.id
ORDER BY course_code, a.\"dueDate\"
LIMIT 8;"

# 10. WINDOW FUNCTION (CUMULATIVE)
run_query "10" "WINDOW FUNCTION - Running sum of registrations over time for a popular event" \
"SELECT e.title AS event_title, r.\"registrationDate\"::date, u.email,
       COUNT(r.id) OVER (PARTITION BY r.\"eventId\" ORDER BY r.\"registrationDate\" ASC) AS cumulative_registrations
FROM \"EventRegistration\" r
JOIN \"Event\" e ON r.\"eventId\" = e.id
JOIN \"User\" u ON r.\"userId\" = u.id
LIMIT 8;"

# 11. VIEW 1 (StudentPerformanceView)
run_query "11" "VIEW - Query StudentPerformanceView for critical low attendance (below 85%)" \
"SELECT student_id, roll_no, first_name, last_name, round(average_attendance_rate::numeric, 2) AS attendance, total_courses_enrolled
FROM \"StudentPerformanceView\"
WHERE average_attendance_rate < 85.0
LIMIT 5;"

# 12. VIEW 2 (CourseAnalyticsView)
run_query "12" "VIEW - Query CourseAnalyticsView to analyze courses performance" \
"SELECT course_code, course_title, total_enrolled_students, round(average_class_attendance::numeric, 2) AS avg_attendance, round(average_assignment_marks::numeric, 2) AS avg_marks
FROM \"CourseAnalyticsView\"
ORDER BY average_class_attendance ASC;"

# 13. VIEW 3 (PlacementStatisticsView)
run_query "13" "VIEW - Query PlacementStatisticsView to analyze industry success rates" \
"SELECT company_name, industry, total_internships_posted, total_applications_received, selection_rate_percentage, average_stipend
FROM \"PlacementStatisticsView\"
ORDER BY selection_rate_percentage DESC;"

# 14. COMPLEX MULTI-TABLE SUMMARY
run_query "14" "COMPLEX SUMMARY - Get full statistics of departments" \
"SELECT d.name AS dept_name, d.code AS dept_code,
       (SELECT COUNT(*) FROM \"Student\" s WHERE s.\"departmentId\" = d.id) AS student_count,
       (SELECT COUNT(*) FROM \"Faculty\" f WHERE f.\"departmentId\" = d.id) AS faculty_count,
       (SELECT COUNT(*) FROM \"Course\" c WHERE c.\"departmentId\" = d.id) AS course_count
FROM \"Department\" d;"

# 15. PI-VOT Funnel Analysis
run_query "15" "PI-VOT FUNNEL - Count applications per internship by recruiting stage" \
"SELECT i.title AS internship_title, comp.name AS company_name,
       COUNT(app.id) AS total_applications,
       SUM(CASE WHEN app.status = 'APPLIED' THEN 1 ELSE 0 END) AS status_applied,
       SUM(CASE WHEN app.status = 'SCREENING' THEN 1 ELSE 0 END) AS status_screening,
       SUM(CASE WHEN app.status = 'INTERVIEW' THEN 1 ELSE 0 END) AS status_interview,
       SUM(CASE WHEN app.status = 'OFFERED' THEN 1 ELSE 0 END) AS status_offered,
       SUM(CASE WHEN app.status = 'REJECTED' THEN 1 ELSE 0 END) AS status_rejected
FROM \"Internship\" i
JOIN \"Company\" comp ON i.\"companyId\" = comp.id
LEFT JOIN \"Application\" app ON i.id = app.\"internshipId\"
GROUP BY i.id, i.title, comp.name
ORDER BY total_applications DESC;"

echo ""
echo "========================================================================="
echo "                TESTING ADVANCED TRANSACTIONAL STORED PROCEDURES"
echo "========================================================================="
echo ""

# Test Stored Procedure 1: GenerateStudentReport
echo "Testing GenerateStudentReport stored function for Student James Smith..."
v_student_id=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "SELECT id FROM \"Student\" LIMIT 1;")
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT GenerateStudentReport('$v_student_id');"

# Test Stored Procedure 2: RegisterForEvent
echo "Testing RegisterForEvent transactional stored function..."
v_user_id=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "SELECT id FROM \"User\" WHERE role = 'STUDENT' LIMIT 1 OFFSET 20;")
v_event_id=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "SELECT id FROM \"Event\" LIMIT 1;")
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT RegisterForEvent('$v_user_id', '$v_event_id');"

# Test Trigger 1: ApplicationStatusHistory
echo "Testing Application trigger and ApplicationStatusHistory insertion..."
echo "Changing application status of student..."
v_app_id=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "SELECT id FROM \"Application\" LIMIT 1;")
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "UPDATE \"Application\" SET status = 'INTERVIEW' WHERE id = '$v_app_id';"

echo "Verifying ApplicationStatusHistory trigger updates..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM \"ApplicationStatusHistory\" WHERE \"applicationId\" = '$v_app_id';"

echo "Verifying placement notifications trigger updates..."
v_stud_id=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "SELECT \"studentId\" FROM \"Application\" WHERE id = '$v_app_id';")
v_user_id_notif=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -A -c "SELECT \"userId\" FROM \"Student\" WHERE id = '$v_stud_id';")
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT title, message, type FROM \"Notification\" WHERE \"userId\" = '$v_user_id_notif' AND type = 'PLACEMENT';"

echo ""
echo "========================================================================="
echo "               CampusConnect Verification Completed Successfully"
echo "========================================================================="
