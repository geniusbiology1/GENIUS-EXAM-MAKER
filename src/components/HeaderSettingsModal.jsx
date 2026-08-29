import React, { useState } from 'react';

export default function HeaderSettingsModal({ branding, onSave, onClose }) {
  const [form, setForm] = useState({ ...branding });

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚙️ إعدادات الترويسة والعلامة التجارية</h3>
        <div className="form-group">
          <label>اسم المعلم:</label>
          <input type="text" value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>المادة الدراسية:</label>
          <input type="text" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} />
        </div>
        <div className="form-group">
          <label>اسم المركز / الأكاديمية:</label>
          <input type="text" value={form.centerName} onChange={(e) => setForm({ ...form, centerName: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          <button className="btn btn-primary" onClick={handleSave}>حفظ التغييرات</button>
          <button className="btn btn-secondary" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
