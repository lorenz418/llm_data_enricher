from fastapi import FastAPI, File, UploadFile, Form, WebSocket
import asyncio
from uuid import uuid4
import csv

app = FastAPI()
progress_store = {}


#TODO: Adjust functionality to actual use case
#TODO: for /process multi form for CSV and JSON is needed

@app.post("/process")
async def process_csv(file: UploadFile = File(...)):
    job_id = str(uuid4())
    content = await file.read()
    lines = content.decode().splitlines()
    reader = list(csv.reader(lines))
    total = len(reader)

    # Kick off background task
    asyncio.create_task(process_companies(reader, job_id))

    return {"job_id": job_id}




async def process_companies(companies, job_id):
    for i, row in enumerate(companies, start=1):
        company_name = row[0]  # Assuming first column is the company
        await asyncio.sleep(1)  # Simulate long-running work
        progress_store[job_id] = {
            "company": company_name,
            "current": i,
            "total": len(companies)
        }

@app.websocket("/ws/progress/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await websocket.accept()
    while True:
        if job_id in progress_store:
            await websocket.send_json(progress_store[job_id])
        await asyncio.sleep(1)
