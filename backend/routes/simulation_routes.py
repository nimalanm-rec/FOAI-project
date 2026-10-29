"""
What-If Simulation Routes
Permits dynamic scenario testing by calculating baseline vs modified scenarios
using the same underlying ML model and financial engine, highlighting exact deltas.
"""

from flask import Blueprint, request, jsonify
from utils.validators import validate_applicant_data
from services.risk_engine import risk_engine

simulation_bp = Blueprint("simulation", __name__)

@simulation_bp.route("/simulate", methods=["POST"])
def simulate_scenario():
    try:
        body = request.get_json(silent=True)
        if not body:
            return jsonify({
                "success": False,
                "error": "Missing JSON request body."
            }), 400

        baseline_data = body.get("baseline", {})
        modified_data = body.get("modified", {})

        if not baseline_data or not modified_data:
            return jsonify({
                "success": False,
                "error": "Both 'baseline' and 'modified' applicant payloads are required."
            }), 400

        # Validate both profiles
        valid_base, base_errs = validate_applicant_data(baseline_data)
        if not valid_base:
            return jsonify({
                "success": False,
                "error": "Baseline profile validation failed.",
                "validation_errors": base_errs
            }), 400

        valid_mod, mod_errs = validate_applicant_data(modified_data)
        if not valid_mod:
            return jsonify({
                "success": False,
                "error": "Modified scenario profile validation failed.",
                "validation_errors": mod_errs
            }), 400

        # Run both through the same engine
        baseline_result = risk_engine.evaluate_applicant(baseline_data)
        scenario_result = risk_engine.evaluate_applicant(modified_data)

        # Compute key comparative deltas
        base_risk = baseline_result["risk_assessment"]["risk_score"]
        scen_risk = scenario_result["risk_assessment"]["risk_score"]
        risk_diff = scen_risk - base_risk

        base_dti = baseline_result["financial_metrics"]["existing_dti_ratio"]
        scen_dti = scenario_result["financial_metrics"]["existing_dti_ratio"]
        dti_diff = round(scen_dti - base_dti, 2)

        base_proj_dti = baseline_result["financial_metrics"]["projected_dti_ratio"]
        scen_proj_dti = scenario_result["financial_metrics"]["projected_dti_ratio"]
        proj_dti_diff = round(scen_proj_dti - base_proj_dti, 2)

        base_emi = baseline_result["financial_metrics"]["estimated_emi"]
        scen_emi = scenario_result["financial_metrics"]["estimated_emi"]
        emi_diff = round(scen_emi - base_emi, 2)

        base_prob = baseline_result["risk_assessment"]["approval_probability"]
        scen_prob = scenario_result["risk_assessment"]["approval_probability"]
        prob_diff = scen_prob - base_prob

        # Generate explanatory narrative on what drove the shift
        causes = []
        
        # Credit score shift
        cs_diff = int(modified_data.get("credit_score", 0)) - int(baseline_data.get("credit_score", 0))
        if cs_diff != 0:
            verb = "improved" if cs_diff > 0 else "reduced"
            causes.append(f"Credit score {verb} by {abs(cs_diff)} points ({baseline_data.get('credit_score')} -> {modified_data.get('credit_score')})")

        # Income shift
        inc_diff = float(modified_data.get("monthly_income", 0)) - float(baseline_data.get("monthly_income", 0))
        if inc_diff != 0:
            verb = "increased" if inc_diff > 0 else "decreased"
            causes.append(f"Monthly income {verb} by ₹{abs(inc_diff):,.0f}")

        # EMI shift
        exist_emi_diff = float(modified_data.get("existing_emi", 0)) - float(baseline_data.get("existing_emi", 0))
        if exist_emi_diff != 0:
            verb = "increased" if exist_emi_diff > 0 else "decreased"
            causes.append(f"Existing monthly EMI obligations {verb} by ₹{abs(exist_emi_diff):,.0f}")

        # Loan amount shift
        loan_diff = float(modified_data.get("requested_loan", 0)) - float(baseline_data.get("requested_loan", 0))
        if loan_diff != 0:
            verb = "increased" if loan_diff > 0 else "reduced"
            causes.append(f"Requested loan amount was {verb} by ₹{abs(loan_diff):,.0f}")

        # Tenure shift
        tenure_diff = float(modified_data.get("loan_tenure", 0)) - float(baseline_data.get("loan_tenure", 0))
        if tenure_diff != 0:
            verb = "extended" if tenure_diff > 0 else "shortened"
            causes.append(f"Repayment tenure was {verb} by {abs(tenure_diff):.0f} year(s)")

        # Savings shift
        sav_diff = float(modified_data.get("savings", 0)) - float(baseline_data.get("savings", 0))
        if sav_diff != 0:
            verb = "increased" if sav_diff > 0 else "decreased"
            causes.append(f"Savings reserve was {verb} by ₹{abs(sav_diff):,.0f}")

        if not causes:
            explanation_narrative = "No substantive financial parameters were changed between scenarios."
        else:
            impact_desc = "reduced credit risk" if risk_diff < 0 else ("increased credit risk" if risk_diff > 0 else "resulted in no net risk score change")
            explanation_narrative = (
                f"Modifications ({', '.join(causes)}) {impact_desc}, "
                f"shifting the risk score from {base_risk} to {scen_risk} ({risk_diff:+d} points)."
            )

        return jsonify({
            "success": True,
            "data": {
                "baseline": baseline_result,
                "scenario": scenario_result,
                "comparison": {
                    "risk_score_baseline": base_risk,
                    "risk_score_scenario": scen_risk,
                    "risk_score_diff": risk_diff,
                    "risk_level_baseline": baseline_result["risk_assessment"]["risk_level"],
                    "risk_level_scenario": scenario_result["risk_assessment"]["risk_level"],
                    "dti_baseline": base_dti,
                    "dti_scenario": scen_dti,
                    "dti_diff": dti_diff,
                    "projected_dti_baseline": base_proj_dti,
                    "projected_dti_scenario": scen_proj_dti,
                    "projected_dti_diff": proj_dti_diff,
                    "emi_baseline": base_emi,
                    "emi_scenario": scen_emi,
                    "emi_diff": emi_diff,
                    "approval_probability_baseline": base_prob,
                    "approval_probability_scenario": scen_prob,
                    "approval_probability_diff": prob_diff,
                    "eligibility_baseline": baseline_result["risk_assessment"]["eligibility"],
                    "eligibility_scenario": scenario_result["risk_assessment"]["eligibility"],
                    "explanation_narrative": explanation_narrative,
                    "causes": causes
                }
            }
        }), 200

    except Exception as e:
        print(f"[API ERROR] /api/simulate failed: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to run what-if simulation.",
            "details": str(e)
        }), 500
