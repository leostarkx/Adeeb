
import React, { useState, useMemo } from 'react';
import { Season, GradeRecord, GRADE_NAMES, Subject } from '../types';
import { calculateGrades, formatGrade } from '../utils/calculations';
import { Bookmark, Filter, AlertCircle, CalendarDays, Award, UserX, Search } from 'lucide-react';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
}

const GradeEntry: React.FC<Props> = ({ season, onUpdate }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [entryMode, setEntryMode] = useState<'midyear' | 'final'>('midyear');

  const isPrimary = selectedGrade <= 4;

  const filteredStudents = useMemo(() => {
    let list = (season.students || []).filter(s => s.grade === selectedGrade && s.section === selectedSection);
    if (searchTerm) {
      list = list.filter(s => s.name.includes(searchTerm) || s.registerNumber?.includes(searchTerm));
    }
    return list;
  }, [season.students, selectedGrade, selectedSection, searchTerm]);

  const subjects = useMemo(() => {
    return season.subjects?.[selectedGrade] || [];
  }, [season.subjects, selectedGrade]);

  const handleGradeChange = (studentId: string, field: keyof GradeRecord, value: string) => {
    const student = (season.students || []).find(s => s.id === studentId);
    if (student?.status === 'dismissed') return;

    let numValue = value === '' ? undefined : parseFloat(value);
    
    if (numValue !== undefined && !isNaN(numValue)) {
      const max = isPrimary ? 10 : 100;
      if (numValue > max) numValue = max;
      if (numValue < 0) numValue = 0;
    } else {
      numValue = undefined;
    }

    const existingIndex = (season.grades || []).findIndex(g => g.studentId === studentId && g.subjectId === selectedSubjectId);
    let newGrades = [...(season.grades || [])];

    const updateData: Partial<GradeRecord> = { [field]: numValue };
    
    if (isPrimary && field === 'finalGrade') {
      updateData.finalResult = numValue;
    }

    if (existingIndex > -1) {
      newGrades[existingIndex] = calculateGrades({
        ...newGrades[existingIndex],
        ...updateData
      }, isPrimary) as GradeRecord;
    } else {
      newGrades.push(calculateGrades({
        studentId,
        subjectId: selectedSubjectId,
        ...updateData
      }, isPrimary) as GradeRecord);
    }

    onUpdate({ grades: newGrades });
  };

  const getGradeValue = (studentId: string, field: keyof GradeRecord) => {
    const record = (season.grades || []).find(g => g.studentId === studentId && g.subjectId === selectedSubjectId);
    return record ? record[field] : undefined;
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3 text-right">الصف الدراسي</label>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(g => (
              <button key={g} onClick={() => {setSelectedGrade(g); setSelectedSection(''); setSelectedSubjectId(''); setSearchTerm('');}} className={`py-2 rounded-xl font-black text-xs transition-all ${selectedGrade === g ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                {GRADE_NAMES[g]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3 text-right">الشعبة</label>
          <select value={selectedSection} onChange={e => {setSelectedSection(e.target.value); setSearchTerm('');}} className="w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 bg-white">
            <option value="">اختر الشعبة...</option>
            {(season.sections?.[selectedGrade] || []).map(s => <option key={s} value={s}>شعبة {s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-500 mb-3 text-right">المادة الدراسية</label>
          <select value={selectedSubjectId} onChange={e => setSelectedSubjectId(e.target.value)} className="w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none font-black text-slate-900 bg-white">
            <option value="">اختر المادة...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {isPrimary && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-blue-50 p-6 rounded-2xl flex items-center gap-4 text-blue-700 font-bold border border-blue-100">
            <AlertCircle size={24} />
            <div className="text-right">
              <p>نظام الصفوف الأولية (1-4): الدرجة من 10.</p>
              <p className="text-xs opacity-70">القاعدة: الرسوب في 3 مواد أو أكثر يعني رسوب التلميذ في الصف.</p>
            </div>
          </div>
          <div className="flex bg-white p-2 rounded-2xl border-2 border-slate-100 shadow-sm">
             <button onClick={() => setEntryMode('midyear')} className={`px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${entryMode === 'midyear' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
               <CalendarDays size={18} /> رصد نصف السنة
             </button>
             <button onClick={() => setEntryMode('final')} className={`px-6 py-2 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${entryMode === 'final' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>
               <Award size={18} /> رصد نهاية السنة
             </button>
          </div>
        </div>
      )}

      {selectedSubjectId && selectedSection ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-800 p-6 flex flex-col md:flex-row justify-between items-center text-white gap-4">
             <div className="flex items-center gap-4">
                <span className="text-xs bg-white/10 px-4 py-2 rounded-full font-black">طلاب الشعبة: {filteredStudents.length}</span>
                <h3 className="font-black flex items-center gap-2">
                  <Bookmark className="text-blue-400" />
                  رصد {isPrimary ? (entryMode === 'midyear' ? 'درجات نصف السنة' : 'درجات نهاية السنة') : 'الدرجات'} لمادة: {subjects.find(s => s.id === selectedSubjectId)?.name}
                </h3>
             </div>
             <div className="relative w-full md:w-64">
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="بحث بالاسم أو رقم القيد..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 bg-white/5 border border-white/10 rounded-xl font-bold outline-none focus:bg-white text-black text-sm"
                />
             </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right border-collapse min-w-max">
              <thead className="bg-slate-100 font-black border-b text-slate-900">
                <tr>
                  <th className="px-6 py-5 sticky right-0 bg-slate-100 z-10 text-right min-w-[220px]">اسم التلميذ</th>
                  {isPrimary ? (
                    <>
                      <th className="px-4 py-5 text-center bg-blue-50/50">الدرجة (من 10)</th>
                      <th className="px-4 py-5 text-center bg-orange-50/50">الدور الثاني</th>
                    </>
                  ) : (
                    <>
                      <th className="px-3 py-5 text-center">تشرين 1</th>
                      <th className="px-3 py-5 text-center">تشرين 2</th>
                      <th className="px-3 py-5 text-center">كانون 1</th>
                      <th className="px-3 py-5 text-center bg-blue-50">معدل 1</th>
                      <th className="px-3 py-5 text-center bg-amber-50">نصف سنة</th>
                      <th className="px-3 py-5 text-center">شباط</th>
                      <th className="px-3 py-5 text-center">آذار</th>
                      <th className="px-3 py-5 text-center">نيسان</th>
                      <th className="px-3 py-5 text-center bg-emerald-50">معدل 2</th>
                      <th className="px-3 py-5 text-center bg-purple-50">السعي</th>
                      <th className="px-3 py-5 text-center bg-red-50">النهائي</th>
                      <th className="px-3 py-5 text-center bg-indigo-50">الدور 1</th>
                      <th className="px-4 py-5 text-center bg-orange-100 font-black">الدور 2</th>
                    </>
                  )}
                  <th className="px-6 py-5 text-center bg-slate-900 text-white min-w-[100px]">النتيجة</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map(student => {
                  const finalResult = getGradeValue(student.id, 'finalResult');
                  const primaryField = entryMode === 'midyear' ? 'midYearExam' : 'finalGrade';
                  const isDismissed = student.status === 'dismissed';
                  
                  return (
                    <tr key={student.id} className={`hover:bg-blue-50/20 ${isDismissed ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4 font-black text-slate-900 sticky right-0 bg-white shadow-md z-10 text-right">
                        <div className="flex items-center gap-2">
                          {isDismissed && <UserX size={14} className="text-red-500" />}
                          <span className={isDismissed ? 'text-red-900' : ''}>{student.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold mr-2">#{student.registerNumber || '---'}</span>
                        </div>
                      </td>
                      
                      {isPrimary ? (
                        <>
                          <td className={`px-4 py-2 text-center ${entryMode === 'midyear' ? 'bg-blue-50/20' : 'bg-emerald-50/20'}`}>
                            <input 
                              disabled={isDismissed}
                              type="number" step="0.5" min="0" max="10" 
                              value={getGradeValue(student.id, primaryField) ?? ''} 
                              onChange={e => handleGradeChange(student.id, primaryField, e.target.value)} 
                              className={`w-24 text-center py-3 border-2 rounded-xl font-black text-lg outline-none focus:ring-2 text-slate-900 bg-white ${isDismissed ? 'opacity-20 cursor-not-allowed' : ''} ${
                                entryMode === 'midyear' ? 'border-blue-200 focus:border-blue-500' : 'border-emerald-200 focus:border-emerald-500'
                              }`}
                              placeholder={isDismissed ? "مفصول" : "-"}
                            />
                          </td>
                          <td className="px-4 py-2 bg-orange-50/20 text-center">
                            <input 
                              disabled={isDismissed}
                              type="number" step="0.5" min="0" max="10" 
                              value={getGradeValue(student.id, 'secondRound') ?? ''} 
                              onChange={e => handleGradeChange(student.id, 'secondRound', e.target.value)} 
                              className={`w-24 text-center py-3 border-2 border-orange-200 rounded-xl font-black text-lg outline-none focus:border-orange-500 text-slate-900 bg-white ${isDismissed ? 'opacity-20 cursor-not-allowed' : ''}`}
                              placeholder={isDismissed ? "مفصول" : "-"}
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-1 py-2"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'october') ?? ''} onChange={e => handleGradeChange(student.id, 'october', e.target.value)} className="w-14 text-center py-2 border rounded-lg font-bold bg-white outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-2"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'november') ?? ''} onChange={e => handleGradeChange(student.id, 'november', e.target.value)} className="w-14 text-center py-2 border rounded-lg font-bold bg-white outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-2"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'december') ?? ''} onChange={e => handleGradeChange(student.id, 'december', e.target.value)} className="w-14 text-center py-2 border rounded-lg font-bold bg-white outline-none focus:border-blue-500" /></td>
                          {/* Assert the result as number since we are targeting numeric grade fields */}
                          <td className="px-1 py-2 text-center font-black text-blue-700 bg-blue-50/30 text-sm">{formatGrade(getGradeValue(student.id, 'firstHalfAvg') as number)}</td>
                          <td className="px-1 py-2 bg-amber-50/30"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'midYearExam') ?? ''} onChange={e => handleGradeChange(student.id, 'midYearExam', e.target.value)} className="w-14 text-center py-2 border border-amber-300 rounded-lg font-black bg-white outline-none focus:border-amber-500" /></td>
                          <td className="px-1 py-2"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'february') ?? ''} onChange={e => handleGradeChange(student.id, 'february', e.target.value)} className="w-14 text-center py-2 border rounded-lg font-bold bg-white outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-2"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'march') ?? ''} onChange={e => handleGradeChange(student.id, 'march', e.target.value)} className="w-14 text-center py-2 border rounded-lg font-bold bg-white outline-none focus:border-blue-500" /></td>
                          <td className="px-1 py-2"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'april') ?? ''} onChange={e => handleGradeChange(student.id, 'april', e.target.value)} className="w-14 text-center py-2 border rounded-lg font-bold bg-white outline-none focus:border-blue-500" /></td>
                          {/* Assert the result as number since we are targeting numeric grade fields */}
                          <td className="px-1 py-2 text-center font-black text-emerald-700 bg-emerald-50/30 text-sm">{formatGrade(getGradeValue(student.id, 'secondHalfAvg') as number)}</td>
                          {/* Assert the result as number since we are targeting numeric grade fields */}
                          <td className="px-1 py-2 text-center font-black text-purple-700 bg-purple-50/30 text-sm">{formatGrade(getGradeValue(student.id, 'annualEffort') as number)}</td>
                          <td className="px-1 py-2 bg-red-50/30"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'finalExam') ?? ''} onChange={e => handleGradeChange(student.id, 'finalExam', e.target.value)} className="w-14 text-center py-2 border border-red-300 rounded-lg font-black bg-white outline-none focus:border-red-500" /></td>
                          {/* Assert the result as number since we are targeting numeric grade fields */}
                          <td className="px-1 py-2 text-center font-black text-indigo-700 bg-indigo-50 text-sm">{formatGrade(getGradeValue(student.id, 'finalGrade') as number)}</td>
                          <td className="px-1 py-2 bg-orange-100/40"><input disabled={isDismissed} type="number" value={getGradeValue(student.id, 'secondRound') ?? ''} onChange={e => handleGradeChange(student.id, 'secondRound', e.target.value)} className="w-16 text-center py-3 border-2 border-orange-300 rounded-xl font-black bg-white outline-none focus:border-orange-600 shadow-sm" /></td>
                        </>
                      )}

                      {/* Cast finalResult to number for safe comparison and formatting */}
                      <td className={`px-6 py-4 text-center font-black text-base ${
                        isDismissed ? 'bg-red-900 text-white' : ((finalResult as number) ?? 0) >= (isPrimary ? 5 : 50) ? 'bg-emerald-600 text-white' : (finalResult === undefined ? 'bg-slate-100 text-slate-400' : 'bg-red-600 text-white')
                      }`}>
                        {isDismissed ? "مفصول" : formatGrade(finalResult as number)}
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
           <p className="text-2xl font-black">يرجى اختيار الصف والشعبة والمادة لبدء الرصد</p>
        </div>
      )}
    </div>
  );
};

export default GradeEntry;
