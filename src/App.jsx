import React, { useState, useEffect } from 'react';
import QuestionBank from './screens/QuestionBank';
import QuestionEditor from './screens/QuestionEditor';
import ExamPreview from './components/ExamPreview';
import QuickGeneratorModal from './components/QuickGeneratorModal';
import HeaderSettingsModal from './components/HeaderSettingsModal';
import BackupRestoreModal from './components/BackupRestoreModal';

export default function App() {
  const [screen, setScreen] = useState('bank');
  const [currentExam, setCurrentExam] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [showQuickGen, setShowQuickGen] = useState(false);
  const [showHeaderSettings, setShowHeaderSettings] = useState(false);
  const [showBackup, setShowBackup] = useState(false);

  const [headerBranding, setHeaderBranding] = useState({
    teacherName: 'أ/ علاء شيتة',
    subjectName: 'الأحياء للثانوية العامة',
    centerName: 'GENIUS BIOLOGY CENTER'
  });

  useEffect(() => {
    const savedHeader = localStorage.getItem('genius_exam_header');
    if (savedHeader) {
      try { setHeaderBranding(JSON.parse(savedHeader)); } catch (e) {}
    }
  }, []);

  const saveHeaderBranding = (newBranding) => {
    setHeaderBranding(newBranding);
    localStorage.setItem('genius_exam_header', JSON.stringify(newBranding));
  };

  return (
    <div className="app-container">
      <header className="main-header no-print">
        <div>
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>🧠 GENIUS EXAM MAKER V3</h1>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowHeaderSettings(true)}>⚙️ الترويسة</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowBackup(true)}>💾 النسخ الاحتياطي</button>
        </div>
      </header>

      <main>
        {screen === 'bank' && (
          <QuestionBank 
            onAddNewQuestion={() => { setEditingQuestion(null); setScreen('add'); }} 
            onEditQuestion={(q) => { setEditingQuestion(q); setScreen('add'); }}
            onBuildExam={(exam, qList) => { setCurrentExam(exam); setSelectedQuestions(qList); setScreen('preview'); }} 
            onOpenQuickGen={() => setShowQuickGen(true)}
          />
        )}

        {screen === 'add' && (
          <QuestionEditor 
            editingQuestion={editingQuestion}
            onSaveSuccess={() => { setEditingQuestion(null); setScreen('bank'); }} 
            onCancel={() => { setEditingQuestion(null); setScreen('bank'); }} 
          />
        )}

        {screen === 'preview' && (
          <ExamPreview 
            exam={currentExam} 
            questions={selectedQuestions} 
            branding={headerBranding}
            onBack={() => setScreen('bank')} 
          />
        )}
      </main>

      {showQuickGen && (
        <QuickGeneratorModal 
          onClose={() => setShowQuickGen(false)} 
          onGenerated={(exam, qList) => { setCurrentExam(exam); setSelectedQuestions(qList); setShowQuickGen(false); setScreen('preview'); }}
        />
      )}

      {showHeaderSettings && (
        <HeaderSettingsModal 
          branding={headerBranding}
          onSave={saveHeaderBranding}
          onClose={() => setShowHeaderSettings(false)}
        />
      )}

      {showBackup && (
        <BackupRestoreModal 
          onClose={() => setShowBackup(false)}
          onDataRestored={() => window.location.reload()}
        />
      )}
    </div>
  );
}
