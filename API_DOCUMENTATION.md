# API Documentation

The CampusConnect backend is built with Node.js, Express, and TypeScript, utilizing Prisma to interface with PostgreSQL.

## Base URL
`http://localhost:3000/api`

## Authentication (`/api/auth`)

All API routes (except Login/Register) require a Bearer token in the `Authorization` header.

*   `POST /api/auth/login` - Authenticates user and returns JWT token and Session details.
*   `GET /api/auth/me` - Validates token and restores session data.

## Analytics & Dashboards (`/api/analytics`)

*   `GET /api/analytics/admin-dashboard` - Fetches university-wide totals, recent activities, and metrics.
*   `GET /api/analytics/student-dashboard/:studentId` - Fetches student-specific performance (using `vw_student_performance`), upcoming assignments, and placement updates.
*   `GET /api/analytics/faculty-dashboard/:facultyId` - Fetches courses taught and pending assignments to grade.
*   `POST /api/analytics/execute-query` - Dynamically executes one of the 15 predefined complex SQL queries and returns the raw output and execution time.

## CRUD Controllers (`/api/crud`)

Generic RESTful endpoints for ecosystem entities.

*   **Students:** `GET /crud/students`, `POST /crud/students`, `DELETE /crud/students/:id`
*   **Faculty:** `GET /crud/faculty`, `POST /crud/faculty`, `DELETE /crud/faculty/:id`
*   **Courses:** `GET /crud/courses`, `POST /crud/courses`
*   **Assignments:** `GET /crud/assignments`, `POST /crud/assignments`
*   **Events:** `GET /crud/events`, `POST /crud/events`
*   **Clubs:** `GET /crud/clubs`, `POST /crud/clubs`
*   **Placements:** `GET /crud/internships`, `POST /crud/internships`
*   **Announcements:** `GET /crud/announcements`, `POST /crud/announcements`
*   **Feedback:** `GET /crud/feedbacks`, `POST /crud/feedbacks`

## Stored Procedure Endpoints (`/api/procedures`)

These endpoints execute raw SQL `SELECT * FROM function_name(...)` to trigger complex database transactions.

*   `POST /procedures/enroll` - Invokes `EnrollStudent(studentId, courseId, semester, academicYear)`.
*   `POST /procedures/apply-internship` - Invokes `ApplyForInternship(studentId, internshipId, resumeUrl, coverLetter)`.
*   `POST /procedures/register-event` - Invokes `RegisterForEvent(userId, eventId)`.
*   `POST /procedures/submit-assignment` - Invokes `SubmitAssignment(studentId, assignmentId, fileUrl)`.

## Error Handling

The API returns standard HTTP status codes:
*   `200 OK` - Success
*   `201 Created` - Resource created
*   `400 Bad Request` - Validation failed or Trigger threw an exception
*   `401 Unauthorized` - Missing or invalid JWT
*   `403 Forbidden` - User role does not have permission
*   `500 Internal Server Error` - Database/Server error

Responses follow a standard JSON structure:
```json
{
  "error": "Message describing the error"
}
```
