-- 1. Departments
INSERT INTO "Department" (id, name, code, "createdAt", "updatedAt") VALUES
('dept-1', 'Computer Science and Engineering', 'CSE', NOW(), NOW()),
('dept-2', 'Electronics and Communication Engineering', 'ECE', NOW(), NOW()),
('dept-3', 'Mechanical Engineering', 'ME', NOW(), NOW()),
('dept-4', 'Science and Humanities', 'S&H', NOW(), NOW());

-- 2. Users (Admin, Faculty, Students)
INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt") VALUES
('user-admin-1', 'admin@campusconnect.edu', '$2a$10$xyz', 'Albus', 'Dumbledore', 'ADMIN', NOW(), NOW()),
('user-fac-1', 'faculty.alan@campusconnect.edu', '$2a$10$xyz', 'Alan', 'Turing', 'FACULTY', NOW(), NOW()),
('user-fac-2', 'faculty.grace@campusconnect.edu', '$2a$10$xyz', 'Grace', 'Hopper', 'FACULTY', NOW(), NOW()),
('user-fac-3', 'faculty.ada@campusconnect.edu', '$2a$10$xyz', 'Ada', 'Lovelace', 'FACULTY', NOW(), NOW()),
('user-stu-1', 'student1@campusconnect.edu', '$2a$10$xyz', 'James', 'Smith', 'STUDENT', NOW(), NOW()),
('user-stu-2', 'student2@campusconnect.edu', '$2a$10$xyz', 'Mary', 'Johnson', 'STUDENT', NOW(), NOW()),
('user-stu-3', 'student3@campusconnect.edu', '$2a$10$xyz', 'John', 'Williams', 'STUDENT', NOW(), NOW()),
('user-stu-4', 'student4@campusconnect.edu', '$2a$10$xyz', 'Patricia', 'Brown', 'STUDENT', NOW(), NOW()),
('user-stu-5', 'student5@campusconnect.edu', '$2a$10$xyz', 'Robert', 'Jones', 'STUDENT', NOW(), NOW());

-- 3. Faculty Profiles
INSERT INTO "Faculty" (id, "userId", designation, "departmentId", "officeHours", "createdAt", "updatedAt") VALUES
('fac-1', 'user-fac-1', 'Professor', 'dept-1', 'Mon/Wed 10-12', NOW(), NOW()),
('fac-2', 'user-fac-2', 'Associate Professor', 'dept-1', 'Tue/Thu 14-16', NOW(), NOW()),
('fac-3', 'user-fac-3', 'Professor', 'dept-2', 'Wed/Fri 11-13', NOW(), NOW());

-- 4. Student Profiles
INSERT INTO "Student" (id, "userId", "rollNo", "departmentId", batch, cgpa, "createdAt", "updatedAt") VALUES
('stu-1', 'user-stu-1', 'ROLL2023-1000', 'dept-1', '2023-2027', 9.2, NOW(), NOW()),
('stu-2', 'user-stu-2', 'ROLL2023-1001', 'dept-2', '2023-2027', 8.5, NOW(), NOW()),
('stu-3', 'user-stu-3', 'ROLL2023-1002', 'dept-3', '2023-2027', 7.9, NOW(), NOW()),
('stu-4', 'user-stu-4', 'ROLL2023-1003', 'dept-4', '2023-2027', 8.8, NOW(), NOW()),
('stu-5', 'user-stu-5', 'ROLL2023-1004', 'dept-1', '2023-2027', 9.5, NOW(), NOW());

-- 5. Courses
INSERT INTO "Course" (id, code, title, credits, "departmentId", "createdAt", "updatedAt") VALUES
('course-1', 'CS101', 'Intro to CS', 3, 'dept-1', NOW(), NOW()),
('course-2', 'CS302', 'Database Systems', 4, 'dept-1', NOW(), NOW()),
('course-3', 'EC201', 'Digital Electronics', 3, 'dept-2', NOW(), NOW()),
('course-4', 'ME101', 'Engg Mechanics', 3, 'dept-3', NOW(), NOW()),
('course-5', 'MA201', 'Discrete Math', 3, 'dept-4', NOW(), NOW());
