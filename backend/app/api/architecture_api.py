from fastapi import APIRouter

router = APIRouter(prefix="/architecture", tags=["NTRO / Unidirectional Architecture"])

@router.get("/info")
def get_architecture_details():
    return {
        "title": "Unidirectional IP Traffic Monitoring & Risk-Based Authorized Response Architecture",
        "classification": "Read-Only Enclave Architecture (SIH/NTRO Design)",
        "components": [
            {
                "id": "traffic_mirror",
                "name": "Optical Tap / Unidirectional Data Diode",
                "layer": "Physical / Network Layer",
                "direction": "Ingress Only (Tx -> Rx only, physical Rx disabled on return path)",
                "description": "Hardware or network configuration guarantees zero traffic injection into monitored network."
            },
            {
                "id": "monitoring_enclave",
                "name": "Read-Only Security Monitoring Enclave",
                "layer": "Enclave Processing Layer",
                "subcomponents": [
                    "Feature Extraction & Protocol Parsing",
                    "Isolation Forest Anomaly Detection Engine",
                    "Random Forest Threat Signature Classifier",
                    "Per-Employee UEBA Baseline Profiler",
                    "Explainable Multi-Factor Risk Scoring Engine (0-100)"
                ],
                "description": "Continuously computes threat likelihood and behavioral deviations without write privileges."
            },
            {
                "id": "rbac_routing",
                "name": "Department-Scoped Alert Routing",
                "layer": "Presentation & Authorization Layer",
                "description": "Strict RBAC ensures department managers inspect alerts exclusively for their personnel."
            },
            {
                "id": "iam_response",
                "name": "Authorized IAM & Mitigation Layer (Separate Out-of-Band Channel)",
                "layer": "Response & Enforcement Layer",
                "description": "Mitigation commands (e.g. Restrict Access, Revoke Token) execute out-of-band with Human-in-the-Loop review and immutable audit trails."
            }
        ],
        "guarantees": [
            "Passive non-intrusive monitoring",
            "Zero operational disruption to core infrastructure during analysis",
            "Explainable AI reasoning for human security analysts and judges",
            "Departmental confidentiality and cryptographic auditability"
        ]
    }
