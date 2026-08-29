import React from 'react';
import { dbOperations } from '../db/database';

export default function BackupRestoreModal({ onClose, onDataRestored }) {
  const handleExport = async () => {
    const questions = await dbOperations.getAll('questions');
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `genius_questions_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const data = JSON.parse(evt.target.result);
          if (Array.isArray(data)) {
            for (const item of data) {
              await dbOperations.add('questions', item);
            }
            alert('تم استعادة بنك الأسئلة بنجاح!');
            onDataRestored();
          }
        } catch (err) {
          alert('ملف غير صالح');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>💾 النسخ الاحتياطي والإستعادة</h3>
        <div className="form-group">
          <button className="btn btn-primary" onClick={handleExport}>📥 تصدير بنك الأسئلة (JSON)</button>
        </div>
        <div className="form-group">
          <label>📤 استيراد بنك أسئلة من ملف:</label>
          <input type="file" accept=".json" onChange={handleImport} />
        </div>
        <div style={{ marginTop: '14px' }}>
          <button className="btn btn-secondary" onClick={onClose}>إغلاق</button>
        </div>
      </div>
    </div>
  );
}
