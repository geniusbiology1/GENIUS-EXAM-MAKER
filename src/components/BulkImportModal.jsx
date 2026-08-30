import React, { useState } from 'react';
import { dbOperations } from '../db/database';

export default function BulkImportModal({ onClose, onSuccess }) {
  const [rawText, setRawText] = useState('');
  const [chapter, setChapter] = useState('عام');
  const [isProcessing, setIsProcessing] = useState(false);

  // دالة الذكاء البرمجي لتفكيك النص المجمع إلى أسئلة منفصلة وتمييز أنواعها
  const parseBulkQuestions = (text) => {
    if (!text.trim()) return [];

    // تقسيم النص بناءً على بدايات الأسئلة (س1/س2/س3 أو 1-/2-/3- أو السطور)
    const blocks = text
      .split(/(?=(?:^|\n)(?:س?\d+[\.\-\)]|\(\d+\)))/g)
      .map(b => b.trim())
      .filter(Boolean);

    const parsed = blocks.map((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0] || '';

      // استخراج الخيارات الممكنة (أ/ب/ج/د أو 1/2/3/4)
      const optionLines = lines.filter(l => /^[أ-دA-D1-4][\.\-\)]/.test(l));
      
      const isMcq = optionLines.length >= 2;

      let options = [];
      if (isMcq) {
        options = optionLines.map(l => l.replace(/^[أ-d1-4][\.\-\)]\s*/, ''));
      }

      // تنظيف نص السؤال من الأرقام في البداية
      const questionText = lines
        .filter(l => !/^[أ-دA-D1-4][\.\-\)]/.test(l))
        .join(' ')
        .replace(/^(?:س?\d+[\.\-\)]|\(\d+\))\s*/, '');

      return {
        id: `q_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
        type: isMcq ? 'mcq' : 'essay', // تمييز تلقائي: مقالي أو اختيار من متعدد
        chapter: chapter.trim() || 'عام',
        difficulty: 'متوسط',
        text: questionText || block,
        image: '',
        options: isMcq ? options : [],
        correctAnswer: 0,
        marks: 1,
        createdAt: new Date().toISOString()
      };
    });

    return parsed;
  };

  const handleImport = async () => {
    if (!rawText.trim()) {
      alert('برجاء إدخال نص الأسئلة أولاً');
      return;
    }

    setIsProcessing(true);
    try {
      const questionsList = parseBulkQuestions(rawText);

      if (questionsList.length === 0) {
        alert('لم يتم التعرف على أية أسئلة، يرجى التحقق من تنسيق النص');
        setIsProcessing(false);
        return;
      }

      // حفظ كل سؤال بشكل مستقل ومتحكم فيه داخل قاعدة البيانات
      for (const q of questionsList) {
        await dbOperations.add('questions', q);
      }

      alert(`تم إضافة ${questionsList.length} سؤال بنجاح إلى بنك الأسئلة! يمكنك الآن تعديل أي سؤال وإضافة صورة له.`);
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة الأسئلة');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3>⚡ الإدخال المتعدد وتفكيك الأسئلة</h3>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label>الفصل / الباب الافتراضي لهذه الأسئلة:</label>
          <input 
            type="text" 
            value={chapter} 
            onChange={(e) => setChapter(e.target.value)} 
            placeholder="مثال: الباب الأول - الدعامة والحركة"
          />
        </div>

        <div className="form-group">
          <label>الصق النص المجمع هنا (سيتم تفكيك الـ 20 سؤالاً تلقائياً وتحديد نوع المقالي/MCQ):</label>
          <textarea 
            rows="10" 
            value={rawText} 
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`مثال للتنسيق:\n1- ما هي الوحدة التركيبية للعضلة الهيكلية؟\nأ) اللييفة العضلية\nب) القطعة العضلية\nج) الليفة العضلية\nد) الخلية العضلية\n\n2- علل: تحاط الخلية النباتية بجدار خليوي سميك؟`}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={isProcessing}>إلغاء</button>
          <button className="btn btn-primary" onClick={handleImport} disabled={isProcessing}>
            {isProcessing ? 'جاري التفكيك والحفظ...' : '🚀 تفكيك وحفظ بالبنك'}
          </button>
        </div>
      </div>
    </div>
  );
}
