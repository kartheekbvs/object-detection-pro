from ultralytics import YOLO
import os

def pre_download():
    print("Pre-downloading YOLOv8n model...")
    # This will download the model to the current directory
    YOLO("yolov8n.pt")
    print("Pre-download complete.")

if __name__ == "__main__":
    pre_download()
