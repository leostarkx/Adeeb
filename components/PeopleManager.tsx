
import React, { useState, useMemo } from 'react';
import { Season, Student, Teacher, GRADE_NAMES, TeacherAssignment, Subject, AppState, User } from '../types';
import { 
  Plus, Trash2, GraduationCap, Users, UserPlus, Search, Edit2, X,
  Baby, Home, Phone, Briefcase, FileText, Hash, UserX,
  BookOpen, Layers, Contact2, CheckCircle2, Filter, CheckSquare,
  ClipboardList, MapPin, Smartphone, UserCircle, ListPlus,
  UsersRound, AlertCircle, Key
} from 'lucide-react';
import { toArabicNums } from '../utils/calculations';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const PeopleManager: React.FC<Props> = ({ season, onUpdate, setState }) => {
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'teachers' | 'audit'>('students');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Student State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    name: '', grade: 1, section: '', status: 'active', birthDate: '', 
    parentPhone: '', address: '', parentJob: '',
    registerNumber: '', pageNumber: '', recordNumber: ''
  });

  // Bulk Add State
  const [bulkNames, setBulkNames] = useState('');

  const bulkNamesCount = useMemo(() => {
    return bulkNames.split('\n').map(n => n.trim()).filter(n => n.length > 0).length;
  }, [bulkNames]);

  const getAgeStatus = (birthDate?: string) => {
    if (!birthDate || !season.minBirthYear || !season.maxBirthYear) return 'normal';
    const birthYear = new Date(birthDate).getFullYear();
    if (birthYear > season.minBirthYear) return 'accelerated'; 
    if (birthYear < season.maxBirthYear) return 'overage';
    return 'normal';
  };

  const filteredStudents = useMemo(() => {
    let list = season.students || [];
    if (activeSubTab === 'audit') {
      list = list.filter(s => getAgeStatus(s.birthDate) !== 'normal');
    } else {
      if (selectedGrade) list = list.filter(s => s.grade === selectedGrade);
      if (selectedSection) list = list.filter(s => s.section === selectedSection);
    }
    if (searchTerm) {
      list = list.filter(s => s.name.includes(searchTerm) || s.registerNumber?.includes(searchTerm));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [season.students, selectedGrade, selectedSection, searchTerm, activeSubTab, season.minBirthYear, season.maxBirthYear]);

  const generateStudentUser = (student: Student): User => {
    const randomPass = Math.floor(100000 + Math.random() * 900000).toString();
    // Generate username: s + registerNumber or s + timestamp
    const username = `s${student.registerNumber || Date.now().toString().slice(-6)}`;
    return {
      id: `u_${student.id}`,
      username,
      password: randomPass,
      name: student.name,
      role: 'student',
      linkedId: student.id
    };
  };

  const saveStudent = () => {
    if (!studentForm.name?.trim() || !studentForm.section || !studentForm.birthDate) {
      alert('يرجى إكمال الاسم والشعبة وتاريخ الميلاد');
      return;
    }

    if (editingStudentId) {
      onUpdate({
        students: (season.students || []).map(s => s.id === editingStudentId ? { ...s, ...studentForm } as Student : s)
      });
      // Update user name if changed
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => u.linkedId === editingStudentId ? { ...u, name: studentForm.name! } : u)
      }));
      setEditingStudentId(null);
    } else {
      const newStudent: Student = { 
        id: Date.now().toString(),
        status: 'active',
        ...(studentForm as Omit<Student, 'id'>)
      };
      
      const newUser = generateStudentUser(newStudent);
      
      onUpdate({ students: [...(season.students || []), newStudent] });
      setState(prev => ({
        ...prev,
        users: [...prev.users, newUser]
      }));
      
      alert(`تم إضافة الطالب بنجاح.\nاسم المستخدم: ${newUser.username}\nكلمة المرور: ${newUser.password}`);
    }
    
    setStudentForm({
      name: '', grade: studentForm.grade || 1, section: studentForm.section || '', status: 'active', birthDate: '', 
      parentPhone: '', address: '', parentJob: '',
      registerNumber: '', pageNumber: '', recordNumber: ''
    });
  };

  const saveBulkStudents = () => {
    const namesArray = bulkNames.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    
    if (namesArray.length === 0) {
      alert('يرجى إدخال الأسماء أولاً');
      return;
    }
    if (!studentForm.section) {
      alert('يرجى اختيار الشعبة أولاً');
      return;
    }

    const defaultBirthYear = season.minBirthYear || (new Date().getFullYear() - 6);
    const defaultBirthDate = `${defaultBirthYear}-01-01`;

    const newStudents: Student[] = [];
    const newUsers: User[] = [];

    namesArray.forEach((name, index) => {
      const student: Student = {
        id: `${Date.now()}_${index}`,
        name,
        grade: studentForm.grade || 1,
        section: studentForm.section || '',
        status: 'active',
        birthDate: defaultBirthDate,
        parentPhone: '',
        address: '',
        parentJob: '',
        registerNumber: '',
        pageNumber: '',
        recordNumber: ''
      };
      newStudents.push(student);
      newUsers.push(generateStudentUser(student));
    });

    onUpdate({ students: [...(season.students || []), ...newStudents] });
    setState(prev => ({
      ...prev,
      users: [...prev.users, ...newUsers]
    }));

    setBulkNames('');
    setIsBulkMode(false);
    alert(`تمت إضافة ${namesArray.length} تلميذ بنجاح وتوليد حسابات دخول لهم.`);
  };

  const deleteStudent = (id: string) => {
    if (confirm('حذف التلميذ نهائياً؟ سيتم حذف حساب الدخول الخاص به أيضاً.')) {
      onUpdate({ students: (season.students || []).filter(s => s.id !== id) });
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.linkedId !== id)
      }));
    }
  };

  // Teacher State
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherForm, setTeacherForm] = useState<Partial<Teacher>>({ name: '', specialization: '', phone: '' });
  const [managingAssignmentsId, setManagingAssignmentsId] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState<TeacherAssignment>({ gradeId: 1, sectionName: '', subjectId: '' });

  const saveTeacher = () => {
    if (!teacherForm.name?.trim()) {
      alert('يرجى إدخال اسم المعلم');
      return;
    }

    if (editingTeacherId) {
      onUpdate({
        teachers: season.teachers.map(t => t.id === editingTeacherId ? { ...t, ...teacherForm } as Teacher : t)
      });
      setEditingTeacherId(null);
    } else {
      const newTeacher: Teacher = {
        id: Date.now().toString(),
        name: teacherForm.name || '',
        specialization: teacherForm.specialization || '',
        phone: teacherForm.phone || '',
        assignments: []
      };
      onUpdate({ teachers: [...(season.teachers || []), newTeacher] });
    }
    setTeacherForm({ name: '', specialization: '', phone: '' });
  };

  const deleteTeacher = (id: string) => {
    if (confirm('حذف المعلم نهائياً؟')) {
      onUpdate({ teachers: (season.teachers || []).filter(t => t.id !== id) });
    }
  };

  const dismissStudent = (id: string) => {
    if (confirm('هل أنت متأكد من تغيير حالة الطالب إلى "مفصول"؟')) {
      onUpdate({
        students: (season.students || []).map(s => s.id === id ? { ...s, status: 'dismissed' } : s)
      });
    }
  };

  const addAssignment = (teacherId: string) => {
    if (!newAssignment.subjectId || !newAssignment.sectionName) return;
    onUpdate({
      teachers: season.teachers.map(t => t.id === teacherId ? {
        ...t, assignments: [...(t.assignments || []), newAssignment]
      } : t)
    });
    setNewAssignment({ gradeId: 1, sectionName: '', subjectId: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm w-fit border border-gray-100 mx-auto no-print">
        <button onClick={() => { setActiveSubTab('students'); setSearchTerm(''); }} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${activeSubTab === 'students' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          <Users size={20} /> شؤون الطلاب
        </button>
        <button onClick={() => { setActiveSubTab('audit'); setSearchTerm(''); }} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${activeSubTab === 'audit' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          <Baby size={20} /> التدقيق العمري
        </button>
        <button onClick={() => { setActiveSubTab('teachers'); setSearchTerm(''); }} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${activeSubTab === 'teachers' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          <GraduationCap size={20} /> الهيئة التعليمية
        </button>
      </div>

      {activeSubTab === 'students' && (
        <div className="space-y-8 animate-in slide-in-bottom">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black flex items-center gap-3 text-slate-800">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  {isBulkMode ? <UsersRound size={24} /> : (editingStudentId ? <Edit2 size={24} /> : <UserPlus size={24} />)}
                </div>
                {isBulkMode ? 'إضافة مجموعة تلاميذ دفعة واحدة' : (editingStudentId ? 'تعديل بيانات التلميذ' : 'تسجيل تلميذ جديد')}
              </h3>
              {!editingStudentId && (
                <div className="flex bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-100">
                  <button 
                    onClick={() => setIsBulkMode(false)}
                    className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${!isBulkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    إضافة فردية
                  </button>
                  <button 
                    onClick={() => setIsBulkMode(true)}
                    className={`px-6 py-2 rounded-xl font-black text-xs transition-all ${isBulkMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
                  >
                    إضافة جماعية
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-8">
              {/* صف اختيارات الصف والشعبة - مشترك */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">الصف الدراسي</label>
                  <select 
                    value={studentForm.grade} 
                    onChange={e => setStudentForm({...studentForm, grade: parseInt(e.target.value), section: ''})} 
                    className="w-full px-5 py-4 border-2 border-white rounded-2xl font-black bg-white shadow-sm outline-none focus:border-blue-600"
                  >
                    {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{GRADE_NAMES[g]}</option>)}
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">الشعبة</label>
                  <select 
                    value={studentForm.section} 
                    onChange={e => setStudentForm({...studentForm, section: e.target.value})} 
                    className="w-full px-5 py-4 border-2 border-white rounded-2xl font-black bg-white shadow-sm outline-none focus:border-blue-600"
                  >
                    <option value="">-- اختر الشعبة --</option>
                    {(season.sections?.[studentForm.grade || 1] || []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {!isBulkMode && (
                   <>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">تاريخ الميلاد</label>
                      <input type="date" value={studentForm.birthDate || ''} onChange={e => setStudentForm({...studentForm, birthDate: e.target.value})} className="w-full px-5 py-4 border-2 border-white rounded-2xl font-black bg-white shadow-sm outline-none focus:border-blue-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">حالة القيد</label>
                      <select 
                        value={studentForm.status || 'active'} 
                        onChange={e => setStudentForm({...studentForm, status: e.target.value as any})} 
                        className="w-full px-5 py-4 border-2 border-white rounded-2xl font-black bg-white shadow-sm outline-none focus:border-blue-600"
                      >
                        <option value="active">مستمر في الدوام</option>
                        <option value="transferred">منقول لمدرسة أخرى</option>
                        <option value="dismissed">مفصول / تارك</option>
                      </select>
                    </div>
                   </>
                )}
              </div>

              {isBulkMode ? (
                <div className="animate-in slide-in-bottom">
                  <div className="flex justify-between items-center mb-3 mr-2">
                    <label className="block text-sm font-black text-slate-700">قائمة الأسماء (اسم واحد في كل سطر)</label>
                    <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black shadow-lg">
                      عدد الأسماء المكتشفة: {toArabicNums(bulkNamesCount)}
                    </div>
                  </div>
                  <textarea 
                    value={bulkNames} 
                    onChange={e => setBulkNames(e.target.value)}
                    rows={12}
                    className="w-full px-8 py-6 border-2 border-slate-100 rounded-[2.5rem] font-bold bg-slate-50 text-right outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner text-lg leading-relaxed"
                    placeholder="الصق الأسماء هنا...&#10;أحمد محمد علي&#10;حسين جاسم كاطع&#10;زيدون إبراهيم خليل"
                  ></textarea>
                  <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 text-amber-800">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold">سيتم تعيين تاريخ ميلاد افتراضي للطلاب المضافين جماعياً (بداية السن القانوني للموسم). يمكنك تعديله لاحقاً لكل طالب على حدة.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-bottom">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">اسم التلميذ الرباعي</label>
                    <input type="text" value={studentForm.name || ''} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full px-6 py-5 border-2 border-slate-50 rounded-[1.5rem] font-black text-xl bg-slate-50/50 outline-none focus:border-blue-600 focus:bg-white" placeholder="الاسم الكامل..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-white">
                    <div className="space-y-4 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">رقم القيد</label>
                        <div className="relative"><Hash size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" value={studentForm.registerNumber || ''} onChange={e => setStudentForm({...studentForm, registerNumber: e.target.value})} className="w-full pr-10 pl-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" placeholder="0000"/></div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">رقم السجل</label>
                        <div className="relative"><ClipboardList size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" value={studentForm.recordNumber || ''} onChange={e => setStudentForm({...studentForm, recordNumber: e.target.value})} className="w-full pr-10 pl-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" placeholder="00"/></div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">رقم الصفحة</label>
                        <div className="relative"><FileText size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" value={studentForm.pageNumber || ''} onChange={e => setStudentForm({...studentForm, pageNumber: e.target.value})} className="w-full pr-10 pl-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" placeholder="00"/></div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">رقم هاتف ولي الأمر</label>
                      <div className="relative"><Smartphone size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" value={studentForm.parentPhone || ''} onChange={e => setStudentForm({...studentForm, parentPhone: e.target.value})} className="w-full pr-10 pl-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" placeholder="07XXXXXXXXX"/></div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">العنوان / السكن</label>
                      <div className="relative"><MapPin size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" value={studentForm.address || ''} onChange={e => setStudentForm({...studentForm, address: e.target.value})} className="w-full pr-10 pl-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" placeholder="الحي / المحلة / الزقاق"/></div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 text-right">مهنة ولي الأمر</label>
                      <div className="relative"><Briefcase size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"/><input type="text" value={studentForm.parentJob || ''} onChange={e => setStudentForm({...studentForm, parentJob: e.target.value})} className="w-full pr-10 pl-4 py-3 bg-white border border-slate-100 rounded-xl font-bold" placeholder="كاسب / موظف..."/></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={isBulkMode ? saveBulkStudents : saveStudent} 
                  className={`flex-1 py-6 rounded-[2rem] font-black shadow-xl transition-all flex items-center justify-center gap-3 ${
                    isBulkMode ? 'bg-slate-900 text-white hover:bg-black' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isBulkMode ? <ListPlus size={24} /> : <Plus size={24} />} 
                  {isBulkMode ? `إضافة الـ (${toArabicNums(bulkNamesCount)}) تلميذ دفعة واحدة` : (editingStudentId ? 'تحديث البيانات' : 'حفظ التلميذ')}
                </button>
                {(editingStudentId || isBulkMode) && (
                  <button 
                    onClick={() => { setEditingStudentId(null); setIsBulkMode(false); setBulkNames(''); }} 
                    className="px-10 bg-slate-100 text-slate-500 rounded-[2rem] font-black"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100">
             <div className="flex flex-col gap-8 mb-10 items-center">
                <div className="flex flex-wrap justify-center gap-2">
                  <button onClick={() => { setSelectedGrade(null); setSelectedSection(null); }} className={`px-6 py-4 rounded-2xl font-black text-sm min-w-[100px] transition-all ${selectedGrade === null ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>الكل</button>
                  {[1,2,3,4,5,6].map(g => (
                    <button key={g} onClick={() => { setSelectedGrade(g); setSelectedSection(null); }} className={`px-6 py-4 rounded-2xl font-black text-sm min-w-[100px] transition-all ${selectedGrade === g ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{GRADE_NAMES[g]}</button>
                  ))}
                </div>
                
                {selectedGrade && (
                  <div className="flex flex-wrap justify-center gap-2 animate-in zoom-in">
                    <button onClick={() => setSelectedSection(null)} className={`px-10 py-4 rounded-2xl font-black text-sm transition-all ${selectedSection === null ? 'bg-slate-800 text-white' : 'bg-white border-2 border-slate-100 text-slate-500'}`}>شعب الصف {GRADE_NAMES[selectedGrade]}</button>
                    {(season.sections?.[selectedGrade] || []).map(s => (
                      <button key={s} onClick={() => setSelectedSection(s)} className={`px-10 py-4 rounded-2xl font-black text-sm transition-all ${selectedSection === s ? 'bg-slate-800 text-white shadow-xl' : 'bg-white border-2 border-slate-100 text-slate-500'}`}>شعبة {s}</button>
                    ))}
                  </div>
                )}

                <div className="w-full max-w-md relative">
                   <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input type="text" placeholder="بحث بالاسم أو رقم القيد..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-bold outline-none focus:bg-white focus:border-blue-600 text-right" />
                </div>
             </div>

             {filteredStudents.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                 {filteredStudents.map(s => (
                   <div key={s.id} className="p-8 border-2 border-slate-50 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all bg-white hover:border-blue-200">
                      <div className="flex items-start gap-5 mb-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-2xl">{s.name[0]}</div>
                        <div className="flex-1 text-right">
                          <h4 className="font-black text-slate-800">{s.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                             <span className="px-3 py-1 bg-slate-100 text-[9px] font-black rounded-full text-slate-500">القيد: {toArabicNums(s.registerNumber) || '---'}</span>
                             <span className="px-3 py-1 bg-blue-50 text-[9px] font-black rounded-full text-blue-600">الصف {GRADE_NAMES[s.grade]}-{s.section}</span>
                             {s.status === 'transferred' && <span className="px-3 py-1 bg-amber-50 text-[9px] font-black rounded-full text-amber-600">منقول</span>}
                             {s.status === 'dismissed' && <span className="px-3 py-1 bg-red-50 text-[9px] font-black rounded-full text-red-600">مفصول</span>}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-slate-400">
                             <Phone size={10}/><span className="text-[9px] font-bold">{toArabicNums(s.parentPhone) || 'بدون هاتف'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2"><button onClick={() => { setEditingStudentId(s.id); setStudentForm(s); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-2xl font-black text-xs hover:bg-blue-600 hover:text-white transition-all">تعديل</button><button onClick={() => deleteStudent(s.id)} className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button></div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-20 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100">
                 <p className="text-slate-400 font-black text-xl italic">لا يوجد نتائج لعرضها</p>
               </div>
             )}
          </div>
        </div>
      )}

      {activeSubTab === 'audit' && (
        <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 animate-in slide-in-bottom">
           <div className="flex items-center gap-4 mb-10 bg-red-50 p-6 rounded-[2.5rem] border border-red-100">
              <Baby size={32} className="text-red-600" />
              <div>
                <h3 className="text-xl font-black text-red-800">قائمة التدقيق العمري</h3>
                <p className="text-xs font-bold text-red-600">التلاميذ الذين يقع تاريخ ميلادهم خارج النطاق القانوني المسموح به للموسم ({toArabicNums(season.maxBirthYear)} - {toArabicNums(season.minBirthYear)})</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredStudents.map(s => {
                const status = getAgeStatus(s.birthDate);
                return (
                  <div key={s.id} className={`p-8 rounded-[3rem] border-2 bg-white transition-all hover:shadow-xl ${status === 'accelerated' ? 'border-amber-200' : 'border-red-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="font-black text-slate-800">{s.name}</h4>
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${status === 'accelerated' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                          {status === 'accelerated' ? 'مسرع (أصغر)' : 'متخلف (أكبر)'}
                       </span>
                    </div>
                    <div className="space-y-2 text-xs font-bold text-slate-500">
                       <p className="flex justify-between">تاريخ الميلاد: <span className="text-slate-900 font-black">{toArabicNums(s.birthDate)}</span></p>
                       <p className="flex justify-between">الصف والشعبة: <span className="text-slate-900 font-black">{GRADE_NAMES[s.grade]} - {s.section}</span></p>
                       <p className="flex justify-between">رقم القيد: <span className="text-slate-900 font-black">{toArabicNums(s.registerNumber) || '---'}</span></p>
                    </div>
                    <button onClick={() => dismissStudent(s.id)} className="mt-6 w-full py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                      <UserX size={16} />
                      فصل الطالب
                    </button>
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <div className="col-span-full py-24 text-center text-emerald-600 bg-emerald-50 rounded-[3rem] border-2 border-dashed border-emerald-100">
                   <CheckCircle2 size={48} className="mx-auto mb-4" />
                   <p className="font-black text-xl">كافة التلاميذ ضمن السن القانوني المسموح</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeSubTab === 'teachers' && (
        <div className="space-y-8 animate-in slide-in-bottom">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-slate-800">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><GraduationCap size={24} /></div>
              {editingTeacherId ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <input type="text" value={teacherForm.name || ''} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} className="px-6 py-4 border-2 border-slate-50 rounded-2xl font-bold bg-slate-50/50" placeholder="اسم المعلم..." />
              <input type="text" value={teacherForm.specialization || ''} onChange={e => setTeacherForm({...teacherForm, specialization: e.target.value})} className="px-6 py-4 border-2 border-slate-50 rounded-2xl font-bold bg-slate-50/50" placeholder="الاختصاص..." />
              <button onClick={saveTeacher} className="bg-purple-600 text-white rounded-2xl font-black shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-2"><Plus size={20} /> {editingTeacherId ? 'تحديث' : 'إضافة'}</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(season.teachers || []).map(t => (
                <div key={t.id} className="p-8 border border-slate-100 rounded-[2.5rem] bg-white hover:shadow-xl transition-all">
                  <h4 className="text-xl font-black text-slate-800 mb-2">{t.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mb-6">{t.specialization || 'بدون اختصاص'}</p>
                  
                  <div className="space-y-2 mb-6">
                     <p className="text-[10px] font-black text-slate-400 border-b pb-1">الحصص المسندة ({toArabicNums(t.assignments?.length || 0)})</p>
                     {t.assignments?.map((as, idx) => (
                       <div key={idx} className="flex justify-between text-[10px] font-black bg-slate-50 p-2 rounded-lg">
                         <span>{GRADE_NAMES[as.gradeId]} - {as.sectionName}</span>
                         <span className="text-purple-600">{season.subjects[as.gradeId]?.find(sub => sub.id === as.subjectId)?.name || 'مادة محذوفة'}</span>
                       </div>
                     ))}
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setManagingAssignmentsId(t.id)} className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl font-black text-[10px] hover:bg-blue-600 hover:text-white transition-all">إسناد حصة</button>
                    <button onClick={() => { setEditingTeacherId(t.id); setTeacherForm(t); }} className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-200"><Edit2 size={16} /></button>
                    <button onClick={() => deleteTeacher(t.id)} className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {managingAssignmentsId && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black text-slate-800">إسناد حصة جديدة</h3>
               <button onClick={() => setManagingAssignmentsId(null)} className="p-2 text-slate-300 hover:text-red-500"><X size={24} /></button>
             </div>
             <div className="space-y-4">
               <select value={newAssignment.gradeId} onChange={e => setNewAssignment({...newAssignment, gradeId: parseInt(e.target.value), sectionName: '', subjectId: ''})} className="w-full p-4 border rounded-2xl font-bold bg-slate-50">{[1,2,3,4,5,6].map(g => <option key={g} value={g}>{GRADE_NAMES[g]}</option>)}</select>
               <select value={newAssignment.sectionName} onChange={e => setNewAssignment({...newAssignment, sectionName: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-slate-50"><option value="">-- اختر الشعبة --</option>{(season.sections?.[newAssignment.gradeId] || []).map(s => <option key={s} value={s}>{s}</option>)}</select>
               <select value={newAssignment.subjectId} onChange={e => setNewAssignment({...newAssignment, subjectId: e.target.value})} className="w-full p-4 border rounded-2xl font-bold bg-slate-50"><option value="">-- اختر المادة --</option>{(season.subjects?.[newAssignment.gradeId] || []).map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}</select>
               <button onClick={() => addAssignment(managingAssignmentsId)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">إسناد الحصة الآن</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleManager;
