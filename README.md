<div align="center">

# 🎓 CampusConnect

**The Ultimate Smart University Management & Student Ecosystem Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]()
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)]()
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)]()
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)]()

*Bridging the gap between Academic Management, Student Engagement, and Career Placements into a single, high-performance SaaS ecosystem.*

</div>

<br />



## 📖 Project Overview

Modern universities operate in silos—academic records are stored in one system, club activities in another, and placement drives on external platforms. 

**CampusConnect** solves this fragmentation by unifying all university operations into a single, highly normalized, enterprise-grade platform. Built with a focus on **Database Optimization** and **Role-Based Access Control (RBAC)**, it delivers a deeply personalized experience tailored specifically for Admins, Faculty, Students, and Recruiters.

### Key Benefits:
- 🚀 **Unified Operations:** Manage courses, clubs, events, and job applications in one hub.
- 🔒 **Military-Grade Security:** Fully isolated role-based routing and JWT state management.
- ⚡ **Extreme Performance:** Leverages PostgreSQL Views, Triggers, and Stored Procedures to offload complex analytical processing to the database layer.
- 🎨 **Premium UX/UI:** Crafted with a modern, fluid glassmorphic design system to maximize user engagement.

---

## ✨ Key Features Matrix

### 🔐 Authentication & Authorization
* **JWT Stateless Auth:** Secure token-based session management.
* **Strict RBAC:** 4 isolated roles (`ADMIN`, `STUDENT`, `FACULTY`, `RECRUITER`).
* **Bcrypt Hashing:** Irreversible password encryption.

### 📚 Academic Management
* **Course Enrollment:** Automated bulk and individual student enrollments.
* **Attendance Tracking:** Real-time percentage calculation via DB Triggers.
* **Assignments:** Due-date tracking and automated late-submission flagging.

### 🎯 Placements & Recruitment
* **Company Profiles:** Dedicated recruiter dashboards.
* **Internship Board:** Dynamic job postings with deadline enforcement.
* **Application Funnel:** Tracking candidates from Applied → Interview → Offered.

### 🌍 Student Ecosystem
* **Club Management:** Roles, memberships, and hierarchies.
* **Event Registrations:** Capacity-locked event booking.
* **University Announcements:** Global targeted broadcasting.

### 📊 Advanced Analytics
* **Role-Specific Dashboards:** Real-time statistical summaries tailored to the user.
* **Interactive Charts:** Recharts integration for visual data representation.
* **Precomputed Views:** Heavy aggregations calculated natively via PostgreSQL Views.

---

## 🛠️ Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + Vite | Fast, modern client-side rendering |
| **Backend Framework** | Node.js + Express.js | Robust, modular API routing |
| **Language** | TypeScript | End-to-end type safety |
| **Database** | PostgreSQL (v14+) | Highly relational, ACID compliant data storage |
| **ORM** | Prisma | Schema migrations and type-safe querying |
| **Styling** | Tailwind CSS | Utility-first, responsive glassmorphic UI |
| **Data Visualization** | Recharts | Interactive SVG dashboard charts |
| **Authentication** | JWT + bcryptjs | Secure identity verification |
| **3D/Animations** | Framer Motion + Three.js | Premium scroll and micro-interactions |

---

## 🏗️ Architecture Overview

### 1. System Architecture
```mermaid
graph LR
    Client[React/Vite Frontend] <--> |REST API / JSON| Server[Node/Express Backend]
    Server <--> |Prisma ORM| Database[(PostgreSQL)]
    
    subgraph Frontend
    UI[Tailwind UI]
    Charts[Recharts]
    end
    
    subgraph Backend
    Auth[JWT Middleware]
    Routes[Modular Routers]
    end
```

### 2. Request Lifecycle
```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Controller
    participant DB
    Client->>Middleware: GET /api/analytics/student-dashboard
    Middleware->>Middleware: Validate JWT & Verify Role
    Middleware->>Controller: Authenticated Request
    Controller->>DB: Query StudentPerformanceView
    DB-->>Controller: Return Aggregated JSON
    Controller-->>Client: 200 OK (Data payload)
```

---

## 📂 Project Structure

```text
CampusConnect/
├── backend/
│   ├── prisma/             # Schema definitions and seed scripts
│   ├── src/
│   │   ├── middleware/     # JWT and RBAC guards
│   │   ├── routes/         # Modular domain-driven APIs (crud/students.ts, etc.)
│   │   ├── index.ts        # Express application entry point
│   │   └── types.ts        # Global backend TS interfaces
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI (Navbar, Sidebar, Card)
│   │   ├── pages/          # Full page views (Dashboard, Login)
│   │   ├── index.css       # Global styles and Tailwind directives
│   │   └── main.tsx        # React root execution
├── database/               # Raw SQL files (schema.sql, views.sql, triggers.sql, queries.sql)
└── PROJECT_REPORT.md       # Exhaustive DBMS academic documentation
```

---

## 🗄️ Database Design

CampusConnect utilizes a strictly normalized relational database comprising **26 tables**.

### Core ER Diagram

