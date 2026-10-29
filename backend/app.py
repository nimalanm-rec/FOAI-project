"""
AI Credit Risk & Loan Assessment System - Flask API Server
College Project for Foundations of Artificial Intelligence
"""

import os
import sys
from datetime import datetime

# Ensure current directory is on python path for direct invocation
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment configuration from .env if present
load_dotenv()

from routes import (
    assessment_bp,
    simulation_bp,
    comparison_bp,
    history_bp,
    model_bp
)
from database.mongo import db_manager
from ml.credit_risk_model import credit_model

def create_app():
    app = Flask(__name__)
    
    # Configure Cross-Origin Resource Sharing (CORS) for React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register API Blueprints under /api prefix
    app.register_blueprint(assessment_bp, url_prefix="/api")
    app.register_blueprint(simulation_bp, url_prefix="/api")
    app.register_blueprint(comparison_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")
    app.register_blueprint(model_bp, url_prefix="/api")

    # Health check endpoint
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db_status = db_manager.get_status()
        model_ready = credit_model.model is not None
        return jsonify({
            "status": "healthy",
            "project": "AI Credit Risk & Loan Assessment System",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "database": db_status,
            "machine_learning": {
                "model_loaded": model_ready,
                "algorithm": "Deterministic Financial Risk Scoring Engine (Standardized Scorecard)",
                "framework": "Rule-Based Python Engine"
            },
            "disclaimer": "AI-generated assessment for educational purposes only."
        }), 200

    # Friendly error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "success": False,
            "error": "The requested API endpoint was not found."
        }), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({
            "success": False,
            "error": "An unexpected server error occurred. Please verify your request parameters."
        }), 500

    return app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    print(f"\n========================================================")
    print(f" AI CREDIT RISK & LOAN ASSESSMENT SYSTEM (FLASK API)")
    print(f" Running on http://127.0.0.1:{port}")
    print(f" Database Mode: {db_manager.get_status()['storage_mode']}")
    print(f" Health Check:  http://127.0.0.1:{port}/api/health")
    print(f"========================================================\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
