import cv2
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from app.inference.model import get_model, DEVICE, CLASS_NAMES
from app.inference.classifier import inference_transform

class GradCAMContext:
    def __init__(self):
        self.model = get_model()
        self.target_layer = self.model.features[-1]
        
        self.activations = None
        self.gradients = None
        self.handlers = []
        
        def forward_hook(module, input, output):
            self.activations = output
            
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0]
            
        self.handlers.append(self.target_layer.register_forward_hook(forward_hook))
        self.handlers.append(self.target_layer.register_full_backward_hook(backward_hook))

    def remove_hooks(self):
        for h in self.handlers:
            h.remove()
        self.handlers = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.remove_hooks()

    def generate_cam(self, image: Image.Image):
        self.activations = None
        self.gradients = None

        original_np = np.array(image.convert("RGB"))
        tensor = inference_transform(image.convert("RGB")).unsqueeze(0).to(DEVICE)

        self.model.zero_grad(set_to_none=True)
        output = self.model(tensor)

        predicted_index = torch.argmax(output, dim=1).item()
        target_score = output[0, predicted_index]

        target_score.backward()

        activations = self.activations.detach().cpu()
        gradients = self.gradients.detach().cpu()

        weights = gradients.mean(dim=(2, 3), keepdim=True)
        cam = (weights * activations).sum(dim=1)
        cam = F.relu(cam)
        cam = cam[0].numpy()

        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()

        height, width = original_np.shape[:2]
        cam = cv2.resize(cam, (width, height))

        return original_np, cam, predicted_index

def calculate_visible_extent(cam, threshold=0.40):
    active_region = (cam >= threshold)
    total_pixels = active_region.shape[0] * active_region.shape[1]
    active_pixels = active_region.sum()
    
    extent_ratio = active_pixels / total_pixels
    extent_percentage = extent_ratio * 100.0
    
    return float(extent_ratio), float(extent_percentage)

def classify_extent(extent_ratio: float):
    if extent_ratio < 0.10:
        return "SMALL", 20
    elif extent_ratio < 0.25:
        return "MODERATE", 45
    elif extent_ratio < 0.45:
        return "LARGE", 70
    else:
        return "VERY LARGE", 90

def analyze_visual_extent(image: Image.Image):
    with GradCAMContext() as cam_ctx:
        _, cam, _ = cam_ctx.generate_cam(image)
        
    extent_ratio, extent_percentage = calculate_visible_extent(cam)
    extent_label, extent_score = classify_extent(extent_ratio)
    
    return {
        "visible_extent_ratio": extent_ratio,
        "visible_extent_percentage": extent_percentage,
        "extent_label": extent_label,
        "extent_score": extent_score
    }
