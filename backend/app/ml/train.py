import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from app.ml.dataset_generator import generate_synthetic_dataset
from app.ml.features import FEATURE_COLUMNS

def train_and_save_models(models_dir: str, data_dir: str):
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)
    
    csv_path = os.path.join(data_dir, "synthetic_network_flows.csv")
    if not os.path.exists(csv_path):
        print("Generating synthetic network flow dataset...")
        df = generate_synthetic_dataset(num_samples=7500, seed=42, output_path=csv_path)
    else:
        df = pd.read_csv(csv_path)
        
    X = df[FEATURE_COLUMNS].values
    y_binary = df["label"].values
    y_threat = df["threat_type"].values
    
    X_train, X_test, y_train_threat, y_test_threat, y_train_bin, y_test_bin = train_test_split(
        X, y_threat, y_binary, test_size=0.25, random_state=42, stratify=y_threat
    )
    
    # 1. Feature Scaler
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 2. Model 1: Isolation Forest (Trained on Normal traffic only for pure anomaly detection)
    normal_mask = (y_train_bin == 0)
    X_train_normal = X_train_scaled[normal_mask]
    
    iso_forest = IsolationForest(
        n_estimators=120,
        contamination=0.08,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train_normal)
    
    # 3. Model 2: Supervised Multi-class Threat Classifier (Random Forest)
    threat_classifier = RandomForestClassifier(
        n_estimators=150,
        max_depth=14,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1
    )
    threat_classifier.fit(X_train_scaled, y_train_threat)
    
    # 4. Evaluation
    y_pred_threat = threat_classifier.predict(X_test_scaled)
    acc = float(accuracy_score(y_test_threat, y_pred_threat))
    prec = float(precision_score(y_test_threat, y_pred_threat, average="weighted", zero_division=0))
    rec = float(recall_score(y_test_threat, y_pred_threat, average="weighted", zero_division=0))
    f1 = float(f1_score(y_test_threat, y_pred_threat, average="weighted", zero_division=0))
    
    labels = sorted(list(set(y_threat)))
    cm = confusion_matrix(y_test_threat, y_pred_threat, labels=labels).tolist()
    
    feature_importances = {
        col: float(imp) for col, imp in zip(FEATURE_COLUMNS, threat_classifier.feature_importances_)
    }
    
    metrics = {
        "model_name": "AegisGuard Hybrid Threat Detector",
        "version": "v1.2.0-ntro",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "labels": labels,
        "confusion_matrix": cm,
        "feature_importances": feature_importances,
        "dataset_notice": "Prototype model trained using reproducible synthetic/labeled network-flow dataset."
    }
    
    # Save artifacts
    joblib.dump(scaler, os.path.join(models_dir, "scaler.pkl"))
    joblib.dump(iso_forest, os.path.join(models_dir, "anomaly_model.pkl"))
    joblib.dump(threat_classifier, os.path.join(models_dir, "classification_model.pkl"))
    
    with open(os.path.join(models_dir, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"ML Training Pipeline completed successfully! Metrics: Accuracy={acc:.4f}, F1={f1:.4f}")
    return metrics

if __name__ == "__main__":
    from app.core.config import settings
    train_and_save_models(settings.MODELS_DIR, settings.DATA_DIR)
