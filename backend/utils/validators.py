"""
Applicant Input Validation Utilities
Validates applicant financial input against banking sanity checks and educational constraints.
Rejects negative numbers and invalid ranges with clear, friendly error messages.
"""

VALID_EMPLOYMENT_TYPES = ["Salaried", "Self-employed", "Business owner", "Student", "Other"]
VALID_LOAN_PURPOSES = ["Education", "Home", "Vehicle", "Personal", "Business", "Medical", "Other"]

def validate_applicant_data(data: dict) -> tuple[bool, dict]:
    """
    Validates applicant data dictionary.
    Returns: (is_valid: bool, errors: dict)
    """
    errors = {}

    if not isinstance(data, dict):
        return False, {"payload": "Invalid request body: expected a JSON object."}

    # 1. Personal Information
    age = data.get("age")
    if age is None or age == "":
        errors["age"] = "Age is required."
    else:
        try:
            age_val = int(age)
            if age_val < 18 or age_val > 100:
                errors["age"] = "Age must be between 18 and 100."
        except (ValueError, TypeError):
            errors["age"] = "Age must be a valid whole number."

    dependents = data.get("dependents", 0)
    try:
        dep_val = int(dependents)
        if dep_val < 0 or dep_val > 25:
            errors["dependents"] = "Dependents must be a non-negative number between 0 and 25."
    except (ValueError, TypeError):
        errors["dependents"] = "Dependents must be a valid integer."

    emp_type = data.get("employment_type", "").strip()
    if not emp_type:
        errors["employment_type"] = "Employment type is required."
    elif emp_type.lower() not in [t.lower() for t in VALID_EMPLOYMENT_TYPES]:
        errors["employment_type"] = f"Employment type must be one of: {', '.join(VALID_EMPLOYMENT_TYPES)}."

    emp_duration = data.get("employment_duration")
    if emp_duration is None or emp_duration == "":
        errors["employment_duration"] = "Employment duration is required."
    else:
        try:
            dur_val = float(emp_duration)
            if dur_val < 0 or dur_val > 60:
                errors["employment_duration"] = "Employment duration must be between 0 and 60 years."
        except (ValueError, TypeError):
            errors["employment_duration"] = "Employment duration must be a valid number."

    # 2. Income & Expenses
    income = data.get("monthly_income")
    if income is None or income == "":
        errors["monthly_income"] = "Monthly income is required."
    else:
        try:
            inc_val = float(income)
            if inc_val <= 0:
                errors["monthly_income"] = "Monthly income must be greater than zero."
        except (ValueError, TypeError):
            errors["monthly_income"] = "Monthly income must be a valid positive number."

    expenses = data.get("monthly_expenses")
    if expenses is None or expenses == "":
        errors["monthly_expenses"] = "Monthly expenses are required."
    else:
        try:
            exp_val = float(expenses)
            if exp_val < 0:
                errors["monthly_expenses"] = "Monthly expenses cannot be negative."
        except (ValueError, TypeError):
            errors["monthly_expenses"] = "Monthly expenses must be a valid number."

    # 3. Credit Profile
    credit_score = data.get("credit_score")
    if credit_score is None or credit_score == "":
        errors["credit_score"] = "Credit score is required."
    else:
        try:
            cs_val = int(credit_score)
            if cs_val < 300 or cs_val > 850:
                errors["credit_score"] = "Credit score must be between 300 and 850."
        except (ValueError, TypeError):
            errors["credit_score"] = "Credit score must be a whole number between 300 and 850."

    existing_loans = data.get("existing_loans", 0)
    try:
        el_val = int(existing_loans)
        if el_val < 0:
            errors["existing_loans"] = "Existing loans count cannot be negative."
    except (ValueError, TypeError):
        errors["existing_loans"] = "Existing loans must be a valid number."

    existing_emi = data.get("existing_emi", 0)
    try:
        emi_val = float(existing_emi)
        if emi_val < 0:
            errors["existing_emi"] = "Existing monthly EMI cannot be negative."
    except (ValueError, TypeError):
        errors["existing_emi"] = "Existing EMI must be a valid number."

    previous_defaults = data.get("previous_defaults", 0)
    try:
        def_val = int(previous_defaults)
        if def_val < 0:
            errors["previous_defaults"] = "Previous loan defaults cannot be negative."
    except (ValueError, TypeError):
        errors["previous_defaults"] = "Previous loan defaults must be a valid integer."

    late_payments = data.get("late_payments", 0)
    try:
        lp_val = int(late_payments)
        if lp_val < 0:
            errors["late_payments"] = "Late payment count cannot be negative."
    except (ValueError, TypeError):
        errors["late_payments"] = "Late payments must be a valid integer."

    # 4. Assets and Debt
    savings = data.get("savings", 0)
    try:
        sav_val = float(savings)
        if sav_val < 0:
            errors["savings"] = "Savings cannot be negative."
    except (ValueError, TypeError):
        errors["savings"] = "Savings must be a valid number."

    bank_balance = data.get("bank_balance", 0)
    try:
        bb_val = float(bank_balance)
        if bb_val < 0:
            errors["bank_balance"] = "Bank balance cannot be negative."
    except (ValueError, TypeError):
        errors["bank_balance"] = "Bank balance must be a valid number."

    existing_debt = data.get("existing_debt", 0)
    try:
        deb_val = float(existing_debt)
        if deb_val < 0:
            errors["existing_debt"] = "Existing debt cannot be negative."
    except (ValueError, TypeError):
        errors["existing_debt"] = "Existing debt must be a valid number."

    # 5. Loan Request
    requested_loan = data.get("requested_loan")
    if requested_loan is None or requested_loan == "":
        errors["requested_loan"] = "Requested loan amount is required."
    else:
        try:
            rl_val = float(requested_loan)
            if rl_val <= 0:
                errors["requested_loan"] = "Requested loan amount must be greater than zero."
        except (ValueError, TypeError):
            errors["requested_loan"] = "Requested loan amount must be a valid positive number."

    loan_tenure = data.get("loan_tenure")
    if loan_tenure is None or loan_tenure == "":
        errors["loan_tenure"] = "Loan tenure is required."
    else:
        try:
            lt_val = float(loan_tenure)
            if lt_val < 0.5 or lt_val > 35:
                errors["loan_tenure"] = "Loan tenure must be between 0.5 and 35 years."
        except (ValueError, TypeError):
            errors["loan_tenure"] = "Loan tenure must be a valid number."

    loan_purpose = data.get("loan_purpose", "").strip()
    if not loan_purpose:
        errors["loan_purpose"] = "Loan purpose is required."
    elif loan_purpose not in VALID_LOAN_PURPOSES:
        errors["loan_purpose"] = f"Loan purpose must be one of: {', '.join(VALID_LOAN_PURPOSES)}."

    is_valid = len(errors) == 0
    return is_valid, errors
