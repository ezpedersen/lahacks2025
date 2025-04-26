from fastapi import Form, File, UploadFile
from fastapi import FastAPI, Request
from positioning import generate
app = FastAPI()


@app.post("/parse")
async def parse_url(url_input: str):
    return {"url": url_input}


@app.post("/screen")
async def screenshot(file: UploadFile = File(...), prompt: str = Form(...)):
    image = await file.read()
    response = generate(image, prompt)
    # Parse the JSON string into a Python dictionary
    import json
    json_str = "{" + response.text.split("{")[1].split("}")[0] + "}"
    result = json.loads(json_str)
    print(result)  # This will print the actual dictionary
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
