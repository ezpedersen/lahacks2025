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
import asyncio # Import asyncio for potential future async operations within the loop
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
CHECKPOINTS_DETAIL_FILE = "llm_transcript_output.json"
PREPROCESSED_CHECKPOINTS_FILE = "checkpoints.json"


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


@app.post("/create-tutorial")
async def create_tutorial():
    print(f"Attempting to read checkpoint details from {CHECKPOINTS_DETAIL_FILE}")
    try:
        with open(CHECKPOINTS_DETAIL_FILE, 'r', encoding='utf-8') as f:
            llm_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {CHECKPOINTS_DETAIL_FILE} not found.")
        raise HTTPException(
            status_code=404, detail=f"{CHECKPOINTS_DETAIL_FILE} not found. Run the /transcript endpoint first.")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {CHECKPOINTS_DETAIL_FILE}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error decoding JSON from {CHECKPOINTS_DETAIL_FILE}.")
    except Exception as e:
        print(f"Error reading {CHECKPOINTS_DETAIL_FILE}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error reading checkpoint detail file: {str(e)}")

    checkpoints = llm_data.get("checkpoints", [])
    analysis_summary = llm_data.get("analysis", "Analysis summary not found.")
    num_checkpoints = len(checkpoints)
    processed_checkpoints_data = []

    print(f"Found {num_checkpoints} checkpoints. Starting pre-processing...")

    for i, checkpoint_info in enumerate(checkpoints):
        print(f"Processing checkpoint {i}/{num_checkpoints-1}...")
        try:
            time_start = str(checkpoint_info.get("time_start", "N/A"))
            time_end = str(checkpoint_info.get("time_end", "N/A"))
            checkpoint_info_str = json.dumps(checkpoint_info)

            prompt_template = checkpoint_prompt
            llm_prompt = prompt_template.replace(
                "{{analysis_summary}}", analysis_summary)
            llm_prompt = llm_prompt.replace("{{checkpoint_info}}", checkpoint_info_str)
            llm_prompt = llm_prompt.replace("{{time_start}}", time_start)
            llm_prompt = llm_prompt.replace("{{time_end}}", time_end)

            # Call Gemini API for this checkpoint
            response = client.models.generate_content(
                model='gemini-2.5-pro-exp-03-25',
                contents=[llm_prompt]
            )
            data = extract_json_from_markdown(response.text)
            processed_checkpoints_data.append(data)
            print(f"Successfully processed checkpoint {i}.")
            # Optional: Add a small delay if hitting API rate limits
            # await asyncio.sleep(1) 

        except Exception as e:
            print(f"Error processing checkpoint {i}: {e}")
            # Decide how to handle errors: skip, use placeholder, or fail fast?
            # Option: Use a placeholder
            processed_checkpoints_data.append({"error": f"Failed to process checkpoint {i}: {str(e)}", "checkpoint_ui_element": "Error processing"})
            # Option: Fail fast (uncomment to enable)
            # raise HTTPException(
            #     status_code=500, detail=f"Error processing checkpoint {i}: {str(e)}")

    print(f"Finished processing all checkpoints. Saving results to {PREPROCESSED_CHECKPOINTS_FILE}")
    try:
        with open(PREPROCESSED_CHECKPOINTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(processed_checkpoints_data, f, ensure_ascii=False, indent=4)
        print(f"Successfully saved pre-processed checkpoints to {PREPROCESSED_CHECKPOINTS_FILE}.")
    except IOError as e:
        print(f"Error writing pre-processed checkpoints to file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save processed checkpoint data.")
    except TypeError as e:
         print(f"Error preparing pre-processed data for JSON serialization: {e}")
         raise HTTPException(status_code=500, detail="Failed to serialize processed checkpoint data.")

    return {"message": f"Successfully pre-processed {len(processed_checkpoints_data)} checkpoints.", "output_file": PREPROCESSED_CHECKPOINTS_FILE}


@app.post("/next-checkpoint")
async def next_checkpoint(request: CheckpointRequest):
    # Read current state from db.json
    state = read_state()
    num_checkpoints = state.get("num_checkpoints", -1)

    # Check if requested checkpoint is valid based on state
    if request.checkpoint_number >= num_checkpoints or request.checkpoint_number < 0:
        print(f"Requested checkpoint {request.checkpoint_number} is out of bounds (0-{num_checkpoints-1}).")
        return {"res": "Tutorial complete! No more checkpoints or invalid checkpoint number."}

    # Read the pre-processed checkpoint data
    print(f"Attempting to read pre-processed data from {PREPROCESSED_CHECKPOINTS_FILE} for checkpoint {request.checkpoint_number}")
    try:
        with open(PREPROCESSED_CHECKPOINTS_FILE, 'r', encoding='utf-8') as f:
            all_checkpoint_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: {PREPROCESSED_CHECKPOINTS_FILE} not found.")
        raise HTTPException(
            status_code=404, detail=f"{PREPROCESSED_CHECKPOINTS_FILE} not found. Run the /create-tutorial endpoint first after /transcript.")
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from {PREPROCESSED_CHECKPOINTS_FILE}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error decoding JSON from {PREPROCESSED_CHECKPOINTS_FILE}.")
    except Exception as e:
        print(f"Error reading {PREPROCESSED_CHECKPOINTS_FILE}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error reading pre-processed checkpoint file: {str(e)}")

    # Retrieve the specific checkpoint data
    try:
        checkpoint_data = all_checkpoint_data[request.checkpoint_number]
        print(f"Successfully retrieved pre-processed data for checkpoint {request.checkpoint_number}.")
    except IndexError:
        print(f"Error: Checkpoint index {request.checkpoint_number} out of range in {PREPROCESSED_CHECKPOINTS_FILE}.")
        raise HTTPException(
            status_code=400, detail=f"Checkpoint index {request.checkpoint_number} out of range in pre-processed file.")
    except Exception as e:
        print(f"Error accessing checkpoint data at index {request.checkpoint_number}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error accessing pre-processed checkpoint data: {str(e)}")

    # Update current_checkpoint in state and write back to db.json
    state["current_checkpoint"] = request.checkpoint_number
    write_state(state)  # Persist the updated checkpoint number
    print(f"Updated current checkpoint in state to {request.checkpoint_number}.")

    # Return the pre-processed data for this checkpoint
    return {"res": checkpoint_data}


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

        # Save the structured transcript output (needed by /create-tutorial)
        try:
            with open(CHECKPOINTS_DETAIL_FILE, 'w', encoding='utf-8') as f:
                json.dump(llm_output_json, f, ensure_ascii=False, indent=4)
            print(f"LLM JSON output saved to {CHECKPOINTS_DETAIL_FILE}")
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
        print("Updated state in db.json with new URL, num_checkpoints, and reset current_checkpoint.")

        # Also delete the old preprocessed file if it exists, as it's now stale
        if os.path.exists(PREPROCESSED_CHECKPOINTS_FILE):
            try:
                os.remove(PREPROCESSED_CHECKPOINTS_FILE)
                print(f"Removed stale {PREPROCESSED_CHECKPOINTS_FILE}.")
            except OSError as e:
                print(f"Error removing stale {PREPROCESSED_CHECKPOINTS_FILE}: {e}")


        return {"res": llm_output_json}

    except Exception as e:
        print(f"Error processing transcript for {request.url}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to process transcript: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
