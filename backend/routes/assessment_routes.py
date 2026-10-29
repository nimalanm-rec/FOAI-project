"""
Assessment Routes
Handles initial applicant assessment submission, validation,
and persistence to MongoDB.
"""

from flask import Blueprint, request, jsonify
from utils.validators import validate_applicant_data
from services.risk_engine import risk_engine
from database.mongo import db_manager

assessment_bp = Blueprint("assessment", __name__)

@assessment_bp.route("/assess", methods=["POST"])
def perform_assessment():
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({
                "success": False,
                "error": "Missing JSON request body."
            }), 400

        is_valid, validation_errors = validate_applicant_data(data)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": "Validation failed on one or more fields.",
                "validation_errors": validation_errors
            }), 400

        # Execute unified risk assessment pipeline
        assessment = risk_engine.evaluate_applicant(data)

        # Store in database
        saved_id = db_manager.insert_assessment(assessment)
        assessment["id"] = saved_id
        assessment["_id"] = saved_id

        return jsonify({
            "success": True,
            "message": "Assessment processed and stored successfully.",
            "data": assessment
        }), 201

    except Exception as e:
        print(f"[API ERROR] /api/assess failed: {e}")
        return jsonify({
            "success": False,
            "error": "An internal error occurred while processing the credit assessment.",
            "details": str(e)
        }), 500
