# Analytics Project Report: CampusConnect Data Ecosystem

## 1. Executive Summary
This report details the data engineering, cleaning, and visualization workflow applied to the CampusConnect database. A synthetic, highly realistic dataset of 1,000 student records was generated to simulate real-world university ecosystem metrics, including academic performance, event engagement, and placement success.

## 2. Data Engineering & Pipeline
### 2.1 Data Generation (`generate_raw_data.py`)
To mimic real-world data collection issues, the raw dataset (`raw_data.csv`) was intentionally injected with:
- Missing values (Nulls in CGPA, Department, Feedback).
- String inconsistencies (e.g., "Computer Science", "cse", "CSE").
- Mathematical outliers (e.g., Attendance rates of 140%).

### 2.2 Data Cleaning (`clean_data.py`)
A Python script leveraging the `pandas` and `numpy` libraries was utilized to construct a robust ETL pipeline:
1. **Imputation:** Missing CGPA values were imputed using the dataset's mean. Feedback scores missing or out-of-bounds (>5) were replaced with the median score.
2. **Normalization:** Department strings were mapped to standardized acronyms (CSE, ECE, ME, etc.).
3. **Outlier Mitigation:** Attendance rates exceeding 100% were capped at 100.0.
4. **Type Casting:** Boolean fields and Dates were strictly formatted for downstream BI tools.

The resulting dataset (`cleaned_data.csv`) achieves 100% data integrity and is optimized for dashboarding.

## 3. Visualization & Insights

### 3.1 Excel Dashboard (`generate_dashboard.py`)
An automated Python script using `xlsxwriter` generated a native Excel dashboard (`CampusConnect_Dashboard.xlsx`).
**Key Features:**
- Automated KPI aggregation (Total Students, Avg CGPA, Avg Attendance).
- Native Excel Column Charts highlighting Departmental distribution.
- Native Excel Bar Charts illustrating the placement application funnel.

### 3.2 Tableau Dashboard Integration
The cleaned dataset is structurally formatted for immediate ingestion into Tableau. The project includes a `TABLEAU_GUIDE.md` detailing the construction of complex Calculated Fields (e.g., Placement Conversion Rate, At-Risk Student Flags) and interactive dashboard actions to analyze the correlation between event attendance and academic success.

## 4. Conclusion
The CampusConnect Analytics project successfully demonstrates end-to-end data processing—from raw, noisy data extraction to clean, normalized data, culminating in automated programmatic Excel dashboards and structured Tableau reporting capabilities.
