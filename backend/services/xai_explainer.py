"""
Explainable AI (XAI) Service
Provides dynamic, human-interpretable feature attributions for credit assessments.
Explains specific strengths (positive factors) and risk drivers (concerns)
customized strictly according to each individual applicant's financial metrics.
"""

class XAIExplainer:
    @staticmethod
    def generate_explanations(applicant_data: dict, financial_metrics: dict, risk_prediction: dict) -> dict:
        """
        Analyzes the applicant's verified numbers and categorizes them into
        concrete positive factors and cautionary risk factors.
        """
        positive_factors = []
        risk_factors = []

        credit_score = int(applicant_data.get("credit_score", 650))
        age = int(applicant_data.get("age", 30))
        employment_type = applicant_data.get("employment_type", "Salaried")
        employment_duration = float(applicant_data.get("employment_duration", 1))
        previous_defaults = int(applicant_data.get("previous_defaults", 0))
        late_payments = int(applicant_data.get("late_payments", 0))

        monthly_income = financial_metrics.get("monthly_income", 0)
        existing_dti = financial_metrics.get("existing_dti_ratio", 0)
        projected_dti = financial_metrics.get("projected_dti_ratio", 0)
        loan_to_income = financial_metrics.get("loan_to_income_ratio", 0)
        savings = financial_metrics.get("savings", 0)
        savings_to_loan = financial_metrics.get("savings_to_loan_ratio", 0)
        existing_debt = financial_metrics.get("existing_debt", 0)
        existing_emi = financial_metrics.get("existing_emi", 0)
        requested_loan = financial_metrics.get("requested_loan", 0)
        savings_runway = financial_metrics.get("savings_runway_months", 0)
        post_loan_disposable = financial_metrics.get("post_loan_disposable_income", 0)

        # ----------------- 1. Credit Score Analysis -----------------
        if credit_score >= 750:
            positive_factors.append({
                "factor": "Prime Credit Score",
                "detail": f"Strong credit score of {credit_score}/850 reflects excellent repayment discipline and low probability of delinquency.",
                "importance": "High"
            })
        elif credit_score >= 700:
            positive_factors.append({
                "factor": "Good Credit Profile",
                "detail": f"Credit score of {credit_score} meets prime lending benchmarks with favorable credit history.",
                "importance": "Moderate"
            })
        elif credit_score < 620:
            risk_factors.append({
                "factor": "Adverse Credit Score",
                "detail": f"Credit score of {credit_score} is below conventional lending thresholds, signaling past credit strain.",
                "importance": "High"
            })
        else:
            risk_factors.append({
                "factor": "Fair Credit Score",
                "detail": f"Credit score of {credit_score} is in the fair band; prime lenders typically prefer 700+ for optimal terms.",
                "importance": "Moderate"
            })

        # ----------------- 2. Repayment History & Defaults -----------------
        if previous_defaults == 0:
            positive_factors.append({
                "factor": "Zero Historical Defaults",
                "detail": "Clean track record with no prior loan default records across formal financial institutions.",
                "importance": "High"
            })
        else:
            risk_factors.append({
                "factor": "Prior Loan Default History",
                "detail": f"Applicant profile reports {previous_defaults} historical loan default(s), which heavily penalizes credit risk algorithms.",
                "importance": "Critical"
            })

        if late_payments == 0:
            positive_factors.append({
                "factor": "Flawless Payment Discipline",
                "detail": "Zero late payments recorded, demonstrating punctual fulfillment of past financial obligations.",
                "importance": "Moderate"
            })
        elif late_payments >= 2:
            risk_factors.append({
                "factor": "Multiple Late Payments",
                "detail": f"{late_payments} late payment instances detected, highlighting cash flow irregularity.",
                "importance": "High"
            })
        elif late_payments == 1:
            risk_factors.append({
                "factor": "Occasional Delayed Payment",
                "detail": "1 late payment instance recorded on credit file within recent cycles.",
                "importance": "Low"
            })

        # ----------------- 3. Debt Burden & DTI -----------------
        if existing_dti <= 20:
            positive_factors.append({
                "factor": "Low Debt-to-Income Ratio",
                "detail": f"Existing monthly debt commitments absorb only {existing_dti:.1f}% of income, leaving ample borrowing headroom.",
                "importance": "High"
            })
        elif existing_dti <= 35:
            positive_factors.append({
                "factor": "Manageable Existing DTI",
                "detail": f"Current DTI of {existing_dti:.1f}% is comfortably within the traditional 35% safe ceiling.",
                "importance": "Moderate"
            })
        elif existing_dti > 45:
            risk_factors.append({
                "factor": "High Existing Debt Burden",
                "detail": f"Existing EMI obligations consume {existing_dti:.1f}% of monthly income prior to the new loan.",
                "importance": "High"
            })

        # Projected DTI with new loan
        if projected_dti > 50:
            risk_factors.append({
                "factor": "High Projected Leverage (DTI)",
                "detail": f"With the requested loan EMI, total debt servicing will reach {projected_dti:.1f}% of monthly income, exceeding safe underwriting guidelines.",
                "importance": "High"
            })
        elif projected_dti <= 35 and requested_loan > 0:
            positive_factors.append({
                "factor": "Prudent Combined Leverage",
                "detail": f"Projected combined debt obligations remain well-contained at {projected_dti:.1f}% of monthly earnings.",
                "importance": "Moderate"
            })

        # ----------------- 4. Savings & Asset Buffer -----------------
        if savings_to_loan >= 0.35 and requested_loan > 0:
            positive_factors.append({
                "factor": "Healthy Savings Buffer",
                "detail": f"Declared liquid savings (₹{savings:,.0f}) cover {savings_to_loan * 100:.1f}% of the total loan request, offering strong downside protection.",
                "importance": "High"
            })
        elif savings_runway >= 6:
            positive_factors.append({
                "factor": "Solid Emergency Liquidity",
                "detail": f"Total liquid reserves cover {savings_runway:.1f} months of recurring expenses.",
                "importance": "Moderate"
            })
        elif savings_to_loan < 0.15 and requested_loan > 200000:
            risk_factors.append({
                "factor": "Low Liquid Reserves vs Loan",
                "detail": f"Savings buffer (₹{savings:,.0f}) represents only {savings_to_loan * 100:.1f}% of the requested loan amount.",
                "importance": "Moderate"
            })

        # ----------------- 5. Employment & Stability -----------------
        if employment_duration >= 4:
            positive_factors.append({
                "factor": "Stable Employment Tenure",
                "detail": f"{employment_duration:.1f} years of continuous professional tenure as a {employment_type}, proving steady earning consistency.",
                "importance": "Moderate"
            })
        elif employment_duration < 1.5:
            risk_factors.append({
                "factor": "Short Employment Duration",
                "detail": f"Current tenure is only {employment_duration:.1f} years. Financial institutions typically prefer at least 2 years of verifiable continuity.",
                "importance": "Low"
            })

        # ----------------- 6. Loan Size Relative to Income -----------------
        if loan_to_income > 2.5:
            risk_factors.append({
                "factor": "Elevated Loan-to-Income Exposure",
                "detail": f"Requested loan is {loan_to_income:.2f}x gross annual income. Multi-year commitments at this multiple carry higher default vulnerability.",
                "importance": "Moderate"
            })
        elif loan_to_income <= 1.2 and requested_loan > 0:
            positive_factors.append({
                "factor": "Conservative Loan Request",
                "detail": f"Loan amount is modest relative to earning capacity ({loan_to_income:.2f}x annual income).",
                "importance": "Moderate"
            })

        # ----------------- 7. Cash Flow / Disposable Income -----------------
        if post_loan_disposable < 5000:
            risk_factors.append({
                "factor": "Narrow Disposable Cash Flow Margin",
                "detail": f"Estimated remaining disposable income after all obligations and expenses is only ₹{post_loan_disposable:,.0f}/month.",
                "importance": "High"
            })

        # Ensure at least 1-2 items per category so UI looks balanced and informative
        if not positive_factors:
            positive_factors.append({
                "factor": "Active Income Stream",
                "detail": f"Active {employment_type} income provides foundational cash flow for financial servicing.",
                "importance": "Low"
            })
        if not risk_factors:
            risk_factors.append({
                "factor": "Standard Market Interest Sensitivity",
                "detail": "Like all credit products, future rate shifts and macroeconomic conditions can impact debt servicing.",
                "importance": "Low"
            })

        return {
            "positive_factors": positive_factors,
            "risk_factors": risk_factors,
            "summary_statement": (
                f"Applicant exhibits {len(positive_factors)} primary credit strengths and {len(risk_factors)} identified risk considerations "
                f"under the demo AI evaluation framework."
            )
        }
