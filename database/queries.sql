-- DBMS Project - 5 Mandatory Queries
-- Documenting the analytical queries used in the CampusConnect application.

-- 1. JOIN & FILTERING QUERY
-- Purpose: Find all students who are actively enrolled in a specific course (e.g., 'CS302') and have an attendance rate below 75%.
SELECT s."rollNo", u."firstName", u."lastName", c.code AS "courseCode", e."attendanceRate"
FROM "Student" s
JOIN "User" u ON s."userId" = u.id
JOIN "Enrollment" e ON s.id = e."studentId"
JOIN "Course" c ON e."courseId" = c.id
WHERE c.code = 'CS302' AND e.status = 'ACTIVE' AND e."attendanceRate" < 0.75;

-- 2. AGGREGATE FUNCTION & GROUP BY QUERY
-- Purpose: Calculate the total number of applications and the average stipend offered by each company.
SELECT comp.name AS "companyName", COUNT(app.id) AS "totalApplications", AVG(i.stipend) AS "averageStipend"
FROM "Company" comp
LEFT JOIN "Internship" i ON comp.id = i."companyId"
LEFT JOIN "Application" app ON i.id = app."internshipId"
GROUP BY comp.id, comp.name
ORDER BY "totalApplications" DESC;

-- 3. SUBQUERY
-- Purpose: Find the details of students who have a CGPA higher than the average CGPA of their respective department.
SELECT s."rollNo", u."firstName", u."lastName", s.cgpa, d.name AS "departmentName"
FROM "Student" s
JOIN "User" u ON s."userId" = u.id
JOIN "Department" d ON s."departmentId" = d.id
WHERE s.cgpa > (
    SELECT AVG(s2.cgpa)
    FROM "Student" s2
    WHERE s2."departmentId" = s."departmentId"
);

-- 4. VIEW DEFINITION & USAGE
-- Purpose: A View that aggregates student performance metrics to power the Student Dashboard.
-- (View defined in views.sql, here is the usage)
SELECT * FROM "StudentPerformanceView" WHERE student_id = 'stu-1';

-- 5. COMPLEX MULTI-JOIN & AGGREGATE (Placement Funnel)
-- Purpose: Analyze the placement application funnel (Applied -> Interview -> Offered) for a specific internship posting.
SELECT app.status, COUNT(app.id) as "count"
FROM "Application" app
JOIN "Internship" i ON app."internshipId" = i.id
WHERE i."companyId" = 'comp-1'
GROUP BY app.status
ORDER BY "count" DESC;
