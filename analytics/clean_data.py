import pandas as pd
import numpy as np

def clean_data(input_file, output_file):
    print(f"Loading raw data from {input_file}...")
    df = pd.read_csv(input_file)
    
    # 1. Standardize Department Names
    print("Cleaning Departments...")
    dept_map = {
        'Computer Science': 'CSE',
        'cse': 'CSE',
        'Mech': 'ME',
        'electrical': 'EE'
    }
    df['Department'] = df['Department'].replace(dept_map)
    df['Department'] = df['Department'].fillna('UNKNOWN')
    
    # 2. Handle missing and outlier CGPA
    print("Cleaning CGPA...")
    df['CGPA'] = pd.to_numeric(df['CGPA'], errors='coerce')
    cgpa_mean = df['CGPA'].mean()
    df['CGPA'] = df['CGPA'].fillna(cgpa_mean).round(2)
    # Clip to max 10.0
    df['CGPA'] = df['CGPA'].clip(upper=10.0)
    
    # 3. Handle Attendance Outliers (Cap at 100)
    print("Cleaning Attendance...")
    df['AttendanceRate'] = df['AttendanceRate'].clip(upper=100.0)
    
    # 4. Standardize Boolean columns
    print("Cleaning Booleans...")
    df['InternshipApplied'] = df['InternshipApplied'].replace({'YES': 'True', 'NO': 'False'})
    df['InternshipApplied'] = df['InternshipApplied'].map({'True': True, 'False': False})
    
    # 5. Fix Feedback Scores
    print("Cleaning Feedback Scores...")
    df['FeedbackScore'] = pd.to_numeric(df['FeedbackScore'], errors='coerce')
    # Replace outliers (>5) with NaN, then fill NaN with median
    df.loc[df['FeedbackScore'] > 5, 'FeedbackScore'] = np.nan
    score_median = df['FeedbackScore'].median()
    df['FeedbackScore'] = df['FeedbackScore'].fillna(score_median)
    
    # 6. Format Dates
    print("Formatting Dates...")
    df['RegistrationDate'] = pd.to_datetime(df['RegistrationDate']).dt.strftime('%Y-%m-%d')
    
    print(f"Saving cleaned dataset to {output_file}...")
    df.to_csv(output_file, index=False)
    
    print("\n--- Data Cleaning Summary ---")
    print(f"Total Rows: {len(df)}")
    print("Missing Values Post-Cleaning:")
    print(df.isnull().sum())
    print("-----------------------------\n")

if __name__ == "__main__":
    clean_data('raw_data.csv', 'cleaned_data.csv')
