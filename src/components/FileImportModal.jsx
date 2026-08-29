import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';
import { dbOperations } from '../db/database';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function FileImportModal({ onClose, onImportSuccess }) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  // 1. قراءة واستخراج النصوص والصور من Word (.docx)
  const processDocx = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const imagesExtracted = [];

    const options = {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read("base64").then((imageBuffer) => {
          const src = `data:${image.contentType};base64,${imageBuffer}`;
          imagesExtracted.push(src);
          return { src };
        });
      })
    };

    const result = await mammoth.extractRawText({ arrayBuffer }, options);
    return { text: result.value, images: imagesExtracted };
  };

  // 2. قراءة واستخراج النصوص من PDF
  const processPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return { text: fullText, images: [] };
  };

  // 3. قراءة وتفريغ النص من الصور المباشرة (OCR)
  const processImageOCR = async (file) => {
    setStatusText('جاري التعرف الضوئي على النص داخل الصورة (OCR)...');
    const worker = await createWorker('ara+eng');
    const ret = await worker.recognize(file);
    await worker.terminate();

    // تحويل الصورة نفسها لـ Base64 لإرفاقها بالسؤال
    const reader = new FileReader();
    const imageBase64 = await new Promise((resolve) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

    return { text: ret.data.text, images: [imageBase64] };
  };

  // دالة تحليل النصوص الذكية والفصل بين الأسئلة والخيارات
  const parseContentToQuestions = (text, images) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const questions = [];
    let currentQ = null;
    let imgIndex = 0;

    const questionRegex = /^([سQ]\s*\d+|[\(\[]?\d+[\)\]\.\-\/])/i;
    const optionRegex = /^([\(\[]?[أ-دA-D1-4][\)\]\.\-\/])/i;

    lines.forEach((line) => {
      if (questionRegex.test(line) || (!currentQ && line.length > 5)) {
        if (currentQ) questions.push(currentQ);
        
        currentQ = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
          text: line.replace(questionRegex, '').trim(),
          type: 'mcq',
          chapter: 'مستورد',
          difficulty: 'متوسط',
          options: [],
          correctAnswer: 0,
          marks: 1,
          image: images[imgIndex] || null, // إرفاق الصورة المتاحة مع السؤال
          createdAt: new Date().toISOString()
        };
        if (images[imgIndex]) imgIndex++;
      } else if (currentQ) {
        if (optionRegex.test(line)) {
          currentQ.options.push(line.replace(optionRegex, '').trim());
        } else {
          if (currentQ.options.length === 0) {
            currentQ.text += ' ' + line;
          } else {
            const lastIdx = currentQ.options.length - 1;
            currentQ.options[lastIdx] += ' ' + line;
          }
        }
      }
    });

    if (currentQ) questions.push(currentQ);

    // خطة احتياطية للفقرات غير المرقمة
    if (questions.length === 0 && text.trim().length > 0) {
      questions.push({
        id: Date.now().toString(),
        text: text.trim(),
        type: 'essay',
        chapter: 'مستورد',
        difficulty: 'متوسط',
        options: [],
        correctAnswer: 0,
        marks: 1,
        image: images[0] || null,
        createdAt: new Date().toISOString()
      });
    }

    return questions;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setStatusText('جاري تحليل ومعالجة الملف...');

    try {
      let extractedData = { text: '', images: [] };
      const ext = file.name.split('.').pop().toLowerCase();

      if (ext === 'pdf') {
        extractedData = await processPdf(file);
      } else if (ext === 'docx') {
        extractedData = await processDocx(file);
      } else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
        extractedData = await processImageOCR(file);
      } else {
        alert('نوع الملف غير مدعوم. اختر (PDF / Word / صورة)');
        setLoading(false);
        return;
      }

      setStatusText('جاري تفكيك وتصنيف الأسئلة والصور...');
      const questions = parseContentToQuestions(extractedData.text, extractedData.images);

      if (questions.length === 0) {
        alert('تعذر استخراج أسئلة من الملف.');
      } else {
        for (const q of questions) {
          await dbOperations.add('questions', q);
        }
        alert(`تم استخراج وإضافة ${questions.length} سؤال وبنجاح!`);
        onImportSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة الملف.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>📁 استيراد الشامل (PDF / Word / صور)</h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa' }}>
          يستخرج هذا المحرك النصوص والصور المدمجة والأسئلة تلقائياً من الملفات والصور المصورة.
        </p>

        <div className="form-group" style={{ marginTop: '14px' }}>
          <label>اختر الملف (PDF, DOCX, PNG, JPG):</label>
          <input 
            type="file" 
            accept=".pdf, .docx, .png, .jpg, .jpeg, .webp" 
            onChange={handleFileUpload}
            disabled={loading}
          />
        </div>

        {loading && (
          <div style={{ marginTop: '12px' }}>
            <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>⏳ {statusText}</p>
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
