from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from model_handler import ObjectDetector
import shutil
import os
import uuid

app = FastAPI()

# Allow CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = ObjectDetector()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.get("/")
def read_root():
    return {"message": "Object Detection Pro API is running."}

@app.post("/detect")
async def detect_objects(file: UploadFile = File(...)):
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    temp_file = f"{UPLOAD_DIR}/{uuid.uuid4()}.{file_extension}"
    
    # Save uploaded file
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Perform detection
    try:
        detections = detector.detect(temp_file)
        return {"filename": file.filename, "detections": detections}
    except Exception as e:
        return {"error": str(e)}
    finally:
        # Optional: Clean up temp file
        if os.path.exists(temp_file):
            os.remove(temp_file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
