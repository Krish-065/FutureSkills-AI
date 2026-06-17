import csv
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client["futureskills_ai"]
collection = db["jobs"]

def convert_value(val):
    if val == "":
        return None
    try:
        # Convert integer strings like "100" to int
        return int(val)
    except ValueError:
        try:
            # Convert float strings like "9.9" to float
            return float(val)
        except ValueError:
            # Fallback to string for text values
            return val

csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "clean_jobs.csv")
if not os.path.exists(csv_path):
    csv_path = "data/processed/clean_jobs.csv"

records = []
with open(csv_path, mode="r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        converted_row = {k: convert_value(v) for k, v in row.items()}
        records.append(converted_row)

collection.delete_many({})
if records:
    collection.insert_many(records)

print(f"{len(records)} records inserted")