import os
from databases import Database
from dotenv import load_dotenv

load_dotenv()
 
DB_USER=os.getenv("DB_USER")
DB_PASSWORD=os.getenv("DB_PASSWORD")
DB_HOST=os.getenv("DB_HOST")
DB_PORT=os.getenv("DB_PORT")
DB_NAME=os.getenv("DB_NAME")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

db = Database(DATABASE_URL)

async def connect():
    if not db.is_connected:
        await db.connect()
    
async def disconnect():
    if db.is_connected:
        await db.disconnect()
    