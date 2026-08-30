import React, { useRef, useState, useEffect } from 'react';

export default function ImageCropperModal({ imageSrc, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(25);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
  }, [imageSrc]);

  const handlePointerDown = (e) => {
    setIsDrawing(true);
    eraseAt(e);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    eraseAt(e);
  };

  const handlePointerUp = () => setIsDrawing(false);

  const eraseAt = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2000 }}>
      <div className="modal-content" style={{ maxWidth: '650px', width: '95%', padding: '15px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>🎨 محرر الرسمة (مسح وتعديل)</h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.85rem' }}>🧹 حجم ممحاة المسح:</span>
          <input 
            type="range" 
            min="5" 
            max="60" 
            value={brushSize} 
            onChange={(e) => setBrushSize(Number(e.target.value))} 
          />
        </div>

        <div 
          style={{ 
            maxHeight: '50vh', 
            overflow: 'auto', 
            background: '#1a1a1a', 
            borderRadius: '8px',
            textAlign: 'center',
            padding: '5px',
            touchAction: 'none'
          }}
        >
          <canvas 
            ref={canvasRef} 
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            style={{ maxWidth: '100%', height: 'auto', cursor: 'crosshair' }}
          />
        </div>

        <p style={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center', marginTop: '8px' }}>
          💡 اسحب الماوس أو إصبعك على أي كتابة أو جزء تريد إزالته باللون الأبيض.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button type="button" className="btn btn-primary" onClick={handleApply}>✅ حفظ الصورة المعدلة</button>
        </div>
      </div>
    </div>
  );
}
