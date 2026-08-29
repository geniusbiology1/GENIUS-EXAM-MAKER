import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { dbOperations } from '../db/database';

// ضبط إعدادات PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function FileImportModal({ onClose, onImportSuccess }) {
  const [loading, setLoading] = useState(false);
  const [extractedCount, setExtractedCount] = useState(0);

  // استخراج النص من PDF
  const readPdfText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  // استخراج النص من Word (.docx)
  const readDocxText = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // تحليل النص المحصل وتحويله لأسئلة مفككة
  const parseTextToQuestions = (text) => {
    // تقسيم النص بناءً على أرقام الأسئلة (س1، س2، أو 1. 2.)
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const questions = [];
    let currentQ = null;

    lines.forEach((line) => {
      // الكشف عن بداية سؤال جديد
      if (/^(س\d+|\d+[\.\-\)])/.test(line)) {
        if (currentQ) questions.push(currentQ);
        currentQ = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
          text: line.replace(/^(س\d+|\d+[\.\-\)])/, '').trim(),
          type: 'mcq',
          chapter: 'مستورد',
          difficulty: 'متوسط',
          options: [],
          correctAnswer: 0,
          marks: 1,
          createdAt: new Date().toISOString()
        };
      } else if (currentQ) {
        // إذا كانت السطر خياراً (أ، ب، ج، د)
        if (/^[أ-دA-D][\.\-\)]/.test(line)) {
          currentQ.options.push(line.replace(/^[أ-دA-D][\.\-\)]/, '').trim());
        } else {
          currentQ.text += ' ' + line;
        }
      }
    });

    if (currentQ) questions.push(currentQ);
    return questions;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      let rawText = '';
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'pdf') {
        rawText = await readPdfText(file);
      } else if (ext === 'docx') {
        rawText = await readDocxText(file);
      } else {
        alert('برجاء اختيار ملف PDF أو Word (docx)');
        setLoading(false);
        return;
      }

      const parsedQuestions = parseTextToQuestions(rawText);

      if (parsedQuestions.length === 0) {
        alert('لم يتم العثور على أسئلة واضحة. تأكد أن الأسئلة مسبوقة بـ (1. أو س1:) والخيارات بـ (أ. ب. ج. د.)');
      } else {
        for (const q of parsedQuestions) {
          await dbOperations.add('questions', q);
        }
        setExtractedCount(parsedQuestions.length);
        alert(`تم استخراج وإضافة ${parsedQuestions.length} سؤال بنجاح إلى البنك!`);
        onImportSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء قراءة الملف. تأكد من سلامة الملف.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📄 استيراد أسئلة من ملف (PDF / Word)</h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
          يدعم التطبيق قراءة ملفات PDF و Word واستخراج الأسئلة التلقائي منها إذا كانت منسقة بـ (س1، س2) أو (1. 2.).
        </p>

        <div className="form-group" style={{ marginTop: '14px' }}>
          <label>اختر الملف (PDF أو DOCX):</label>
          <input 
            type="file" 
            accept=".pdf, .docx, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            onChange={handleFileUpload}
            disabled={loading}
          />
        </div>

        {loading && <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>⏳ جاري تحليل واستخراج الأسئلة...</p>}

        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
