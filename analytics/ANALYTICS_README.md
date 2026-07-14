# CampusConnect Analytics & Dashboard Submission

Welcome to the Data Analytics module of the CampusConnect project. This folder contains a complete end-to-end data engineering and visualization pipeline.

## Project Deliverables Included

1. **`generate_raw_data.py`**: A Python script that generates 1,000 highly realistic (and intentionally messy) student records.
2. **`raw_data.csv`**: The output of the raw data generator.
3. **`clean_data.py`**: A `pandas` script that handles missing values, normalizes strings, and caps outliers.
4. **`cleaned_data.csv`**: The pristine, dashboard-ready dataset.
5. **`generate_dashboard.py`**: A Python script that automatically generates a fully formatted Excel Dashboard with native charts using `xlsxwriter`.
6. **`CampusConnect_Dashboard.xlsx`**: The generated Excel Dashboard.
7. **`TABLEAU_GUIDE.md`**: Step-by-step instructions for building the Tableau visualization requirement.
8. **`ANALYTICS_REPORT.md`**: The final academic/professional report summarizing the findings.

## How to Run the Code Locally

If you wish to re-run the data pipeline from scratch, ensure you have Python 3 installed.

```bash
# 1. Navigate to the analytics directory
cd analytics

# 2. (Optional) Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install required libraries
pip install pandas xlsxwriter numpy

# 4. Generate the raw data (overwrites raw_data.csv)
python generate_raw_data.py

# 5. Clean the data (overwrites cleaned_data.csv)
python clean_data.py

# 6. Generate the Excel Dashboard (overwrites CampusConnect_Dashboard.xlsx)
python generate_dashboard.py
```

## Submission Checklist Met
- [x] Python Data Cleaning Script
- [x] Spreadsheet Dashboard (Excel)
- [x] Tableau Dashboard (Documentation & Cleaned Data ready)
- [x] 500-1000 Realistic Records
- [x] Project Report
