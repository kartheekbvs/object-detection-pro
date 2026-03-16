import cv2
import numpy as np
from ultralytics import YOLO

class ObjectDetector:
    def __init__(self, model_name="yolov8n.pt"):
        # We use yolov8n (nano) for speed or yolov8x (extra large) for 99% accuracy
        # yolov8n is a good starting point for real-time camera feeds
        self.model = YOLO(model_name)
    
    def detect(self, image_path):
        results = self.model(image_path)
        detections = []
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Get coordinates
                x1, y1, x2, y2 = box.xyxy[0]
                # Get confidence
                conf = float(box.conf[0])
                # Get class ID
                cls = int(box.cls[0])
                # Get class name
                name = self.model.names[cls]
                
                detections.append({
                    "box": [int(x1), int(y1), int(x2), int(y2)],
                    "confidence": round(conf, 2),
                    "class": name
                })
        
        return detections

if __name__ == "__main__":
    # Test instance
    detector = ObjectDetector()
    print("Model loaded successfully.")