```mermaid
erDiagram
    User ||--o| Student : "1:1"
    User ||--o| Faculty : "1:1"
    User ||--o| Recruiter : "1:1"
    Department ||--o{ Student : "1:M"
    Department ||--o{ Faculty : "1:M"
    Department ||--o{ Course : "1:M"
    Course ||--o{ Enrollment : "1:M"
    Student ||--o{ Enrollment : "1:M"
    Course ||--o{ Attendance : "1:M"
    Student ||--o{ Attendance : "1:M"
    Course ||--o{ Assignment : "1:M"
    Assignment ||--o{ AssignmentSubmission : "1:M"
    Company ||--o{ Internship : "1:M"
    Internship ||--o{ Application : "1:M"
```

---

## 🌐 API Documentation (Core Routes)

The backend exposes dozens of modular routes. Below is a snapshot of the primary architectural endpoints:

| Method | Endpoint | Purpose | Auth Required | Body/Query |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT | ❌ No | `{ email, password }` |
| `GET` | `/api/crud/students` | Fetch paginated student directory | ✅ Yes | `?page=1&limit=10` |
| `POST` | `/api/crud/internships` | Post a new placement drive | ✅ `RECRUITER` | `{ title, stipend, deadline...}` |
| `GET` | `/api/analytics/student-dashboard/:id`| Fetch precomputed student metrics | ✅ `STUDENT` | URL Param: `id` |
| `GET` | `/api/analytics/admin-dashboard` | Fetch university-wide statistics | ✅ `ADMIN` | None |

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher running locally)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/singhankit001/CampusConnect.git
cd CampusConnect
```

### 2. Environment Setup
Create `.env` files in both backend and frontend directories.
**`backend/.env`**
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/campusconnect?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
```

### 3. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 4. Database Initialization
```bash
cd backend
# Push the schema to your local PostgreSQL instance
npx prisma db push

# Seed the database with mock realistic data
npm run db:seed
```

### 5. Run the Application
You will need two terminal windows:
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

---

## 🛡️ Security Features
- **Stateless Authorization:** Eliminates session hijacking via securely signed JWTs.
- **Bcrypt Salt Hashing:** Prevents dictionary and rainbow table attacks on user passwords.
- **Middleware Guards:** Prevents unauthorized endpoint execution by evaluating token role claims before controller logic runs.
- **Input Validation:** Ensuring data integrity on critical POST/PUT mutations.

---

## ⚡ Performance Optimizations
- **PostgreSQL Views (`views.sql`):** Rather than using Node.js to iterate over thousands of academic records to calculate averages, CampusConnect uses database Views to return pre-computed O(1) aggregations directly to the dashboard.
- **Active Triggers (`triggers.sql`):** Cascade operations and attendance aggregations are fired asynchronously at the database engine level, significantly reducing API response times.
- **Vite Bundling:** The frontend utilizes Vite's Rollup configuration for aggressive dead-code elimination and fast HMR (Hot Module Replacement).

---

## 🚦 Deployment Guide (Production)

The platform is designed to be easily deployed on modern PaaS providers.

**Backend (Render / Railway):**
1. Connect your GitHub repository.
2. Set Build Command: `npm install && npm run build && npx prisma generate`
3. Set Start Command: `npm start`
4. Inject `DATABASE_URL` (Supabase/Neon) and `JWT_SECRET` in provider environment settings.

**Frontend (Vercel / Netlify):**
1. Connect GitHub repository.
2. Framework Preset: Vite
3. Build Command: `npm run build`
4. Set `VITE_API_BASE_URL` to point to your live backend domain.

---

## 🗺️ Product Roadmap

- [x] **Phase 1:** Core Authentication, Role segregation, and Monorepo setup.
- [x] **Phase 2:** Advanced PostgreSQL Schema, Triggers, and Views implementation.
- [x] **Phase 3:** Glassmorphic UI redesign and Recharts dashboard integration.
- [x] **Phase 4:** API Modularization (Decoupling monolithic routers).
- [ ] **Phase 5:** Real-time chat for Student-Faculty communication (WebSockets).
- [ ] **Phase 6:** Alumni Mentorship Portal.
- [ ] **Phase 7:** Automated PDF Transcript Generation.

---

## 💡 Why This Project Stands Out

CampusConnect is not a standard "To-Do List" or basic CRUD application. It was engineered to showcase **Senior-level architectural decisions**:
1. **Database Mastery:** Operating a 26-table normalized schema with complex relational integrity (UUIDs, Cascades, Enums) demonstrates a deep understanding of data modeling.
2. **Beyond Standard ORMs:** While Prisma is used for basic operations, the system relies on raw SQL Views, Triggers, and Stored Procedures for heavy lifting—proving competency in native SQL optimization.
3. **Enterprise UI/UX:** The interface rejects generic component libraries in favor of a bespoke, premium Tailwind CSS design system featuring fluid typography and fluid layouts.
4. **Modular Scalability:** The backend routes are perfectly decoupled by domain, ensuring the codebase can scale to hundreds of endpoints without becoming a maintenance nightmare.

---

## 👨‍💻 Author

**Ankit Singh**
- GitHub: [@singhankit001](https://github.com/singhankit001)
- Portfolio / LinkedIn: *[Insert Link]*

*Always open to discussing software architecture, database design, and frontend engineering!*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <i>If you found this repository helpful or interesting, please consider dropping a ⭐!</i>
</div>
