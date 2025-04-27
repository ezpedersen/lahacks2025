from fastapi import Form, File, UploadFile
from fastapi import FastAPI, Request
from positioning import process
from typing import List
app = FastAPI()


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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
