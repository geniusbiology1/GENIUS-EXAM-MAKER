import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';
import ImageCropperModal from './ImageCropperModal'; // 👈 1. استدعاء أداة القص والمسح

export default function QuestionEditor({ editingQuestion, onSaveSuccess, onCancel }) {
  const [type, setType] = useState('mcq');
  const [chapter, setChapter] = useState('عام');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [marks, setMarks] = useState(1);
  
  // 👈 2. حالة جديدة للتحكم في ظهور أداة القص
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageForCropper, setTempImageForCropper] = useState(null);

  useEffect(() => {
    if (editingQuestion) {
      setType(editingQuestion.type || 'mcq');
      setChapter(editingQuestion.chapter || 'عام');
      setDifficulty(editingQuestion.difficulty || 'متوسط');
      setText(editingQuestion.text || '');
      setImage(editingQuestion.image || '');
      setOptions(editingQuestion.options?.length ? editingQuestion.options : ['', '', '', '']);
      setCorrectAnswer(editingQuestion.correctAnswer || 0);
      setMarks(editingQuestion.marks || 1);
    }
  }, [editingQuestion]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // بدلاً من حفظ الصورة مباشرة، نفتحها في أداة التعديل
        setTempImageForCropper(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert('غير مدعوم في متصفحك');
    const rec = new SpeechRecognition();
    rec.lang = 'ar-EG';
    rec.start();
    rec.onresult = (e) => setText((prev) => (prev ? prev + ' ' + e.results[0][0].transcript : e.results[0][0].transcript));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return alert('اكتب نص السؤال');
    await dbOperations.add('questions', {
      id: editingQuestion ? editingQuestion.id : Date.now().toString(),
      type, chapter: chapter.trim() || 'عام', difficulty, text, image,
      options: type === 'mcq' ? options.filter(o => o.trim() !== '') : [],
      correctAnswer: type === 'mcq' ? Number(correctAnswer) : null,
      marks: Number(marks),
      createdAt: editingQuestion ? editingQuestion.createdAt : new Date().toISOString()
    });
    onSaveSuccess();
  };

  return (
    <div className="card">
      <h3>{editingQuestion ? 'تعديل سؤال' : 'إضافة سؤال جديد'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>نوع السؤال:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="mcq">اختيار من متعدد</option>
              <option value="essay">مقالي</option>
            </select>
          </div>
          <div className="form-group">
            <label>الفصل / الباب:</label>
            <input type="text" value={chapter} onChange={(e) => setChapter(e.target.value)} required />
          </div>
        </div>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label>نص السؤال:</label>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleVoiceInput}>🎙️ إملاء صوتي</button>
          </div>
          <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} required />
        </div>
        
        {/* 👈 3. تعديل واجهة رفع الصورة */}
        <div className="form-group">
          <label>صورة السؤال:</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          
          {image && (
            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <img src={image} alt="Preview" style={{ maxHeight: '140px', borderRadius: '6px', border: '1px solid #444' }} />
              <br />
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', marginTop: '6px' }}
                onClick={() => { setTempImageForCropper(image); setShowCropper(true); }}
              >
                ✏️ مسح البيانات أو تعديل الصورة
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ fontSize: '0.8rem', marginTop: '6px', marginRight: '5px' }}
                onClick={() => setImage('')}
              >
                ❌ حذف الصورة
              </button>
            </div>
          )}
        </div>

        {type === 'mcq' && (
          <div className="form-group">
            <label>الخيارات:</label>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <input type="radio" name="corr" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} />
                <input type="text" value={opt} onChange={(e) => {
                  const arr = [...options]; arr[i] = e.target.value; setOptions(arr);
                }} placeholder={`خيار ${i + 1}`} />
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit" className="btn btn-primary">💾 حفظ</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>إلغاء</button>
        </div>
      </form>

      {/* 👈 4. إظهار نافذة أداة القص عند الحاجة */}
      {showCropper && tempImageForCropper && (
        <ImageCropperModal 
          imageSrc={tempImageForCropper}
          onSave={(croppedImg) => {
            setImage(croppedImg);
            setShowCropper(false);
          }}
          onClose={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}
