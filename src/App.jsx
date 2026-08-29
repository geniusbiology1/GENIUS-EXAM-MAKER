import React, { useState, useEffect } from 'react';
import { dbOperations } from './db/database';
import HeaderSettingsModal from './components/HeaderSettingsModal';
import FileImportModal from './components/FileImportModal';
import ExamPreview from './components/ExamPreview';
import './styles/global.css';

export default function App() {
  const [currentView, setCurrentView] = useState('questions'); // 'questions', 'exams', 'preview'
  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [activeExam, setActiveExam] = useState(null);

  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [branding, setBranding] = useState({
    teacherName: 'أ/ علاء شيتة',
    subjectName: 'الأحياء للثانوية العامة',
    centerName: 'GENIUS BIOLOGY CENTER',
    slogan: 'طريقك للتقفيل في الأحياء',
    phone: '01000000000'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const qList = await dbOperations.getAll('questions');
    const eList = await dbOperations.getAll('exams');
    setQuestions(qList || []);
    setExams(eList || []);
  };

  const handleCreateExam = () => {
    if (selectedQuestions.length === 0) {
      alert('الرجاء اختيار سؤال واحد على الأقل لبناء الامتحان');
      return;
    }
    const newExam = {
      title: 'اختبار تقييمي في الأحياء',
      duration: 60,
      createdAt: new Date().toISOString()
    };
    setActiveExam(newExam);
    setCurrentView('preview');
  };

  return (
    <div>
      {/* الهيدر العلوي الذكي */}
      <header className="app-header no-print">
        <div className="brand-title-group">
          <h1>🧠 GENIUS EXAM MAKER V3</h1>
          <span>{branding.teacherName}</span>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>⚙️ الإعدادات والبراند</button>
          <button className="btn btn-accent" onClick={() => setShowImport(true)}>📥 استيراد ملفات (PDF/Word)</button>
          <button className="btn btn-primary" onClick={handleCreateExam}>🚀 إنشاء امتحان ({selectedQuestions.length})</button>
        </div>
      </header>

      {/* الشاشة الرئيسية للأسئلة والداشبورد الداخلي */}
      {currentView === 'questions' && (
        <main>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>📚 بنك الأسئلة المتاحة ({questions.length})</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>اختر الأسئلة المطلوبة لتنسيق ورقة الامتحانات</p>
            </div>
          </div>

          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="card" style={{ textAlignment: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>لا يوجد أسئلة حالياً. قم باستيراد ملف أسئلة عبر زر (استيراد ملفات) في الأعلى.</p>
              </div>
            ) : (
              questions.map((q) => {
                const isSelected = selectedQuestions.includes(q.id);
                return (
                  <div key={q.id} className="q-bank-item">
                    <div style={{ flexGrow: 1, paddingLeft: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <span className={`badge ${q.type === 'mcq' ? 'badge-mcq' : 'badge-essay'}`}>
                          {q.type === 'mcq' ? 'اختيار من متعدد' : 'سؤال مقالي'}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{q.chapter}</span>
                      </div>
                      <p style={{ fontWeight: '700', fontSize: '1rem' }}>{q.text}</p>
                    </div>

                    <button 
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                        } else {
                          setSelectedQuestions([...selectedQuestions, q.id]);
                        }
                      }}
                    >
                      {isSelected ? '✓ تم الاختيار' : '+ إضافة للامتحان'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* شاشة معاينة وتصدير الامتحان */}
      {currentView === 'preview' && (
        <ExamPreview 
          exam={activeExam}
          questions={questions.filter(q => selectedQuestions.includes(q.id))}
          branding={branding}
          onBack={() => setCurrentView('questions')}
        />
      )}

      {/* المودالات والشبكات المنبثقة */}
      {showSettings && (
        <HeaderSettingsModal 
          branding={branding} 
          onSave={(updated) => setBranding(updated)}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showImport && (
        <FileImportModal 
          onClose={() => setShowImport(false)}
          onImportSuccess={() => {
            setShowImport(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
