"""
Model Information Routes
Provides transparent metrics, feature importance rankings, and architectural details
for the AI Model explanation page.
"""

from flask import Blueprint, jsonify
from ml.credit_risk_model import credit_model

model_bp = Blueprint("model", __name__)

@model_bp.route("/model-info", methods=["GET"])
def get_model_information():
    try:
        info = credit_model.get_model_info()
        return jsonify({
            "success": True,
            "data": info
        }), 200
    except Exception as e:
        print(f"[API ERROR] /api/model-info failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to retrieve model metrics.",
            "details": str(e)
        }), 500
