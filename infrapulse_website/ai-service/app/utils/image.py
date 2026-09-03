import os
from PIL import Image, UnidentifiedImageError

def validate_image(image_uri: str) -> Image.Image:
    """
    Validates and opens the image from a URI (local path in this MVP).
    """
    if not os.path.exists(image_uri):
        raise FileNotFoundError(f"Image not found at {image_uri}")
    
    try:
        # Load and verify it's a valid image
        img = Image.open(image_uri)
        img.verify()
        
        # Need to reopen because verify() closes the file sometimes or leaves it in bad state
        img = Image.open(image_uri)
        return img
    except UnidentifiedImageError:
        raise ValueError(f"Invalid image format at {image_uri}")
    except Exception as e:
        raise ValueError(f"Failed to process image {image_uri}: {str(e)}")
