import csv
import random
import uuid
from datetime import datetime, timedelta

def random_date(start_year=2022, end_year=2024):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

departments = ['CSE', 'ECE', 'ME', 'EE', 'CE', 'BBA', 'MBA']
messy_departments = ['Computer Science', 'cse', 'Mech', 'electrical']

first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Ayaan", "Krishna", "Ishaan", "Shaurya", "Saanvi", "Aanya", "Aadhya", "Aaradhya", "Ananya", "Pari", "Diya", "Nandini", "Kashvi", "Meera", "John", "Jane", "Alice", "Bob", "Charlie"]
last_names = ["Sharma", "Singh", "Patel", "Kumar", "Gupta", "Deshmukh", "Joshi", "Reddy", "Rao", "Nair", "Das", "Bose", "Mukherjee", "Smith", "Johnson", "Williams", "Jones", "Brown"]

statuses = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFERED', 'REJECTED']

def generate_data(num_records=1000):
    data = []
    
    for _ in range(num_records):
        # Introduce missing values occasionally
        dept = random.choice(departments)
        if random.random() < 0.05:
            dept = random.choice(messy_departments) # Messy string
        if random.random() < 0.03:
            dept = '' # Missing
            
        cgpa = round(random.uniform(5.5, 10.0), 2)
        if random.random() < 0.04:
            cgpa = '' # Missing CGPA
            
        attendance = round(random.uniform(40.0, 100.0), 2)
        if random.random() < 0.01:
            attendance = 140.0 # Outlier error
            
        events_attended = random.randint(0, 15)
        
        internship_applied = random.choice(['True', 'False', 'YES', 'NO'])
        
        status = ''
        if internship_applied in ['True', 'YES']:
            status = random.choice(statuses)
            
        feedback_score = random.choice([1, 2, 3, 4, 5, '', 99]) # 99 is outlier
        
        record = {
            'StudentID': str(uuid.uuid4())[:8],
            'FirstName': random.choice(first_names),
            'LastName': random.choice(last_names),
            'Department': dept,
            'Batch': random.choice(['2024', '2025', '2026', '2027']),
            'CGPA': cgpa,
            'AttendanceRate': attendance,
            'EventsAttended': events_attended,
            'InternshipApplied': internship_applied,
            'InternshipStatus': status,
            'FeedbackScore': feedback_score,
            'RegistrationDate': random_date().strftime('%Y-%m-%d')
        }
        data.append(record)
        
    return data

if __name__ == "__main__":
    records = generate_data(1000)
    
    with open('raw_data.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)
        
    print(f"Successfully generated {len(records)} messy records into raw_data.csv")
