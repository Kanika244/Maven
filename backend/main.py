from fastapi import FastAPI
from sqlalchemy import text

from databases.postgres import engine
from databases.mongodb import mongodb
from router.auth import authrouter
from fastapi.middleware.cors import CORSMiddleware
from router.kyc import kycrouter



app = FastAPI(
    title="MAVEN API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # add your deployed frontend URL(s) here too
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(authrouter, prefix="/api/auth", tags=["auth"])
app.include_router(kycrouter, prefix="/api/kyc", tags=["kyc"])
@app.get("/")
async def home():
    return {"message": "MAVEN Backend Running "}