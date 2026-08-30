import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';

export default function BulkImportModal({ onClose, onSuccess }) {
  const [rawText, setRawText] = useState('');
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedChap, setSelectedChap] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');

  useEffect(() => {
    dbOperations.getAll('chapters').then(ch => {
      setChapters(ch || []);
      if (ch && ch.length > 0) setSelectedChap(ch[0].name);
    });
    dbOperations.getAll('lessons').then(ls => setLessons(ls || []));
  }, []);

  const handleProcessBulk = async () => {
    if (!rawText.trim()) return alert('قم بوضع نص الأسئلة أولاً');

    // تقسيم النص بناءً على السطور أو أرقام الأسئلة
    const blocks = rawText.split(/\n(?=س|\d+[\.-]|\n)/g);
    
    for (let block of blocks) {
      if (!block.trim()) continue;

      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0] || '';

      // البحث عن الخيارات أ، ب، ج، د
      const hasOptions = lines.some(l => l.startsWith('أ') || l.startsWith('ب') || l.startsWith('ج') || l.startsWith('د') || l.startsWith('1') || l.startsWith('2'));

      let questionType = hasOptions ? 'mcq' : 'essay';
      let text = firstLine.replace(/^(س\d*||\d+[\.-])\s*/, '');
      let options = [];

      if (questionType === 'mcq') {
        const optA = lines.find(l => l.startsWith('أ') || l.startsWith('ا')) || lines[1] || '';
        const optB = lines.find(l => l.startsWith('ب')) || lines[2] || '';
        const optC = lines.find(l => l.startsWith('ج')) || lines[3] || '';
        const optD = lines.find(l => l.startsWith('د')) || lines[4] || '';
        options = [
          optA.replace(/^[أابجد1234][\.\)-]\s*/, ''),
          optB.replace(/^[أابجد1234][\.\)-]\s*/, ''),
          optC.replace(/^[أابجد1234][\.\)-]\s*/, ''),
          optD.replace(/^[أابجد1234][\.\)-]\s*/, '')
        ];
      }

      await dbOperations.add('questions', {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        chapter: selectedChap,
        lesson: selectedLesson,
        type: questionType,
        text: text || block,
        options: options,
        essayLines: questionType === 'essay' ? 3 : 0,
        createdAt: new Date().toISOString()
      });
    }

    onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚡ إضافة مجموعة أسئلة دفعة واحدة</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          انسخ النص وضعْه هنا، وسيقوم النظام بتصنيف كل سؤال (اختيار من متعدد إذا احتوى خيارات، أو مقالي) تلقائياً.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '10px 0' }}>
          <div>
            <label style={{ fontSize: '0.8rem' }}>التصنيف للفصل:</label>
            <select value={selectedChap} onChange={(e) => setSelectedChap(e.target.value)}>
              {chapters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem' }}>الدرس:</label>
            <select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
              {lessons.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <textarea 
          rows="10" 
          value={rawText} 
          onChange={(e) => setRawText(e.target.value)} 
          placeholder={`مثال:\nس1: ما هي الخلية الحارسة؟\nأ) خلية تحيط بالثغر\nب) خلية عضلية\nج) خلية خشبية\nد) لا شيء مما سبق\n\nس2: علل: تكتسب النباتات دعامة تركيبية.`}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          <button className="btn btn-primary" onClick={handleProcessBulk}>إدخال الكل للبنك</button>
        </div>
      </div>
    </div>
  );
}
