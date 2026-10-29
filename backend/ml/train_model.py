"""
Model Training Script for Credit Risk & Loan Assessment
Trains an explainable Random Forest Classifier on synthetic credit data.
Evaluates model performance and saves artifacts and real performance metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)

try:
    from ml.dataset_generator import generate_credit_dataset
except ImportError:
    from dataset_generator import generate_credit_dataset

# Defined feature list in exact order
NUMERIC_FEATURES = [
    "age",
    "dependents",
    "employment_duration",
    "monthly_income",
    "monthly_expenses",
    "credit_score",
    "existing_loans",
    "existing_emi",
    "existing_debt",
    "previous_defaults",
    "late_payments",
    "savings",
    "bank_balance",
    "requested_loan",
    "loan_tenure",
    "dti_ratio",
    "loan_to_income",
    "savings_to_loan"
]

def train_and_evaluate(save_dir=None):
    if save_dir is None:
        save_dir = os.path.join(os.path.dirname(__file__), "saved_models")
    os.makedirs(save_dir, exist_ok=True)

    print("[ML TRAIN] Generating synthetic training dataset (5,000 samples)...")
    df = generate_credit_dataset(n_samples=5000, random_seed=42)
    
    X = df[NUMERIC_FEATURES]
    y = df["default_risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[ML TRAIN] Train set size: {len(X_train)}, Test set size: {len(X_test)}")
    print(f"[ML TRAIN] Default class proportion: {y.mean():.2%}")

    # Standard Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Random Forest Classifier with controlled depth for explainability & generalization
    print("[ML TRAIN] Training Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=10,
        min_samples_leaf=5,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train_scaled, y_train)

    # Evaluation
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature Importance
    importances = model.feature_importances_
    feature_importance_list = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(NUMERIC_FEATURES, importances), key=lambda x: x[1], reverse=True)
    ]

    metrics = {
        "model_name": "Random Forest Classifier",
        "algorithm": "RandomForestClassifier(n_estimators=100, max_depth=8)",
        "framework": "scikit-learn",
        "features": NUMERIC_FEATURES,
        "n_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "confusion_matrix": cm,
        "feature_importances": feature_importance_list,
        "evaluation_summary": f"Trained with 80/20 stratified split. Accuracy: {acc*100:.1f}%, F1-Score: {f1*100:.1f}%, ROC-AUC: {roc_auc*100:.1f}%.",
        "dataset_notice": "Model trained and evaluated on synthetic/demo data for educational purposes."
    }

    # Save artifacts
    model_path = os.path.join(save_dir, "model.joblib")
    scaler_path = os.path.join(save_dir, "scaler.joblib")
    metrics_path = os.path.join(save_dir, "metrics.json")

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    print(f"[ML TRAIN] Successfully saved model artifacts to {save_dir}")
    print(f"[ML TRAIN] Metrics: Acc={acc:.3f}, Prec={prec:.3f}, Rec={rec:.3f}, F1={f1:.3f}, AUC={roc_auc:.3f}")
    return metrics

if __name__ == "__main__":
    train_and_evaluate()
