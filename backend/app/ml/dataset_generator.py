import numpy as np
import pandas as pd
import random
import os
from datetime import datetime, timedelta

def generate_synthetic_dataset(num_samples: int = 6000, seed: int = 42, output_path: str = None) -> pd.DataFrame:
    np.random.seed(seed)
    random.seed(seed)
    
    rows = []
    
    # 70% Normal traffic, 30% Attacks/Anomalies
    num_normal = int(num_samples * 0.70)
    num_attacks = num_samples - num_normal
    
    attack_types = [
        ("Data Exfiltration", 0.30),
        ("Brute Force", 0.20),
        ("Port Scanning", 0.20),
        ("Denial-of-Service-like Traffic", 0.10),
        ("Botnet-like Behaviour", 0.10),
        ("Abnormal Outbound Traffic", 0.10)
    ]
    
    start_time = datetime.now() - timedelta(days=7)
    
    # Generate Normal traffic
    for i in range(num_normal):
        timestamp = start_time + timedelta(minutes=random.randint(0, 10080))
        hour = timestamp.hour
        # 85% normal working hours (9-18)
        if random.random() < 0.85:
            hour = random.randint(9, 18)
            timestamp = timestamp.replace(hour=hour)
            
        bytes_sent = float(np.random.lognormal(mean=8.5, sigma=1.2))     # ~5KB to ~50KB
        bytes_recv = float(np.random.lognormal(mean=11.0, sigma=1.2))    # ~60KB to ~500KB
        duration = max(0.1, float(np.random.exponential(scale=2.5)))
        packets = max(2, int(bytes_sent / random.randint(500, 1400)) + int(bytes_recv / random.randint(500, 1400)))
        conn_per_min = float(np.random.normal(loc=12, scale=4))
        conn_per_min = max(1.0, conn_per_min)
        up_down_ratio = bytes_sent / max(1.0, bytes_recv)
        
        dst_port = random.choice([80, 443, 53, 8080, 8443, 389, 88])
        protocol = "TCP" if dst_port != 53 else "UDP"
        
        is_external = random.random() < 0.60
        dst_reputation = max(0.85, min(1.0, float(np.random.normal(0.98, 0.03))))
        is_off_hours = 1 if (hour < 8 or hour > 19) else 0
        new_dest_flag = 0 if random.random() < 0.95 else 1
        new_device_flag = 0 if random.random() < 0.98 else 1
        
        rows.append({
            "bytes_sent": bytes_sent,
            "bytes_received": bytes_recv,
            "packet_count": packets,
            "connection_duration": duration,
            "connections_per_minute": conn_per_min,
            "upload_download_ratio": up_down_ratio,
            "destination_reputation": dst_reputation,
            "is_external": 1 if is_external else 0,
            "hour_of_day": hour,
            "is_off_hours": is_off_hours,
            "dst_port": dst_port,
            "unusual_destination": new_dest_flag,
            "new_device": new_device_flag,
            "baseline_deviation": float(np.random.uniform(0.0, 0.25)),
            "label": 0,  # Normal
            "threat_type": "Normal Traffic"
        })
    
    # Generate Attack traffic
    attack_counts = {t[0]: int(num_attacks * t[1]) for t in attack_types}
    
    for threat, count in attack_counts.items():
        for _ in range(count):
            timestamp = start_time + timedelta(minutes=random.randint(0, 10080))
            
            if threat == "Data Exfiltration":
                # High outbound bytes, off-hours, high upload/download ratio, external unseen IP
                hour = random.choice([1, 2, 3, 4, 22, 23])
                bytes_sent = float(np.random.uniform(50000000, 1500000000)) # 50MB to 1.5GB
                bytes_recv = float(np.random.uniform(5000, 50000))          # Tiny ack
                duration = float(np.random.uniform(120.0, 1800.0))
                packets = int(bytes_sent / 1400)
                conn_per_min = float(np.random.uniform(15, 60))
                up_down_ratio = bytes_sent / max(1.0, bytes_recv)
                dst_port = random.choice([443, 22, 8443, 9001, 8088])
                protocol = "TCP"
                is_external = 1
                dst_reputation = float(np.random.uniform(0.1, 0.5))
                is_off_hours = 1
                new_dest = 1
                new_dev = 1 if random.random() < 0.4 else 0
                baseline_dev = float(np.random.uniform(0.75, 1.0))
                
            elif threat == "Brute Force":
                # Rapid connections, small packets, SSH/RDP/SMB
                hour = random.randint(0, 23)
                bytes_sent = float(np.random.uniform(300, 2000))
                bytes_recv = float(np.random.uniform(200, 1500))
                duration = float(np.random.uniform(0.05, 0.4))
                packets = random.randint(4, 12)
                conn_per_min = float(np.random.uniform(80, 400)) # High connection frequency
                up_down_ratio = bytes_sent / max(1.0, bytes_recv)
                dst_port = random.choice([22, 3389, 445, 21, 23])
                protocol = "TCP"
                is_external = 1 if random.random() < 0.7 else 0
                dst_reputation = float(np.random.uniform(0.2, 0.6))
                is_off_hours = 1 if (hour < 8 or hour > 19) else 0
                new_dest = 1 if random.random() < 0.8 else 0
                new_dev = 0
                baseline_dev = float(np.random.uniform(0.65, 0.95))
                
            elif threat == "Port Scanning":
                # Probing many ports, very short duration, 0 or minimal received bytes
                hour = random.randint(0, 23)
                bytes_sent = float(np.random.uniform(40, 120))
                bytes_recv = 0.0
                duration = float(np.random.uniform(0.01, 0.1))
                packets = 1
                conn_per_min = float(np.random.uniform(200, 1200)) # Extreme frequency
                up_down_ratio = 10.0
                dst_port = random.randint(1, 65535)
                protocol = "TCP"
                is_external = 1 if random.random() < 0.5 else 0
                dst_reputation = float(np.random.uniform(0.3, 0.7))
                is_off_hours = 1 if (hour < 8 or hour > 19) else 0
                new_dest = 1
                new_dev = 1 if random.random() < 0.3 else 0
                baseline_dev = float(np.random.uniform(0.70, 0.98))
                
            elif threat == "Denial-of-Service-like Traffic":
                hour = random.randint(0, 23)
                bytes_sent = float(np.random.uniform(500000, 50000000))
                bytes_recv = 0.0
                duration = float(np.random.uniform(0.01, 0.5))
                packets = random.randint(500, 20000)
                conn_per_min = float(np.random.uniform(500, 2500))
                up_down_ratio = 100.0
                dst_port = random.choice([80, 443, 53, 123])
                protocol = random.choice(["TCP", "UDP"])
                is_external = 1
                dst_reputation = float(np.random.uniform(0.1, 0.4))
                is_off_hours = 1 if (hour < 8 or hour > 19) else 0
                new_dest = 1
                new_dev = 0
                baseline_dev = float(np.random.uniform(0.80, 1.0))
                
            elif threat == "Botnet-like Behaviour":
                hour = random.randint(0, 23)
                bytes_sent = float(np.random.uniform(200, 1000))
                bytes_recv = float(np.random.uniform(200, 1000))
                duration = float(np.random.uniform(1.0, 5.0))
                packets = random.randint(5, 20)
                conn_per_min = float(np.random.uniform(1, 4)) # Periodic beacon
                up_down_ratio = 1.0
                dst_port = random.choice([4444, 6667, 8080, 9050, 443])
                protocol = "TCP"
                is_external = 1
                dst_reputation = float(np.random.uniform(0.05, 0.35)) # Known C2 reputation
                is_off_hours = 1 if (hour < 8 or hour > 19) else 0
                new_dest = 1
                new_dev = 0
                baseline_dev = float(np.random.uniform(0.60, 0.90))
                
            else: # Abnormal Outbound Traffic
                hour = random.randint(0, 23)
                bytes_sent = float(np.random.uniform(10000000, 200000000))
                bytes_recv = float(np.random.uniform(100000, 500000))
                duration = float(np.random.uniform(30.0, 300.0))
                packets = int(bytes_sent / 1200)
                conn_per_min = float(np.random.uniform(10, 40))
                up_down_ratio = bytes_sent / max(1.0, bytes_recv)
                dst_port = random.choice([443, 80, 21])
                protocol = "TCP"
                is_external = 1
                dst_reputation = float(np.random.uniform(0.4, 0.8))
                is_off_hours = 1 if (hour < 8 or hour > 19) else 0
                new_dest = 1 if random.random() < 0.6 else 0
                new_dev = 0
                baseline_dev = float(np.random.uniform(0.55, 0.85))

            rows.append({
                "bytes_sent": bytes_sent,
                "bytes_received": bytes_recv,
                "packet_count": packets,
                "connection_duration": duration,
                "connections_per_minute": conn_per_min,
                "upload_download_ratio": up_down_ratio,
                "destination_reputation": dst_reputation,
                "is_external": is_external,
                "hour_of_day": hour,
                "is_off_hours": is_off_hours,
                "dst_port": dst_port,
                "unusual_destination": new_dest,
                "new_device": new_dev,
                "baseline_deviation": baseline_dev,
                "label": 1,  # Malicious / Anomalous
                "threat_type": threat
            })
            
    df = pd.DataFrame(rows)
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    
    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Generated {len(df)} synthetic network flow records at: {output_path}")
        
    return df

if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "..", "data", "synthetic_network_flows.csv")
    generate_synthetic_dataset(output_path=out)
