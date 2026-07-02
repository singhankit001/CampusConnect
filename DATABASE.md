# Database Architecture & Design

The `campusconnect_db` PostgreSQL database is the core of this project, featuring a highly normalized schema (3NF) containing 23 tables, advanced referential integrity, automated triggers, and complex views.

## 1. Entity Relationship (ER) Overview

The database models the physical and logical entities of a university ecosystem:

*   **Core Entities:** `User`, `Department`, `Course`, `Student`, `Faculty`
*   **Academic Operations:** `Enrollment`, `Attendance`, `Assignment`, `Submission`
*   **Ecosystem:** `Event`, `EventRegistration`, `Club`, `ClubMembership`, `Announcement`, `Feedback`
*   **Placements:** `Company`, `Internship`, `Application`, `ApplicationStatusHistory`
*   **System/Audit:** `Notification`, `ActivityLog`

### Key Relationships
*   `Student` and `Faculty` hold a 1:1 relationship with `User`.
*   `Student` has an M:N relationship with `Course` (resolved via `Enrollment`).
*   `Internship` has a 1:N relationship with `Application`.
*   `Department` has a 1:N relationship with `Course`, `Student`, and `Faculty`.

## 2. Advanced SQL Components

### 2.1 Triggers (`database/triggers.sql`)
Triggers are implemented to automate data integrity and audit trailing:
1.  **`trg_attendance_change`**: Automatically recalculates and updates the `attendanceRate` in the `Enrollment` table whenever a child `Attendance` record is inserted or updated.
2.  **`trg_application_status_history`**: Maintains an immutable log in `ApplicationStatusHistory` whenever a placement `Application.status` is modified.
3.  **`trg_placement_notification`**: Automatically generates a system `Notification` for the student when an internship application status is changed to 'SHORTLISTED', 'REJECTED', or 'SELECTED'.
4.  **`trg_audit_user_activity`**: Captures DML (Insert/Update) actions on critical tables (`User`, `Enrollment`, `Application`) and logs the JSON payload to `ActivityLog`.

### 2.2 Stored Functions/Procedures (`database/triggers.sql`)
Stored procedures wrap complex multi-step transactions, ensuring ACID compliance and centralized business logic.
1.  **`EnrollStudent(student_id, course_id, semester, academic_year)`**: Checks if the student is already enrolled. If not, safely inserts into `Enrollment`.
2.  **`ApplyForInternship(student_id, internship_id, resume_url, cover_letter)`**: Validates that the student's CGPA meets the internship's minimum requirement and that the deadline hasn't passed before inserting the `Application`.
3.  **`RegisterForEvent(user_id, event_id)`**: Performs a capacity check on the event. Rejects registration if capacity is full; otherwise, registers the user.
4.  **`SubmitAssignment(student_id, assignment_id, file_url)`**: Inserts a submission. If the current date is past the assignment deadline, it flags `isLate = true`.
5.  **`GenerateStudentReport(student_id)`**: Returns a compiled JSON document aggregating the student's personal details, course enrollments, attendance, and placement applications in a single query execution.

### 2.3 Analytical Views (`database/views.sql`)
Views precompute complex joins for dashboard analytics:
1.  **`vw_student_performance`**: Aggregates a student's total credits, current CGPA, total assignments submitted, and overall average attendance rate.
2.  **`vw_department_statistics`**: Calculates the number of students, faculty, and average CGPA per department.
3.  **`vw_course_enrollment_stats`**: Shows total enrollments and average attendance for every active course.
4.  **`vw_placement_success_rate`**: Calculates the application conversion metrics (Applied vs. Selected) per company and internship role.

## 3. Analytical Queries

The project contains 15 highly complex SQL queries demonstrating advanced database querying capabilities. These can be executed dynamically via the frontend **SQL Analytical Queries** portal.

**Query Types Included:**
*   Multi-table Joins (4+ tables)
*   Window Functions (`RANK()`, `ROW_NUMBER()`, `OVER (PARTITION BY)`)
*   Common Table Expressions (CTEs)
*   Correlated Subqueries
*   Aggregate Grouping (`GROUP BY`, `HAVING`)
*   Date/Time formatting and calculations

*Refer to the `scripts/verify.sh` output or the frontend dashboard to see these queries in action.*
