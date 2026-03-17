import React, { useState, useRef } from 'react';
import './index.css';
import CameraView from './components/CameraView';

function App() {
  const [mode, setMode] = useState('menu');
  const [imagePreview, setImagePreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageDims, setImageDims] = useState({ width: 640, height: 480 });
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setLoading(true);
    setError(null);
    setDetections([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://object-detection-pro.onrender.com/detect', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      
      const data = await response.json();
      if (data.detections) {
        setDetections(data.detections);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error:', err);
      setError("Failed to reach the detection server. It might be waking up—please try again in 1 minute.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageLoad = (e) => {
    setImageDims({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight
    });
  };

  const reset = () => {
    setMode('menu');
    setImagePreview(null);
    setDetections([]);
    setError(null);
  };

  return (
    <div className="container">
      <h1>Object Detection Pro</h1>
      <p className="text-sub">Detect thousands of objects with 99% accuracy using state-of-the-art CNNs.</p>

      {mode === 'menu' && (
        <div className="dashboard">
          <div className="card" onClick={() => { fileInputRef.current.click(); }}>
            <i>📁</i>
            <h2>Upload Photo</h2>
            <p>Upload any image to detect multiple objects instantly.</p>
          </div>
          <div className="card" onClick={() => setMode('camera')}>
            <i>📷</i>
            <h2>Live Camera</h2>
            <p>Real-time object detection directly from your webcam.</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={(e) => {
                setMode('upload');
                handleFileUpload(e);
            }} 
          />
        </div>
      )}

      {mode === 'upload' && (
        <div className="upload-section">
          <button className="btn" onClick={reset}>Back Overall</button>
          
           {!imagePreview && !loading && (
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button className="btn" onClick={() => fileInputRef.current.click()} style={{ padding: '2rem 4rem', fontSize: '1.5rem' }}>
                Select Image to Detect Objects
              </button>
            </div>
          )}

          {imagePreview && (
            <div id="preview-container">
                <img 
                id="preview-img" 
                src={imagePreview} 
                alt="Preview" 
                onLoad={handleImageLoad}
                ref={imgRef}
                />
                {detections.map((det, idx) => (
                <div 
                    key={idx} 
                    className="bounding-box"
                    style={{
                    left: `${(det.box[0] / imageDims.width) * 100}%`,
                    top: `${(det.box[1] / imageDims.height) * 100}%`,
                    width: `${((det.box[2] - det.box[0]) / imageDims.width) * 100}%`,
                    height: `${((det.box[3] - det.box[1]) / imageDims.height) * 100}%`
                    }}
                >
                    <div className="label">{det.class} ({Math.round(det.confidence * 100)}%)</div>
                </div>
                ))}
            </div>
          )}
          
          {loading && (
            <div style={{ marginTop: '1rem', color: 'var(--accent)' }}>
              <p>Analyzing image... (Typically takes 5-10s, but may take up to 60s on first run)</p>
            </div>
          )}
          {error && (
            <div style={{ marginTop: '1rem', color: '#ff4444' }}>
              <p>{error}</p>
              <button className="btn" onClick={() => fileInputRef.current.click()} style={{ background: '#444' }}>Try Different Photo</button>
            </div>
          )}
        </div>
      )}

      {mode === 'camera' && (
        <div className="camera-section">
          <button className="btn" onClick={reset} style={{ marginBottom: '2rem' }}>Stop Camera</button>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <CameraView onDetect={(dets) => setDetections(dets)} />
            {detections.map((det, idx) => (
              <div 
                key={idx} 
                className="bounding-box"
                style={{
                  left: `${(det.box[0] / 640) * 100}%`,
                  top: `${(det.box[1] / 480) * 100}%`,
                  width: `${((det.box[2] - det.box[0]) / 640) * 100}%`,
                  height: `${((det.box[3] - det.box[1]) / 480) * 100}%`
                }}
              >
                <div className="label">{det.class} ({Math.round(det.confidence * 100)}%)</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
