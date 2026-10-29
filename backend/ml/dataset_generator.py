"""
Synthetic Dataset Generator for Credit Risk & Loan Assessment
Generates a realistic, statistically grounded financial dataset for training
and evaluating explainable scikit-learn models.

All data is explicitly marked as synthetic/demo data for educational purposes.
"""

import numpy as np
import pandas as pd

def generate_credit_dataset(n_samples: int = 5000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic credit risk dataset with realistic correlations.
    """
    np.random.seed(random_seed)

    # 1. Demographics & Basic Profiles
    age = np.random.randint(21, 65, size=n_samples)
    dependents = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.35, 0.25, 0.25, 0.10, 0.05])
    
    # Employment
    emp_types = ["Salaried", "Self-employed", "Business owner", "Student", "Other"]
    employment_type = np.random.choice(emp_types, size=n_samples, p=[0.60, 0.20, 0.12, 0.05, 0.03])
    
    # Employment duration correlated with age
    base_tenure = (age - 20) * 0.45 + np.random.normal(0, 2.5, size=n_samples)
    employment_duration = np.clip(base_tenure, 0.5, 35.0).round(1)

    # 2. Incomes & Expenses
    # Log-normal distribution for income
    log_income = np.random.normal(11.0, 0.55, size=n_samples)
    monthly_income = np.clip(np.exp(log_income), 18000, 350000).round(-2)

    # Expenses typically 30% - 65% of income
    expense_pct = np.random.uniform(0.28, 0.65, size=n_samples) + (dependents * 0.04)
    monthly_expenses = np.clip(monthly_income * expense_pct, 8000, monthly_income * 0.90).round(-2)

    # 3. Credit Profile
    # Credit score distribution: 300 to 850, centered around 690
    credit_score = np.random.normal(690, 75, size=n_samples)
    credit_score = np.clip(credit_score, 300, 850).round().astype(int)

    # Existing debt and EMI
    has_debt_prob = np.where(credit_score > 700, 0.55, 0.75)
    has_debt = np.random.binomial(1, has_debt_prob, size=n_samples)
    existing_loans = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.40, 0.35, 0.15, 0.07, 0.03]) * has_debt
    
    existing_emi = np.where(
        existing_loans > 0,
        np.clip(monthly_income * np.random.uniform(0.08, 0.38, size=n_samples), 2000, monthly_income * 0.55),
        0.0
    ).round(-2)
    
    existing_debt = np.where(
        existing_loans > 0,
        existing_emi * np.random.randint(10, 48, size=n_samples),
        0.0
    ).round(-2)

    # Payment discipline (defaults & late payments)
    # Strongly inversely correlated with credit score
    poor_credit_mask = credit_score < 650
    default_prob = np.where(credit_score < 580, 0.45, np.where(credit_score < 660, 0.15, 0.02))
    previous_defaults = np.random.binomial(2, default_prob, size=n_samples)
    
    late_prob = np.where(credit_score < 620, 0.60, np.where(credit_score < 720, 0.20, 0.04))
    late_payments = np.random.binomial(4, late_prob, size=n_samples)

    # 4. Assets & Liquidity
    # Savings buffer correlated with income and employment duration
    savings_factor = np.random.uniform(2.0, 12.0, size=n_samples) + (employment_duration * 0.2)
    savings = np.clip(monthly_income * savings_factor, 10000, 5000000).round(-2)
    bank_balance = np.clip(monthly_income * np.random.uniform(0.5, 3.5, size=n_samples), 5000, 1500000).round(-2)

    # 5. Loan Request
    purposes = ["Home", "Vehicle", "Education", "Personal", "Business", "Medical", "Other"]
    loan_purpose = np.random.choice(purposes, size=n_samples, p=[0.25, 0.20, 0.15, 0.20, 0.10, 0.06, 0.04])
    
    # Requested loan typically 2x to 15x monthly income
    loan_multiplier = np.random.uniform(3.0, 20.0, size=n_samples)
    requested_loan = np.clip(monthly_income * loan_multiplier, 50000, 5000000).round(-3)
    loan_tenure = np.random.choice([1, 2, 3, 5, 7, 10], size=n_samples, p=[0.10, 0.15, 0.25, 0.30, 0.12, 0.08])

    # 6. Engineered Financial Ratios
    dti_ratio = (existing_emi / monthly_income) * 100.0
    loan_to_income = requested_loan / (monthly_income * 12.0)
    savings_to_loan = savings / requested_loan

    # 7. Ground Truth Default Probability Formulation (Financial Risk Logic)
    # Logistic function of risk factors
    # Base risk
    z = -1.8
    # Credit score impact (high score = massive reduction in risk)
    z -= (credit_score - 650) / 55.0
    # DTI impact (high DTI increases risk)
    z += (dti_ratio - 25.0) / 12.0
    # Loan to income impact
    z += (loan_to_income - 1.5) * 0.6
    # Savings buffer (high savings protects against default)
    z -= np.log1p(savings_to_loan) * 1.5
    # Previous defaults (severe penalty)
    z += previous_defaults * 1.8
    # Late payments
    z += late_payments * 0.75
    # Employment duration
    z -= np.clip(employment_duration, 0, 10) * 0.08
    # Noise
    z += np.random.normal(0, 0.4, size=n_samples)

    prob_default = 1.0 / (1.0 + np.exp(-z))
    # Binary classification target (1 = Default / High Risk, 0 = Non-default / Low Risk)
    default_risk = (prob_default > 0.48).astype(int)

    df = pd.DataFrame({
        "age": age,
        "dependents": dependents,
        "employment_type": employment_type,
        "employment_duration": employment_duration,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "credit_score": credit_score,
        "existing_loans": existing_loans,
        "existing_emi": existing_emi,
        "existing_debt": existing_debt,
        "previous_defaults": previous_defaults,
        "late_payments": late_payments,
        "savings": savings,
        "bank_balance": bank_balance,
        "requested_loan": requested_loan,
        "loan_tenure": loan_tenure,
        "loan_purpose": loan_purpose,
        "dti_ratio": dti_ratio.round(2),
        "loan_to_income": loan_to_income.round(2),
        "savings_to_loan": savings_to_loan.round(2),
        "default_risk": default_risk
    })

    return df

if __name__ == "__main__":
    df = generate_credit_dataset(100)
    print(f"Generated sample dataset shape: {df.shape}")
    print(f"Default rate: {df['default_risk'].mean():.2%}")
    print(df.head())
