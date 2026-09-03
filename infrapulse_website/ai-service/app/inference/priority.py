DEFECT_RISK_SCORE = {
    "Spalling": 90,
    "Cracked_Tiles": 80,
    "Stagnant_Water": 65,
    "Peeling": 40
}

def calculate_severity(defect: str, extent_score: int):
    """
    Severity = 0.65 * defect risk + 0.35 * extent score.
    Labels: HIGH >= 75; MEDIUM >= 50; otherwise LOW.
    """
    defect_risk = DEFECT_RISK_SCORE.get(defect, 0)
    severity_score = (0.65 * defect_risk) + (0.35 * extent_score)
    
    if severity_score >= 75:
        severity_label = "HIGH"
    elif severity_score >= 50:
        severity_label = "MEDIUM"
    else:
        severity_label = "LOW"
        
    return severity_score, severity_label

def calculate_priority(defect: str, confidence: float, severity_score: float, extent_score: int):
    """
    Priority = 0.40 * defect risk + 0.30 * severity score + 0.20 * extent score + 0.10 * (confidence * 100).
    Clamped to [0, 100].
    Labels: CRITICAL >= 75; HIGH >= 60; MEDIUM >= 40; otherwise LOW.
    """
    defect_risk = DEFECT_RISK_SCORE.get(defect, 0)
    
    priority_score = (
        (0.40 * defect_risk) +
        (0.30 * severity_score) +
        (0.20 * extent_score) +
        (0.10 * (confidence * 100))
    )
    
    priority_score = max(0.0, min(100.0, priority_score))
    
    if priority_score >= 75:
        priority_level = "CRITICAL"
    elif priority_score >= 60:
        priority_level = "HIGH"
    elif priority_score >= 40:
        priority_level = "MEDIUM"
    else:
        priority_level = "LOW"
        
    return priority_score, priority_level
