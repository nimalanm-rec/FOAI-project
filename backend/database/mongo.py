"""
Database Management Module
Provides transparent MongoDB Atlas integration with a reliable local JSON fallback
if MongoDB is unreachable or not configured yet. This ensures the application never crashes.
"""

import os
import json
import uuid
from datetime import datetime
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

class DatabaseManager:
    def __init__(self):
        self.uri = os.getenv("MONGODB_URI", "").strip()
        self.db_name = os.getenv("DATABASE_NAME", "credit_risk_db")
        self.client = None
        self.db = None
        self.collection = None
        self.is_connected = False
        self.storage_mode = "local_cache"
        self.cache_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
        self.cache_file = os.path.join(self.cache_dir, "assessments.json")
        
        self._ensure_cache_dir()
        self._init_connection()

    def _ensure_cache_dir(self):
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir, exist_ok=True)
        if not os.path.exists(self.cache_file):
            with open(self.cache_file, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _init_connection(self):
        if not self.uri:
            print("[DATABASE] No MONGODB_URI set in environment. Running in graceful local cache mode.")
            self.storage_mode = "local_cache"
            self.is_connected = False
            return

        try:
            # Set a 3-second timeout for server selection so startup does not hang
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=3000)
            # Trigger quick command to verify connection
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            self.collection = self.db["assessments"]
            self.is_connected = True
            self.storage_mode = "mongodb"
            print(f"[DATABASE] Connected successfully to MongoDB Atlas database: {self.db_name}")
        except (ConnectionFailure, ServerSelectionTimeoutError, Exception) as e:
            print(f"[DATABASE WARNING] Could not connect to MongoDB Atlas ({e}). Operating in resilient local storage mode.")
            self.is_connected = False
            self.storage_mode = "local_cache"

    def get_status(self):
        return {
            "connected": self.is_connected,
            "storage_mode": self.storage_mode,
            "database_name": self.db_name,
            "uri_configured": bool(self.uri)
        }

    def insert_assessment(self, assessment_data):
        """Save an assessment record to MongoDB or fallback JSON store."""
        # Ensure unique ID and timestamp
        if "_id" not in assessment_data and "id" not in assessment_data:
            record_id = str(uuid.uuid4())
            assessment_data["_id"] = record_id
            assessment_data["id"] = record_id
        else:
            record_id = str(assessment_data.get("_id") or assessment_data.get("id"))
            assessment_data["_id"] = record_id
            assessment_data["id"] = record_id

        if "created_at" not in assessment_data:
            assessment_data["created_at"] = datetime.utcnow().isoformat() + "Z"

        if self.is_connected and self.collection is not None:
            try:
                # Mongo expects _id
                doc_to_save = dict(assessment_data)
                self.collection.insert_one(doc_to_save)
                return record_id
            except Exception as e:
                print(f"[DATABASE ERROR] Failed writing to MongoDB ({e}). Falling back to local cache.")

        # Local cache fallback
        try:
            with open(self.cache_file, "r+", encoding="utf-8") as f:
                try:
                    records = json.load(f)
                except json.JSONDecodeError:
                    records = []
                # Prepend for reverse-chronological order
                records.insert(0, assessment_data)
                f.seek(0)
                json.dump(records, f, indent=2)
                f.truncate()
            return record_id
        except Exception as e:
            print(f"[DATABASE ERROR] Failed saving assessment locally: {e}")
            return record_id

    def get_all_assessments(self, limit=50):
        """Retrieve recent assessments."""
        if self.is_connected and self.collection is not None:
            try:
                cursor = self.collection.find().sort("created_at", -1).limit(limit)
                results = []
                for doc in cursor:
                    doc["id"] = str(doc.get("_id", doc.get("id")))
                    doc["_id"] = str(doc["_id"])
                    results.append(doc)
                return results
            except Exception as e:
                print(f"[DATABASE ERROR] Querying MongoDB failed ({e}). Falling back to local cache.")

        try:
            with open(self.cache_file, "r", encoding="utf-8") as f:
                records = json.load(f)
                return records[:limit]
        except Exception as e:
            print(f"[DATABASE ERROR] Querying local cache failed: {e}")
            return []

    def get_assessment_by_id(self, assessment_id):
        """Retrieve a single assessment by ID."""
        if self.is_connected and self.collection is not None:
            try:
                doc = self.collection.find_one({"_id": assessment_id})
                if not doc:
                    doc = self.collection.find_one({"id": assessment_id})
                if doc:
                    doc["id"] = str(doc.get("_id", doc.get("id")))
                    doc["_id"] = str(doc["_id"])
                    return doc
            except Exception as e:
                print(f"[DATABASE ERROR] MongoDB find_by_id failed ({e}). Searching local cache.")

        try:
            with open(self.cache_file, "r", encoding="utf-8") as f:
                records = json.load(f)
                for item in records:
                    if str(item.get("id")) == str(assessment_id) or str(item.get("_id")) == str(assessment_id):
                        return item
            return None
        except Exception as e:
            print(f"[DATABASE ERROR] Local cache search failed: {e}")
            return None

# Singleton instance
db_manager = DatabaseManager()
