import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';
import FileImportModal from '../components/FileImportModal';

export default function QuestionBank({ onAddNewQuestion, onEditQuestion, onBuildExam, onOpenQuickGen }) {
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterChapter, setFilterChapter] = useState('الكل');
  const [showImportModal, setShowImportModal] = useState(false);

  const loadQuestions = async () => {
    const data = await dbOperations.getAll('questions');
    setQuestions(data || []);
  };

  useEffect(() => { loadQuestions(); }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
      await dbOperations.delete('questions', id);
      loadQuestions();
    }
  };

  const chapters = ['الكل', ...new Set(questions.map(q => q.chapter))];
  const filtered = filterChapter === 'الكل' ? questions : questions.filter(q => q.chapter === filterChapter);

  return (
    <div>
      <div className="card" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onAddNewQuestion}>➕ سؤال جديد</button>
          <button className="btn btn-accent" onClick={() => setShowImportModal(true)}>📁 استيراد (PDF/Word/صور)</button>
          <button className="btn btn-secondary" onClick={onOpenQuickGen}>⚡ توليد سريع</button>
        </div>
        {selectedIds.length > 0 && (
          <button className="btn btn-primary" onClick={() => onBuildExam({ title: 'امتحان مخصص', duration: 60 }, questions.filter(q => selectedIds.includes(q.id)))}>
            📋 إنشاء امتحان بالمختارة ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="card">
        <label>تصفية حسب الفصل / الباب:</label>
        <select value={filterChapter} onChange={(e) => setFilterChapter(e.target.value)}>
          {chapters.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        {filtered.map(q => (
          <div key={q.id} className="card" style={{ display: 'flex', gap: '10px' }}>
            <input type="checkbox" checked={selectedIds.includes(q.id)} onChange={() => toggleSelect(q.id)} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>{q.text}</p>
              {q.image && <img src={q.image} alt="معاينة" style={{ maxHeight: '80px', borderRadius: '4px', display: 'block', marginBottom: '6px' }} />}
              <small style={{ color: '#aaa' }}>الفصل: {q.chapter} | النوع: {q.type === 'mcq' ? 'اختياري' : 'مقالي'}</small>
            </div>
            <div>
              <button className="btn btn-secondary btn-sm" onClick={() => onEditQuestion(q)}>✏️</button>
              <button className="btn btn-secondary btn-sm" style={{ marginRight: '4px' }} onClick={() => handleDelete(q.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {showImportModal && (
        <FileImportModal 
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false);
            loadQuestions();
          }}
        />
      )}
    </div>
  );
}
