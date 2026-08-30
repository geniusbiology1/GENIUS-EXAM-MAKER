import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';

export default function SettingsModal({ onClose, onSave }) {
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [newChapter, setNewChapter] = useState('');
  const [newLesson, setNewLesson] = useState('');
  const [selectedChapId, setSelectedChapId] = useState('');
  const [theme, setTheme] = useState('red');

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
    if (ch && ch.length > 0) setSelectedChapId(ch[0].id);
  };

  const addChapter = async () => {
    if (!newChapter.trim()) return;
    const item = { id: Date.now().toString(), name: newChapter };
    await dbOperations.add('chapters', item);
    setNewChapter('');
    loadData();
  };

  const addLesson = async () => {
    if (!newLesson.trim() || !selectedChapId) return alert('اختر الفصل أولاً ثم اكتب اسم الدرس');
    const item = { id: Date.now().toString(), chapterId: selectedChapId, name: newLesson };
    await dbOperations.add('lessons', item);
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
        <h3>⚙️ الإعدادات العامة وقواميس المنهج</h3>

        {/* بيانات البراندينج */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="form-group">
            <label>اسم المعلم:</label>
            <input type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>اسم السنتر:</label>
            <input type="text" value={centerName} onChange={(e) => setCenterName(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>المادة والصف:</label>
          <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>🎨 الباليت البصرية للطباعة (A4):</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="red">الملكي (أحمر + أسود + أبيض)</option>
            <option value="navy">الكحلي الحديث (كحلي + رمادي)</option>
            <option value="eco">الاقتصادي (أبيض وأسود)</option>
          </select>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '15px 0' }} />

        {/* ربط الفصول بالدروس */}
        <h4>📚 إدارة الفصول والدروس</h4>
        
        {/* إضافة فصل */}
        <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
          <input type="text" placeholder="اسم الفصل الجديد..." value={newChapter} onChange={(e) => setNewChapter(e.target.value)} />
          <button className="btn btn-primary" onClick={addChapter}>+ إضافة فصل</button>
        </div>

        {/* اختيار فصل لإضافة دروس تابعة له */}
        {chapters.length > 0 && (
          <div style={{ background: '#1c2333', padding: '10px', borderRadius: '8px', marginTop: '10px' }}>
            <label style={{ fontSize: '0.85rem', color: '#aaa' }}>اختر الفصل لإضافة دروس جواه:</label>
            <select value={selectedChapId} onChange={(e) => setSelectedChapId(e.target.value)} style={{ margin: '6px 0' }}>
              {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <input type="text" placeholder="اسم الدرس التابع لهذا الفصل..." value={newLesson} onChange={(e) => setNewLesson(e.target.value)} />
              <button className="btn btn-primary" onClick={addLesson}>+ إضافة درس</button>
            </div>

            {/* عرض دروس الفصل المختار فقط */}
            <div style={{ marginTop: '8px' }}>
              <small style={{ color: 'var(--text-secondary)' }}>دروس هذا الفصل:</small>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {lessons.filter(l => l.chapterId === selectedChapId).map(l => (
                  <span key={l.id} style={{ background: '#293249', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                    📖 {l.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={saveSettings}>حفظ الإعدادات</button>
        </div>
      </div>
    </div>
  );
}
