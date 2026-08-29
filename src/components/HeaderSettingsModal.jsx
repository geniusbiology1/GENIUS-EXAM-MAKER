import React, { useState, useEffect } from 'react';

export default function HeaderSettingsModal({ branding, onSave, onClose }) {
  const [form, setForm] = useState(branding || {
    teacherName: 'أ/ علاء شيتة',
    subjectName: 'الأحياء للثانوية العامة',
    centerName: 'GENIUS BIOLOGY CENTER',
    slogan: 'طريقك للتقفيل في الأحياء',
    phone: '01000000000',
    themeColor: 'red' // red, blue, emerald
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    document.documentElement.setAttribute('data-theme', form.themeColor);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <h3>⚙️ إعدادات البراند والهوية البصرية</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>اسم المعلم:</label>
            <input type="text" value={form.teacherName} onChange={e => setForm({...form, teacherName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>المادة الدراسية:</label>
            <input type="text" value={form.subjectName} onChange={e => setForm({...form, subjectName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>اسم السنتر / البراند:</label>
            <input type="text" value={form.centerName} onChange={e => setForm({...form, centerName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>الشعار (Slogan):</label>
            <input type="text" value={form.slogan} onChange={e => setForm({...form, slogan: e.target.value})} />
          </div>
          <div className="form-group">
            <label>رقم التواصل / الواتساب:</label>
            <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>

          <div className="form-group">
            <label>الطابع البصري للتطبيق (Color Palette):</label>
            <select value={form.themeColor} onChange={e => setForm({...form, themeColor: e.target.value})}>
              <option value="red">🔴 الملكي (أحمر + أسود + أبيض)</option>
              <option value="blue">🔵 النخبة (أزرق ملكي + كحلي + ذهبي)</option>
              <option value="emerald">🟢 الزمردي (أخضر زمردي + رمادي دافئ)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary">حفظ الإعدادات</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}
