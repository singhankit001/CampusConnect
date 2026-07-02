# CampusConnect: Smart University Management & Student Ecosystem Platform

CampusConnect is a premium, production-grade SaaS platform designed to centralize university operations, student engagement, placement tracking, and academic feedback. It was built with a strong emphasis on **advanced database architecture**, featuring complex normalized schemas, triggers, views, stored procedures, and analytical SQL queries.

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for Admins, Faculty, Students, and Recruiters.
*   **Advanced Database Mechanics:**
    *   **23 Normalized Tables** mapping out a complex university ecosystem.
    *   **Automated Triggers** for calculating attendance rates, maintaining application status histories, and logging audit activities.
    *   **Stored Procedures** wrapping complex transactions (e.g., Event Registration, Course Enrollment) with ACID compliance.
    *   **Analytical Views** precomputing student performance, department statistics, and placement success metrics.
*   **Academic Management:** Course registration, attendance tracking, and assignment submissions.
*   **Student Ecosystem:** Discover and join campus clubs, view university announcements, and register for events.
*   **Placement Portal:** Recruiters post internships, students apply (with CGPA validation checks enforced at the database level), and track their application lifecycle.
*   **Feedback System:** Students can rate courses, faculty, and facilities, aggregated into live dashboards.
*   **Live SQL Workbench:** An interactive frontend portal to execute and visualize the output of complex analytical SQL queries against the live database.

## 🏗️ Tech Stack

*   **Database:** PostgreSQL (Core focus of the project) + Prisma ORM (for schema management and initial migrations)
*   **Backend:** Node.js, Express, TypeScript
*   **Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide React (Premium glassmorphic UI)

## 📁 Repository Structure

*   `/backend` - Express API Server and Prisma Schema.
*   `/frontend` - React Vite Application.
*   `/database` - Raw SQL DDL files (Views, Triggers, Functions).
*   `/scripts` - Automation scripts for database verification and testing.
*   `/docs` - Generated query outputs and documentation.

## 🚀 Quick Start

Please refer to the [INSTALLATION.md](./INSTALLATION.md) for detailed instructions on setting up the PostgreSQL database, configuring environment variables, and starting the development servers.

## 📚 Documentation

*   [Database Architecture (DATABASE.md)](./DATABASE.md)
*   [API Documentation (API_DOCUMENTATION.md)](./API_DOCUMENTATION.md)
*   [Evaluation Project Report (PROJECT_REPORT.md)](./PROJECT_REPORT.md)

---
*Developed as a comprehensive End-Semester DBMS Evaluation Project.*
