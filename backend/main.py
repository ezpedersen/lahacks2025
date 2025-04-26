from fastapi import FastAPI
from positioning import generate
app = FastAPI()


@app.post("/parse")
async def parse_url(url_input: str):
    return {"url": url_input}


@app.post("/screen")
async def screenshot(image: bytes):
    response = generate(image, "the file button")
    stripped = "{" + response.text.split("{")[1].split("}")[0] + "}"
    return stripped

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
