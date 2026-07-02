# CampusConnect - DBMS Viva Preparation Guide

This guide contains 50 professor-level viva questions and expected answers designed to help you defend the database architecture, design decisions, and SQL implementations of the CampusConnect project.

---

## 🏗️ Section 1: ER Diagram & Database Design

**1. Why did you choose PostgreSQL over a NoSQL database like MongoDB for this project?**
*Answer:* The university ecosystem is highly structured with clear relationships (e.g., Students belong to Departments, Enrollments link Students to Courses). PostgreSQL, a relational database, provides ACID compliance, strong referential integrity, and complex JOIN capabilities which are essential for academic grading and placement transactions, whereas NoSQL is better suited for unstructured or rapidly changing schemas.

**2. Explain the relationship between the `User`, `Student`, and `Faculty` tables.**
*Answer:* We implemented an inheritance-like structure using 1:1 relationships. The `User` table holds common authentication and profile data (email, password hash, role). The `Student` and `Faculty` tables store role-specific data and each has a `userId` foreign key that references `User.id` with a `UNIQUE` constraint to enforce the 1:1 cardinality.

**3. What is an Entity-Relationship (ER) model and how did it guide your schema creation?**
*Answer:* An ER model is a conceptual representation of data requirements. It helped identify strong entities (e.g., Student, Course) and weak/associative entities (e.g., Enrollment). By mapping these relationships (1:1, 1:N, M:N), we translated the conceptual model into the physical relational schema in PostgreSQL.

**4. How did you resolve the Many-to-Many (M:N) relationship between Students and Courses?**
*Answer:* We introduced a junction (or associative) table called `Enrollment`. It contains foreign keys referencing both `Student` and `Course`, along with attributes specific to the relationship, such as `semester`, `academicYear`, and `grade`.

**5. How is the M:N relationship between Clubs and Students handled?**
*Answer:* Through the `ClubMember` junction table, which links `clubId` and `studentId` and tracks the specific `role` (e.g., Member, Coordinator) and `joinDate` of the student in that club.

**6. What are the advantages of using UUIDs as primary keys instead of auto-incrementing integers?**
*Answer:* UUIDs provide global uniqueness across distributed systems, make it harder for malicious users to guess record counts or scrape data sequentially, and allow IDs to be generated safely on the application side before inserting into the database.

**7. In your schema, what would happen if a `Department` is deleted?**
*Answer:* Currently, `Department` deletion is not configured to cascade. If attempted, the database will throw a foreign key constraint violation error because the department is heavily referenced by existing Students, Faculty, and Courses. This prevents accidental massive data loss.

**8. Explain the concept of referential integrity and where it is used in your project.**
*Answer:* Referential integrity ensures that relationships between tables remain consistent. For example, in the `Application` table, the `studentId` must exist in the `Student` table. If that student doesn't exist, the database rejects the insert, preventing orphaned records.

**9. What is a Composite Primary Key? Do you use them?**
*Answer:* A composite key uses multiple columns to uniquely identify a record. While our tables use UUIDs as single primary keys, we enforce uniqueness via composite `UNIQUE` constraints (e.g., `@@unique([studentId, courseId, semester, academicYear])` in `Enrollment`) to prevent duplicate enrollments for the same term.

**10. Why is the `Attendance` table separate from `Enrollment`?**
*Answer:* To maintain normalization. An enrollment spans an entire semester, but attendance is recorded daily. By separating them, we establish a 1:N relationship from `Enrollment` to `Attendance`, allowing us to track specific dates and statuses (Present, Absent) without repeating enrollment data.

---

## 📏 Section 2: Normalization

**11. Define 1st Normal Form (1NF) and how your database complies.**
*Answer:* 1NF requires that all table attributes are atomic (indivisible) and there are no repeating groups. Our tables comply by storing single values in every column; for instance, instead of a comma-separated list of courses in the `Student` table, we use the `Enrollment` junction table.

**12. Explain 2nd Normal Form (2NF).**
*Answer:* 2NF requires 1NF compliance and that all non-key attributes are fully functionally dependent on the entire primary key. Because we use single-column UUIDs as primary keys for every table, there can be no partial dependencies, inherently achieving 2NF.

**13. How did you achieve 3rd Normal Form (3NF) in CampusConnect?**
*Answer:* 3NF requires 2NF compliance and the elimination of transitive dependencies (where a non-key attribute depends on another non-key attribute). For example, a student's `departmentName` is NOT stored in the `Student` table; instead, only the `departmentId` is stored, and the name is retrieved via a JOIN to the `Department` table.

**14. What is Boyce-Codd Normal Form (BCNF)? Is your DB in BCNF?**
*Answer:* BCNF is a stricter version of 3NF where every determinant must be a candidate key. Given our schema's strict reliance on UUID primary keys and elimination of transitive dependencies, the database effectively meets BCNF requirements.

**15. Can over-normalization be a problem?**
*Answer:* Yes. While normalization reduces data redundancy, over-normalization requires excessive JOIN operations to retrieve basic data, which degrades read performance. We mitigated this by creating Views (e.g., `vw_student_performance`) to precompute complex joins for faster dashboard reads.

