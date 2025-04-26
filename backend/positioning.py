import base64
from typing import Tuple
import os
from google import genai
from google.genai import types
import dotenv
dotenv.load_dotenv()

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# To run this code you need to install the following dependencies:
# pip install google-genai


def generate(img, checkpoint: str) -> str:
    client = genai.Client(
        # vertexai=True,
        # project="",
        # location="",
        api_key=GOOGLE_API_KEY,
    )
    prompt = "RETURN JUST THE X AND Y AS ONLY JSON OBJECT; tell me in pixel coordinates from the top left corner of the image where the user should click to fulfill the following requirement: \"" + checkpoint + "\""
    print(prompt)
    model = "gemini-2.5-flash-preview-04-17"
    contents = [
        types.Content(

            role="user",
            parts=[
                types.Part.from_bytes(
                    mime_type="""image/png""",
                    data=img,
                ),
                types.Part.from_text(
                    text=prompt),
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


if __name__ == "__main__":
    # Read image bytes directly
    with open("./example.png", "rb") as f:
        img_bytes = f.read()

    resp = generate(img_bytes, "the file button")
    stripped = "{" + resp.text.split("{")[1].split("}")[0] + "}"
    print(stripped)
