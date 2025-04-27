import io
import json
from PIL import Image, ImageDraw
import base64
from typing import Tuple
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


def scaled_coords(box: list, image_size: Tuple[int, int]):
    ymin, xmin, ymax, xmax = box
    width, height = image_size
    x = int((xmin / 1000) * width)
    y = int((ymin / 1000) * height)
    w = int(((xmax - xmin) / 1000) * width)
    h = int(((ymax - ymin) / 1000) * height)
    return (x, y, x + w, y + h)


def process(img_bytes, feature, quadrant):
    # Open the image
    image = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    original_width, original_height = image.size
    (from_row, to_row), (from_col, to_col) = quadrant
    if from_row == -1:
        from_row = 0
    if to_row == -1:
        to_row = original_height
    if from_col == -1:
        from_col = 0
    if to_col == -1:
        to_col = original_width
    crop_offset_x = from_col
    crop_offset_y = from_row
    image = image.crop((from_col, from_row, to_col, to_row))
    # Update img_bytes to be the cropped image bytes
    buf = io.BytesIO()
    # image.show()
    image.save(buf, format="PNG")
    img_bytes = buf.getvalue()
    print(f"Original image size: {original_width}x{original_height}")

    # Scale the image
    # scaled_image, scale = scale_image(image)
    scaled_width, scaled_height, scale = get_scaled_dims(image)
    print(f"Scaled image size: {scaled_width}x{scaled_height}")

    # Generate bounding boxes
    resp = generate(img_bytes, feature)
    # print(resp.text)

    try:
        # Parse the JSON response
        json_str = resp.text
        start = json_str.find('[')
        end = json_str.rfind(']')

        if start == -1 or end == -1:
            raise ValueError("Could not find JSON list in response")

        list_str = json_str[start:end+1]
        box_list = json.loads(list_str)
        # print("Parsed bounding boxes:", box_list)
    except Exception as e:
        print("Failed to parse bounding boxes:", e)
        box_list = []
    for item in box_list:
        box = item.get("box_2d")
        if box and len(box) == 4:
            # Normalize coordinates
            scaled = scaled_coords(box, (scaled_width, scaled_height))

            x1, y1, x2, y2 = [int(x/scale) for x in scaled]

            return [x1+crop_offset_x, y1+crop_offset_y, x2+crop_offset_x, y2+crop_offset_y]
    return []


if __name__ == "__main__":
    # Read image bytes directly
    with open("./example.png", "rb") as f:
        img_bytes = f.read()
    feature = "gear settings button"
    quadrant = [[0, 400], [1600, -1]]

    # Create a new image for drawing
    draw_image = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    # draw_image, scale = scale_image(draw_image)
    draw = ImageDraw.Draw(draw_image)

    # Draw bounding boxes

    # Convert back to pixel coordinates for drawing

    x1, y1, x2, y2 = process(img_bytes, feature, quadrant)
    print(x1, y1, x2, y2)
    # Draw the rectangle
    draw.rectangle([x1, y1, x2, y2], outline="red", width=4)

    # Draw the label
    draw.text((x1, y1-10), feature, fill="red")

    # Show the image with bounding boxes
    draw_image.show()
