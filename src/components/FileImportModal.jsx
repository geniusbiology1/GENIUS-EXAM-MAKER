import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { dbOperations } from '../db/database';

export default function FileImportModal({ onClose, onImportSuccess }) {
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [chapter, setChapter] = useState('الدعامة والحركة');

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setStatusText('تحضير محرك معالجة ورسم الأحياء...');

    try {
      const worker = await createWorker('ara');
      const newItems = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatusText(`قراءة الصورة وحفظ الرسم التوضيحي (${i + 1} من ${files.length})...`);

        const imageSrc = await readFileAsDataURL(file);
        const { data: { text } } = await worker.recognize(file);
        const cleanedText = text.replace(/([أ-ي])\s+([أ-ي])/g, '$1$2').trim();

        newItems.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
          text: cleanedText || 'اكتب نص السؤال هنا...',
          image: imageSrc,
          hasImage: true,
          type: 'mcq',
          marks: 1,
          chapter: chapter
        });
      }

      await worker.terminate();
      setQuestionsList(prev => [...prev, ...newItems]);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تحليل الصور. تحقق من اتصال الإنترنت للتحميل الأول.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleSaveAll = async () => {
    for (const q of questionsList) {
      await dbOperations.add('questions', {
        ...q,
        image: q.hasImage ? q.image : null,
        createdAt: new Date().toISOString()
      });
    }
    onImportSuccess();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <h3>🧬 معالجة واستخراج أسئلة الأحياء (نص + رسم)</h3>

        <div className="form-group">
          <label>الفصل / الدرس:</label>
          <input type="text" value={chapter} onChange={(e) => setChapter(e.target.value)} />
        </div>

        <div className="form-group">
          <label>اختر صور الأسئلة (تحتوي رسم توضيحي أو نص):</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesUpload} disabled={loading} />
        </div>

        {loading && <p style={{ color: 'var(--accent-gold)', textAlign: 'center' }}>⏳ {statusText}</p>}

        {questionsList.length > 0 && (
          <div style={{ maxHeight: '420px', overflowY: 'auto', margin: '15px 0' }}>
            {questionsList.map((q, idx) => (
              <div key={q.id} className="card" style={{ background: '#0f121a', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary-red)' }}>سؤال #{idx + 1}</span>
                  <button style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }} onClick={() => setQuestionsList(questionsList.filter(item => item.id !== q.id))}>🗑️ حذف</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: q.hasImage ? '1fr 220px' : '1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: '#aaa' }}>النص والخيارات المستخرجة:</label>
                    <textarea rows="4" value={q.text} onChange={(e) => {
                      const updated = [...questionsList];
                      updated[idx].text = e.target.value;
                      setQuestionsList(updated);
                    }} />
                  </div>

                  {q.hasImage && (
                    <div style={{ textAlign: 'center', background: '#161b26', padding: '8px', borderRadius: '8px' }}>
                      <img src={q.image} alt="diagram" style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
                      <button className="btn btn-secondary" style={{ fontSize: '0.75rem', marginTop: '6px' }} onClick={() => {
                        const updated = [...questionsList];
                        updated[idx].hasImage = !updated[idx].hasImage;
                        setQuestionsList(updated);
                      }}>إلغاء الرسمة</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" disabled={questionsList.length === 0 || loading} onClick={handleSaveAll}>حفظ في بنك الأسئلة</button>
        </div>
      </div>
    </div>
  );
}
