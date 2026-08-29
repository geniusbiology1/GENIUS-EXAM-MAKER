import React, { useState } from 'react';

export default function ExamPreview({ exam, questions, branding, onBack }) {
  const [showOMR, setShowOMR] = useState(false);
  const [imgScale, setImgScale] = useState(100);

  return (
    <div>
      <div className="card no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>⬅️ العودة</button>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <label>
            <input type="checkbox" checked={showOMR} onChange={(e) => setShowOMR(e.target.checked)} />
            إضافة ورقة OMR
          </label>
          <label>
            حجم الرسومات:
            <select value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))}>
              <option value={80}>صغير (80%)</option>
              <option value={100}>متوسط (100%)</option>
              <option value={120}>كبير (120%)</option>
            </select>
          </label>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨️ طباعة / حفظ PDF</button>
        </div>
      </div>

      <div className="exam-paper-container">
        <div className="exam-header-book">
          <div>
            <h2>{branding.centerName}</h2>
            <div>{branding.subjectName} — {branding.teacherName}</div>
          </div>
          <div>
            <h3>{exam?.title || 'اختبار الأحياء'}</h3>
            <div>⏱️ الزمن: {exam?.duration || 60} دقيقة</div>
          </div>
        </div>

        <div>
          {questions.map((q, idx) => (
            <div key={q.id || idx} className="question-block" style={{ pageBreakInside: 'avoid' }}>
              <div className="q-head">
                <span className="q-num">س {idx + 1}:</span>
                <span style={{ flexGrow: 1 }}>{q.text}</span>
                <span>({q.marks || 1} درجات)</span>
              </div>

              {q.image && (
                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                  <img src={q.image} alt="diagram" style={{ maxWidth: `${imgScale}%`, maxHeight: '350px', objectFit: 'contain' }} />
                </div>
              )}

              {q.type === 'essay' && (
                <div>
                  <div className="essay-line"></div>
                  <div className="essay-line"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
