class RecommendationEngine:
    @staticmethod
    def generate_recommendations(applicant_data: dict, financial_metrics: dict, risk_prediction: dict) -> list:
        
        recs = []

        credit_score = int(applicant_data.get("credit_score", 650))
        previous_defaults = int(applicant_data.get("previous_defaults", 0))
        late_payments = int(applicant_data.get("late_payments", 0))
        employment_duration = float(applicant_data.get("employment_duration", 1))
        
        monthly_income = financial_metrics.get("monthly_income", 1)
        existing_dti = financial_metrics.get("existing_dti_ratio", 0)
        projected_dti = financial_metrics.get("projected_dti_ratio", 0)
        loan_to_income = financial_metrics.get("loan_to_income_ratio", 0)
        savings_to_loan = financial_metrics.get("savings_to_loan_ratio", 0)
        savings_runway = financial_metrics.get("savings_runway_months", 0)
        existing_debt = financial_metrics.get("existing_debt", 0)
        loan_tenure = financial_metrics.get("loan_tenure_years", 5)
        requested_loan = financial_metrics.get("requested_loan", 0)

        # 1. Credit Score & Repayment Recommendations
        if credit_score < 700:
            impact = "High" if credit_score < 620 else "Moderate"
            recs.append({
                "id": "rec_credit_score",
                "category": "Credit Optimization",
                "priority": "High" if credit_score < 620 else "Medium",
                "title": "Strengthen Credit Profile & Repayment Consistency",
                "advice": (
                    "Improving repayment consistency may strengthen your credit profile. "
                    "Maintain your revolving credit card utilization below 30% and ensure zero late payments "
                    "for the next 6 to 12 months to progressively elevate your CIBIL/Experian credit score."
                ),
                "expected_impact": f"{impact} positive impact on credit scoring.",
                "action_item": "Set up auto-debits for all credit card and utility bills to avoid missing due dates."
            })

        if late_payments > 0:
            recs.append({
                "id": "rec_late_payments",
                "category": "Payment Discipline",
                "priority": "High",
                "title": "Eliminate Late Payment Incidents",
                "advice": (
                    f"Profile shows {late_payments} late payment(s). Even a single 30-day delinquency can "
                    "reduce credit scores significantly and raise lender scrutiny during underwriting."
                ),
                "expected_impact": "High: Demonstrating 6+ consecutive months of on-time payments restores bureau trust.",
                "action_item": "Activate SMS / WhatsApp banking reminders and align billing cycles with your monthly salary crediting date."
            })

        if previous_defaults > 0:
            recs.append({
                "id": "rec_defaults",
                "category": "Credit Remediation",
                "priority": "Critical",
                "title": "Address Previous Default History",
                "advice": (
                    f"Profile reflects {previous_defaults} previous default(s). In formal lending, defaults "
                    "remain visible for up to 7 years. Obtaining official No Objection Certificates (NOC) and "
                    "ensuring all past settlements are properly updated with bureaus is crucial."
                ),
                "expected_impact": "Critical for moving from 'High Risk' to formal review.",
                "action_item": "Request updated credit report copies and resolve any lingering unclosed loan accounts."
            })

        # 2. Debt Burden & DTI Recommendations
        if existing_dti > 35 or projected_dti > 45:
            recs.append({
                "id": "rec_dti_reduction",
                "category": "Debt Restructuring",
                "priority": "High",
                "title": "Reduce Existing Debt Obligations",
                "advice": (
                    f"Reducing existing debt obligations may improve your financial profile. "
                    f"Your existing DTI is {existing_dti:.1f}% (projected {projected_dti:.1f}%). Paying off small personal "
                    "loans or credit card balances before applying can lower monthly EMI burden significantly."
                ),
                "expected_impact": "Substantial reduction in risk score and immediate increase in borrowing power.",
                "action_item": "Use the avalanche or snowball method to prepay the highest-interest short-term debt."
            })

        # 3. Loan Sizing & Tenure Optimization
        if loan_to_income > 2.0 or projected_dti > 45:
            suggested_tenure = min(int(loan_tenure + 2), 10)
            suggested_amount = round(requested_loan * 0.8, -3)
            recs.append({
                "id": "rec_loan_sizing",
                "category": "Loan Structure",
                "priority": "Medium",
                "title": "Optimize Loan Amount or Extend Tenure",
                "advice": (
                    "Consider reducing the requested loan amount or evaluating a longer repayment period. "
                    f"Extending tenure from {loan_tenure:.0f} to {suggested_tenure} years, or lowering principal "
                    f"to ₹{suggested_amount:,.0f}, would decrease your monthly EMI commitment."
                ),
                "expected_impact": "Directly lowers monthly EMI burden and enhances debt service ratios.",
                "action_item": "Use our What-If Simulator and Loan Comparison tool to evaluate a lower monthly installment."
            })

        # 4. Savings & Liquidity Buffer
        if savings_to_loan < 0.25 or savings_runway < 3:
            recs.append({
                "id": "rec_savings_buffer",
                "category": "Liquidity Buffer",
                "priority": "Medium",
                "title": "Build Additional Emergency Savings",
                "advice": (
                    "Building additional savings may improve your financial resilience. "
                    f"Target liquid emergency reserves of at least 3 to 6 months of essential living expenses (approx. ₹{(financial_metrics.get('monthly_expenses', 0) * 3):,.0f}) "
                    "prior to onboarding significant new debt commitments."
                ),
                "expected_impact": "Provides a crucial shock absorber against sudden income disruptions.",
                "action_item": "Allocate 15-20% of net monthly income into a high-yield liquid fund or recurring deposit."
            })

        # 5. Employment Duration
        if employment_duration < 2:
            recs.append({
                "id": "rec_employment_tenure",
                "category": "Career Continuity",
                "priority": "Low",
                "title": "Establish Longer Employment Continuity",
                "advice": (
                    "Longer employment stability may strengthen the profile used by the demo model. "
                    "Lenders typically require a minimum of 2 years of overall employment or 1 year with the current employer "
                    "to confirm continuous earnings."
                ),
                "expected_impact": "Increases eligibility tier and facilitates smoother document verification.",
                "action_item": "Maintain salary slips, Form 16, and bank statements ready to verify income continuity."
            })

        # Fallback if profile is already top tier
        if not recs:
            recs.append({
                "id": "rec_maintenance",
                "category": "Profile Maintenance",
                "priority": "Low",
                "title": "Maintain Strong Financial Health",
                "advice": (
                    "Your financial metrics align exceptionally well with prudent underwriting guidelines. "
                    "Continue monitoring credit reports annually and maintaining your low debt-to-income ratio."
                ),
                "expected_impact": "Preserves prime eligibility for competitive market interest rates.",
                "action_item": "Periodically compare lending rates to ensure you receive the most competitive terms."
            })

        return recs
