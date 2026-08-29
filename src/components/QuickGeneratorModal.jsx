import React, { useState } from 'react';
import { dbOperations } from '../db/database';

export default function QuickGeneratorModal({ onClose, onGenerated }) {
  const [count, setCount] = useState(10);

  const handleGenerate = async () => {
    const all = await dbOperations.getAll('questions');
    if (!all || all.length === 0) return alert('بنك الأسئلة فارغ!');
    
    const shuffled = [...all].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Number(count));
    
    onGenerated({ title: 'اختبار شمول سريعة', duration: 45 }, selected);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚡ التوليد السريع للامتحان</h3>
        <div className="form-group">
          <label>عدد الأسئلة المطلوبة عشوائياً:</label>
          <input type="number" value={count} onChange={(e) => setCount(e.target.value)} min="1" />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button className="btn btn-primary" onClick={handleGenerate}>توليد الآن</button>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
