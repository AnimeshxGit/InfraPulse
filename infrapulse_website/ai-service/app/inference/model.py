import os
import torch
import torch.nn as nn
from torchvision import models
from app.config import settings

CLASS_NAMES = [
    "Cracked_Tiles",
    "Peeling",
    "Spalling",
    "Stagnant_Water"
]

DEFECT_DEPARTMENT = {
    "Cracked_Tiles": "Performance",
    "Peeling": "Performance",
    "Spalling": "Structural",
    "Stagnant_Water": "Functional"
}

_model_instance = None
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    """Initializes and loads the MobileNetV3-Small model with the custom checkpoint."""
    if not os.path.exists(settings.MODEL_WEIGHTS_PATH):
        raise FileNotFoundError(f"Model checkpoint not found: {settings.MODEL_WEIGHTS_PATH}")

    model = models.mobilenet_v3_small(weights=None)
    
    # Replace classifier for 4 classes
    model.classifier[-1] = nn.Linear(model.classifier[-1].in_features, len(CLASS_NAMES))
    
    checkpoint = torch.load(settings.MODEL_WEIGHTS_PATH, map_location=DEVICE)
    
    if isinstance(checkpoint, dict):
        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        elif "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]
        else:
            state_dict = checkpoint
    else:
        state_dict = checkpoint
        
    clean_state_dict = {}
    for key, value in state_dict.items():
        new_key = key
        if new_key.startswith("module."):
            new_key = new_key[len("module."):]
        clean_state_dict[new_key] = value

    model.load_state_dict(clean_state_dict, strict=True)
    model = model.to(DEVICE)
    model.eval()
    return model

def get_model():
    """Returns the singleton model instance."""
    global _model_instance
    if _model_instance is None:
        _model_instance = load_model()
    return _model_instance
