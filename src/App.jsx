import React, { useState, useEffect } from 'react';
import { dbOperations } from './db/database';
import QuestionFormModal from './components/QuestionFormModal';
import SettingsModal from './components/SettingsModal';
import ExamPreview from './components/ExamPreview';
import './styles/global.css';

export default function App() {
  const [view, setView] = useState('questions');
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    const list = await dbOperations.getAll('questions');
    setQuestions(list || []);
  };

  return (
    <div className="container">
      <header className="app-header no-print">
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--theme-primary)' }}>🧬 GENIUS EXAM BUILDER</h2>
          <small style={{ color: 'var(--text-secondary)' }}>أ/ علاء شيتة — بنك الأسئلة والامتحانات</small>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={() => setShowSettingsModal(true)}>⚙️ القواميس والباليتات</button>
          <button className="btn btn-secondary" onClick={() => setShowQuestionModal(true)}>➕ سؤال جديد</button>
          <button className="btn btn-primary" disabled={selectedIds.length === 0} onClick={() => setView('preview')}>
            🚀 معاينة A4 ({selectedIds.length})
          </button>
        </div>
      </header>

      {view === 'questions' ? (
        <main>
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4>📚 بنك الأسئلة المتاحة ({questions.length})</h4>
          </div>

          {questions.map((q) => {
            const isSelected = selectedIds.includes(q.id);
            return (
              <div key={q.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    📌 {q.chapter} ➔ {q.lesson}
                  </div>
                  <p style={{ fontWeight: 700 }}>{q.text}</p>
                </div>
                <button 
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedIds(isSelected ? selectedIds.filter(id => id !== q.id) : [...selectedIds, q.id])}
                >
                  {isSelected ? '✓ محدد' : '+ تحديد'}
                </button>
              </div>
            );
          })}
        </main>
      ) : (
        <ExamPreview 
          exam={{ title: 'اختبار الأحياء' }} 
          questions={questions.filter(q => selectedIds.includes(q.id))} 
          onBack={() => setView('questions')} 
        />
      )}

      {showQuestionModal && <QuestionFormModal onClose={() => setShowQuestionModal(false)} onSuccess={loadQuestions} />}
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} onSave={loadQuestions} />}
    </div>
  );
}
