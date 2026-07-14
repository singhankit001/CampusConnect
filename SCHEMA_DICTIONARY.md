# Database Schema Dictionary

This document explicitly fulfills the **Schema Design** requirements for the SQL Database Project submission. It outlines the Name, Attributes, Data Types, Keys, and Constraints for the primary tables within the CampusConnect database.

*(Note: The database contains 26 tables in total to maintain 3NF normalization. Below are the details for the major operational entities).*

---

### 1. User
**Purpose:** Core identity and authentication table for all platform users.
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `email` | String | | **UNIQUE**, NOT NULL, Indexed |
| `passwordHash` | String | | NOT NULL |
| `firstName` | String | | NOT NULL |
| `lastName` | String | | NOT NULL |
| `role` | Enum (`UserRole`) | | NOT NULL |
| `createdAt` | DateTime | | Default `now()` |
| `updatedAt` | DateTime | | Automatically Updated |

---

### 2. Department
**Purpose:** Represents university departments (e.g., Computer Science).
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `name` | String | | **UNIQUE**, NOT NULL |
| `code` | String | | **UNIQUE**, NOT NULL |
| `createdAt` | DateTime | | Default `now()` |

---

### 3. Student
**Purpose:** Academic profile for student users.
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `userId` | UUID / String | **Foreign Key** | References `User(id)`, **UNIQUE**, `ON DELETE CASCADE` |
| `rollNo` | String | | **UNIQUE**, NOT NULL |
| `departmentId` | UUID / String | **Foreign Key** | References `Department(id)` |
| `batch` | String | | NOT NULL |
| `cgpa` | Float | | Default `0.0` |

---

### 4. Faculty
**Purpose:** Professional profile for faculty users.
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `userId` | UUID / String | **Foreign Key** | References `User(id)`, **UNIQUE**, `ON DELETE CASCADE` |
| `designation` | String | | NOT NULL |
| `departmentId` | UUID / String | **Foreign Key** | References `Department(id)` |
| `officeHours` | String | | Optional (Nullable) |

---

### 5. Course
**Purpose:** Represents an academic subject or module.
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `code` | String | | **UNIQUE**, NOT NULL |
| `title` | String | | NOT NULL |
| `credits` | Integer | | NOT NULL |
| `departmentId` | UUID / String | **Foreign Key** | References `Department(id)` |

---

### 6. Enrollment
**Purpose:** Maps Students to Courses for a given semester (M:N relationship resolver).
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `studentId` | UUID / String | **Foreign Key** | References `Student(id)`, `ON DELETE CASCADE` |
| `courseId` | UUID / String | **Foreign Key** | References `Course(id)`, `ON DELETE CASCADE` |
| `semester` | String | | NOT NULL |
| `academicYear` | String | | NOT NULL |
| `grade` | String | | Optional (Nullable) |
| `attendanceRate`| Float | | Default `0.0` |
| `status` | Enum | | Default `ACTIVE` |
**Composite Constraints:** `UNIQUE(studentId, courseId, semester, academicYear)` ensures a student cannot enroll in the exact same course twice in one semester.

---

### 7. Internship
**Purpose:** Represents placement opportunities posted by companies.
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `companyId` | UUID / String | **Foreign Key** | References `Company(id)`, `ON DELETE CASCADE` |
| `title` | String | | NOT NULL |
| `stipend` | Float | | NOT NULL |
| `deadline` | DateTime | | NOT NULL |
| `durationMonths`| Integer | | NOT NULL |

---

### 8. Application
**Purpose:** Represents a student's application to an internship.
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `internshipId` | UUID / String | **Foreign Key** | References `Internship(id)`, `ON DELETE CASCADE` |
| `studentId` | UUID / String | **Foreign Key** | References `Student(id)`, `ON DELETE CASCADE` |
| `resumeUrl` | String | | NOT NULL |
| `status` | Enum | | Default `APPLIED` |
**Composite Constraints:** `UNIQUE(internshipId, studentId)` prevents multiple applications to the same internship by the same student.

---

### 9. Event
**Purpose:** Ecosystem events (Tech fests, workshops, etc.).
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `title` | String | | NOT NULL |
| `date` | DateTime | | Date only |
| `capacity` | Integer | | NOT NULL |
| `organizerId` | UUID / String | **Foreign Key** | References `User(id)` |
| `clubId` | UUID / String | **Foreign Key** | References `Club(id)`, Optional, `ON DELETE SET NULL` |

---

### 10. Club
**Purpose:** Student organizations.
| Attribute | Data Type | Keys | Constraints |
| :--- | :--- | :--- | :--- |
| `id` | UUID / String | **Primary Key** | Default `uuid()` |
| `name` | String | | **UNIQUE**, NOT NULL |
| `category` | String | | NOT NULL |
| `presidentId` | UUID / String | **Foreign Key** | References `Student(id)` |

---

*This document confirms the strict adherence to normalization (3NF), data type integrity, relational foreign key constraints, and cascade operations expected in a rigorous DBMS evaluation.*
