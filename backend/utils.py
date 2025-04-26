from youtube_transcript_api import YouTubeTranscriptApi
import re, json

def get_structured_transcript(url):
    video_id = url.split('v=')[1]
    transcript = YouTubeTranscriptApi.get_transcript(video_id)
    return [
        {
            "text": entry['text'],
            "start": entry['start'],
            "end": entry['start'] + entry['duration']
        } for entry in transcript
    ]

import re
import json

def extract_json_from_markdown(text: str) -> dict:
    if not text.strip():
        raise ValueError("Input text is empty.")

    cleaned_text = text.strip()

    # If wrapped in triple backticks (```json ... ```)
    if cleaned_text.startswith("```"):
        # Remove starting ```json or ``` and ending ```
        cleaned_text = re.sub(r"^```(?:json)?\s*", "", cleaned_text)
        cleaned_text = re.sub(r"\s*```$", "", cleaned_text)

    # Try to parse as JSON
    try:
        parsed = json.loads(cleaned_text.strip())
        return parsed
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON: {str(e)}")
    
DB_FILE = "db.json"

def read_state():
    """Reads the current state from db.json."""
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default state if file doesn't exist
        return {"url": None, "num_checkpoints": -1, "current_checkpoint": 0}
    except json.JSONDecodeError:
        # Handle corrupted file - return default state or raise error
        print(f"Warning: Error decoding {DB_FILE}. Returning default state.")
        return {"url": None, "num_checkpoints": -1, "current_checkpoint": 0}
    except Exception as e:
        print(f"Error reading state file {DB_FILE}: {e}")
        # Depending on desired robustness, could raise or return default
        return {"url": None, "num_checkpoints": -1, "current_checkpoint": 0}

def write_state(state_data):
    """Writes the given state dictionary to db.json."""
    try:
        with open(DB_FILE, 'w', encoding='utf-8') as f:
            json.dump(state_data, f, indent=4)
    except IOError as e:
        print(f"Error writing state to {DB_FILE}: {e}")
    except Exception as e:
        print(f"Unexpected error writing state: {e}")