import React, { useState } from 'react';
import ImageCropperModal from './ImageCropperModal';

export default function QuestionModal({ question, onSave, onClose }) {
  const [text, setText] = useState(question?.text || '');
  const [image, setImage] = useState(question?.image || null);
  const [tempImage, setTempImage] = useState(null); // الصورة المؤقتة للقص
  const [showCropper, setShowCropper] = useState(false);

  // عند اختيار صورة من الملفات
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result);
        setShowCropper(true); // فتح محرر الصور مباشرة
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{question ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h3>
        
        {/* نص السؤال */}
        <div className="form-group">
          <label>نص السؤال:</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows="3" />
        </div>

        {/* رفع وتعديل الصورة */}
        <div className="form-group">
          <label>صورة الرسمة التوضيحية (إن وجدت):</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          
          {image && (
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <img src={image} alt="Preview" style={{ maxHeight: '150px', borderRadius: '6px' }} />
              <br />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', marginTop: '5px' }}
                onClick={() => { setTempImage(image); setShowCropper(true); }}
              >
                ✏️ تعديل ومسح زوائد هذه الصورة
              </button>
            </div>
          )}
        </div>

        {/* فتح نافذة التعديل والقص */}
        {showCropper && tempImage && (
          <ImageCropperModal 
            imageSrc={tempImage}
            onSave={(croppedImg) => setImage(croppedImg)}
            onClose={() => setShowCropper(false)}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={() => { onSave({ ...question, text, image }); onClose(); }}>حفظ السؤال</button>
        </div>
      </div>
    </div>
  );
}
