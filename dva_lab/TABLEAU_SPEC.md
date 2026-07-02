# Tableau Dashboard Specification: CampusConnect Event Engagement

This document details the configuration for the Tableau requirement of the DVA Lab.

## 1. Data Connection
- **Source:** `cleaned_data.csv`
- **Data Types:** Ensure `RegistrationDate` is recognized as a Date, and `FeedbackRating` as a continuous Measure.

## 2. Calculated Fields

**1. Attendance %**
```tableau
SUM(IIF([AttendanceStatus] = 'PRESENT', 1, 0)) / COUNT([RegistrationID])
```

**2. High Engagement Flag**
```tableau
IF [FeedbackRating] >= 4.0 THEN 'High Satisfaction' ELSE 'Needs Improvement' END
```

## 3. Required Visualizations (Sheets)

**Sheet 1: Department Participation (Bar Chart)**
- **Columns:** `Department`
- **Rows:** `CNT(RegistrationID)`
- **Color:** `Department`
- **Objective:** Visualizes the total volume of event registrations per department.

**Sheet 2: Event Popularity (Tree Map)**
- **Text:** `EventName`
- **Size:** `CNT(RegistrationID)`
- **Color:** `AVG(FeedbackRating)`
- **Objective:** Highlights the most attended events; color intensity denotes student satisfaction.

**Sheet 3: Attendance Analysis (Pie Chart)**
- **Color:** `AttendanceStatus` (PRESENT, ABSENT, LATE)
- **Angle:** `CNT(RegistrationID)`
- **Label:** Percentage of Total.
- **Objective:** Shows the overall attendance discipline of registered students.

**Sheet 4: Registration Trends (Line Chart)**
- **Columns:** `MONTH(RegistrationDate)`
- **Rows:** `CNT(RegistrationID)`
- **Objective:** Maps the seasonality of event registrations over the academic year.

**Sheet 5: Club Engagement (Stacked Bar)**
- **Columns:** `CNT(RegistrationID)`
- **Rows:** `ClubName`
- **Color:** `AttendanceStatus`
- **Objective:** Evaluates which clubs have the best actual turnout vs merely registrations.

**Sheet 6: Feedback Distribution (Histogram)**
- **Columns:** `FeedbackRating` (Binned)
- **Rows:** `CNT(RegistrationID)`
- **Objective:** Understand the spread of satisfaction scores across all events.

## 4. Dashboard Assembly & Filters
- **Layout:** Place the 4 KPIs (Total Students, Total Events, Attendance %, Average Rating) at the top.
- **Filters:** 
  - Add interactive filters for `Department`, `ClubName`, and `EventName`.
  - Apply filters to "All Using This Data Source".
- **Interactivity:** Use Sheet 1 (Department) as a filter for the rest of the dashboard.
