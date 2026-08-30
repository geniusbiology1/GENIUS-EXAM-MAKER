import React, { useRef, useState } from 'react';

export default function ImageCropperModal({ imageSrc, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [isErasing, setIsErasing] = useState(false);

  const handleCanvasInit = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleErase = (e) => {
    if (!isErasing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleSaveCropped = () => {
    const canvas = canvasRef.current;
    onSave(canvas.toDataURL('image/png'));
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ textAlign: 'center' }}>
        <h4>🎨 تعديل ومسح الزوائد من الصورة</h4>
        <div style={{ margin: '10px 0', overflow: 'auto', maxHeight: '60vh' }}>
          <canvas 
            ref={canvasRef} 
            onMouseDown={() => setIsErasing(true)}
            onMouseUp={() => setIsErasing(false)}
            onMouseMove={handleErase}
            style={{ maxWidth: '100%', border: '1px solid #444', cursor: 'crosshair' }}
          />
        </div>
        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>اضغط واسحب بالماوس/الإصبع لمسح الأجزاء باللون الأبيض</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={handleSaveCropped}>حفظ الصورة التعديل</button>
        </div>
        <img src={imageSrc} onLoad={handleCanvasInit} style={{ display: 'none' }} alt="hidden" />
      </div>
    </div>
  );
}
