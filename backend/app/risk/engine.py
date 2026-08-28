from typing import Dict, Any, List, Tuple
from app.core.config import settings
from app.database.models import SeverityEnum

def calculate_explainable_risk(
    ml_result: Dict[str, Any],
    baseline_analysis: Dict[str, Any],
    flow: Dict[str, Any],
    employee: Any
) -> Dict[str, Any]:
    """
    Computes a transparent, explainable 0-100 risk score based on 7 weighted cybersecurity factors:
    1. ML Anomaly Score (30%)
    2. Data Exfiltration Indicators (20%)
    3. Destination Anomaly (15%)
    4. Behavior Deviation (15%)
    5. Time Anomaly (5%)
    6. Device Anomaly (5%)
    7. Historical Incidents (10%)
    """
    
    # 1. ML Anomaly Factor (0 - 100)
    raw_ml_anomaly = ml_result.get("anomaly_score", 0.0) * 100.0
    threat_pred = ml_result.get("predicted_threat", "Normal Traffic")
    threat_conf = ml_result.get("threat_confidence", 0.0)
    
    if threat_pred != "Normal Traffic":
        raw_ml_anomaly = max(raw_ml_anomaly, 70.0 + (threat_conf * 30.0))
    ml_anomaly_score = min(100.0, max(0.0, raw_ml_anomaly))
    
    # 2. Data Exfiltration Factor (0 - 100)
    bytes_sent = float(flow.get("bytes_sent", 0.0))
    up_down_ratio = float(flow.get("upload_download_ratio", 0.1))
    
    data_exfil_score = 0.0
    if bytes_sent > 1000000000:       # > 1GB
        data_exfil_score = 100.0
    elif bytes_sent > 100000000:     # > 100MB
        data_exfil_score = 80.0
    elif bytes_sent > 20000000:      # > 20MB
        data_exfil_score = 50.0
    elif bytes_sent > 5000000:       # > 5MB
        data_exfil_score = 25.0
        
    if up_down_ratio > 10.0:
        data_exfil_score = min(100.0, data_exfil_score + 25.0)
    elif up_down_ratio > 3.0:
        data_exfil_score = min(100.0, data_exfil_score + 10.0)
        
    # 3. Destination Anomaly Factor (0 - 100)
    dst_rep = float(flow.get("destination_reputation", 1.0))
    is_unseen = baseline_analysis.get("is_unseen_dest", False)
    is_external = flow.get("is_external", False)
    
    dst_anomaly_score = (1.0 - dst_rep) * 70.0
    if is_unseen and is_external:
        dst_anomaly_score = min(100.0, dst_anomaly_score + 40.0)
    elif is_external and dst_rep < 0.7:
        dst_anomaly_score = min(100.0, dst_anomaly_score + 20.0)
        
    # 4. Behavior Deviation Factor (0 - 100)
    vol_ratio = baseline_analysis.get("volume_ratio", 1.0)
    if vol_ratio > 10.0:
        behavior_deviation_score = 100.0
    elif vol_ratio > 5.0:
        behavior_deviation_score = 85.0
    elif vol_ratio > 2.0:
        behavior_deviation_score = 55.0
    elif vol_ratio > 1.2:
        behavior_deviation_score = 25.0
    else:
        behavior_deviation_score = 10.0
        
    # 5. Time Anomaly Factor (0 - 100)
    is_off_hours = baseline_analysis.get("is_off_hours", False)
    time_anomaly_score = 90.0 if is_off_hours else 5.0
    
    # 6. Device Anomaly Factor (0 - 100)
    is_dev_mismatch = baseline_analysis.get("is_device_mismatch", False)
    device_anomaly_score = 85.0 if is_dev_mismatch else 5.0
    
    # 7. Historical Risk Factor (0 - 100)
    prev_incidents = getattr(employee, "previous_incidents_count", 0) if employee else 0
    historical_risk_score = min(100.0, prev_incidents * 25.0 + 10.0)
    
    # Weighted calculation
    total_score = (
        (ml_anomaly_score * settings.WEIGHT_ML_ANOMALY) +
        (data_exfil_score * settings.WEIGHT_DATA_EXFILTRATION) +
        (dst_anomaly_score * settings.WEIGHT_DESTINATION_ANOMALY) +
        (behavior_deviation_score * settings.WEIGHT_BEHAVIOR_DEVIATION) +
        (time_anomaly_score * settings.WEIGHT_TIME_ANOMALY) +
        (device_anomaly_score * settings.WEIGHT_DEVICE_ANOMALY) +
        (historical_risk_score * settings.WEIGHT_HISTORICAL_RISK)
    )
    
    total_score = round(min(100.0, max(0.0, total_score)), 1)
    
    # Severity classification
    if total_score <= settings.THRESHOLD_LOW_MAX:
        severity = SeverityEnum.LOW
    elif total_score <= settings.THRESHOLD_MEDIUM_MAX:
        severity = SeverityEnum.MEDIUM
    elif total_score <= settings.THRESHOLD_HIGH_MAX:
        severity = SeverityEnum.HIGH
    else:
        severity = SeverityEnum.CRITICAL
        
    # Compile plain-English reasons
    reasons = list(baseline_analysis.get("reasons", []))
    if ml_result.get("is_anomaly") and threat_pred != "Normal Traffic":
        reasons.insert(0, f"AI Threat Detection Engine identified signature patterns of '{threat_pred}' with {threat_conf*100:.1f}% model confidence.")
    elif ml_result.get("is_anomaly"):
        reasons.insert(0, f"Isolation Forest Anomaly Model detected severe statistical divergence from normal baseline (Anomaly index: {ml_result.get('anomaly_score', 0):.2f}).")
        
    if not reasons:
        reasons.append("Traffic volume, connection duration, and destination profile match normal historical baseline.")
        
    # Summary & Recommended response
    emp_name = getattr(employee, "name", "User") if employee else "User"
    if severity == SeverityEnum.CRITICAL:
        explanation_summary = f"Critical security alert: High-risk anomaly detected for {emp_name}. Substantial divergence in outbound volume, untrusted destination, and off-hours execution."
        recommended_action = "Recommended action: Immediate investigation required. Initiate access restriction (RESTRICTED status) through the Authorized Response Layer."
    elif severity == SeverityEnum.HIGH:
        explanation_summary = f"High security alert: Suspicious network activity detected for {emp_name} matching {threat_pred} indicators."
        recommended_action = "Recommended action: Security Analyst review and notify Department Manager for access verification."
    elif severity == SeverityEnum.MEDIUM:
        explanation_summary = f"Medium security warning: Mild behavioral divergence or unusual connection destination observed for {emp_name}."
        recommended_action = "Recommended action: Log and notify Department Manager for situational awareness."
    else:
        explanation_summary = f"Normal baseline activity for {emp_name} within expected operational parameters."
        recommended_action = "No action required. Traffic logged into read-only monitoring database."

    return {
        "total_score": total_score,
        "severity": severity,
        "factors": {
            "ml_anomaly_score": round(ml_anomaly_score, 1),
            "data_exfil_score": round(data_exfil_score, 1),
            "dst_anomaly_score": round(dst_anomaly_score, 1),
            "behavior_deviation_score": round(behavior_deviation_score, 1),
            "time_anomaly_score": round(time_anomaly_score, 1),
            "device_anomaly_score": round(device_anomaly_score, 1),
            "historical_risk_score": round(historical_risk_score, 1)
        },
        "reasons": reasons,
        "explanation_summary": explanation_summary,
        "recommended_action": recommended_action
    }
