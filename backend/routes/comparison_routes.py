"""
Loan Comparison Routes
Allows comparing 2 to 6 loan scenarios (differing in amount, tenure, purpose)
against a fixed applicant financial profile.
"""

from flask import Blueprint, request, jsonify
from utils.validators import validate_applicant_data
from services.risk_engine import risk_engine

comparison_bp = Blueprint("comparison", __name__)

@comparison_bp.route("/compare", methods=["POST"])
def compare_loan_scenarios():
    try:
        body = request.get_json(silent=True)
        if not body:
            return jsonify({
                "success": False,
                "error": "Missing JSON request body."
            }), 400

        applicant = body.get("applicant", {})
        scenarios = body.get("scenarios", [])

        if not applicant:
            return jsonify({
                "success": False,
                "error": "Applicant baseline data is required."
            }), 400

        if not isinstance(scenarios, list) or len(scenarios) < 2:
            return jsonify({
                "success": False,
                "error": "At least 2 loan scenarios are required for comparison."
            }), 400

        if len(scenarios) > 6:
            return jsonify({
                "success": False,
                "error": "Maximum 6 scenarios allowed at a time."
            }), 400

        results = []
        best_scenario_idx = 0
        lowest_risk = 999

        for idx, scn in enumerate(scenarios):
            merged = dict(applicant)
            merged["requested_loan"] = float(scn.get("loan_amount", merged.get("requested_loan", 500000)))
            merged["loan_tenure"] = float(scn.get("loan_tenure", merged.get("loan_tenure", 5)))
            if "loan_purpose" in scn and scn["loan_purpose"]:
                merged["loan_purpose"] = scn["loan_purpose"]

            is_valid, errs = validate_applicant_data(merged)
            if not is_valid:
                return jsonify({
                    "success": False,
                    "error": f"Scenario {idx + 1} ('{scn.get('name', 'Scenario')}') validation failed.",
                    "validation_errors": errs
                }), 400

            eval_res = risk_engine.evaluate_applicant(merged)
            risk_score = eval_res["risk_assessment"]["risk_score"]
            fin = eval_res["financial_metrics"]

            scenario_entry = {
                "id": scn.get("id", f"scenario_{idx+1}"),
                "name": scn.get("name", f"Scenario {chr(65 + idx)}"),
                "loan_amount": fin["requested_loan"],
                "loan_tenure": fin["loan_tenure_years"],
                "loan_purpose": merged.get("loan_purpose", "Personal"),
                "estimated_emi": fin["estimated_emi"],
                "total_payable": fin["total_payable"],
                "total_interest": fin["total_interest"],
                "loan_to_income_ratio": fin["loan_to_income_ratio"],
                "projected_dti_ratio": fin["projected_dti_ratio"],
                "risk_score": risk_score,
                "risk_level": eval_res["risk_assessment"]["risk_level"],
                "risk_tier": eval_res["risk_assessment"]["risk_tier"],
                "approval_probability": eval_res["risk_assessment"]["approval_probability"],
                "eligibility": eval_res["risk_assessment"]["eligibility"],
                "disposable_income_after_emi": fin["post_loan_disposable_income"]
            }

            if risk_score < lowest_risk:
                lowest_risk = risk_score
                best_scenario_idx = idx

            results.append(scenario_entry)

        if results:
            results[best_scenario_idx]["is_recommended"] = True

        return jsonify({
            "success": True,
            "data": {
                "scenarios": results,
                "recommended_scenario_name": results[best_scenario_idx]["name"],
                "summary": (
                    f"{results[best_scenario_idx]['name']} presents the most favorable risk profile "
                    f"with a risk score of {results[best_scenario_idx]['risk_score']}/100 and an estimated "
                    f"monthly EMI of ₹{results[best_scenario_idx]['estimated_emi']:,.0f}."
                )
            }
        }), 200

    except Exception as e:
        print(f"[API ERROR] /api/compare failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to compare loan scenarios.",
            "details": str(e)
        }), 500
