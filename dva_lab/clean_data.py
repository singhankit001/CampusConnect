import pandas as pd
import numpy as np

def clean_dva_data(input_csv, output_csv):
    print("--- STARTING DATA CLEANING PIPELINE ---")
    df = pd.read_csv(input_csv)
    initial_rows = len(df)
    
    # 1. Remove Duplicates
    df.drop_duplicates(inplace=True)
    dedup_rows = len(df)
    print(f"Removed {initial_rows - dedup_rows} duplicate rows.")
    
    # 2. Standardize Text (Department)
    dept_map = {
        'Comp Sci': 'CSE',
        'cse': 'CSE',
        '': 'UNKNOWN'
    }
    df['Department'] = df['Department'].fillna('UNKNOWN')
    df['Department'] = df['Department'].replace(dept_map)
    
    # 3. Handle Missing/Outlier Feedback Ratings
    df['FeedbackRating'] = pd.to_numeric(df['FeedbackRating'], errors='coerce')
    df.loc[df['FeedbackRating'] > 5, 'FeedbackRating'] = np.nan # Outliers
    median_rating = df['FeedbackRating'].median()
    df['FeedbackRating'] = df['FeedbackRating'].fillna(median_rating)
    
    # 4. Validate Dates
    df['RegistrationDate'] = pd.to_datetime(df['RegistrationDate'], errors='coerce')
    # Drop rows where date couldn't be parsed
    df.dropna(subset=['RegistrationDate'], inplace=True)
    df['RegistrationDate'] = df['RegistrationDate'].dt.strftime('%Y-%m-%d')
    
    final_rows = len(df)
    print(f"Final clean dataset contains {final_rows} rows.")
    
    df.to_csv(output_csv, index=False)
    print(f"Saved to {output_csv}")

if __name__ == "__main__":
    clean_dva_data('raw_data.csv', 'cleaned_data.csv')
