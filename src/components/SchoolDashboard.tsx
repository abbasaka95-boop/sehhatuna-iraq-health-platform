/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, AnnouncementAlert } from '../types';
import { translations, CURRENT_DATE_STRING } from '../data';
import { 
  Building2, Users, CheckCircle2, AlertOctagon, Percent, UserPlus,
  ArrowDownToLine, Trash2, Heart, Search, Megaphone, Calendar, FileText, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, setDoc } from '../lib/firebase';

interface SchoolDashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  announcements: AnnouncementAlert[];
  setAnnouncements: React.Dispatch<React.SetStateAction<AnnouncementAlert[]>>;
  lang: 'ar' | 'en';
}

export default function SchoolDashboard({
  students,
  setStudents,
  announcements,
  setAnnouncements,
  lang,
}: SchoolDashboardProps) {
  const t = translations[lang];

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Student Registry Form
  const [nameAr, setNameAr] = useState<string>('');
  const [nameEn, setNameEn] = useState<string>('');
  const [age, setAge] = useState<number>(11);
  const [gradeAr, setGradeAr] = useState<string>('');
  const [gradeEn, setGradeEn] = useState<string>('');
  const [bloodType, setBloodType] = useState<string>('O+');
  const [weight, setWeight] = useState<number>(40);
  const [height, setHeight] = useState<number>(140);
  const [parentNameAr, setParentNameAr] = useState<string>('');
  const [parentNameEn, setParentNameEn] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [nationalId, setNationalId] = useState<string>('');
  const [chronicAr, setChronicAr] = useState<string>('');
  const [chronicEn, setChronicEn] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('2027-06-25'); // default 1 yr subscription
  const [studentSuccess, setStudentSuccess] = useState<boolean>(false);

  // Announcement Broadcaster Form
  const [annTitleAr, setAnnTitleAr] = useState<string>('');
  const [annTitleEn, setAnnTitleEn] = useState<string>('');
  const [annDescAr, setAnnDescAr] = useState<string>('');
  const [annDescEn, setAnnDescEn] = useState<string>('');
  const [annType, setAnnType] = useState<'vaccine' | 'campaign' | 'general'>('vaccine');
  const [annSuccess, setAnnSuccess] = useState<boolean>(false);

  // Statistics
  const totalCount = students.length;
  // Subscribed students count (active, expiring, critical)
  const subscribedCount = students.filter(s => s.subscriptionStatus !== 'expired').length;
  const criticalCount = students.filter(s => s.status === 'emergency' || s.status === 'review').length;
  const ratio = totalCount > 0 ? Math.round((subscribedCount / totalCount) * 100) : 0;

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.nationalId.includes(searchQuery) ||
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !gradeAr || !nationalId || !parentPhone || !parentNameAr) return;

    // Calculate subscription status based on expiry
    const expDate = new Date(expiry);
    const today = new Date(CURRENT_DATE_STRING);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let subStatus: 'active' | 'expiring_soon' | 'critical' | 'expired' = 'active';
    if (diffDays <= 0) subStatus = 'expired';
    else if (diffDays <= 30) subStatus = 'critical';
    else if (diffDays <= 90) subStatus = 'expiring_soon';

    const newStudent: Student = {
      id: `STU-${Math.floor(100 + Math.random() * 900)}`,
      nameAr,
      nameEn: nameEn || nameAr,
      age: Number(age),
      gradeAr,
      gradeEn: gradeEn || gradeAr,
      status: 'good',
      chronicDiseasesAr: chronicAr ? chronicAr.split('،').map(s => s.trim()) : [],
      chronicDiseasesEn: chronicEn ? chronicEn.split(',').map(s => s.trim()) : [],
      vaccinationsAr: ['شلل الأطفال', 'الحصبة'],
      vaccinationsEn: ['Polio', 'Measles'],
      bloodType,
      weight: Number(weight),
      height: Number(height),
      parentNameAr,
      parentNameEn: parentNameEn || parentNameAr,
      parentPhone,
      nationalId,
      schoolNameAr: 'مدرسة السياب الابتدائية',
      schoolNameEn: 'Al-Sayyab Primary School',
      subscriptionPrice: 150000,
      subscriptionStatus: subStatus,
      subscriptionExpiry: expiry,
      joinedDate: CURRENT_DATE_STRING
    };

    try {
      await setDoc(doc(db, 'students', newStudent.id), newStudent);
    } catch (err) {
      console.error("Firebase error saving student:", err);
    }

    setStudents(prev => [...prev, newStudent]);
    setStudentSuccess(true);

    // Clear Form
    setNameAr('');
    setNameEn('');
    setAge(11);
    setGradeAr('');
    setGradeEn('');
    setParentNameAr('');
    setParentNameEn('');
    setParentPhone('');
    setNationalId('');
    setChronicAr('');
    setChronicEn('');
    
    setTimeout(() => {
      setStudentSuccess(false);
    }, 4000);
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitleAr || !annDescAr) return;

    const newAnn: AnnouncementAlert = {
      id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
      titleAr: annTitleAr,
      titleEn: annTitleEn || annTitleAr,
      descriptionAr: annDescAr,
      descriptionEn: annDescEn || annDescAr,
      type: annType,
      date: CURRENT_DATE_STRING,
      schoolNameAr: 'مدرسة السياب الابتدائية',
      schoolNameEn: 'Al-Sayyab Primary School'
    };

    try {
      await setDoc(doc(db, 'announcements', newAnn.id), newAnn);
    } catch (err) {
      console.error("Firebase error saving announcement:", err);
    }

    setAnnouncements(prev => [newAnn, ...prev]);
    setAnnSuccess(true);

    setAnnTitleAr('');
    setAnnTitleEn('');
    setAnnDescAr('');
    setAnnDescEn('');

    setTimeout(() => {
      setAnnSuccess(false);
    }, 4000);
  };

  // Simulate exporting student record to CSV/Excel
  const handleExportCSV = () => {
    const header = 'ID,Name,Grade,Status,Chronic Conditions,Guardian,Phone\n';
    const rows = filteredStudents.map(s => {
      const name = lang === 'ar' ? s.nameAr : s.nameEn;
      const grade = lang === 'ar' ? s.gradeAr : s.gradeEn;
      const chronic = (lang === 'ar' ? s.chronicDiseasesAr : s.chronicDiseasesEn).join(' | ');
      const guardian = lang === 'ar' ? s.parentNameAr : s.parentNameEn;
      return `${s.id},"${name}","${grade}",${s.status},"${chronic}","${guardian}",${s.parentPhone}`;
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `sehhatuna_students_export_${CURRENT_DATE_STRING}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="w-full flex flex-col gap-6" id="school-portal-container">
      
      {/* School stats header block */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-[2rem] p-6 md:p-8 shadow-md border border-slate-950 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-right md:text-right">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 text-emerald-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {lang === 'ar' ? 'مدرسة السياب الابتدائية' : 'Al-Sayyab Primary School'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-semibold font-sans">
              {lang === 'ar' ? 'المكتب الصحي للمدرسة • إدارة شؤون الطلبة الطبية' : 'School Health Office • Student Medical Affairs'}
            </p>
          </div>
        </div>

        {/* Connected subscribers count bar as requested by user */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full md:w-auto">
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.totalStudents}</span>
            </p>
            <p className="text-xl font-black text-white mt-1 font-mono">{totalCount}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.subscribedStudents}</span>
            </p>
            <p className="text-xl font-black text-white mt-1 font-mono">{subscribedCount}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.emergencyCount}</span>
            </p>
            <p className="text-xl font-black text-rose-400 mt-1 font-mono animate-pulse">{criticalCount}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 justify-center">
              <Percent className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.subscriptionRatio}</span>
            </p>
            <p className="text-xl font-black text-teal-400 mt-1 font-mono">{ratio}%</p>
          </div>
        </div>
      </div>

      {/* Directory database section */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>{lang === 'ar' ? 'سجل الطلاب الصحي والمتابعة الميدانية' : 'Students Health Directory Ledger'}</span>
          </h3>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-9 pr-4 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-sans shadow-inner"
              />
            </div>

            {/* Status filtering dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer shadow-sm font-sans"
            >
              <option value="all">{lang === 'ar' ? 'تصفية: جميع الحالات' : 'All Health States'}</option>
              <option value="good">{t.status_good}</option>
              <option value="review">{t.status_review}</option>
              <option value="emergency">{t.status_emergency}</option>
            </select>

            {/* Export CSV button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-all rounded-xl shadow-sm cursor-pointer min-h-[38px]"
              id="export-csv-btn"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>{t.exportCSV}</span>
            </button>
          </div>
        </div>

        {/* Directory Student Table */}
        <div className="overflow-x-auto mt-4 rounded-2xl border border-gray-100" id="students-table-container">
          <table className="w-full text-right sm:text-right font-sans text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-5 py-3.5">{lang === 'ar' ? 'اسم الطالب / الكود الأكاديمي' : 'Student Name / Academic ID'}</th>
                <th className="px-5 py-3.5">{t.grade}</th>
                <th className="px-5 py-3.5">{lang === 'ar' ? 'الحالة الصحية العامة' : 'Medical Severity'}</th>
                <th className="px-5 py-3.5">{t.chronicDiseases}</th>
                <th className="px-5 py-3.5">{lang === 'ar' ? 'صلاحية الاشتراك' : 'Sub Expiry'}</th>
                <th className="px-5 py-3.5 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/70 transition-all">
                    {/* Student Identity */}
                    <td className="px-5 py-4 flex items-center gap-3">
                      <div className="h-9 w-9 bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold flex items-center justify-center rounded-xl text-xs">
                        {student.nameAr[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-xs">{lang === 'ar' ? student.nameAr : student.nameEn}</span>
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5">{student.id} | الهوية: {student.nationalId}</span>
                      </div>
                    </td>

                    {/* Grade */}
                    <td className="px-5 py-4 font-semibold text-gray-800">
                      {lang === 'ar' ? student.gradeAr : student.gradeEn}
                    </td>

                    {/* Health Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                        student.status === 'good'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : student.status === 'review'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          student.status === 'good' ? 'bg-emerald-500' : student.status === 'review' ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        {t[`status_${student.status}`]}
                      </span>
                    </td>

                    {/* Chronic diseases */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(lang === 'ar' ? student.chronicDiseasesAr : student.chronicDiseasesEn).length > 0 ? (
                          (lang === 'ar' ? student.chronicDiseasesAr : student.chronicDiseasesEn).map((d, i) => (
                            <span key={i} className="bg-rose-50 text-rose-800 text-[10px] px-2 py-0.5 rounded border border-rose-100 font-bold">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">{lang === 'ar' ? 'لا توجد' : 'None'}</span>
                        )}
                      </div>
                    </td>

                    {/* Subscription Countdown Expiry bar */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border w-fit ${
                          student.subscriptionStatus === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : student.subscriptionStatus === 'expiring_soon'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : student.subscriptionStatus === 'critical'
                                ? 'bg-rose-50 text-rose-700 border-rose-250 animate-pulse'
                                : 'bg-gray-100 text-gray-500 border-gray-300'
                        }`}>
                          {t[`sub_${student.subscriptionStatus}`]}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 font-mono">{student.subscriptionExpiry}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-gray-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all cursor-pointer min-h-[38px]"
                        title={lang === 'ar' ? 'إزالة السجل' : 'Remove Record'}
                        id={`delete-student-btn-${student.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400 italic">
                    {lang === 'ar' ? 'لم يتم العثور على طلاب يطابقون شروط البحث.' : 'No matched students in health office directory.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Register Student Form vs Broadcast Announcement Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Enroll student */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <span>{t.addStudent}</span>
          </h3>

          <AnimatePresence>
            {studentSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-2xl mt-4 flex items-center gap-2 font-sans font-semibold shadow-sm"
              >
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>{t.addSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleRegisterStudent} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 font-sans">
            
            {/* Student Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'اسم الطالب بالكامل (عربي) *' : 'Student Full Name (Arabic) *'}</label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="أحمد يوسف السبيعي"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Optional English Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'اسم الطالب (إنجليزي)' : 'Student Name (English)'}</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Ahmed Yousuf Al-Subaie"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* National ID */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{t.nationalId} *</label>
              <input
                type="text"
                required
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="1092837465"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Age */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{t.age} *</label>
              <input
                type="number"
                required
                min={6}
                max={18}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Grade Level */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'الصف الدراسي *' : 'Grade Level *'}</label>
              <input
                type="text"
                required
                value={gradeAr}
                onChange={(e) => setGradeAr(e.target.value)}
                placeholder="الصف السادس - أ"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Grade Level (English) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'الصف بالإنجليزي' : 'Grade (English)'}</label>
              <input
                type="text"
                value={gradeEn}
                onChange={(e) => setGradeEn(e.target.value)}
                placeholder="Grade 6 - A"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Blood Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{t.bloodType}</label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
              </select>
            </div>

            {/* Weight */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{t.weight}</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Height */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{t.height}</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Parent Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'اسم ولي الأمر *' : 'Guardian Name *'}</label>
              <input
                type="text"
                required
                value={parentNameAr}
                onChange={(e) => setParentNameAr(e.target.value)}
                placeholder="يوسف السبيعي"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Parent Mobile */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{t.parentPhone} *</label>
              <input
                type="text"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="0550000000"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Subscription Expiry date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'تاريخ انتهاء الاشتراك السنوي *' : 'Annual Sub Expiration *'}</label>
              <input
                type="date"
                required
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            {/* Chronic Conditions */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'الأمراض المزمنة أو الحساسية (افصل بينها بـ "،")' : 'Chronic Allergies (Separate with ",")'}</label>
              <input
                type="text"
                value={chronicAr}
                onChange={(e) => setChronicAr(e.target.value)}
                placeholder="السكري، حساسية الفراولة"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-6 rounded-xl cursor-pointer shadow-md transition-all active:scale-95"
                id="register-student-submit-btn"
              >
                {t.saveBtn}
              </button>
            </div>
          </form>
        </div>

        {/* School Announcement Campaign Broadcaster Form */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'ar' ? 'نشر حملة أو إعلان صحي مدرسي' : 'Broadcast Health Notice / Campaign'}</span>
            </h3>

            <AnimatePresence>
              {annSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-2xl mt-4 flex items-center gap-2 font-sans font-semibold shadow-sm"
                >
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                  <span>{lang === 'ar' ? 'تم تعميم الإشعار فوراً في حسابات الطلاب وأولياء الأمور والمستشفيات!' : 'Campaign dispatched dynamically across the ecosystem!'}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleBroadcastAnnouncement} className="flex flex-col gap-4 mt-4 font-sans">
              
              {/* Type */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'نوع الحملة الصحية' : 'Campaign Category'}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnType('vaccine')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      annType === 'vaccine'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {lang === 'ar' ? 'تطعيم ولقاحات' : 'Vaccine Drive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnType('campaign')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      annType === 'campaign'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {lang === 'ar' ? 'ندوة وتوعية' : 'Education'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnType('general')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      annType === 'general'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {lang === 'ar' ? 'إعلان عام' : 'General announcement'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'عنوان التعميم (عربي) *' : 'Notice Heading (Arabic) *'}</label>
                <input
                  type="text"
                  required
                  value={annTitleAr}
                  onChange={(e) => setAnnTitleAr(e.target.value)}
                  placeholder="ندوة وقائية ضد سمنة الأطفال"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Title (English) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'العنوان بالإنجليزي (اختياري)' : 'Heading in English (Optional)'}</label>
                <input
                  type="text"
                  value={annTitleEn}
                  onChange={(e) => setAnnTitleEn(e.target.value)}
                  placeholder="Pediatric Obesity Prevention Seminar"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-600">{lang === 'ar' ? 'محتوى وبنود الإشعار *' : 'Notice Details *'}</label>
                <textarea
                  required
                  rows={2}
                  value={annDescAr}
                  onChange={(e) => setAnnDescAr(e.target.value)}
                  placeholder="اكتب التوجيهات والتفاصيل..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm resize-none"
                />
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-6 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 w-full mt-2"
                id="announcement-broadcast-btn"
              >
                {lang === 'ar' ? 'تعميم الإعلان ونشره فورا' : 'Dispatch Broadcast Immediately'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
