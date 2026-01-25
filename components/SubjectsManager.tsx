
import React, { useState } from 'react';
import { Season, Subject, GRADE_NAMES } from '../types';
import { Plus, Trash2, Book, Layers } from 'lucide-react';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
}

const SubjectsManager: React.FC<Props> = ({ season, onUpdate }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [subjectName, setSubjectName] = useState('');
  const [sectionName, setSectionName] = useState('');

  const addSubject = () => {
    if (!subjectName.trim()) return;
    const currentSubs = season.subjects[selectedGrade] || [];
    onUpdate({
      subjects: { ...season.subjects, [selectedGrade]: [...currentSubs, { id: Date.now().toString(), name: subjectName }] }
    });
    setSubjectName('');
  };

  const removeSubject = (subId: string) => {
    if (!confirm('حذف المادة؟')) return;
    onUpdate({
      subjects: { ...season.subjects, [selectedGrade]: (season.subjects[selectedGrade] || []).filter(s => s.id !== subId) },
      grades: (season.grades || []).filter(g => g.subjectId !== subId)
    });
  };

  const addSection = () => {
    if (!sectionName.trim()) return;
    const currentSections = season.sections?.[selectedGrade] || [];
    if (currentSections.includes(sectionName)) return;
    onUpdate({
      sections: { ...season.sections, [selectedGrade]: [...currentSections, sectionName] }
    });
    setSectionName('');
  };

  const removeSection = (name: string) => {
    if (!confirm('حذف الشعبة؟')) return;
    onUpdate({
      sections: { ...season.sections, [selectedGrade]: (season.sections[selectedGrade] || []).filter(s => s !== name) }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-3 bg-white p-3 rounded-3xl shadow-sm border border-gray-100">
        {[1, 2, 3, 4, 5, 6].map(g => (
          <button type="button" key={g} onClick={() => setSelectedGrade(g)} className={`flex-1 min-w-[100px] px-4 py-4 rounded-2xl font-black transition-all ${selectedGrade === g ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
            {GRADE_NAMES[g]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2"><Layers className="text-blue-500" /> إدارة شعب الصف {GRADE_NAMES[selectedGrade]}</h3>
          <div className="flex gap-3 mb-8">
            <input type="text" value={sectionName} onChange={e => setSectionName(e.target.value)} placeholder="اسم الشعبة..." className="flex-1 px-5 py-3 border border-gray-100 rounded-2xl outline-none bg-gray-50 focus:bg-white transition-all" />
            <button type="button" onClick={addSection} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 h-[52px] shadow-lg"><Plus size={20} /></button>
          </div>
          <div className="flex flex-wrap gap-3">
            {(season.sections?.[selectedGrade] || []).map(sec => (
              <div key={sec} className="px-5 py-2.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-2xl font-black text-sm flex items-center gap-4 group">
                <span>{sec}</span>
                <button type="button" onClick={() => removeSection(sec)} className="text-blue-300 hover:text-red-500 transition-colors"><Trash2 size={16} className="pointer-events-none" /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <h3 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2"><Book className="text-emerald-500" /> مواد الصف {GRADE_NAMES[selectedGrade]}</h3>
          <div className="flex gap-3 mb-8">
            <input type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="اسم المادة..." className="flex-1 px-5 py-3 border border-gray-100 rounded-2xl outline-none bg-gray-50 focus:bg-white transition-all" />
            <button type="button" onClick={addSubject} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 h-[52px] shadow-lg"><Plus size={20} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(season.subjects[selectedGrade] || []).map(sub => (
              <div key={sub.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all">
                <span className="font-black text-gray-700 text-sm">{sub.name}</span>
                <button type="button" onClick={() => removeSubject(sub.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} className="pointer-events-none" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectsManager;
