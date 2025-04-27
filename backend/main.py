from dotenv import load_dotenv
from fastapi import Form, File, UploadFile, HTTPException
from fastapi import FastAPI, Request
from positioning import generate
from utils import get_structured_transcript, extract_json_from_markdown, read_state, write_state
from google import genai
from google.generativeai import client
from prompts import parse_yt_prompt, checkpoint_prompt
from pydantic import BaseModel
import os
import json
from positioning import process


class TranscriptRequest(BaseModel):
    url: str


class CheckpointRequest(BaseModel):
    checkpoint_number: int


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY)

app = FastAPI()

state = read_state()


@app.post("/")
async def root():
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", contents="What color is grass?"
        )
        return {"res": response.text}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process transcript: {str(e)}")


@app.post("/parse")
async def parse_url(url_input: str):
    return {"url": url_input}


@app.post("/screen")
async def screenshot(file: UploadFile = File(...), prompt: str = Form(...), quadrant: str = Form(...)):
    import json
    # quadrant = json.loads(quadrant)
    # quadrant = [[0, 500], [1400, -1]]
    image = await file.read()
    response = process(image, prompt, quadrant)
    print(response)
    # Parse the JSON string into a Python dictionary
    import json
    # json_str = "{" + response.text.split("{")[1].split("}")[0] + "}"
    result = {"x": int((response[0]+response[2])/2),
              "y": int((response[1]+response[3])/2)}
    # print(result)  # This will print the actual dictionary
    return result


@app.post("/next-checkpoint")
async def next_checkpoint(request: CheckpointRequest):
    # Read current state from db.json
    state = read_state()

    # Read detailed checkpoint data from the separate llm output file
    checkpoint_detail_file = "llm_transcript_output.json"
    try:
        with open(checkpoint_detail_file, 'r', encoding='utf-8') as f:
            llm_data = json.load(f)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, detail=f"{checkpoint_detail_file} not found. Run the /transcript endpoint first.")
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500, detail=f"Error decoding JSON from {checkpoint_detail_file}.")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error reading checkpoint detail file: {str(e)}")

    # Get num_checkpoints from the *state* read from db.json
    num_checkpoints = state.get("num_checkpoints", -1)

    if request.checkpoint_number >= num_checkpoints:
        return {"res": "Tutorial complete! No more checkpoints or invalid checkpoint number."}

    # Update current_checkpoint in state and write back to db.json
    state["current_checkpoint"] = request.checkpoint_number
    write_state(state)  # Persist the updated checkpoint number

    # Use loaded data from llm_transcript_output.json for prompt details
    analysis_summary = llm_data.get("analysis", "Analysis summary not found.")
    try:
        checkpoint_info = llm_data["checkpoints"][request.checkpoint_number]
        time_start = str(checkpoint_info.get("time_start", "N/A"))
        time_end = str(checkpoint_info.get("time_end", "N/A"))
        checkpoint_info_str = json.dumps(checkpoint_info)
    except IndexError:
        raise HTTPException(
            status_code=400, detail=f"Checkpoint index {request.checkpoint_number} out of range in detail file.")
    except KeyError as e:
        raise HTTPException(
            status_code=500, detail=f"Missing key {e} in checkpoint detail data.")

    prompt_template = checkpoint_prompt
    llm_prompt = prompt_template.replace(
        "{{analysis_summary}}", analysis_summary)
    llm_prompt = llm_prompt.replace("{{checkpoint_info}}", checkpoint_info_str)
    llm_prompt = llm_prompt.replace("{{time_start}}", time_start)
    llm_prompt = llm_prompt.replace("{{time_end}}", time_end)

    try:
        print(
            f"Sending checkpoint prompt for index {request.checkpoint_number} to LLM...")
        response = client.models.generate_content(
            model='gemini-2.5-pro-exp-03-25',
            contents=[llm_prompt]  # Text-only call
        )
        data = extract_json_from_markdown(response.text)
        print(f"Received response for checkpoint {request.checkpoint_number}.")
        return {"res": data}
    except Exception as e:
        print(
            f"Error calling LLM for checkpoint {request.checkpoint_number}: {e}")
        raise HTTPException(
            status_code=500, detail=f"LLM call failed: {str(e)}")


@app.post("/transcript")
async def transcript(request: TranscriptRequest):
    try:
        transcript_data = get_structured_transcript(request.url)
        prompt = parse_yt_prompt + str(transcript_data)

        response = client.models.generate_content(
            model="gemini-2.5-pro-exp-03-25",
            contents=prompt
        )

        llm_output_text = response.text
        llm_output_json = extract_json_from_markdown(llm_output_text)

        output_file_path_llm = "llm_transcript_output.json"  # Keep saving this
        try:
            with open(output_file_path_llm, 'w', encoding='utf-8') as f:
                json.dump(llm_output_json, f, ensure_ascii=False, indent=4)
            print(f"LLM JSON output saved to {output_file_path_llm}")
        except IOError as e:
            print(f"Error writing LLM JSON output to file: {e}")
        except TypeError as e:
            print(f"Error preparing LLM output for JSON serialization: {e}")

        new_num_checkpoints = len(llm_output_json.get("checkpoints", []))
        print(
            f"Transcript processed. Number of checkpoints: {new_num_checkpoints}")

        # Read current state, update, and write back
        current_state = read_state()
        current_state["url"] = request.url  # Store the URL used
        current_state["num_checkpoints"] = new_num_checkpoints
        # Reset checkpoint to 0 when new transcript is processed
        current_state["current_checkpoint"] = 0
        write_state(current_state)

        return {"res": llm_output_json}

    except Exception as e:
        print(f"Error processing transcript for {request.url}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to process transcript: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
