from fastapi import FastAPI

app = FastAPI()


@app.post("/parse")
async def parse_url(url_input: str):
    return {"url": url_input}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
