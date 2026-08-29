import React, { useState, useEffect } from 'react';
import { dbOperations } from '../db/database';

export default function SettingsModal({ onClose, onSave }) {
  const [chapters, setChapters] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [newChapter, setNewChapter] = useState('');
  const [newLesson, setNewLesson] = useState('');
  const [selectedChapId, setSelectedChapId] = useState('');
  const [theme, setTheme] = useState('red');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const ch = await dbOperations.getAll('chapters');
    const ls = await dbOperations.getAll('lessons');
    const th = await dbOperations.getSetting('theme', 'red');
    setChapters(ch || []);
    setLessons(ls || []);
    setTheme(th);
    if (ch.length > 0) setSelectedChapId(ch[0].id);
  };

  const addChapter = async () => {
    if (!newChapter.trim()) return;
    const item = { id: Date.now().toString(), name: newChapter };
    await dbOperations.add('chapters', item);
    setNewChapter('');
    loadData();
  };

  const addLesson = async () => {
    if (!newLesson.trim() || !selectedChapId) return;
    const item = { id: Date.now().toString(), chapterId: selectedChapId, name: newLesson };
    await dbOperations.add('lessons', item);
    setNewLesson('');
    loadData();
  };

  const saveSettings = async () => {
    await dbOperations.setSetting('theme', theme);
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>⚙️ إعدادات القواميس والهوية البصرية</h3>

        {/* اختيارات الهوية البصرية */}
        <div className="form-group" style={{ marginTop: '14px' }}>
          <label>🎨 اختر الباليت البصرية للطباعة (A4):</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="red">الملكي (أحمر + أسود + أبيض)</option>
            <option value="navy">الكحلي الحديث (كحلي + رمادي + أبيض)</option>
            <option value="eco">الاقتصادي (أبيض وأسود فقط - موفر للحبر)</option>
          </select>
        </div>

        <hr style={{ borderColor: 'var(--border-color)', margin: '15px 0' }} />

        {/* إدارة الفصول */}
        <h4>📚 قاموس الفصول</h4>
        <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
          <input type="text" placeholder="اسم الفصل الجديد..." value={newChapter} onChange={(e) => setNewChapter(e.target.value)} />
          <button className="btn btn-primary" onClick={addChapter}>+ إضافة</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {chapters.map(c => (
            <span key={c.id} style={{ background: '#1c2333', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
              {c.name}
            </span>
          ))}
        </div>

        {/* إدارة الدروس */}
        <h4>📖 قاموس الدروس</h4>
        <div className="form-group" style={{ marginTop: '6px' }}>
          <select value={selectedChapId} onChange={(e) => setSelectedChapId(e.target.value)}>
            {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
          <input type="text" placeholder="اسم الدرس الجديد..." value={newLesson} onChange={(e) => setNewLesson(e.target.value)} />
          <button className="btn btn-primary" onClick={addLesson}>+ إضافة</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {lessons.filter(l => l.chapterId === selectedChapId).map(l => (
            <span key={l.id} style={{ background: '#1c2333', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem' }}>
              {l.name}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button className="btn btn-primary" onClick={saveSettings}>حفظ وتطبيق</button>
        </div>
      </div>
    </div>
  );
}
