import time
import torch
from torchvision import transforms
from PIL import Image
from app.inference.model import get_model, DEVICE, CLASS_NAMES

inference_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def predict_image(image: Image.Image):
    """
    Runs classification forward pass on the given PIL Image.
    Returns the predicted class name, class index, confidence, and inference time in ms.
    """
    start_time = time.perf_counter()
    model = get_model()
    
    tensor = inference_transform(image.convert("RGB")).unsqueeze(0).to(DEVICE)
    
    with torch.no_grad():
        logits = model(tensor)
        probabilities = torch.softmax(logits, dim=1)
        predicted_index = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0, predicted_index].item()
        
    inference_time_ms = (time.perf_counter() - start_time) * 1000
    predicted_class = CLASS_NAMES[predicted_index]
    
    return {
        "class": predicted_class,
        "class_index": predicted_index,
        "confidence": confidence,
        "inference_time_ms": inference_time_ms
    }