**16. Why did you store `attendanceRate` in the `Enrollment` table if it can be calculated from the `Attendance` table?**
*Answer:* This is intentional **denormalization** for performance optimization. Calculating the rate dynamically on every dashboard load across thousands of students is expensive. Instead, we use a database Trigger to update this field automatically when attendance is marked, balancing read speed with write complexity.

**17. What is an anomaly, and which types does normalization prevent?**
*Answer:* Anomalies are inconsistencies in data. Normalization prevents Insertion anomalies (inability to insert data without other data), Update anomalies (updating one record but missing duplicates), and Deletion anomalies (losing unintended data when deleting a record).

---

## ⚡ Section 3: Triggers & Active Database Concepts

**18. What is a Database Trigger?**
*Answer:* A trigger is a stored program in the database that automatically executes (or "fires") in response to specific DML events (INSERT, UPDATE, DELETE) on a particular table.

**19. Explain the purpose of `trg_attendance_change` in your project.**
*Answer:* It ensures the `attendanceRate` in the `Enrollment` table stays perfectly synced. Whenever a professor inserts or updates a record in the `Attendance` table, the trigger fires, recalculates the percentage of 'PRESENT' days for that student/course, and updates the `Enrollment` table.

**20. How does `trg_application_status_history` work?**
*Answer:* When an internship `Application` row is updated (e.g., status changes from SCREENING to INTERVIEW), the trigger automatically captures the old/new state and inserts an immutable audit record into the `ApplicationStatusHistory` table.

**21. What is the difference between a `BEFORE` trigger and an `AFTER` trigger?**
*Answer:* A `BEFORE` trigger fires before the DML operation is written to disk; it is often used for data validation or modifying incoming values. An `AFTER` trigger fires after the data is saved; it is used for auditing or cascading changes to other tables (which is how our audit triggers operate).

**22. How did you implement automated notifications?**
*Answer:* Using `trg_placement_notification`. If an application status changes to 'SELECTED' or 'REJECTED', the trigger automatically inserts a new row into the `Notification` table alerting the user. This removes the burden from the backend application code.

**23. What are the potential drawbacks of using too many triggers?**
*Answer:* Triggers can create "hidden logic" that makes debugging difficult for application developers. They can also cause cascading execution chains leading to lock contention and performance bottlenecks.

**24. Could you have handled the audit logging in the backend (Node.js) instead of using a Trigger?**
*Answer:* Yes, but placing it in the database via `trg_audit_user_activity` guarantees that the audit log is created regardless of how the data was modified (e.g., if a DBA manually updates a row via the SQL console, the trigger still catches it, whereas backend logic would be bypassed).

---

## 🛠️ Section 4: Stored Procedures & Transactions

**25. What is a Stored Procedure?**
*Answer:* A stored procedure is a precompiled set of SQL statements that can execute complex business logic directly on the database server.

**26. Explain the `ApplyForInternship` stored procedure.**
*Answer:* It validates business rules at the database level before inserting an application. It verifies that the student's CGPA meets the internship's minimum requirement and checks if the current date is before the application deadline. If valid, it inserts the record; if not, it raises a SQL exception.

**27. What is ACID compliance in database transactions?**
*Answer:* ACID stands for Atomicity (all or nothing), Consistency (maintaining rules), Isolation (concurrent transactions don't interfere), and Durability (saved data isn't lost).

**28. How does `RegisterForEvent` ensure data consistency under heavy load?**
*Answer:* It uses transaction isolation to prevent race conditions (overbooking). It checks the current registration count against the event's `capacity`. If `count >= capacity`, it rolls back the transaction and throws an error, ensuring the event is never overbooked.

**29. What is the difference between a Stored Procedure and a Trigger?**
*Answer:* A trigger executes automatically based on a database event (INSERT/UPDATE/DELETE), whereas a stored procedure must be explicitly called by the application or a user (e.g., `SELECT * FROM ApplyForInternship(...)`).

**30. Why did you use `plpgsql` for your functions in PostgreSQL?**
*Answer:* PL/pgSQL is PostgreSQL's procedural language. It adds control structures like IF statements, loops, and variable declarations to standard SQL, which were necessary for the complex validation logic in our procedures.

**31. How does the `SubmitAssignment` procedure handle late submissions?**
*Answer:* It compares the `CURRENT_TIMESTAMP` against the `dueDate` of the referenced assignment. If it is past the deadline, it allows the insertion but automatically flags the submission status as 'LATE'.

---

## 👁️ Section 5: Views and Complex Queries

**32. What is a View, and why use it?**
*Answer:* A View is a virtual table representing the result of a stored query. We use views like `vw_student_performance` to abstract away complex JOINs and aggregations, making the backend queries much simpler and keeping dashboard load times fast.

