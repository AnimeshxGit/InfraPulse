import pytest
from app.inference.priority import calculate_severity, calculate_priority
from app.inference.gradcam import classify_extent
from app.inference.model import DEFECT_DEPARTMENT

def test_classify_extent():
    assert classify_extent(0.05) == ("SMALL", 20)
    assert classify_extent(0.15) == ("MODERATE", 45)
    assert classify_extent(0.35) == ("LARGE", 70)
    assert classify_extent(0.55) == ("VERY LARGE", 90)

def test_severity_spalling_large():
    score, label = calculate_severity("Spalling", 70)
    # 0.65 * 90 + 0.35 * 70 = 58.5 + 24.5 = 83.0 -> HIGH
    assert score == 83.0
    assert label == "HIGH"

def test_severity_peeling_small():
    score, label = calculate_severity("Peeling", 20)
    # 0.65 * 40 + 0.35 * 20 = 26 + 7 = 33.0 -> LOW
    assert score == 33.0
    assert label == "LOW"

def test_priority_spalling_large_high_conf():
    score, level = calculate_priority("Spalling", 0.95, 83.0, 70)
    # 0.40 * 90 + 0.30 * 83.0 + 0.20 * 70 + 0.10 * 95 = 36 + 24.9 + 14 + 9.5 = 84.4 -> CRITICAL
    assert pytest.approx(score) == 84.4
    assert level == "CRITICAL"

def test_defect_department_mapping():
    assert DEFECT_DEPARTMENT["Cracked_Tiles"] == "Performance"
    assert DEFECT_DEPARTMENT["Peeling"] == "Performance"
    assert DEFECT_DEPARTMENT["Spalling"] == "Structural"
    assert DEFECT_DEPARTMENT["Stagnant_Water"] == "Functional"
