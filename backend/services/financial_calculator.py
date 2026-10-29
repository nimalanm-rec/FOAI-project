"""
Financial Calculator Service
Provides financial ratio computations, EMI calculations, and health metrics
according to banking standards and educational formulas.
"""

import os

# Default illustrative annual interest rate (e.g., 9.5%)
DEFAULT_DEMO_INTEREST_RATE = float(os.getenv("DEMO_INTEREST_RATE", "9.5"))

class FinancialCalculator:
    @staticmethod
    def calculate_emi(principal: float, tenure_years: float, annual_rate_pct: float = None) -> float:
        """
        Calculate Equated Monthly Installment (EMI) using the standard amortization formula:
        EMI = [P x r x (1 + r)^n] / [(1 + r)^n - 1]
        where:
        P = Principal loan amount
        r = Monthly interest rate (annual rate / 12 / 100)
        n = Total number of monthly installments (tenure in years * 12)
        """
        if principal <= 0 or tenure_years <= 0:
            return 0.0

        if annual_rate_pct is None:
            annual_rate_pct = DEFAULT_DEMO_INTEREST_RATE

        monthly_rate = (annual_rate_pct / 100.0) / 12.0
        months = int(tenure_years * 12)

        if monthly_rate == 0:
            return round(principal / months, 2)

        # Standard formula
        emi = (principal * monthly_rate * ((1 + monthly_rate) ** months)) / (((1 + monthly_rate) ** months) - 1)
        return round(float(emi), 2)

    @classmethod
    def analyze_applicant_finances(cls, data: dict, custom_interest_rate: float = None) -> dict:
        """
        Calculates all key financial metrics, ratios, and obligations.
        """
        monthly_income = max(float(data.get("monthly_income", 0)), 1.0) # Avoid div by zero
        monthly_expenses = float(data.get("monthly_expenses", 0))
        existing_emi = float(data.get("existing_emi", 0))
        existing_debt = float(data.get("existing_debt", 0))
        savings = float(data.get("savings", 0))
        bank_balance = float(data.get("bank_balance", 0))
        total_liquid_assets = savings + bank_balance
        
        requested_loan = float(data.get("requested_loan", 0))
        loan_tenure = float(data.get("loan_tenure", 5)) # in years
        
        interest_rate = custom_interest_rate if custom_interest_rate is not None else DEFAULT_DEMO_INTEREST_RATE

        # 1. Proposed EMI calculation
        proposed_emi = cls.calculate_emi(requested_loan, loan_tenure, interest_rate)
        total_months = int(loan_tenure * 12)
        total_payable = round(proposed_emi * total_months, 2) if proposed_emi > 0 else 0.0
        total_interest = round(total_payable - requested_loan, 2) if total_payable >= requested_loan else 0.0

        # 2. Existing Ratios
        annual_income = monthly_income * 12.0
        
        # Debt-to-Income (existing monthly debt obligations / monthly income * 100)
        # Often considered as existing EMI or monthly debt servicing
        existing_dti_ratio = round((existing_emi / monthly_income) * 100.0, 2)
        
        # EMI-to-Income ratio (existing EMI / monthly income * 100)
        emi_to_income_ratio = existing_dti_ratio

        # Projected DTI (including the newly requested loan EMI)
        total_monthly_obligations = existing_emi + proposed_emi
        projected_dti_ratio = round((total_monthly_obligations / monthly_income) * 100.0, 2)

        # Loan-to-Income (LTI) ratio = requested_loan / annual_income
        loan_to_income_ratio = round(requested_loan / annual_income, 2) if annual_income > 0 else 0.0

        # Savings-to-Loan ratio = savings / requested_loan
        savings_to_loan_ratio = round(savings / requested_loan, 2) if requested_loan > 0 else 0.0
        
        # Total Liquid Assets to Loan ratio
        assets_to_loan_ratio = round(total_liquid_assets / requested_loan, 2) if requested_loan > 0 else 0.0

        # Expense-to-Income ratio
        expense_to_income_ratio = round((monthly_expenses / monthly_income) * 100.0, 2)

        # Net disposable income
        net_disposable_income = round(monthly_income - (monthly_expenses + existing_emi), 2)
        post_loan_disposable_income = round(monthly_income - (monthly_expenses + total_monthly_obligations), 2)

        # Savings cushion in months of living expenses
        monthly_burn = monthly_expenses + existing_emi
        savings_runway_months = round(total_liquid_assets / monthly_burn, 1) if monthly_burn > 0 else 0.0

        return {
            "monthly_income": monthly_income,
            "annual_income": annual_income,
            "monthly_expenses": monthly_expenses,
            "existing_emi": existing_emi,
            "existing_debt": existing_debt,
            "savings": savings,
            "bank_balance": bank_balance,
            "total_liquid_assets": total_liquid_assets,
            "requested_loan": requested_loan,
            "loan_tenure_years": loan_tenure,
            "interest_rate_pct": interest_rate,
            "interest_rate_note": "Demo/Illustrative interest rate for calculation purposes only.",
            "estimated_emi": proposed_emi,
            "total_monthly_obligations": total_monthly_obligations,
            "total_payable": total_payable,
            "total_interest": total_interest,
            "existing_dti_ratio": existing_dti_ratio,
            "emi_to_income_ratio": emi_to_income_ratio,
            "projected_dti_ratio": projected_dti_ratio,
            "loan_to_income_ratio": loan_to_income_ratio,
            "savings_to_loan_ratio": savings_to_loan_ratio,
            "assets_to_loan_ratio": assets_to_loan_ratio,
            "expense_to_income_ratio": expense_to_income_ratio,
            "net_disposable_income": net_disposable_income,
            "post_loan_disposable_income": post_loan_disposable_income,
            "savings_runway_months": savings_runway_months
        }
