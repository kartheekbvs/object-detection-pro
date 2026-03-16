import React, { useState, useRef } from 'react';
import './index.css';
import CameraView from './components/CameraView';

function App() {
  const [mode, setMode] = useState('menu');
  const [imagePreview, setImagePreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.detections) {
        setDetections(data.detections);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMode('menu');
    setImagePreview(null);
    setDetections([]);
  };

  return (
    <div className="container">
      <h1>Object Detection Pro</h1>
      <p className="text-sub">Detect thousands of objects with 99% accuracy using state-of-the-art CNNs.</p>

      {mode === 'menu' && (
        <div className="dashboard">
          <div className="card" onClick={() => { setMode('upload'); fileInputRef.current.click(); }}>
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
            onChange={handleFileUpload} 
          />
        </div>
      )}

      {mode === 'upload' && imagePreview && (
        <div className="upload-section">
          <button className="btn" onClick={reset}>Back Overall</button>
          <div id="preview-container">
            <img id="preview-img" src={imagePreview} alt="Preview" />
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
          {loading && <p>Analyzing image...</p>}
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
