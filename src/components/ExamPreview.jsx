import React, { useState, useEffect, useRef } from 'react';
import { dbOperations } from '../db/database';
import html2pdf from 'html2pdf.js';

export default function ExamPreview({ exam, questions, onBack }) {
  const [theme, setTheme] = useState('red');
  const [teacherName, setTeacherName] = useState('أ/ علاء شيتة');
  const [centerName, setCenterName] = useState('GENIUS BIOLOGY CENTER');
  const [subjectName, setSubjectName] = useState('الأحياء للثانوية العامة');
  const printRef = useRef(null);

  useEffect(() => {
    dbOperations.getSetting('theme', 'red').then(setTheme);
    dbOperations.getSetting('teacherName', 'أ/ علاء شيتة').then(setTeacherName);
    dbOperations.getSetting('centerName', 'GENIUS BIOLOGY CENTER').then(setCenterName);
    dbOperations.getSetting('subjectName', 'الأحياء للثانوية العامة').then(setSubjectName);
  }, []);

  const downloadPDF = () => {
    const element = printRef.current;
    const opt = {
      margin: 8,
      filename: `امتحان_العبقري_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  const getThemeStyles = () => {
    if (theme === 'navy') return { '--theme-primary': '#0077b6', '--theme-dark': '#0f172a', '--theme-bg': '#ffffff' };
    if (theme === 'eco') return { '--theme-primary': '#000000', '--theme-dark': '#000000', '--theme-bg': '#ffffff' };
    return { '--theme-primary': '#e63946', '--theme-dark': '#111111', '--theme-bg': '#ffffff' };
  };

  return (
    <div>
      <div className="card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>⬅️ العودة للبنك</button>
        <button className="btn btn-primary" onClick={downloadPDF}>📥 تنزيل PDF جاهز للطباعة</button>
      </div>

      <div className="a4-paper" ref={printRef} style={getThemeStyles()}>
        <div className="exam-header-box">
          <div>
            <h2 className="exam-header-title">{centerName}</h2>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{subjectName} — {teacherName}</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{exam?.title || 'اختبار الأحياء'}</h3>
            <div style={{ fontSize: '0.85rem' }}>⏱️ الزمن: 60 دقيقة</div>
          </div>
        </div>

        {questions.map((q, idx) => (
          <div key={q.id || idx} className="q-block">
            <div className="q-title">
              <span className="q-badge">س{idx + 1}:</span>
              <span>{q.text}</span>
            </div>

            {q.image && (
              <div style={{ textAlign: 'center', margin: '8px 0' }}>
                <img src={q.image} alt="diagram" />
              </div>
            )}

            {q.type === 'mcq' && q.options && q.options.length > 0 && (
              <div className="options-grid">
                <div>(أ) {q.options[0]}</div>
                <div>(ب) {q.options[1]}</div>
                <div>(ج) {q.options[2]}</div>
                <div>(د) {q.options[3]}</div>
              </div>
            )}

            {q.type === 'essay' && (
              <div style={{ marginTop: '8px' }}>
                {Array.from({ length: q.essayLines || 3 }).map((_, i) => (
                  <div key={i} className="essay-line-dash"></div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
