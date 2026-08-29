import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';

export default function QuestionFormModal({ onClose, onSuccess }) {
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  
  const [selectedChap, setSelectedChap] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [type, setType] = useState('mcq');
  const [text, setText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState('A');
  const [essayLines, setEssayLines] = useState(3);
  const [image, setImage] = useState(null);

  useEffect(() => {
    loadDictionaries();
  }, []);

  const loadDictionaries = async () => {
    const ch = await dbOperations.getAll('chapters');
    const ls = await dbOperations.getAll('lessons');
    setChapters(ch || []);
    setLessons(ls || []);
    if (ch.length > 0) {
      setSelectedChap(ch[0].name);
      const filtered = ls.filter(l => l.chapterId === ch[0].id);
      if (filtered.length > 0) setSelectedLesson(filtered[0].name);
    }
  };

  const handleChapChange = (e) => {
    const name = e.target.value;
    setSelectedChap(name);
    const chapObj = chapters.find(c => c.name === name);
    if (chapObj) {
      const filtered = lessons.filter(l => l.chapterId === chapObj.id);
      setSelectedLesson(filtered.length > 0 ? filtered[0].name : '');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setImage(evt.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!text.trim()) return alert('برجاء كتابة نص السؤال');

    const questionData = {
      id: Date.now().toString(),
      chapter: selectedChap,
      lesson: selectedLesson,
      type,
      text,
      image,
      options: type === 'mcq' ? [optA, optB, optC, optD] : [],
      correctOption: type === 'mcq' ? correctOpt : null,
      essayLines: type === 'essay' ? Number(essayLines) : 0,
      createdAt: new Date().toISOString()
    };

    await dbOperations.add('questions', questionData);
    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📝 إضافة سؤال جديد للبنوك</h3>

        {/* ربط القواميس */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="form-group">
            <label>الفصل:</label>
            <select value={selectedChap} onChange={handleChapChange}>
              {chapters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>الدرس:</label>
            <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
              {lessons.filter(l => {
                const c = chapters.find(ch => ch.name === selectedChap);
                return c && l.chapterId === c.id;
              }).map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>نوع السؤال:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="mcq">اختيار من متعدد (MCQ)</option>
            <option value="essay">سؤال مقالي</option>
          </select>
        </div>

        <div className="form-group">
          <label>نص السؤال:</label>
          <textarea rows="3" value={text} onChange={(e) => setText(e.target.value)} placeholder="اكتب نص السؤال هنا..." />
        </div>

        {/* إضافة رسم توضيحي مستقل */}
        <div className="form-group">
          <label>إضافة رسم توضيحي (اختياري):</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {image && <img src={image} alt="preview" style={{ maxHeight: '100px', marginTop: '8px', borderRadius: '6px' }} />}
        </div>

        {/* تفاصيل MCQ */}
        {type === 'mcq' ? (
          <div>
            <label style={{ fontSize: '0.85rem', color: '#aaa' }}>الخيارات وتحديد الإجابة الصحيحة:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              <input type="text" placeholder="(أ) الخيار الأول" value={optA} onChange={(e) => setOptA(e.target.value)} />
              <input type="text" placeholder="(ب) الخيار الثاني" value={optB} onChange={(e) => setOptB(e.target.value)} />
              <input type="text" placeholder="(ج) الخيار الثالث" value={optC} onChange={(e) => setOptC(e.target.value)} />
              <input type="text" placeholder="(د) الخيار الرابع" value={optD} onChange={(e) => setOptD(e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>عدد أسطر الإجابة المتروكة في الورقة المطبوعة:</label>
            <input type="number" min="1" max="10" value={essayLines} onChange={(e) => setEssayLines(e.target.value)} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={handleSave}>حفظ السؤال</button>
        </div>
      </div>
    </div>
  );
}
