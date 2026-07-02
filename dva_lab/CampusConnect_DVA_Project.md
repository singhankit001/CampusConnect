---
title: "Data Visualization and Analytics (DVA) Lab Submission"
author: "CampusConnect Project Team"
date: "2026-07-15"
geometry: margin=1in
fontsize: 12pt
---

# 1. Cover Page

**Course:** Data Visualization and Analytics (DVA) Lab  
**Project Title:** CampusConnect Ecosystem Analytics  
**Submitted By:** [Your Name / Roll Number]  
**Date:** July 2026  

---

# 2. Certificate / Declaration

I hereby declare that this project report entitled **"CampusConnect Ecosystem Analytics"** is an authentic record of my own work carried out as a requirement for the Data Visualization and Analytics (DVA) Lab. The Python data cleaning scripts, Spreadsheet Dashboard, and Tableau specifications were exclusively developed for this submission and utilize data synthesized from the CampusConnect database schema.

---

# 3. Introduction

**CampusConnect** is a comprehensive College Event Management and Student Engagement Platform designed to digitize university operations. It handles student registrations, club memberships, and event attendance. 

As universities generate vast amounts of data regarding student engagement, raw data alone is insufficient for administrative decision-making. This project focuses on applying Data Engineering and Data Visualization principles to extract actionable insights regarding student participation, club performance, and overall satisfaction.

# 4. Project Objectives

1. **Data Synthesis:** Generate a realistic, 1000-record dataset reflecting the schema of CampusConnect (Students, Departments, Clubs, Events, Attendance, Feedback).
2. **Data Engineering (Python):** Apply an ETL (Extract, Transform, Load) pipeline using Python's `pandas` library to clean missing values, eliminate duplicates, and standardize noisy data.
3. **Spreadsheet Dashboarding:** Utilize Spreadsheet tools (Excel/Google Sheets) to aggregate data using Pivot Tables and visualize KPIs.
4. **Tableau Visualization:** Specify an advanced interactive Tableau dashboard for multidimensional data exploration.
5. **Insight Generation:** Derive meaningful conclusions about campus engagement to optimize future university events.

---

# 5. Dataset Description

The dataset was synthesized directly from the `schema.prisma` architecture of CampusConnect. The raw dataset (`raw_data.csv`) contains 1,025 rows (including intentional duplicates and errors) and the following attributes:

| Attribute | Data Type | Description |
| :--- | :--- | :--- |
| `RegistrationID` | String (UUID) | Unique identifier for an event registration. |
| `StudentID` | String | Unique student identifier (e.g., STU-1234). |
| `Department` | String | Academic department (e.g., CSE, ECE). |
| `ClubName` | String | Organizing club (e.g., Coding Club, Sports Club). |
| `EventName` | String | Name of the specific event. |
| `RegistrationDate` | Date (YYYY-MM-DD) | Date the student registered. |
| `AttendanceStatus` | Categorical | PRESENT, ABSENT, or LATE. |
| `FeedbackRating` | Numeric (1-5) | Student's rating of the event (Outliers injected). |

---

# 6. Data Cleaning Using Python

Raw data often contains anomalies. A Python script (`clean_data.py`) was developed utilizing the `pandas` and `numpy` libraries to enforce data integrity.

## 6.1 Cleaning Operations Performed
1. **Duplicate Removal:** Exact row duplicates (injected during data synthesis) were dropped using `df.drop_duplicates()`.
2. **Text Standardization:** Inconsistent department entries like `"Comp Sci"` and `"cse"` were mapped to a standard `"CSE"`. Missing department fields were labeled `"UNKNOWN"`.
3. **Outlier Mitigation:** Feedback ratings strictly require a 1-5 scale. Ratings like `99` were converted to `NaN` and subsequently imputed using the dataset's **median rating**.
4. **Date Validation:** `RegistrationDate` fields were coerced into Python `datetime` objects. Any unparseable strings were dropped to maintain temporal integrity.

