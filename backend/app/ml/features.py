import numpy as np
import pandas as pd
from typing import Dict, Any, List

FEATURE_COLUMNS = [
    "bytes_sent",
    "bytes_received",
    "packet_count",
    "connection_duration",
    "connections_per_minute",
    "upload_download_ratio",
    "destination_reputation",
    "is_external",
    "hour_of_day",
    "is_off_hours",
    "dst_port",
    "unusual_destination",
    "new_device",
    "baseline_deviation"
]

def extract_features_from_flow(flow: Dict[str, Any], baseline: Dict[str, Any] = None) -> np.ndarray:
    """
    Extracts and computes unified numerical feature vector from a single raw flow dict + optional UEBA baseline.
    """
    bytes_sent = float(flow.get("bytes_sent", 0.0))
    bytes_received = float(flow.get("bytes_received", 0.0))
    packet_count = float(flow.get("packet_count", 1))
    duration = max(0.01, float(flow.get("connection_duration", 1.0)))
    conn_per_min = float(flow.get("connections_per_minute", flow.get("connections_per_min", 5.0)))
    up_down_ratio = bytes_sent / max(1.0, bytes_received)
    dst_reputation = float(flow.get("destination_reputation", 1.0))
    is_external = 1.0 if flow.get("is_external", False) else 0.0
    
    # Time
    hour = flow.get("hour_of_day")
    if hour is None:
        ts = flow.get("timestamp")
        if hasattr(ts, "hour"):
            hour = ts.hour
        else:
            hour = 12
    is_off_hours = 1.0 if (hour < 8 or hour > 19) else 0.0
    dst_port = float(flow.get("dst_port", 443))
    
    # Baseline comparison features
    unusual_destination = 1.0 if flow.get("unusual_destination", False) else 0.0
    new_device = 1.0 if flow.get("new_device", False) else 0.0
    baseline_dev = float(flow.get("baseline_deviation", 0.0))
    
    if baseline:
        # Check volume baseline deviation
        avg_sent = float(baseline.get("avg_daily_bytes_sent", 25000000.0))
        if bytes_sent > (avg_sent * 0.5):
            baseline_dev = min(1.0, max(baseline_dev, bytes_sent / (avg_sent * 2.0)))
            
        # Check destinations
        common_dst = baseline.get("common_destinations", [])
        if isinstance(common_dst, str):
            import json
            try:
                common_dst = json.loads(common_dst)
            except Exception:
                common_dst = []
        if flow.get("dst_ip") and flow.get("dst_ip") not in common_dst and is_external:
            unusual_destination = 1.0
            
        # Check device
        typical_dev = baseline.get("typical_device_code")
        if typical_dev and flow.get("device_id") and flow.get("device_id") != typical_dev:
            new_device = 1.0
            
    vector = [
        bytes_sent,
        bytes_received,
        packet_count,
        duration,
        conn_per_min,
        up_down_ratio,
        dst_reputation,
        is_external,
        float(hour),
        is_off_hours,
        dst_port,
        unusual_destination,
        new_device,
        baseline_dev
    ]
    return np.array(vector, dtype=np.float32).reshape(1, -1)
