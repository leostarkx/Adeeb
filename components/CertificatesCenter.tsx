
import React, { useState, useMemo } from 'react';
import { Season, Student, GRADE_NAMES, Subject, GradeRecord } from '../types';
import { formatGrade, getPrimaryResult, toArabicNums } from '../utils/calculations';
import { 
  Printer, ArrowRight, Search, FileText, CheckSquare, Square, 
  ChevronRight, Trophy, AlertCircle, Bookmark
} from 'lucide-react';

interface Props {
  season: Season;
  schoolName: string;
}

const CertificatesCenter: React.FC<Props> = ({ season, schoolName }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isViewingPreview, setIsViewingPreview] = useState(false);

  const filteredStudents = useMemo(() => {
    let list = (season.students || []).filter(s => s.grade === selectedGrade);
    if (selectedSection) list = list.filter(s => s.section === selectedSection);
    
    if (searchTerm) {
      list = list.filter(s => s.name.includes(searchTerm) || s.registerNumber?.includes(searchTerm));
    }
    
    return list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [season.students, selectedGrade, selectedSection, searchTerm]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedStudentIds(filteredStudents.map(s => s.id));
  };

  const clearSelection = () => setSelectedStudentIds([]);

  const selectedStudents = useMemo(() => 
    (season.students || []).filter(s => selectedStudentIds.includes(s.id)),
    [season.students, selectedStudentIds]
  );

  const getStudentGrades = (studentObj: Student) => {
    const subjects = season.subjects?.[studentObj.grade] || [];
    return subjects.map(sub => {
      const grade = (season.grades || []).find(g => g.studentId === studentObj.id && g.subjectId === sub.id);
      return { subject: sub.name, subjectId: sub.id, ...grade };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const CertificateTemplate = ({ student }: { student: Student }) => {
    const isPrimary = student.grade <= 4;
    const studentGrades = getStudentGrades(student);
    const totalFinal = studentGrades.reduce((acc, g) => acc + (g.finalResult || 0), 0);
    const result = getPrimaryResult(studentGrades.map(g => g.finalResult), isPrimary);

    if (!isPrimary) {
      // تصميم الصفوف العليا (5-6) - نظام السجل الدراسي التفصيلي
      return (
        <div className="cert-item-box bg-white p-4 border-[3px] border-slate-900 rounded-xl h-[47.5%] flex flex-col justify-between mb-4 print:mb-0 overflow-hidden text-slate-900 relative box-border">
           <div className="flex justify-between items-start mb-2 font-black text-[10px] border-b-2 border-black pb-2">
              <div className="text-right leading-tight">
                <p>وزارة التربية</p>
                <p>{schoolName}</p>
                <p>الصف: {GRADE_NAMES[student.grade]} / {student.section}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-black underline underline-offset-4">وثيقة درجات تلميذ رسمية</p>
                <p className="text-[9px] mt-1">للعام الدراسي {toArabicNums(season.name)}</p>
              </div>
              <div className="text-left leading-tight">
                <p className="text-sm">التلميذ: {student.name}</p>
                <p>الشعبة: {student.section}</p>
              </div>
           </div>

           <div className="flex-1 overflow-hidden mt-1">
             <table className="w-full text-center border-collapse border-2 border-black text-[7.5px] font-black table-fixed">
                <thead className="bg-slate-100">
                  <tr className="h-14">
                    <th className="border-2 border-black p-0.5 w-[16%]">الدرس</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header">تشرين 1</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header">تشرين 2</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header">كانون 1</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header bg-blue-50">معدل 1</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header bg-amber-50">نصف السنة</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header">شباط</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header">آذار</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header">نيسان</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header bg-emerald-50">معدل 2</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header bg-purple-50">السعي</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header">النهائي</th>
                    <th className="border-2 border-black p-0.5 vertical-text-header bg-slate-200">الدرجة</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.map((g, idx) => (
                    <tr key={idx} className="h-6">
                      <td className="border-2 border-black text-right pr-1 text-[8px] truncate">{g.subject}</td>
                      <td className="border-2 border-black">{formatGrade(g.october)}</td>
                      <td className="border-2 border-black">{formatGrade(g.november)}</td>
                      <td className="border-2 border-black">{formatGrade(g.december)}</td>
                      <td className="border-2 border-black bg-blue-50/30">{formatGrade(g.firstHalfAvg)}</td>
                      <td className="border-2 border-black bg-amber-50/30">{formatGrade(g.midYearExam)}</td>
                      <td className="border-2 border-black">{formatGrade(g.february)}</td>
                      <td className="border-2 border-black">{formatGrade(g.march)}</td>
                      <td className="border-2 border-black">{formatGrade(g.april)}</td>
                      <td className="border-2 border-black bg-emerald-50/30">{formatGrade(g.secondHalfAvg)}</td>
                      <td className="border-2 border-black bg-purple-50/30">{formatGrade(g.annualEffort)}</td>
                      <td className="border-2 border-black">{formatGrade(g.finalExam)}</td>
                      <td className={`border-2 border-black font-black bg-slate-100 ${(g.finalResult || 0) < 50 ? 'text-red-600' : ''}`}>
                        {formatGrade(g.finalResult)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black h-8">
                    <td className="border-2 border-black text-center text-[9px]">المجموع</td>
                    <td colSpan={11} className="border-2 border-black text-center text-xs">{toArabicNums(Math.round(totalFinal))}</td>
                    <td className="border-2 border-black text-center text-[9px]">{toArabicNums(Math.round(totalFinal))}</td>
                  </tr>
                </tbody>
             </table>
           </div>

           <div className="flex justify-between items-end text-[10px] font-black mt-2 border-t border-slate-200 pt-2">
              <div className="space-y-1">
                <p>النتيجة: <span className={`px-4 py-0.5 rounded ${result.status === 'ناجح' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{result.status}</span></p>
              </div>
              <div className="text-center px-6">
                <p className="mb-6">مدير المدرسة</p>
                <p className="text-[9px]">{season.managerName || '..................'}</p>
              </div>
           </div>
        </div>
      );
    }

    // تصميم الصفوف الأولية (1-4) - مع معالجة الحدود
    return (
      <div className="cert-item-box bg-white p-4 border-[6px] border-double border-slate-800 rounded-[2.5rem] h-[47.5%] flex flex-col justify-between mb-4 print:mb-0 overflow-hidden text-slate-900 text-center relative box-border">
         <div className="flex justify-between items-center mb-2 text-[10px] font-black border-b-2 border-slate-800 pb-1 px-4">
            <p>مدرسة: {schoolName}</p>
            <p className="text-base text-blue-800">شهادة تقديرية</p>
            <p>موسم: {toArabicNums(season.name)}</p>
         </div>
         
         <div className="my-1">
            <p className="text-[10px] font-bold text-slate-500 mb-0.5">يسرنا إعلامكم بنتيجة التلميذ:</p>
            <h4 className="text-xl font-black mb-0.5 text-blue-900">{student.name}</h4>
            <p className="text-xs font-black text-slate-600">الصف {GRADE_NAMES[student.grade]} - شعبة {student.section}</p>
         </div>

         <table className="w-[90%] mx-auto border-collapse border-2 border-slate-800 text-[10px] font-black my-2">
            <thead>
              <tr className="bg-slate-50">
                <th className="border-2 border-black p-1.5 w-[40%]">المادة الدراسية</th>
                <th className="border-2 border-black p-1.5">نصف السنة</th>
                <th className="border-2 border-black p-1.5">النتيجة النهائية</th>
                <th className="border-2 border-black p-1.5">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {studentGrades.map((g, idx) => (
                <tr key={idx} className="h-7">
                  <td className="border-2 border-black text-right pr-3">{g.subject}</td>
                  <td className="border-2 border-black text-base">{formatGrade(g.midYearExam)}</td>
                  <td className="border-2 border-black text-base font-black text-blue-800">{formatGrade(g.finalResult)}</td>
                  <td className="border-2 border-black">{(g.finalResult || 0) >= 5 ? 'ناجح' : 'مكمل'}</td>
                </tr>
              ))}
            </tbody>
         </table>

         <div className="flex justify-between items-center text-[11px] font-black mt-2 px-8">
            <div className="text-right">
              <p className="text-xs">النتيجة: <span className={result.status === 'ناجح' ? 'text-emerald-700' : 'text-red-600'}>{result.status}</span></p>
            </div>
            <div className="text-center border-t border-slate-400 pt-1 min-w-[120px]">
               <p className="text-[10px]">توقيع الإدارة</p>
            </div>
         </div>
      </div>
    );
  };

  if (isViewingPreview) {
    const pairedStudents = [];
    for (let i = 0; i < selectedStudents.length; i += 2) {
      pairedStudents.push(selectedStudents.slice(i, i + 2));
    }

    return (
      <div className="animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-8 no-print">
          <button onClick={() => setIsViewingPreview(false)} className="flex items-center gap-2 text-slate-600 font-black px-6 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowRight size={20} /> العودة للاختيار
          </button>
          <div className="flex items-center gap-4">
             <div className="bg-blue-50 text-blue-700 px-6 py-2 rounded-xl text-[10px] font-black border border-blue-100">
                سيتم طباعة {toArabicNums(selectedStudents.length)} شهادة في {toArabicNums(Math.ceil(selectedStudents.length / 2))} ورقة A4.
             </div>
             <button onClick={handlePrint} className="bg-emerald-600 text-white px-10 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-all">
                <Printer size={22} /> طباعة الآن
             </button>
          </div>
        </div>

        <div className="print-area space-y-0">
           {pairedStudents.map((pair, pageIdx) => (
             <div key={pageIdx} className="print-page bg-white h-[297mm] w-[210mm] mx-auto p-[10mm] border border-gray-100 shadow-xl mb-10 print:mb-0 print:shadow-none print:border-none flex flex-col justify-between box-border overflow-hidden">
                <CertificateTemplate student={pair[0]} />
                {pair[1] ? (
                  <>
                    <div className="border-t-2 border-dashed border-slate-200 w-full my-1 relative no-print">
                       <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-[11px] font-black text-slate-300">محل القص</span>
                    </div>
                    <CertificateTemplate student={pair[1]} />
                  </>
                ) : (
                  <div className="h-[47.5%] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 font-black gap-4 box-border">
                    <Trophy size={48} className="opacity-20" />
                    <p>نهاية الدفعة</p>
                  </div>
                )}
             </div>
           ))}
        </div>

        <style>{`
          .vertical-text-header { 
            writing-mode: vertical-rl; 
            transform: rotate(180deg); 
            white-space: nowrap; 
            font-size: 7px;
            padding: 2px 0;
            text-align: center;
          }
          @media print {
            body { background: white !important; margin: 0; padding: 0; width: 210mm; height: 297mm; }
            #root > div > aside, #root > div > div > header, .no-print { display: none !important; }
            .print-page { 
              page-break-after: always; 
              margin: 0 !important; 
              height: 297mm !important; 
              width: 210mm !important; 
              box-shadow: none !important;
              border: none !important;
              padding: 5mm !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
            }
            .cert-item-box {
               height: 47.5% !important;
               border: 3px solid black !important;
               box-sizing: border-box !important;
               -webkit-print-color-adjust: exact;
               print-color-adjust: exact;
               margin-bottom: 0 !important;
               page-break-inside: avoid !important;
            }
            .cert-item-box table { border: 2px solid black !important; width: 100% !important; }
            .cert-item-box td, .cert-item-box th { border: 1px solid black !important; }
            @page { size: A4 portrait; margin: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20 no-print">
      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-10">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-lg">
                <Bookmark size={28} />
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-800">مركز طباعة الشهادات</h2>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">تجهيز الشهادات للطباعة الجماعية (2 في الصفحة)</p>
             </div>
          </div>

          <div className="flex flex-wrap gap-2">
             <button onClick={selectAll} className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all">تحديد الكل</button>
             <button onClick={clearSelection} className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-xs hover:bg-slate-200">إلغاء التحديد</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2">الصف الدراسي</label>
              <select value={selectedGrade} onChange={e => {setSelectedGrade(parseInt(e.target.value)); setSelectedSection('');}} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black outline-none focus:border-slate-900 focus:bg-white transition-all">
                {[1,2,3,4,5,6].map(g => <option key={g} value={g}>الصف {GRADE_NAMES[g]}</option>)}
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2">الشعبة</label>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black outline-none focus:border-slate-900 focus:bg-white transition-all">
                <option value="">-- كافة الشعب --</option>
                {(season.sections?.[selectedGrade] || []).map(s => <option key={s} value={s}>شعبة {s}</option>)}
              </select>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 mr-2">بحث سريع عن تلميذ</label>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ابحث بالاسم..." className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black outline-none focus:border-slate-900 focus:bg-white transition-all" />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[450px] overflow-y-auto p-4 bg-slate-50/50 rounded-[2.5rem] border-2 border-slate-100 custom-scrollbar">
           {filteredStudents.map(s => (
             <div 
              key={s.id} 
              onClick={() => toggleStudent(s.id)}
              className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group ${selectedStudentIds.includes(s.id) ? 'bg-white border-blue-600 shadow-md' : 'bg-white border-slate-50 hover:border-slate-200'}`}
             >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-colors ${selectedStudentIds.includes(s.id) ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-300'}`}>
                    {selectedStudentIds.includes(s.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-sm leading-tight">{s.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">شعبة {s.section} | قيد {toArabicNums(s.registerNumber) || '---'}</p>
                  </div>
                </div>
                <ChevronRight size={16} className={`text-slate-200 group-hover:text-blue-600 transition-colors ${selectedStudentIds.includes(s.id) ? 'text-blue-600' : ''}`} />
             </div>
           ))}
           {filteredStudents.length === 0 && (
             <div className="col-span-full py-20 text-center text-slate-300 font-black italic">لا يوجد تلاميذ في هذا الصف حالياً</div>
           )}
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-slate-900 rounded-[3rem] text-white">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <FileText size={28} className="text-blue-400" />
              </div>
              <div>
                <p className="text-xl font-black">جاهز للمعاينة؟</p>
                <p className="text-xs text-slate-400 font-bold">تم اختيار ({toArabicNums(selectedStudentIds.length)}) تلميذ من أصل ({toArabicNums(filteredStudents.length)})</p>
              </div>
           </div>
           <button 
            disabled={selectedStudentIds.length === 0}
            onClick={() => setIsViewingPreview(true)}
            className={`px-12 py-5 rounded-2xl font-black text-lg shadow-xl transition-all ${selectedStudentIds.length > 0 ? 'bg-blue-600 hover:bg-blue-500 hover:scale-[1.02]' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
           >
             معاينة وترتيب الشهادات
           </button>
        </div>
      </div>
    </div>
  );
};

export default CertificatesCenter;
