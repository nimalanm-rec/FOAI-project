"""
Assessment History Routes
Provides retrieval of saved historical assessments from MongoDB / local storage.
"""

from flask import Blueprint, jsonify
from database.mongo import db_manager

history_bp = Blueprint("history", __name__)

@history_bp.route("/assessments", methods=["GET"])
def get_assessment_history():
    try:
        records = db_manager.get_all_assessments(limit=50)
        return jsonify({
            "success": True,
            "count": len(records),
            "storage_status": db_manager.get_status(),
            "data": records
        }), 200
    except Exception as e:
        print(f"[API ERROR] /api/assessments failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to fetch assessment history.",
            "details": str(e)
        }), 500

@history_bp.route("/assessments/<assessment_id>", methods=["GET"])
def get_assessment_detail(assessment_id):
    try:
        record = db_manager.get_assessment_by_id(assessment_id)
        if not record:
            return jsonify({
                "success": False,
                "error": f"Assessment with ID '{assessment_id}' not found."
            }), 404

        return jsonify({
            "success": True,
            "data": record
        }), 200
    except Exception as e:
        print(f"[API ERROR] /api/assessments/{assessment_id} failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve assessment details.",
            "details": str(e)
        }), 500
