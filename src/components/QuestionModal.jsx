import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';
import ImageCropperModal from './ImageCropperModal';

export default function QuestionModal({ questionToEdit, onClose, onSave }) {
  const [type, setType] = useState('mcq'); // 'mcq' أو 'essay'
  const [chapter, setChapter] = useState('عام');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [marks, setMarks] = useState(1);

  // التحكم في نافذة قص ومسح الصور
  const [showCropper, setShowCropper] = useState(false);
  const [tempImg, setTempImg] = useState(null);

  useEffect(() => {
    if (questionToEdit) {
      setType(questionToEdit.type || 'mcq');
      setChapter(questionToEdit.chapter || 'عام');
      setDifficulty(questionToEdit.difficulty || 'متوسط');
      setText(questionToEdit.text || '');
      setImage(questionToEdit.image || '');
      setOptions(questionToEdit.options?.length ? questionToEdit.options : ['', '', '', '']);
      setCorrectAnswer(questionToEdit.correctAnswer || 0);
      setMarks(questionToEdit.marks || 1);
    }
  }, [questionToEdit]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImg(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      alert('يرجى إدخال نص السؤال');
      return;
    }

    const questionData = {
      id: questionToEdit ? questionToEdit.id : `q_${Date.now()}`,
      type, // 'mcq' أو 'essay'
      chapter: chapter.trim() || 'عام',
      difficulty,
      text,
      image,
      options: type === 'mcq' ? options.filter(o => o.trim() !== '') : [],
      correctAnswer: type === 'mcq' ? Number(correctAnswer) : null,
      marks: Number(marks),
      createdAt: questionToEdit ? questionToEdit.createdAt : new Date().toISOString()
    };

    await dbOperations.add('questions', questionData);
    onSave();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3>{questionToEdit ? '✏️ تعديل سؤال' : '➕ إضافة سؤال جديد'}</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* اختيار نوع السؤال */}
          <div className="form-group" style={{ background: '#0b0e14', padding: '10px', borderRadius: '8px', marginBottom: '14px' }}>
            <label style={{ color: 'var(--theme-primary)', fontWeight: 'bold' }}>نوع السؤال:</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="qType" 
                  value="mcq" 
                  checked={type === 'mcq'} 
                  onChange={() => setType('mcq')} 
                />
                🔘 اختيار من متعدد (MCQ)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="qType" 
                  value="essay" 
                  checked={type === 'essay'} 
                  onChange={() => setType('essay')} 
                />
                📝 سؤال مقالي / مقالي قصير
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>الفصل / الباب:</label>
              <input type="text" value={chapter} onChange={(e) => setChapter(e.target.value)} required />
            </div>
            <div className="form-group" style={{ width: '100px' }}>
              <label>الدرجة:</label>
              <input type="number" min="1" value={marks} onChange={(e) => setMarks(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label>نص السؤال:</label>
            <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} required />
          </div>

          {/* قسم الصورة والمسح */}
          <div className="form-group">
            <label>صورة السؤال (اختياري):</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img src={image} alt="Preview" style={{ maxHeight: '120px', borderRadius: '6px', border: '1px solid #333' }} />
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setTempImg(image); setShowCropper(true); }}
                  >
                    ✏️ مسح البيانات / قص الصورة
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setImage('')}
                  >
                    🗑️ إزالة الصورة
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* خيارات MCQ تظهر فقط عند اختيار اختياري */}
          {type === 'mcq' && (
            <div className="form-group">
              <label>الخيارات (اختر الإجابة الصحيحة):</label>
              {options.map((opt, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                  <input 
                    type="radio" 
                    name="correct" 
                    checked={correctAnswer === i} 
                    onChange={() => setCorrectAnswer(i)} 
                  />
                  <input 
                    type="text" 
                    value={opt} 
                    onChange={(e) => handleOptionChange(i, e.target.value)} 
                    placeholder={`خيار ${i + 1}`} 
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
            <button type="submit" className="btn btn-primary">💾 حفظ في البنك</button>
          </div>
        </form>

        {/* أداة تعديل وقص الصور */}
        {showCropper && tempImg && (
          <ImageCropperModal 
            imageSrc={tempImg}
            onSave={(croppedRes) => {
              setImage(croppedRes);
              setShowCropper(false);
            }}
            onClose={() => setShowCropper(false)}
          />
        )}
      </div>
    </div>
  );
}
