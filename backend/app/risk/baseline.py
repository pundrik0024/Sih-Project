import json
from typing import Dict, Any, Tuple, List
from datetime import datetime

def compare_flow_with_baseline(flow: Dict[str, Any], baseline_obj: Any, employee_obj: Any) -> Dict[str, Any]:
    """
    Compares incoming flow metadata with the employee's historical baseline profile.
    Returns deviation metrics and descriptive anomaly statements.
    """
    reasons = []
    
    # Defaults if baseline not yet fully populated
    avg_bytes_sent = getattr(baseline_obj, "avg_daily_bytes_sent", 25000000.0) if baseline_obj else 25000000.0
    max_burst = getattr(baseline_obj, "max_normal_burst_bytes", 50000000.0) if baseline_obj else 50000000.0
    avg_conn_rate = getattr(baseline_obj, "avg_connections_per_min", 12.0) if baseline_obj else 12.0
    
    # Parse common destinations
    common_destinations = []
    if baseline_obj and getattr(baseline_obj, "common_destinations", None):
        raw_dst = baseline_obj.common_destinations
        if isinstance(raw_dst, str):
            try:
                common_destinations = json.loads(raw_dst)
            except Exception:
                common_destinations = []
        elif isinstance(raw_dst, list):
            common_destinations = raw_dst
            
    # Working hours
    work_start = getattr(employee_obj, "work_start_hour", 9) if employee_obj else 9
    work_end = getattr(employee_obj, "work_end_hour", 18) if employee_obj else 18
    
    # 1. Volume analysis
    bytes_sent = float(flow.get("bytes_sent", 0.0))
    volume_ratio = bytes_sent / max(1000.0, avg_bytes_sent)
    is_volume_anomaly = bytes_sent > max_burst or volume_ratio > 3.0
    if is_volume_anomaly:
        if bytes_sent >= 1024 * 1024 * 1024:
            size_str = f"{bytes_sent / (1024**3):.2f} GB"
        elif bytes_sent >= 1024 * 1024:
            size_str = f"{bytes_sent / (1024**2):.1f} MB"
        else:
            size_str = f"{bytes_sent / 1024:.0f} KB"
            
        emp_name = getattr(employee_obj, "name", "Employee") if employee_obj else "Employee"
        reasons.append(f"Outbound transfer of {size_str} is {volume_ratio:.1f}× higher than {emp_name}'s baseline.")
        
    # 2. Time analysis
    hour = flow.get("hour_of_day")
    if hour is None:
        ts = flow.get("timestamp")
        if isinstance(ts, datetime):
            hour = ts.hour
        else:
            hour = 12
            
    is_off_hours = (hour < work_start or hour >= work_end)
    if is_off_hours:
        reasons.append(f"Activity occurred at {hour:02d}:00, outside normal working hours ({work_start:02d}:00 - {work_end:02d}:00).")
        
    # 3. Destination analysis
    dst_ip = flow.get("dst_ip", "")
    is_external = flow.get("is_external", False)
    is_unseen_dest = False
    if is_external and dst_ip and (dst_ip not in common_destinations):
        is_unseen_dest = True
        reputation = flow.get("destination_reputation", 1.0)
        reasons.append(f"Connection to unobserved external destination {dst_ip} (Reputation: {reputation:.2f}).")
        
    # 4. Upload/Download ratio
    up_down_ratio = float(flow.get("upload_download_ratio", 0.0))
    if up_down_ratio > 4.0 and bytes_sent > 5000000:
        reasons.append(f"Upload-to-download ratio ({up_down_ratio:.1f}:1) indicates heavy outbound data exfiltration.")
        
    # 5. Frequency analysis
    conn_rate = float(flow.get("connections_per_min", flow.get("connections_per_minute", 5.0)))
    if conn_rate > (avg_conn_rate * 4.0):
        reasons.append(f"High connection frequency ({conn_rate:.0f} conn/min) exceeds typical profile ({avg_conn_rate:.0f} conn/min).")
        
    # 6. Device verification
    flow_dev = flow.get("device_id")
    emp_dev = getattr(employee_obj, "device_id", None) if employee_obj else None
    is_device_mismatch = False
    if flow_dev and emp_dev and flow_dev != emp_dev:
        is_device_mismatch = True
        reasons.append(f"Traffic originated from unregistered device ID {flow_dev} instead of assigned {emp_dev}.")
        
    return {
        "volume_ratio": round(volume_ratio, 2),
        "is_volume_anomaly": is_volume_anomaly,
        "is_off_hours": is_off_hours,
        "is_unseen_dest": is_unseen_dest,
        "is_device_mismatch": is_device_mismatch,
        "reasons": reasons
    }
