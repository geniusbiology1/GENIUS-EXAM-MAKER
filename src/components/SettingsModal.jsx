import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';

export default function SettingsModal({ onClose, onSave }) {
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [newChapter, setNewChapter] = useState('');
  const [newLesson, setNewLesson] = useState('');
  const [selectedChapId, setSelectedChapId] = useState('');
  const [theme, setTheme] = useState('red');

  // بيانات الترويسة
  const [teacherName, setTeacherName] = useState('أ/ علاء شيتة');
  const [centerName, setCenterName] = useState('GENIUS BIOLOGY CENTER');
  const [subjectName, setSubjectName] = useState('الأحياء للثانوية العامة');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const ch = await dbOperations.getAll('chapters');
    const ls = await dbOperations.getAll('lessons');
    const th = await dbOperations.getSetting('theme', 'red');
    const tName = await dbOperations.getSetting('teacherName', 'أ/ علاء شيتة');
    const cName = await dbOperations.getSetting('centerName', 'GENIUS BIOLOGY CENTER');
    const sName = await dbOperations.getSetting('subjectName', 'الأحياء للثانوية العامة');
    
    setChapters(ch || []);
    setLessons(ls || []);
    setTheme(th);
    setTeacherName(tName);
    setCenterName(cName);
    setSubjectName(sName);
    if (ch.length > 0) setSelectedChapId(ch[0].id);
  };

  const addChapter = async () => {
    if (!newChapter.trim()) return;
    await dbOperations.add('chapters', { id: Date.now().toString(), name: newChapter });
    setNewChapter('');
    loadData();
  };

  const addLesson = async () => {
    if (!newLesson.trim() || !selectedChapId) return;
    await dbOperations.add('lessons', { id: Date.now().toString(), chapterId: selectedChapId, name: newLesson });
    setNewLesson('');
    loadData();
  };

  const saveSettings = async () => {
    await dbOperations.setSetting('theme', theme);
    await dbOperations.setSetting('teacherName', teacherName);
    await dbOperations.setSetting('centerName', centerName);
    await dbOperations.setSetting('subjectName', subjectName);
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚙️ إعدادات الترويسة والباليتات</h3>

        {/* بيانات البراندينج */}
        <div className="form-group" style={{ marginTop: '10px' }}>
          <label>اسم السنتر / المركز:</label>
          <input type="text" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>اسم المعلم:</label>
          <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
        </div>
        <div className="form-group">
          <label>اسم المادة / الصف:</label>
          <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>🎨 الباليت البصرية للطباعة (A4):</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="red">الملكي (أحمر + أسود + أبيض)</option>
            <option value="navy">الكحلي الحديث (كحلي + رمادي + أبيض)</option>
            <option value="eco">الاقتصادي (أبيض وأسود فقط)</option>
          </select>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '15px 0' }} />

        {/* إدارة الفصول والدروس */}
        <h4>📚 قاموس الفصول والدروس</h4>
        <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
          <input type="text" placeholder="اسم الفصل..." value={newChapter} onChange={(e) => setNewChapter(e.target.value)} />
          <button className="btn btn-primary" onClick={addChapter}>+ إضافة</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={saveSettings}>حفظ وتطبيق</button>
        </div>
      </div>
    </div>
  );
}
