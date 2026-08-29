import React, { useState, useEffect } from 'react';
import { dbOperations } from './db/database';
import FileImportModal from './components/FileImportModal';
import ExamPreview from './components/ExamPreview';
import './styles/global.css';

export default function App() {
  const [currentView, setCurrentView] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [showImport, setShowImport] = useState(false);

  const [branding] = useState({
    teacherName: 'أ/ علاء شيتة',
    subjectName: 'الأحياء للثانوية العامة',
    centerName: 'GENIUS BIOLOGY CENTER',
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const qList = await dbOperations.getAll('questions');
    setQuestions(qList || []);
  };

  return (
    <div>
      <header className="app-header no-print">
        <h1>🧬 GENIUS BIOLOGY EXAM BUILDER V3</h1>
        <div>
          <button className="btn btn-secondary" onClick={() => setShowImport(true)}>📥 إدخال ومعالجة صور</button>
          <button className="btn btn-primary" onClick={() => setCurrentView('preview')}>🚀 إنشاء امتحان ({selectedQuestions.length})</button>
        </div>
      </header>

      {currentView === 'questions' ? (
        <main>
          <div className="card"><h3>📚 بنك الأسئلة والمخططات ({questions.length})</h3></div>
          {questions.map((q) => {
            const isSelected = selectedQuestions.includes(q.id);
            return (
              <div key={q.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 'bold' }}>{q.text}</p>
                  {q.image && <small style={{ color: 'var(--accent-gold)' }}>🖼️ يحتوي رسم توضيحي</small>}
                </div>
                <button className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`} onClick={() => {
                  setSelectedQuestions(isSelected ? selectedQuestions.filter(id => id !== q.id) : [...selectedQuestions, q.id]);
                }}>
                  {isSelected ? '✓ محدد' : '+ إضافة'}
                </button>
              </div>
            );
          })}
        </main>
      ) : (
        <ExamPreview exam={{ title: 'اختبار الأحياء' }} questions={questions.filter(q => selectedQuestions.includes(q.id))} branding={branding} onBack={() => setCurrentView('questions')} />
      )}

      {showImport && <FileImportModal onClose={() => setShowImport(false)} onImportSuccess={() => { setShowImport(false); loadData(); }} />}
    </div>
  );
}
