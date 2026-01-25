
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
            className="w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
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
            className="w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold"
          >
            <option value="">اختر المادة...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {selectedSubjectId && selectedSection ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-6 border-b flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Bookmark className="text-blue-500" size={20} />
              رصد درجات {subjects.find(s => s.id === selectedSubjectId)?.name} - صف {GRADE_NAMES[selectedGrade]} ({selectedSection})
            </h3>
            <span className="text-sm text-gray-500">عدد الطلاب: {filteredStudents.length}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                <tr>
                  <th className="px-6 py-5 sticky right-0 bg-gray-50 shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10">اسم الطالب</th>
                  <th className="px-1 py-5 text-center bg-blue-50/30">تشرين 1</th>
                  <th className="px-1 py-5 text-center bg-blue-50/30">تشرين 2</th>
                  <th className="px-1 py-5 text-center bg-blue-50/30">كانون 1</th>
                  <th className="px-2 py-5 text-center bg-blue-100 text-blue-800">معدل 1</th>
                  <th className="px-2 py-5 text-center bg-amber-50">نصف سنة</th>
                  <th className="px-1 py-5 text-center bg-green-50/30">شباط</th>
                  <th className="px-1 py-5 text-center bg-green-50/30">آذار</th>
                  <th className="px-1 py-5 text-center bg-green-50/30 font-black text-blue-600">نيسان</th>
                  <th className="px-2 py-5 text-center bg-green-100 text-green-800">معدل 2</th>
                  <th className="px-2 py-5 text-center bg-purple-100 text-purple-800">السعي</th>
                  <th className="px-2 py-5 text-center bg-red-50 text-red-800">دور 1</th>
                  <th className="px-2 py-5 text-center bg-orange-100 text-orange-800">دور 2</th>
                  <th className="px-4 py-5 text-center bg-indigo-600 text-white">النتيجة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map(student => {
                  const finalResult = getGradeValue(student.id, 'finalResult');
                  return (
                    <tr key={student.id} className="hover:bg-blue-50/20 transition-all">
                      <td className="px-6 py-4 font-bold text-gray-800 sticky right-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10">{student.name}</td>
                      
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'october') ?? ''} onChange={e => handleGradeChange(student.id, 'october', e.target.value)} className="w-14 text-center py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'november') ?? ''} onChange={e => handleGradeChange(student.id, 'november', e.target.value)} className="w-14 text-center py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'december') ?? ''} onChange={e => handleGradeChange(student.id, 'december', e.target.value)} className="w-14 text-center py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></td>
                      
                      <td className="px-1 py-1 text-center font-bold text-blue-700 bg-blue-50/50">{formatGrade(getGradeValue(student.id, 'firstHalfAvg'))}</td>
                      
                      <td className="px-0.5 py-1 bg-amber-50/30"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'midYearExam') ?? ''} onChange={e => handleGradeChange(student.id, 'midYearExam', e.target.value)} className="w-14 text-center py-2 border border-amber-100 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" /></td>

                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'february') ?? ''} onChange={e => handleGradeChange(student.id, 'february', e.target.value)} className="w-14 text-center py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'march') ?? ''} onChange={e => handleGradeChange(student.id, 'march', e.target.value)} className="w-14 text-center py-2 border border-gray-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'april') ?? ''} onChange={e => handleGradeChange(student.id, 'april', e.target.value)} className="w-14 text-center py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-black" /></td>
                      
                      <td className="px-1 py-1 text-center font-bold text-green-700 bg-green-50/50">{formatGrade(getGradeValue(student.id, 'secondHalfAvg'))}</td>
                      <td className="px-1 py-1 text-center font-bold text-purple-700 bg-purple-50/50">{formatGrade(getGradeValue(student.id, 'annualEffort'))}</td>
                      
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'finalExam') ?? ''} onChange={e => handleGradeChange(student.id, 'finalExam', e.target.value)} className="w-14 text-center py-2 border border-red-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" /></td>
                      <td className="px-0.5 py-1"><input type="number" min="0" max="100" value={getGradeValue(student.id, 'secondRound') ?? ''} onChange={e => handleGradeChange(student.id, 'secondRound', e.target.value)} className="w-14 text-center py-2 border border-orange-100 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" /></td>
                      
                      <td className={`px-2 py-1 text-center font-black ${
                        (finalResult ?? 0) >= 50 ? 'bg-indigo-600 text-white' : 'bg-red-600 text-white'
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
        <div className="bg-white p-24 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400">
           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
             <Filter size={40} className="text-gray-200" />
           </div>
           <p className="text-xl font-bold">يرجى اختيار الصف والشعبة والمادة للبدء</p>
           <p className="text-sm mt-2 opacity-60">تأكد من تعريف الشعب في قائمة "المواد والصفوف" أولاً</p>
        </div>
      )}
    </div>
  );
};

export default GradeEntry;
