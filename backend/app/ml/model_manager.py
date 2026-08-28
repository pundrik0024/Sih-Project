import os
import json
import joblib
import numpy as np
from typing import Dict, Any, Tuple, Optional
from app.core.config import settings
from app.ml.features import extract_features_from_flow
from app.ml.train import train_and_save_models

class MLModelManager:
    _instance = None
    
    def __init__(self):
        self.scaler = None
        self.anomaly_model = None
        self.threat_classifier = None
        self.metrics = {}
        self.is_loaded = False
        self.load_models()
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = MLModelManager()
        return cls._instance
        
    def load_models(self, force_retrain: bool = False):
        scaler_path = os.path.join(settings.MODELS_DIR, "scaler.pkl")
        anomaly_path = os.path.join(settings.MODELS_DIR, "anomaly_model.pkl")
        clf_path = os.path.join(settings.MODELS_DIR, "classification_model.pkl")
        metrics_path = os.path.join(settings.MODELS_DIR, "metrics.json")
        
        if force_retrain or not (os.path.exists(scaler_path) and os.path.exists(anomaly_path) and os.path.exists(clf_path)):
            print("Training models for first-run setup...")
            self.metrics = train_and_save_models(settings.MODELS_DIR, settings.DATA_DIR)
        
        try:
            self.scaler = joblib.load(scaler_path)
            self.anomaly_model = joblib.load(anomaly_path)
            self.threat_classifier = joblib.load(clf_path)
            if os.path.exists(metrics_path):
                with open(metrics_path, "r") as f:
                    self.metrics = json.load(f)
            self.is_loaded = True
            print("Loaded AI models & metrics successfully.")
        except Exception as e:
            print(f"Error loading models: {e}. Retraining now...")
            self.metrics = train_and_save_models(settings.MODELS_DIR, settings.DATA_DIR)
            self.scaler = joblib.load(scaler_path)
            self.anomaly_model = joblib.load(anomaly_path)
            self.threat_classifier = joblib.load(clf_path)
            self.is_loaded = True

    def predict(self, flow_dict: Dict[str, Any], baseline_dict: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes hybrid inference:
        1. Feature Extraction & Scaling
        2. Isolation Forest Anomaly Score (0.0 to 1.0)
        3. Random Forest Threat Classification & Probability Distribution
        """
        if not self.is_loaded:
            self.load_models()
            
        features_raw = extract_features_from_flow(flow_dict, baseline_dict)
        features_scaled = self.scaler.transform(features_raw)
        
        # Isolation Forest: -1 for anomaly, 1 for normal
        iso_pred = self.anomaly_model.predict(features_scaled)[0]
        # Decision function: lower values mean more anomalous
        iso_score = self.anomaly_model.decision_function(features_scaled)[0]
        # Normalize anomaly score to [0.0, 1.0] where 1.0 is highest anomaly
        # Typically iso_score ranges between -0.3 and 0.2
        anomaly_score_norm = float(np.clip(1.0 - (iso_score + 0.25) / 0.5, 0.0, 1.0))
        is_anomaly = bool(iso_pred == -1 or anomaly_score_norm > 0.60)
        
        # Threat classification
        predicted_threat = str(self.threat_classifier.predict(features_scaled)[0])
        probabilities = self.threat_classifier.predict_proba(features_scaled)[0]
        classes = self.threat_classifier.classes_
        
        prob_dict = {cls_name: float(round(prob, 4)) for cls_name, prob in zip(classes, probabilities)}
        threat_confidence = float(round(prob_dict.get(predicted_threat, 0.0), 4))
        
        # If threat classifier identified a specific attack with high confidence
        if predicted_threat != "Normal Traffic" and threat_confidence > 0.45:
            is_anomaly = True
            
        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": round(anomaly_score_norm, 4),
            "predicted_threat": predicted_threat,
            "threat_confidence": threat_confidence,
            "class_probabilities": prob_dict
        }

model_manager = MLModelManager.get_instance()
