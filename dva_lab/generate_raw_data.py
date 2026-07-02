import csv
import random
import uuid
from datetime import datetime, timedelta

departments = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BBA', 'MBA', 'Comp Sci', 'cse', ''] # Intentional messiness
clubs = ['Coding Club', 'Robotics Society', 'Cultural Committee', 'Sports Club', 'Literature Society']
events = ['Hackathon 2024', 'Tech Symposium', 'Annual Sports Meet', 'Cultural Fest', 'RoboWars', 'Guest Lecture']
statuses = ['PRESENT', 'ABSENT', 'LATE']

def random_date(start_year=2023, end_year=2024):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    return start + timedelta(days=random.randint(0, (end - start).days))

def generate_dva_data(num_records=1000):
    data = []
    for _ in range(num_records):
        dept = random.choice(departments)
        club = random.choice(clubs)
        
        # Missing values injection
        feedback = random.choice([1, 2, 3, 4, 5, '', 99]) # 99 is outlier error
        
        record = {
            'RegistrationID': f"REG-{str(uuid.uuid4())[:6].upper()}",
            'StudentID': f"STU-{random.randint(1000, 9999)}",
            'Department': dept,
            'ClubName': club,
            'EventName': random.choice(events),
            'RegistrationDate': random_date().strftime('%Y-%m-%d'),
            'AttendanceStatus': random.choice(statuses),
            'FeedbackRating': feedback
        }
        data.append(record)
        
    # Inject exact duplicates for cleaning phase
    for _ in range(25):
        data.append(random.choice(data))
        
    return data

if __name__ == "__main__":
    records = generate_dva_data(1000)
    with open('raw_data.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)
    print(f"Generated {len(records)} records (including duplicates/errors) to raw_data.csv")
