
import React, { useMemo, useState } from 'react';
import { Season, Student, GRADE_NAMES } from '../types';
import { Medal, Printer, Trophy, Star, Crown, Award, ArrowRight } from 'lucide-react';

interface Props {
  season: Season;
  schoolName: string;
}

interface RankedStudent extends Student {
  average: number;
  rank: number;
}

const HonorBoard: React.FC<Props> = ({ season, schoolName }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<RankedStudent | null>(null);

  const topStudents = useMemo(() => {
    const studentsInGrade = season.students.filter(s => s.grade === selectedGrade && s.status !== 'dismissed');
    const subjectsInGrade = season.subjects[selectedGrade] || [];
    
    if (subjectsInGrade.length === 0) return [];

    const ranked = studentsInGrade.map(student => {
      const studentGrades = season.grades.filter(g => g.studentId === student.id);
      const total = studentGrades.reduce((sum, g) => sum + (g.finalResult || 0), 0);
      const average = studentGrades.length > 0 ? total / subjectsInGrade.length : 0;
      
      return { ...student, average };
    });

    return ranked
      .sort((a, b) => b.average - a.average)
      .map((s, idx) => ({ ...s, rank: idx + 1 }))
      .slice(0, 10); // عرض أول 10 طلاب
  }, [season, selectedGrade]);

  const handlePrint = () => {
    window.print();
  };

  if (selectedStudentForCert) {
    return (
      <div className="animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-8 no-print">
          <button 
            onClick={() => setSelectedStudentForCert(null)} 
            className="flex items-center gap-2 text-slate-600 font-black px-6 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowRight size={20} /> العودة للوحة الشرف
          </button>
          <button 
            onClick={handlePrint} 
            className="bg-amber-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:bg-amber-700 transition-all"
          >
            <Printer size={20} /> طباعة شهادة التقدير
          </button>
        </div>

        {/* تصميم شهادة التقدير */}
        <div className="certificate-container p-12 bg-white shadow-2xl rounded-sm border-[16px] border-double border-amber-500 relative overflow-hidden mx-auto max-w-[900px] min-h-[600px] flex flex-col items-center text-center font-serif text-slate-900">
           {/* زخارف الزوايا */}
           <div className="absolute top-4 right-4 w-24 h-24 border-t-8 border-r-8 border-amber-300 opacity-40"></div>
           <div className="absolute top-4 left-4 w-24 h-24 border-t-8 border-l-8 border-amber-300 opacity-40"></div>
           <div className="absolute bottom-4 right-4 w-24 h-24 border-b-8 border-r-8 border-amber-300 opacity-40"></div>
           <div className="absolute bottom-4 left-4 w-24 h-24 border-b-8 border-l-8 border-amber-300 opacity-40"></div>

           <div className="z-10 w-full space-y-8 mt-10">
              <div className="flex justify-between items-center px-10">
                <div className="text-right font-black text-xs">
                  <p>وزارة التربية</p>
                  <p>مديرية التربية</p>
                  <p>{schoolName}</p>
                </div>
                <Trophy size={60} className="text-amber-500" />
                <div className="text-left font-black text-xs">
                  <p>العام الدراسي</p>
                  <p>{season.name}</p>
                </div>
              </div>

              <h1 className="text-6xl font-black text-amber-600 mb-10" style={{ fontFamily: 'Tajawal' }}>شهادة تقدير وتفوق</h1>
              
              <div className="space-y-6">
                <p className="text-2xl font-bold">تسر إدارة {schoolName} أن تمنح هذه الشهادة للتلميذ المتفوق:</p>
                <div className="relative inline-block px-12 py-4 border-b-4 border-amber-500">
                  <span className="text-4xl font-black text-slate-800">{selectedStudentForCert.name}</span>
                </div>
                <p className="text-2xl font-bold">وذلك لحصوله على المركز <span className="text-amber-600 font-black">({selectedStudentForCert.rank})</span> في الصف <span className="text-slate-800 font-black">({GRADE_NAMES[selectedGrade]})</span></p>
                <p className="text-2xl font-bold">بمعدل قدره <span className="bg-amber-100 px-4 py-1 rounded-xl text-amber-700 font-black">{selectedStudentForCert.average.toFixed(1)}%</span></p>
              </div>

              <p className="text-xl italic mt-10 px-20 text-slate-600">نتمنى لك دوام الموفقية والنجاح لخدمة بلدنا الحبيب وأهلك الكرام.</p>

              <div className="mt-20 flex justify-around items-end w-full">
                <div className="text-center font-black">
                  <p className="mb-14">مرشد الصف</p>
                  <p className="border-t border-slate-300 pt-2 px-8">........................</p>
                </div>
                <div className="text-center">
                  <Crown size={40} className="mx-auto text-amber-400 mb-2 no-print" />
                  <div className="font-black text-center">
                    <p className="mb-14">مدير المؤسسة</p>
                    <p className="text-xl text-slate-800">{season.managerName || '........................'}</p>
                  </div>
                </div>
              </div>
           </div>
        </div>

        <style>{`
          @media print {
            body * { visibility: hidden; }
            .certificate-container, .certificate-container * { visibility: visible; }
            .certificate-container { 
              position: absolute; 
              left: 0; top: 0; 
              width: 100%; 
              border: 10px double #d97706 !important;
              print-color-adjust: exact;
            }
            @page { size: A4 landscape; margin: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* اختيار الصف */}
      <div className="flex flex-wrap gap-3 bg-white p-3 rounded-3xl shadow-sm border border-gray-100 no-print">
        {[1, 2, 3, 4, 5, 6].map(g => (
          <button 
            key={g} 
            onClick={() => setSelectedGrade(g)} 
            className={`flex-1 min-w-[100px] px-4 py-4 rounded-2xl font-black transition-all flex flex-col items-center gap-1 ${
              selectedGrade === g ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs opacity-70">الصف</span>
            <span className="text-lg">{GRADE_NAMES[g]}</span>
          </button>
        ))}
      </div>

      {/* عرض الأوائل */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topStudents.map((student, idx) => (
          <div 
            key={student.id} 
            className={`relative bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:scale-[1.02] hover:shadow-xl group ${
              idx === 0 ? 'ring-4 ring-amber-400 border-amber-100' : ''
            }`}
          >
            {/* الأوسمة */}
            <div className="absolute top-4 left-4">
              {idx === 0 && <Crown className="text-amber-500 animate-bounce" size={40} />}
              {idx === 1 && <Medal className="text-slate-400" size={34} />}
              {idx === 2 && <Medal className="text-amber-700" size={34} />}
            </div>

            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center font-black text-4xl mb-6 shadow-inner ${
              idx === 0 ? 'bg-amber-100 text-amber-600' : 
              idx === 1 ? 'bg-slate-100 text-slate-500' : 
              idx === 2 ? 'bg-orange-100 text-orange-700' : 
              'bg-blue-50 text-blue-600'
            }`}>
              {student.rank}
            </div>

            <h4 className="text-xl font-black text-slate-800 mb-2">{student.name}</h4>
            <div className="bg-slate-50 px-6 py-2 rounded-full mb-6">
              <span className="text-sm font-bold text-slate-500">المعدل: </span>
              <span className="text-xl font-black text-blue-600">{student.average.toFixed(1)}%</span>
            </div>

            <button 
              onClick={() => setSelectedStudentForCert(student)}
              className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm opacity-0 group-hover:opacity-100 transition-all shadow-xl"
            >
              <Award size={18} /> منح شهادة تقدير
            </button>
          </div>
        ))}

        {topStudents.length === 0 && (
          <div className="md:col-span-3 py-24 text-center text-slate-300 font-black text-2xl bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[4rem]">
             بانتظار رصد الدرجات لهذا الصف...
          </div>
        )}
      </div>

      {/* لوحة الشرف الكاملة */}
      {topStudents.length > 0 && (
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
           <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <Star className="text-amber-500 fill-amber-500" /> قائمة العشرة الأوائل (الصف {GRADE_NAMES[selectedGrade]})
           </h3>
           <div className="space-y-4">
             {topStudents.map((s) => (
               <div key={s.id} className="flex items-center justify-between p-4 border border-slate-50 rounded-2xl hover:bg-slate-50 transition-colors">
                 <div className="flex items-center gap-6">
                    <span className="w-10 h-10 flex items-center justify-center font-black bg-slate-800 text-white rounded-xl">{s.rank}</span>
                    <span className="font-black text-slate-700 text-lg">{s.name}</span>
                 </div>
                 <div className="flex items-center gap-8">
                    <span className="font-black text-blue-600 text-xl">{s.average.toFixed(1)}%</span>
                    <button onClick={() => setSelectedStudentForCert(s)} className="p-3 text-amber-500 hover:bg-amber-50 rounded-xl transition-all"><Printer size={20} /></button>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default HonorBoard;
