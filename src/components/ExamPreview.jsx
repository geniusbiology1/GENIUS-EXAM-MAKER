import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';

export default function ExamPreview({ exam, questions, onBack }) {
  const [theme, setTheme] = useState('red');

  useEffect(() => {
    dbOperations.getSetting('theme', 'red').then(setTheme);
  }, []);

  const getThemeStyles = () => {
    if (theme === 'navy') return { '--theme-primary': '#0077b6', '--theme-dark': '#0f172a', '--theme-bg': '#ffffff' };
    if (theme === 'eco') return { '--theme-primary': '#000000', '--theme-dark': '#000000', '--theme-bg': '#ffffff' };
    return { '--theme-primary': '#e63946', '--theme-dark': '#111111', '--theme-bg': '#ffffff' };
  };

  return (
    <div>
      <div className="card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>⬅️ العودة للبنك</button>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ طباعة الورقة A4 / PDF</button>
      </div>

      <div className="a4-paper" style={getThemeStyles()}>
        <div className="exam-header-box">
          <div>
            <h2 className="exam-header-title">GENIUS BIOLOGY CENTER</h2>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>الأحياء للثانوية العامة — أ/ علاء شيتة</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem' }}>{exam?.title || 'اختبار الأحياء الشامل'}</h3>
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
              <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <img src={q.image} alt="diagram" style={{ maxHeight: '180px', objectFit: 'contain' }} />
              </div>
            )}

            {q.type === 'mcq' && q.options && (
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
