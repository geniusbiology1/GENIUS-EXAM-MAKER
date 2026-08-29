import React, { useState } from 'react';
import html2canvas from 'html2canvas';

export default function ExamPreview({ exam, questions, branding, onBack }) {
  const [includeOMR, setIncludeOMR] = useState(true);
  const [includeModelAnswer, setIncludeModelAnswer] = useState(false);

  // تصدير كـ Word (.docx / HTML Format)
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

  // تصدير كـ صور (PNG Image Export)
  const exportToImages = async () => {
    const element = document.getElementById("print-area");
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${exam?.title || 'امتحان'}.png`;
    link.click();
  };

  return (
    <div>
      {/* شريط التحكم للتصدير والطباعة */}
      <div className="card no-print" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-secondary" onClick={onBack}>⬅️ العودة</button>
        <button className="btn btn-primary" onClick={() => window.print()}>📄 تصدير / طباعة PDF</button>
        <button className="btn btn-accent" onClick={exportToWord}>📝 تصدير ملف Word</button>
        <button className="btn btn-secondary" onClick={exportToImages}>🖼️ تصدير كـ صورة</button>

        <div style={{ marginRight: 'auto', display: 'flex', gap: '12px' }}>
          <label><input type="checkbox" checked={includeOMR} onChange={e => setIncludeOMR(e.target.checked)} /> ورقة OMR</label>
          <label><input type="checkbox" checked={includeModelAnswer} onChange={e => setIncludeModelAnswer(e.target.checked)} /> الإجابات</label>
        </div>
      </div>

      {/* منطقة الورقة الامتحانية المنقحة والمصممة كـ كتاب احترافي */}
      <div id="print-area" className="exam-paper-container">
        {/* هيدر الامتحان الاحترافي */}
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

        {/* جسم الامتحان والأسئلة */}
        <div className="questions-body">
          {(questions || []).map((q, idx) => (
            <div key={q.id || idx} className="question-block">
              <div className="q-head">
                <span className="q-num">س {idx + 1}</span>
                <span className="q-text">{q.text}</span>
                <span className="q-marks">({q.marks} درجات)</span>
              </div>

              {q.image && <img src={q.image} alt="توضيح" className="q-img" />}

              {q.type === 'mcq' && q.options && (
                <div className="options-grid">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="option-item">
                      <span className="opt-symbol">({String.fromCharCode(65 + oIdx)})</span>
                      <span className="opt-text">{opt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* جدول الـ OMR الاحترافي */}
        {includeOMR && (
          <div className="omr-section page-break">
            <h3 className="section-title">شيت إجابة البابل شيت (OMR)</h3>
            <div className="omr-grid">
              {(questions || []).filter(q => q.type === 'mcq').map((q, i) => (
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
      </div>
    </div>
  );
}
