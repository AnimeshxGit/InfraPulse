from PIL import Image
import torch
import torch.nn as nn
from app.inference.gradcam import GradCAMContext

# Dummy model for testing hooks
class DummyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 10, 3, padding=1),
            nn.ReLU()
        )
        self.classifier = nn.Linear(10 * 224 * 224, 4)
        
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

def test_gradcam_context_hooks():
    model = DummyModel()
    
    # We patch the getter to use our dummy model
    import app.inference.gradcam
    original_get_model = app.inference.gradcam.get_model
    app.inference.gradcam.get_model = lambda: model
    
    try:
        ctx = GradCAMContext()
        assert len(ctx.handlers) == 2
        
        # Test hook removal
        ctx.remove_hooks()
        assert len(ctx.handlers) == 0
        
        # Test context manager
        with GradCAMContext() as c:
            assert len(c.handlers) == 2
        assert len(c.handlers) == 0
        
    finally:
        app.inference.gradcam.get_model = original_get_model
