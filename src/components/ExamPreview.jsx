import React, { useState } from 'react';

export default function ExamPreview({ exam, questions, branding, onBack }) {
  const [includeOMR, setIncludeOMR] = useState(true);
  const [includeModelAnswer, setIncludeModelAnswer] = useState(false);

  // تصدير كـ Word (.docx)
  const exportToWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Exam</title></head><body dir='rtl' style='font-family: Arial;'>";
    const footer = "</body></html>";
    const sourceHTML = header + document.getElementById("print-area").innerHTML + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${exam?.title || 'اختبار'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const mcqQuestions = (questions || []).filter(q => q.type === 'mcq');
  const essayQuestions = (questions || []).filter(q => q.type === 'essay');

  return (
    <div>
      {/* شريط التحكم والتصدير */}
      <div className="card no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>⬅️ العودة</button>
        <button className="btn btn-primary" onClick={() => window.print()}>📄 طباعة / حفظ PDF أو صورة</button>
        <button className="btn btn-accent" onClick={exportToWord}>📝 تصدير ملف Word</button>

        <div style={{ marginRight: 'auto', display: 'flex', gap: '12px' }}>
          <label><input type="checkbox" checked={includeOMR} onChange={e => setIncludeOMR(e.target.checked)} /> ورقة OMR</label>
          <label><input type="checkbox" checked={includeModelAnswer} onChange={e => setIncludeModelAnswer(e.target.checked)} /> الإجابات</label>
        </div>
      </div>

      {/* الورقة الامتحانية */}
      <div id="print-area" className="exam-paper-container">
        
        {/* الترويسة الاحترافية */}
        <div className="exam-header-book">
          <div className="brand-side">
            <h2>{branding?.centerName}</h2>
            <p className="sub">{branding?.subjectName} — {branding?.teacherName}</p>
            <small>{branding?.slogan}</small>
          </div>
          <div className="exam-info-side">
            <h1 className="exam-title">{exam?.title || 'اختبار تقييمي'}</h1>
            <div className="meta-tags">
              <span>⏱️ الزمن: {exam?.duration || 60} دقيقة</span>
              <span>📱 للتواصل: {branding?.phone}</span>
            </div>
          </div>
        </div>

        {/* القسم الأول: أسئلة الاختيار من متعدد */}
        {mcqQuestions.length > 0 && (
          <div className="exam-section">
            <h3 className="section-header-title">أولاً: أسئلة الاختيار من متعدد</h3>
            {mcqQuestions.map((q, idx) => (
              <div key={q.id || idx} className="question-block">
                <div className="q-head">
                  <span className="q-num">س {idx + 1}:</span>
                  <span className="q-text">{q.text}</span>
                  <span className="q-marks">({q.marks || 1} درجة)</span>
                </div>

                {q.image && <img src={q.image} alt="توضيح" className="q-img" />}

                <div className="options-grid">
                  {(q.options || []).map((opt, oIdx) => (
                    <div key={oIdx} className="option-item">
                      <span className="opt-symbol">({String.fromCharCode(65 + oIdx)})</span>
                      <span className="opt-text">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* القسم الثاني: الأسئلة المقالية */}
        {essayQuestions.length > 0 && (
          <div className="exam-section" style={{ marginTop: '24px' }}>
            <h3 className="section-header-title">ثانياً: الأسئلة المقالية</h3>
            {essayQuestions.map((q, idx) => (
              <div key={q.id || idx} className="question-block essay-block">
                <div className="q-head">
                  <span className="q-num">س {mcqQuestions.length + idx + 1}:</span>
                  <span className="q-text">{q.text}</span>
                  <span className="q-marks">({q.marks || 2} درجات)</span>
                </div>

                {q.image && <img src={q.image} alt="توضيح" className="q-img" />}

                <div className="essay-answer-space">
                  <div className="essay-line"></div>
                  <div className="essay-line"></div>
                  <div className="essay-line"></div>
                  <div className="essay-line"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* شيت الـ OMR */}
        {includeOMR && mcqQuestions.length > 0 && (
          <div className="omr-section page-break" style={{ marginTop: '30px' }}>
            <h3 className="section-title">شيت إجابة البابل شيت (OMR)</h3>
            <div className="omr-grid">
              {mcqQuestions.map((q, i) => (
                <div key={i} className="omr-row">
                  <span className="omr-num">{i + 1}</span>
                  <div className="omr-bubbles">
                    <span>أ</span><span>ب</span><span>ج</span><span>د</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نموذج الإجابة */}
        {includeModelAnswer && (
          <div className="model-answer-section page-break" style={{ marginTop: '30px', borderTop: '2px solid #000', paddingTop: '15px' }}>
            <h3>🔑 نموذج الإجابة الرسمي</h3>
            <h4>إجابات الاختيار من متعدد:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {mcqQuestions.map((q, i) => (
                <div key={i}><strong>س{i + 1}:</strong> الخيار ({String.fromCharCode(65 + (q.correctAnswer || 0))})</div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
