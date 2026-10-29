"""
Comprehensive Risk Engine Service
Integrates financial calculations, machine learning inference, explainable AI,
and recommendation logic into a unified assessment pipeline.
"""

from services.financial_calculator import FinancialCalculator
from ml.credit_risk_model import credit_model
from services.xai_explainer import XAIExplainer
from services.recommendation_engine import RecommendationEngine

class RiskEngine:
    @classmethod
    def evaluate_applicant(cls, applicant_data: dict, custom_interest_rate: float = None) -> dict:
        """
        Executes the end-to-end evaluation pipeline:
        1. Compute financial metrics, ratios, and estimated EMI
        2. Execute scikit-learn model inference for deterministic risk score
        3. Generate individualized Explainable AI strengths and risks
        4. Synthesize customized recommendations
        5. Package complete assessment payload
        """
        # 1. Financial Analytics
        finances = FinancialCalculator.analyze_applicant_finances(
            applicant_data, custom_interest_rate=custom_interest_rate
        )

        # 2. Machine Learning Model Scoring
        ml_result = credit_model.predict_risk(applicant_data, finances)

        # 3. Explainable AI Insights
        xai_insights = XAIExplainer.generate_explanations(applicant_data, finances, ml_result)

        # 4. Actionable Recommendations
        recommendations = RecommendationEngine.generate_recommendations(applicant_data, finances, ml_result)

        # 5. Assemble full assessment object
        assessment_payload = {
            "applicant": {
                "age": int(applicant_data.get("age", 28)),
                "dependents": int(applicant_data.get("dependents", 0)),
                "employment_type": applicant_data.get("employment_type", "Salaried"),
                "employment_duration": float(applicant_data.get("employment_duration", 3)),
                "credit_score": int(applicant_data.get("credit_score", 700)),
                "previous_defaults": int(applicant_data.get("previous_defaults", 0)),
                "late_payments": int(applicant_data.get("late_payments", 0)),
                "existing_loans": int(applicant_data.get("existing_loans", 0)),
                "loan_purpose": applicant_data.get("loan_purpose", "Personal")
            },
            "financial_metrics": finances,
            "risk_assessment": ml_result,
            "explainability": xai_insights,
            "recommendations": recommendations,
            "educational_disclaimer": (
                "AI-generated assessment for educational purposes only. "
                "This result is not a guaranteed loan approval and should not be considered financial advice."
            )
        }

        return assessment_payload

risk_engine = RiskEngine()
