import io
import json
from PIL import Image, ImageDraw
import base64
from typing import Tuple, List
import os
from google import genai
from google.genai import types
import dotenv
dotenv.load_dotenv()

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


def generate(img, feature: str) -> str:
    client = genai.Client(
        api_key=GOOGLE_API_KEY,
    )
    prompt = f'Detect {feature}, with no more than 20 items. Output a json list where each entry contains the 2D bounding box in "box_2d" and a text label in "label".'
    # print(prompt)
    model = "gemini-2.5-flash-preview-04-17"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_bytes(
                    mime_type="image/png",
                    data=img,
                ),
                types.Part.from_text(text=prompt),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        response_mime_type="text/plain",

    )

    return client.models.generate_content(
        model=model,
        contents=contents,
        config=generate_content_config,
    )


def scale_image(image: Image.Image, max_size: int = 640) -> Tuple[Image.Image, float]:
    """Scale image down while maintaining aspect ratio."""
    width, height = image.size
    scale = min(max_size / width, max_size / height)
    new_width = int(width * scale)
    new_height = int(height * scale)
    return image.resize((new_width, new_height), Image.Resampling.LANCZOS), scale


def get_scaled_dims(image: Image.Image, max_size: int = 640) -> Tuple[Image.Image, float]:
    """Scale image down while maintaining aspect ratio."""
    width, height = image.size
    scale = min(max_size / width, max_size / height)
    new_width = int(width * scale)
    new_height = int(height * scale)
    return new_width, new_height, scale


def normalize_coordinates(box: list, scale: float) -> dict:
    """Convert bounding box coordinates to normalized values (0-1 range)."""
    ymin, xmin, ymax, xmax = box
    return {
        'x': xmin / 1000,
        'y': ymin / 1000,
        'width': (xmax - xmin) / 1000,
        'height': (ymax - ymin) / 1000,
        'label': 'file button'  # You can get this from the response
    }


def denormalize_coordinates(normalized: dict, image_size: Tuple[int, int]) -> Tuple[int, int, int, int]:
    """Convert normalized coordinates back to pixel coordinates."""
    width, height = image_size
    x = int(normalized['x'] * width)
    y = int(normalized['y'] * height)
    w = int(normalized['width'] * width)
    h = int(normalized['height'] * height)
    return (x, y, x + w, y + h)


def process(img_bytes, feature, quadrant):
    # Open the image and crop based on quadrant
    image = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    original_width, original_height = image.size  # Save original image size

    # quadrant: [[from_row, to_row], [from_col, to_col]]
    (from_row, to_row), (from_col, to_col) = quadrant
    width, height = image.size
    if from_row == -1:
        from_row = 0
    if to_row == -1:
        to_row = height
    if from_col == -1:
        from_col = 0
    if to_col == -1:
        to_col = width
    crop_offset_x = from_col
    crop_offset_y = from_row
    image = image.crop((from_col, from_row, to_col, to_row))
    # Update img_bytes to be the cropped image bytes
    buf = io.BytesIO()
    image.show()
    image.save(buf, format="PNG")
    img_bytes = buf.getvalue()

    # Scale the image
    scaled_width, scaled_height, scale = get_scaled_dims(image)
    # Generate bounding boxes
    resp = generate(img_bytes, feature)

    try:
        # Parse the JSON response
        json_str = resp.text
        start = json_str.find('[')
        end = json_str.rfind(']')

        if start == -1 or end == -1:
            raise ValueError("Could not find JSON list in response")

        list_str = json_str[start:end+1]
        box_list = json.loads(list_str)
    except Exception as e:
        print("Failed to parse bounding boxes:", e)
        box_list = []
    for item in box_list:
        box = item.get("box_2d")
        if box and len(box) == 4:
            # Normalize coordinates
            normalized = normalize_coordinates(box, scale)

            # Convert back to pixel coordinates for drawing (in cropped/scaled image)
            x1, y1, x2, y2 = denormalize_coordinates(
                normalized, (scaled_width, scaled_height))
            # Adjust coordinates back to original (uncropped) image reference frame
            x1_uncropped = x1 + crop_offset_x
            y1_uncropped = y1 + crop_offset_y
            x2_uncropped = x2 + crop_offset_x
            y2_uncropped = y2 + crop_offset_y
            # Draw rectangle on the image for visualization (optional, can be removed in production)
            # draw = ImageDraw.Draw(image)
            # draw.rectangle([x1, y1, x2, y2], outline="red", width=2)
            # image.show()
            # image.show()  # Commented out to avoid popping up image windows during processing
            processed = [x1, y1, x2, y2]
            print(processed)

            return processed
    return []


if __name__ == "__main__":
    # Read image bytes directly
    with open("./example2.png", "rb") as f:
        img_bytes = f.read()

    # Create a new image for drawing
    draw_image = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    draw = ImageDraw.Draw(draw_image)

    # Draw bounding boxes

    # Convert back to pixel coordinates for drawing
    feature = "plus Icon"
    quadrant = [[0, -1], [0, -1]]

    rect = process(img_bytes, feature, quadrant)
    # Draw the rectangle
    x1, y1, x2, y2 = rect
    draw.rectangle(rect, outline="red", width=4)

    # Draw the label
    draw.text((x1, y1-10), feature, fill="red")

    # Show the image with bounding boxes
    draw_image.show()
