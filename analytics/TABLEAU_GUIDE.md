# Tableau Dashboard Implementation Guide: CampusConnect Analytics

This document serves as the complete technical specification for building the CampusConnect Tableau Dashboard using `cleaned_data.csv`. 

## 1. Data Connection
1. Open Tableau Desktop.
2. Select **Connect to Data > Text File**.
3. Select `cleaned_data.csv` from this directory.
4. Ensure Tableau correctly identifies `RegistrationDate` as a Date and `FeedbackScore`, `CGPA`, and `AttendanceRate` as continuous Measures.

## 2. Calculated Fields Required
You must create the following Calculated Fields to power the dashboard:

**Placement Rate:**
```tableau
SUM(IIF([InternshipApplied] = True AND [InternshipStatus] = 'OFFERED', 1, 0)) / SUM(IIF([InternshipApplied] = True, 1, 0))
```

**At-Risk Flag:**
```tableau
IF [AttendanceRate] < 75.0 OR [CGPA] < 6.0 THEN 'At Risk' ELSE 'Safe' END
```

**Highly Active Student:**
```tableau
IF [EventsAttended] > 10 THEN 'Highly Active' ELSE 'Normal' END
```

## 3. Required Sheets (Worksheets)

### Sheet 1: Department Overview (Bar Chart)
* **Columns:** `Department`
* **Rows:** `CNT(StudentID)`
* **Color:** `Department`
* **Label:** Show mark labels (Count of Students).
* **Objective:** Visualizes student distribution across branches.

### Sheet 2: Academic Performance vs. Attendance (Scatter Plot)
* **Columns:** `AVG(AttendanceRate)`
* **Rows:** `AVG(CGPA)`
* **Detail:** `StudentID` (to plot every student).
* **Color:** `At-Risk Flag` (Red for At Risk, Blue for Safe).
* **Objective:** Identifies correlation between attendance and grades.

### Sheet 3: Internship Funnel (Funnel Chart)
* **Rows:** `InternshipStatus` (Filtered to exclude Null/False).
* **Size:** `CNT(StudentID)`
* **Color:** `InternshipStatus`
* **Sort:** Sort `InternshipStatus` manually: APPLIED -> SCREENING -> INTERVIEW -> OFFERED -> REJECTED.
* **Objective:** Visualizes the drop-off in placement conversions.

### Sheet 4: Student Satisfaction (Highlight Table)
* **Columns:** `Department`
* **Rows:** `Batch`
* **Text/Color:** `AVG(FeedbackScore)` (Use a diverging color palette, e.g., Red-White-Green).
* **Objective:** Identifies which cohorts are most satisfied with the college ecosystem.

## 4. Dashboard Assembly
1. Create a new Dashboard (`Size: Automatic` or `Desktop 1000x800`).
2. **Title:** "CampusConnect Student Ecosystem Analytics".
3. **KPI Ban (Top Row):** Drag `CNT(StudentID)`, `AVG(CGPA)`, and `Placement Rate` into a horizontal container at the top.
4. **Layout:** 
   - Left Half: Place Sheet 1 (Department Overview) and Sheet 4 (Satisfaction).
   - Right Half: Place Sheet 2 (Scatter Plot) and Sheet 3 (Funnel).
5. **Filters:** 
   - Add a global filter for `Batch` and apply it to **All Using This Data Source**.
   - Add a global filter for `Department`.
6. **Actions:** 
   - Add a Filter Action: When a user clicks a Department in Sheet 1, it filters the Scatter Plot and Funnel Chart.

## 5. Exporting for Submission
Once built, go to **File > Export as PowerPoint** or save the file as a `.twbx` (Tableau Packaged Workbook) for final university submission.
