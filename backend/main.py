from fastapi import FastAPI
from sqlalchemy import text

from databases.postgres import engine
from databases.mongodb import mongodb

app = FastAPI(
    title="MAVEN API",
    version="1.0.0"
)

@app.get("/")
async def home():
    return {"message": "MAVEN Backend Running "}