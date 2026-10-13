"""Nisha's birthday wish-wall backend (FastAPI + MongoDB).

Run locally:
    pip install -r requirements.txt
    cp .env.example .env   # then fill in MONGO_URI
    uvicorn app:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import DESCENDING, MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise RuntimeError("MONGO_URI environment variable is required")
MONGO_DB = os.getenv("MONGO_DB", "nisha_birthday")

client = MongoClient(MONGO_URI)
db = client[MONGO_DB]
wishes_col = db["wishes"]


class WishIn(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    message: str = Field(min_length=1, max_length=500)


def to_dict(doc):
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "message": doc["message"],
        "created_at": doc.get("created_at"),
    }


def seed_db():
    """Insert Aman's starter wish if the collection is empty."""
    if wishes_col.count_documents({}) == 0:
        wishes_col.insert_one(
            {
                "name": "Aman",
                "message": (
                    "Happy birthday, Nisha! May this year bring you all the "
                    "happiness you deserve, and may every wish you make today "
                    "come true."
                ),
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_db()
    yield


app = FastAPI(title="Nisha Birthday API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


@app.get("/api/wishes")
def list_wishes():
    docs = wishes_col.find().sort("created_at", DESCENDING)
    return [to_dict(d) for d in docs]


@app.post("/api/wishes", status_code=201)
def create_wish(payload: WishIn):
    name = payload.name.strip()
    message = payload.message.strip()
    if not name or not message:
        raise HTTPException(
            status_code=422, detail="Name and message must not be empty."
        )
    doc = {
        "name": name,
        "message": message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    res = wishes_col.insert_one(doc)
    return to_dict({**doc, "_id": res.inserted_id})
