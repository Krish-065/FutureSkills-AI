import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(
    os.getenv("MONGO_URI")
)

db = client["futureskills_ai"]
collection = db["jobs"]

df = pd.read_csv(
    "data/processed/clean_jobs.csv"
)

records = df.to_dict("records")


collection.delete_many({})


collection.insert_many(records)



print(
    f"{len(records)} records inserted"
)