**33. What is a Window Function? Did you use any?**
*Answer:* Window functions perform calculations across a set of table rows that are somehow related to the current row, without grouping them into a single output row. Yes, we used `RANK() OVER (PARTITION BY department_id ORDER BY cgpa DESC)` in our analytical queries to find department toppers.

**34. Explain the difference between `WHERE` and `HAVING`.**
*Answer:* `WHERE` filters rows before any grouping or aggregation occurs. `HAVING` filters the result set after the `GROUP BY` and aggregate functions (like COUNT or AVG) have been applied.

**35. What is a CTE (Common Table Expression)?**
*Answer:* A CTE is a temporary named result set defined using the `WITH` clause. We used CTEs to break down complex queries—like finding "At-Risk Students"—into readable, logical steps (e.g., first filtering attendance, then joining grades).

**36. Explain the `LEFT JOIN` used in `CourseAnalyticsView`.**
*Answer:* We use `LEFT JOIN` on tables like `Enrollment` and `AssignmentSubmission` so that even if a course has zero enrolled students or zero submissions, the course itself still appears in the analytics report with counts of 0, rather than disappearing completely (which an `INNER JOIN` would cause).

**37. What does `COALESCE` do in your SQL queries?**
*Answer:* `COALESCE` returns the first non-null value in a list. In our views, we use `COALESCE(AVG(attendanceRate), 0)` to ensure that if a student has no attendance records (which would return NULL), the view returns 0 instead, preventing math errors in the frontend.

**38. What is a Correlated Subquery?**
*Answer:* A subquery that depends on values from the outer query. It executes once for every row processed by the outer query. We used this to check if a student had applied to *all* internships offered by a specific top-tier company.

**39. How do you optimize query performance for large datasets?**
*Answer:* By adding Indexes on frequently filtered/joined columns (foreign keys, emails, roll numbers), writing efficient JOINs instead of nested subqueries, and using Views to precompile execution plans.

---

## 🔐 Section 6: Security & System Architecture

**40. What is an Index, and which columns did you index?**
*Answer:* An index is a data structure that improves the speed of data retrieval operations. We indexed all Foreign Keys (e.g., `userId`, `departmentId`, `courseId`) and unique lookups (`email`, `rollNo`) to optimize JOINs and searches.

**41. What is the architectural trade-off between Soft Deletes and Cascade Deletes?**
*Answer:* Cascade deletes (which we used) automatically wipe out all child records when a parent is deleted, preventing orphaned rows but risking massive accidental data loss. Soft Deletes (adding an `isDeleted = true` flag) preserve data for audit trails but require every single SELECT query in the app to filter out deleted rows. 

**42. How does Prisma ORM prevent SQL Injection?**
*Answer:* Prisma automatically uses parameterized queries (Prepared Statements). User input is sent separately from the query structure, making it impossible for malicious input strings to alter the executable SQL logic.

**43. Explain Role-Based Access Control (RBAC) in your system.**
*Answer:* The `UserRole` ENUM defines 4 roles (Admin, Faculty, Student, Recruiter). The Express backend uses a middleware `requireRole()` that inspects the JWT token. If a Student tries to hit the `POST /api/courses` endpoint, the middleware blocks it with a 403 Forbidden error before it reaches the database.

**44. How are passwords stored in the database?**
*Answer:* Passwords are never stored in plain text. They are hashed using the `bcrypt` algorithm with salt before insertion into the `User.passwordHash` column, protecting them even if the database is compromised.

**45. What is a JWT and how is it used in CampusConnect?**
*Answer:* JSON Web Token (JWT) is a secure, stateless authentication method. Upon login, the backend issues a signed JWT containing the user's ID and Role. The React frontend sends this token in the `Authorization` header on subsequent requests to authenticate against the API.

---

## 🎓 Section 7: General / Conceptual

**46. What was the most challenging part of designing this database?**
*Answer:* Integrating three disparate systems—Academic Grading, Extracurricular Clubs, and Placement tracking—into a single unified `User` identity without causing massive null-value columns, which we solved using the 1:1 `User` to `Student`/`Faculty` table inheritance pattern.

**47. If this application scales to 100,000 students, what database changes would you make?**
*Answer:* I would implement read-replicas for dashboard analytics, partition the `Attendance` and `ActivityLog` tables by month/year to manage table size, and migrate from Cascade deletes to Soft Deletes to preserve historical audit data.

**48. Why separate `ActivityLog` from the main tables?**
*Answer:* For separation of concerns. `ActivityLog` acts as an append-only ledger for security and debugging. Keeping it separate prevents bloat in the operational tables.

**49. What is a schema migration?**
*Answer:* A migration is a version-controlled script that modifies the database schema (adding tables, altering columns) incrementally. We used Prisma Migrate to safely evolve the database structure during development without destroying data.

**50. In conclusion, why does CampusConnect deserve a high grade?**
*Answer:* It goes beyond basic CRUD operations by pushing complex transaction logic (Procedures), data integrity (Triggers), and analytical reporting (Views, CTEs, Window Functions) down to the PostgreSQL engine, perfectly demonstrating the power of a Relational Database Management System.
