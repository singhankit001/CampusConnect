# Installation & Setup Guide

## Prerequisites

1.  **Node.js** (v18 or higher)
2.  **PostgreSQL** (v14 or higher, running locally or remotely)
3.  **npm** (comes with Node.js)

## 1. Database Configuration

The project is configured to connect to a local PostgreSQL instance. 

1.  Ensure PostgreSQL is running.
2.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
3.  Create a `.env` file in the `/backend` directory and set your `DATABASE_URL`:
    ```env
    # Example format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
    DATABASE_URL="postgresql://ankitsingh@localhost:5432/campusconnect_db?schema=public"
    JWT_SECRET="super_secret_jwt_key_for_campusconnect_2024"
    ```

## 2. Initialize Database and Seed Data

We use Prisma ORM to initialize the 23 tables, followed by raw SQL scripts to inject Triggers, Views, and Stored Procedures.

```bash
# Inside the /backend directory
npm install

# Push the schema to the database (creates tables)
npx prisma db push

# Apply Triggers, Views, and Stored Procedures
psql -U ankitsingh -d campusconnect_db -f ../database/views.sql
psql -U ankitsingh -d campusconnect_db -f ../database/triggers.sql

# Seed the database with 600+ sample records
npm run seed
```

*Note: You can also use the automated verification script `./scripts/verify.sh` from the root directory to run queries and test triggers automatically.*

## 3. Start the Backend Server

```bash
cd backend
npm run dev
```
The Express API will start running on `http://localhost:3000`.

## 4. Start the Frontend Application

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The React frontend will start running on `http://localhost:5173`.

## 5. Login Credentials

The database has been seeded with test accounts. Use the quick-fill buttons on the Login Page, or use the following:

**Password for all accounts:** `password123`

*   **Admin:** admin@campusconnect.edu
*   **Student:** a.sharma@students.university.edu (Sample)
*   **Faculty:** d.patel@university.edu (Sample)
*   **Recruiter:** hr@techcorp.com (Sample)
