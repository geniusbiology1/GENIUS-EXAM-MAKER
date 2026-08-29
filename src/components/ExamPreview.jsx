import React, { useState } from 'react';

export default function ExamPreview({ exam, questions, branding, onBack }) {
  const [includeOMR, setIncludeOMR] = useState(true);
  const [includeModelAnswer, setIncludeModelAnswer] = useState(false);

  const mcqQuestions = questions.filter(q => q.type === 'mcq');

  return (
    <div>
      <div className="card no-print" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" onClick={onBack}>⬅️ العودة</button>
        <button className="btn btn-primary" onClick={() => window.print()}>🖨️ طباعة PDF</button>
        <label><input type="checkbox" checked={includeOMR} onChange={(e) => setIncludeOMR(e.target.checked)} /> ورقة OMR</label>
        <label><input type="checkbox" checked={includeModelAnswer} onChange={(e) => setIncludeModelAnswer(e.target.checked)} /> نموذج الإجابة</label>
      </div>

      <div id="print-area" className="exam-paper">
        <div className="branding-header">
          <div>
            <h2>{branding.centerName}</h2>
            <p>{branding.subjectName} - {branding.teacherName}</p>
          </div>
          <div>
            <h3>{exam?.title || 'اختبار تقييمي'}</h3>
            <p>الزمن: {exam?.duration || 60} دقيقة</p>
          </div>
        </div>

        <div className="questions-list">
          {questions.map((q, idx) => (
            <div key={q.id} style={{ marginBottom: '16px' }}>
              <p><strong>س{idx + 1}:</strong> {q.text} ({q.marks} درجة)</p>
              {q.image && <img src={q.image} alt="" style={{ maxHeight: '150px', display: 'block' }} />}
              {q.type === 'mcq' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingRight: '12px' }}>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx}>({String.fromCharCode(65 + oIdx)}) {opt}</div>
                  ))}
                </div>
              )}
              {q.type === 'essay' && <div style={{ border: '1px dashed #999', height: '60px', marginTop: '6px' }}></div>}
            </div>
          ))}
        </div>

        {includeOMR && mcqQuestions.length > 0 && (
          <div style={{ marginTop: '30px', borderTop: '2px dashed #000', paddingTop: '10px' }}>
            <h4>ورقة إجابة الـ OMR السريعة</h4>
            <table className="omr-table">
              <thead>
                <tr><th>رقم السؤال</th><th>أخيارات الإجابة</th></tr>
              </thead>
              <tbody>
                {mcqQuestions.map((q, i) => (
                  <tr key={q.id}>
                    <td>س{i + 1}</td>
                    <td>
                      <span className="bubble">أ</span>
                      <span className="bubble">ب</span>
                      <span className="bubble">ج</span>
                      <span className="bubble">د</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {includeModelAnswer && (
          <div style={{ pageBreakBefore: 'always', paddingTop: '20px' }}>
            <h3>نموذج الإجابة الرسمي</h3>
            {questions.map((q, i) => (
              <p key={q.id}>
                <strong>س{i + 1}:</strong> {q.type === 'mcq' ? `الخيار (${String.fromCharCode(65 + q.correctAnswer)})` : 'إجابة مقالية تتطلب تقدير المعلم'}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
