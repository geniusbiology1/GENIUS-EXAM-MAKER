import React, { useRef, useState, useEffect } from 'react';

export default function ImageCropperModal({ imageSrc, onSave, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(25);
  const [mode, setMode] = useState('erase'); // 'erase' أو 'crop'
  
  // نقاط تحديد القص
  const [cropRect, setCropRect] = useState({ x: 10, y: 10, width: 80, height: 80 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setCropRect({ x: 0, y: 0, width: img.width, height: img.height });
    };
  }, [imageSrc]);

  // المسح بالفرشاة البيضاء
  const handlePointerDown = (e) => {
    if (mode !== 'erase') return;
    setIsDrawing(true);
    eraseAt(e);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || mode !== 'erase') return;
    eraseAt(e);
  };

  const handlePointerUp = () => setIsDrawing(false);

  const eraseAt = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // تحويل إحداثيات الشاشة لإحداثيات الكانفاس الحقيقية
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.fillStyle = '#FFFFFF'; // لون المسح الأبيض
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  // إتمام حفظ الصورة وتطبيق التعديل/القص
  const handleApply = () => {
    const canvas = canvasRef.current;
    
    if (mode === 'crop') {
      // إقتطاع الجزء المحدد فقط
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = cropRect.width;
      tempCanvas.height = cropRect.height;

      tempCtx.drawImage(
        canvas,
        cropRect.x, cropRect.y, cropRect.width, cropRect.height,
        0, 0, cropRect.width, cropRect.height
      );

      onSave(tempCanvas.toDataURL('image/png'));
    } else {
      // حفظ المسح المباشر
      onSave(canvas.toDataURL('image/png'));
    }
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content" style={{ maxWidth: '600px', width: '95%', padding: '15px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>🎨 محرر وتعديل رسمة السؤال</h3>

        {/* شريط أدوات التعديل */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className={`btn ${mode === 'erase' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setMode('erase')}
          >
            🧹 فرشة المسح
          </button>
          
          {mode === 'erase' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.8rem' }}>حجم الفرشاة:</span>
              <input 
                type="range" 
                min="10" 
                max="60" 
                value={brushSize} 
                onChange={(e) => setBrushSize(Number(e.target.value))} 
              />
            </div>
          )}
        </div>

        {/* منطقة عرض الرسمة للتعديل */}
        <div 
          style={{ 
            position: 'relative', 
            maxHeight: '55vh', 
            overflow: 'auto', 
            background: '#222', 
            borderRadius: '8px',
            textAlign: 'center',
            padding: '5px',
            touchAction: 'none' // منع السكرول أثناء المسح على الموبايل
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
            style={{ maxWidth: '100%', height: 'auto', cursor: mode === 'erase' ? 'crosshair' : 'default' }}
          />
        </div>

        <p style={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center', marginTop: '8px' }}>
          💡 اسحب بصُباعك أو بالماوس فوق أي جزء غير مرغوب فيه لمسحه باللون الأبيض.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button type="button" className="btn btn-primary" onClick={handleApply}>✅ تطبيق واعتماد الصورة</button>
        </div>
      </div>
    </div>
  );
}
