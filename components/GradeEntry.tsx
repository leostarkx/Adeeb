
import React, { useState, useMemo } from 'react';
import { Season, GradeRecord, Subject, Student, GRADE_NAMES } from '../types';
import { calculateGrades, formatGrade } from '../utils/calculations';
import { Save, Search, ChevronRight, Filter, AlertCircle, Bookmark } from 'lucide-react';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
}

const GradeEntry: React.FC<Props> = ({ season, onUpdate }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const filteredStudents = useMemo(() => 
    season.students.filter(s => s.grade === selectedGrade && s.section === selectedSection),
    [season.students, selectedGrade, selectedSection]
  );

  const subjects = useMemo(() => season.subjects[selectedGrade] || [], [season.subjects, selectedGrade]);
  const sections = useMemo(() => season.sections?.[selectedGrade] || [], [season.sections, selectedGrade]);

  const handleGradeChange = (studentId: string, field: keyof GradeRecord, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    
    const existingIndex = season.grades.findIndex(g => g.studentId === studentId && g.subjectId === selectedSubjectId);
    let newGrades = [...season.grades];

    if (existingIndex > -1) {
      newGrades[existingIndex] = calculateGrades({
        ...newGrades[existingIndex],
        [field]: numValue
      }) as GradeRecord;
    } else {
      newGrades.push(calculateGrades({
        studentId,
        subjectId: selectedSubjectId,
        [field]: numValue
      }) as GradeRecord);
    }

    onUpdate({ grades: newGrades });
  };

  const getGradeValue = (studentId: string, field: keyof GradeRecord) => {
    const record = season.grades.find(g => g.studentId === studentId && g.subjectId === selectedSubjectId);
    return record ? record[field] : undefined;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Selection Panel */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3">الصف الدراسي</label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button
                key={g}
                onClick={() => {setSelectedGrade(g); setSelectedSection(''); setSelectedSubjectId('');}}
                className={`py-2 rounded-xl font-bold text-xs transition-all ${selectedGrade === g ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
              >
                {GRADE_NAMES[g]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3">الشعبة</label>
          <select 
            value={selectedSection} 
            onChange={e => setSelectedSection(e.target.value)}
            className="w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black"
          >
            <option value="">اختر الشعبة...</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3">المادة الدراسية</label>
          <select 
            value={selectedSubjectId} 
            onChange={e => setSelectedSubjectId(e.target.value)}
            className="w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-black"
          >
            <option value="">اختر المادة...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {selectedSubjectId && selectedSection ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-6 border-b flex justify-between items-center">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Bookmark className="text-blue-500" size={20} />
              رصد درجات: {subjects.find(s => s.id === selectedSubjectId)?.name} (الصف {GRADE_NAMES[selectedGrade]} - {selectedSection})
            </h3>
            <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-black">عدد الطلاب: {filteredStudents.length}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px]">
              <thead className="bg-slate-800 text-white font-black border-b">
                <tr>
                  <th className="px-6 py-5 sticky right-0 bg-slate-800 z-10 text-sm min-w-[180px]">اسم التلميذ</th>
                  <th className="px-1 py-5 text-center bg-slate-700">ت1</th>
                  <th className="px-1 py-5 text-center bg-slate-700">ت2</th>
                  <th className="px-1 py-5 text-center bg-slate-700">ك1</th>
                  <th className="px-2 py-5 text-center bg-blue-600">معدل 1</th>
                  <th className="px-2 py-5 text-center bg-amber-600">نصف سنة</th>
                  <th className="px-1 py-5 text-center bg-emerald-800">شباط</th>
                  <th className="px-1 py-5 text-center bg-emerald-800">آذار</th>
                  <th className="px-1 py-5 text-center bg-emerald-800">نيسان</th>
                  <th className="px-2 py-5 text-center bg-emerald-600">معدل 2</th>
                  <th className="px-2 py-5 text-center bg-purple-600">السعي</th>
                  <th className="px-2 py-5 text-center bg-red-600">النهائي</th>
                  <th className="px-2 py-5 text-center bg-indigo-700">الدرجة</th>
                  <th className="px-2 py-5 text-center bg-orange-600">دور 2</th>
                  <th className="px-4 py-5 text-center bg-slate-900">النتيجة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const finalGrade = getGradeValue(student.id, 'finalGrade');
                  const finalResult = getGradeValue(student.id, 'finalResult');
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/20 transition-all">
                      <td className="px-6 py-4 font-black text-slate-800 sticky right-0 bg-white shadow-md z-10 text-sm">{student.name}</td>
                      
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'october') ?? ''} onChange={e => handleGradeChange(student.id, 'october', e.target.value)} className="w-12 text-center py-2 border border-slate-100 rounded-lg outline-none font-bold focus:border-blue-500" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'november') ?? ''} onChange={e => handleGradeChange(student.id, 'november', e.target.value)} className="w-12 text-center py-2 border border-slate-100 rounded-lg outline-none font-bold focus:border-blue-500" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'december') ?? ''} onChange={e => handleGradeChange(student.id, 'december', e.target.value)} className="w-12 text-center py-2 border border-slate-100 rounded-lg outline-none font-bold focus:border-blue-500" /></td>
                      
                      <td className="px-1 py-1 text-center font-black text-blue-700 bg-blue-50/30">{formatGrade(getGradeValue(student.id, 'firstHalfAvg'))}</td>
                      
                      <td className="px-0.5 py-1 bg-amber-50/30"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'midYearExam') ?? ''} onChange={e => handleGradeChange(student.id, 'midYearExam', e.target.value)} className="w-12 text-center py-2 border border-amber-200 rounded-lg outline-none font-black text-amber-700" /></td>

                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'february') ?? ''} onChange={e => handleGradeChange(student.id, 'february', e.target.value)} className="w-12 text-center py-2 border border-slate-100 rounded-lg outline-none font-bold focus:border-blue-500" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'march') ?? ''} onChange={e => handleGradeChange(student.id, 'march', e.target.value)} className="w-12 text-center py-2 border border-slate-100 rounded-lg outline-none font-bold focus:border-blue-500" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'april') ?? ''} onChange={e => handleGradeChange(student.id, 'april', e.target.value)} className="w-12 text-center py-2 border border-slate-100 rounded-lg outline-none font-bold focus:border-blue-500" /></td>
                      
                      <td className="px-1 py-1 text-center font-black text-emerald-700 bg-emerald-50/30">{formatGrade(getGradeValue(student.id, 'secondHalfAvg'))}</td>
                      <td className="px-1 py-1 text-center font-black text-purple-700 bg-purple-50/30">{formatGrade(getGradeValue(student.id, 'annualEffort'))}</td>
                      
                      <td className="px-0.5 py-1 bg-red-50/30"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'finalExam') ?? ''} onChange={e => handleGradeChange(student.id, 'finalExam', e.target.value)} className="w-12 text-center py-2 border border-red-200 rounded-lg outline-none font-black text-red-700" /></td>
                      
                      <td className="px-1 py-1 text-center font-black text-indigo-700 bg-indigo-50">{formatGrade(finalGrade)}</td>

                      <td className="px-0.5 py-1 bg-orange-50/30"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'secondRound') ?? ''} onChange={e => handleGradeChange(student.id, 'secondRound', e.target.value)} className="w-12 text-center py-2 border border-orange-200 rounded-lg outline-none font-black text-orange-700" /></td>
                      
                      <td className={`px-2 py-1 text-center font-black text-xs ${
                        (finalResult ?? 0) >= 50 ? 'bg-slate-900 text-emerald-400' : 'bg-red-900 text-white'
                      }`}>
                        {formatGrade(finalResult)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-24 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-slate-300">
           <Filter size={80} className="opacity-10 mb-6" />
           <p className="text-2xl font-black">يرجى اختيار الصف والشعبة والمادة</p>
        </div>
      )}
    </div>
  );
};

export default GradeEntry;
