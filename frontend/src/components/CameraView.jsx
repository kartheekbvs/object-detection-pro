import React, { useRef, useEffect, useState } from 'react';

const CameraView = ({ onDetect }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [streaming, setStreaming] = useState(false);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStreaming(true);
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    useEffect(() => {
        if (!streaming) return;

        const interval = setInterval(() => {
            captureAndDetect();
        }, 500); // Detect every 500ms for smoothness without overloading

        return () => clearInterval(interval);
    }, [streaming]);

    const captureAndDetect = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        
        canvasRef.current.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append('file', blob, 'frame.jpg');

            try {
                const response = await fetch('http://localhost:8000/detect', {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                if (data.detections) {
                    onDetect(data.detections);
                }
            } catch (err) {
                console.error("Inference error:", err);
            }
        }, 'image/jpeg');
    };

    return (
        <div className="camera-container" style={{ position: 'relative', width: '640px', margin: '0 auto' }}>
            <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: '100%', borderRadius: '1rem' }} 
            />
            <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
        </div>
    );
};

export default CameraView;
