import time
from datetime import datetime, timezone
from PIL import Image
from app.contracts import InferenceJob, InferenceResult
from app.inference.classifier import predict_image
from app.inference.gradcam import analyze_visual_extent
from app.inference.priority import calculate_severity, calculate_priority
from app.inference.model import DEFECT_DEPARTMENT

def run_inference(job: InferenceJob, image: Image.Image) -> InferenceResult:
    start_time = time.perf_counter()
    
    # 1. Classification
    clf_result = predict_image(image)
    defect = clf_result["class"]
    confidence = clf_result["confidence"]
    classifier_inference_ms = clf_result["inference_time_ms"]
    
    # 2. Grad-CAM extent
    extent_result = analyze_visual_extent(image)
    
    # 3. Severity & Priority
    severity_score, severity = calculate_severity(defect, extent_result["extent_score"])
    priority_score, priority_level = calculate_priority(
        defect, confidence, severity_score, extent_result["extent_score"]
    )
    
    # 4. Pipeline timing
    pipeline_time_ms = (time.perf_counter() - start_time) * 1000
    
    return InferenceResult(
        event_type="ai.inference.completed",
        pipeline_version=job.pipeline_version,
        job_id=job.job_id,
        complaint_id=job.complaint_id,
        
        detected_defect=defect,
        category=DEFECT_DEPARTMENT[defect],
        confidence=confidence,
        
        visible_extent_ratio=extent_result["visible_extent_ratio"],
        visible_extent_percentage=extent_result["visible_extent_percentage"],
        extent_label=extent_result["extent_label"],
        extent_score=extent_result["extent_score"],
        
        severity_score=severity_score,
        severity=severity,
        
        priority_score=priority_score,
        priority_level=priority_level,
        
        classifier_inference_ms=classifier_inference_ms,
        pipeline_time_ms=pipeline_time_ms,
        processed_at=datetime.now(timezone.utc)
    )