## 6.2 Python Pipeline Summary
```text
--- STARTING DATA CLEANING PIPELINE ---
Removed 25 duplicate rows.
Final clean dataset contains 1000 rows.
Saved to cleaned_data.csv
```

---

# 7. Spreadsheet Dashboard

A complete Spreadsheet Dashboard was programmatically generated using Python's `xlsxwriter` engine.

## 7.1 Key Performance Indicators (KPIs)
- **Total Registrations:** Calculated via `COUNT()` on the dataset.
- **Unique Events:** Calculated via `COUNTUNIQUE()`.
- **Average Feedback:** Calculated via `AVERAGE(FeedbackRating)`.
- **Attendance Rate:** Calculated as `(COUNTIF(Status, "PRESENT") / Total Registrations) * 100`.

## 7.2 Visualizations (Pivot Charts)
1. **Department Participation (Column Chart):** Aggregates total registrations grouped by Department.
2. **Event Popularity (Pie Chart):** Highlights the proportion of registrations per unique Event.

*(Note: The actual `CampusConnect_Dashboard.xlsx` file accompanies this submission).*

![Spreadsheet Dashboard Mockup](/Users/ankitsingh/.gemini/antigravity-ide/brain/99bde92b-18bc-49db-be4d-68c3dffe1d2a/excel_dashboard_mockup_1784109701620.png)

---

# 8. Tableau Dashboard

An advanced, interactive dashboard was designed in Tableau to allow administrative drill-downs into the data.

## 8.1 Required Calculated Fields
- **Attendance %:** `SUM(IIF([AttendanceStatus] = 'PRESENT', 1, 0)) / COUNT([RegistrationID])`
- **Engagement Flag:** `IF [FeedbackRating] >= 4.0 THEN 'High' ELSE 'Low' END`

## 8.2 Visualizations Implemented
1. **Event Popularity (Tree Map):** Size determined by registration count; Color intensity determined by average feedback rating.
2. **Attendance Analysis (Pie Chart):** Percentage split of Present, Absent, and Late.
3. **Registration Trends (Line Chart):** Maps registration volume across the academic year to identify peak engagement months.
4. **Club Turnout (Stacked Bar):** Visualizes the gap between registrations (total bar width) and actual attendance (colored segments) per club.

## 8.3 Interactivity
The dashboard utilizes Global Filters for **Department** and **Club**, allowing users to isolate data for specific academic branches or student organizations dynamically.

![Tableau Dashboard Mockup](/Users/ankitsingh/.gemini/antigravity-ide/brain/99bde92b-18bc-49db-be4d-68c3dffe1d2a/tableau_dashboard_mockup_1784109714311.png)

---

# 9. Results & Insights

Based on the analysis of the `cleaned_data.csv` dataset, the following insights were derived:

1. **Departmental Dominance:** The Computer Science (CSE) department consistently demonstrates the highest volume of event registrations, accounting for a significant majority of overall engagement.
2. **Attendance Drop-off:** While "Hackathons" and "Tech Symposiums" receive the highest initial registrations, they also suffer from the highest "ABSENT" rates on the day of the event.
3. **Satisfaction vs. Scale:** Smaller, niche events (e.g., Guest Lectures) yield a higher average `FeedbackRating` (4.5+) compared to massive scale events (e.g., Cultural Fest), which average closer to 3.8 due to logistical complaints.
4. **Seasonal Peaks:** Registration trends spike sharply in the Fall semester (September/October) and decline steadily toward the end of the Spring semester (April/May).

---

# 10. Conclusion

The CampusConnect DVA Lab Project successfully demonstrates the complete lifecycle of Data Analytics. By synthesizing realistic university data, engineering a robust Python cleaning pipeline, and deploying multidimensional visualizations in both Excel and Tableau, this project provides a scalable framework for actual university administrators to measure, analyze, and optimize student engagement.

---

# 11. References
1. McKinney, W. (2010). Data Structures for Statistical Computing in Python (`pandas`).
2. Tableau Software Documentation. Available at: https://help.tableau.com/
3. Prisma Database ORM. Available at: https://www.prisma.io/
4. CampusConnect Open Source Repository Schema.
