/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Appointment, HealthReport, EmergencyAlert, HospitalEntity } from '../types';
import { translations, CURRENT_DATE_STRING } from '../data';
import { 
  Activity, Calendar, FileText, Check, X, ShieldAlert, Sparkles, AlertCircle,
  FilePlus, UserPlus, Heart, CheckCircle, TrendingUp, BarChart2, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HospitalDashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  reports: HealthReport[];
  setReports: React.Dispatch<React.SetStateAction<HealthReport[]>>;
  emergencies: EmergencyAlert[];
  setEmergencies: React.Dispatch<React.SetStateAction<EmergencyAlert[]>>;
  hospitals?: HospitalEntity[];
  setHospitals?: React.Dispatch<React.SetStateAction<HospitalEntity[]>>;
  lang: 'ar' | 'en';
}

export default function HospitalDashboard({
  students,
  setStudents,
  appointments,
  setAppointments,
  reports,
  setReports,
  emergencies,
  setEmergencies,
  hospitals,
  setHospitals,
  lang,
}: HospitalDashboardProps) {
  const t = translations[lang];

  // Report uploader form states
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [reportType, setReportType] = useState<string>('');
  const [diagnosisAr, setDiagnosisAr] = useState<string>('');
  const [diagnosisEn, setDiagnosisEn] = useState<string>('');
  const [notesAr, setNotesAr] = useState<string>('');
  const [notesEn, setNotesEn] = useState<string>('');
  const [doctorNameAr, setDoctorNameAr] = useState<string>('');
  const [doctorNameEn, setDoctorNameEn] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // Filter out today's appointments for active view
  const todayAppointments = appointments.filter(app => app.date === CURRENT_DATE_STRING);
  const activeSOS = emergencies.filter(e => e.status === 'active');

  // Handle appointment status change
  const handleSetAppointmentStatus = async (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (err) {
      console.error("Firebase error updating appointment:", err);
    }
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
  };

  // Handle Emergency SOS resolution
  const handleResolveSOS = async (sosId: string, studentId: string) => {
    try {
      await updateDoc(doc(db, 'emergencies', sosId), { status: 'resolved' });
    } catch (err) {
      console.error("Firebase error updating emergency:", err);
    }
    // Set emergency status to resolved
    setEmergencies(prev => prev.map(e => e.id === sosId ? { ...e, status: 'resolved' } : e));
    // Set student health status back to review (requiring follow up)
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: 'review' } : s));
  };

  // Handle clinical report submission
  const handleUploadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !reportType || !diagnosisAr || !notesAr || !doctorNameAr) return;

    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    const newReport: HealthReport = {
      id: `REP-${Math.floor(100 + Math.random() * 900)}`,
      studentId: student.id,
      studentNameAr: student.nameAr,
      studentNameEn: student.nameEn,
      typeAr: reportType,
      typeEn: lang === 'ar' ? `${reportType} Diagnostic` : reportType,
      date: CURRENT_DATE_STRING,
      diagnosisAr,
      diagnosisEn: diagnosisEn || diagnosisAr,
      notesAr,
      notesEn: notesEn || notesAr,
      doctorNameAr,
      doctorNameEn: doctorNameEn || doctorNameAr,
      hospitalNameAr: 'مستشفى الموسوي الأهلي',
      hospitalNameEn: 'Al-Moussawi Private Hospital',
      attachmentName: `${reportType.replace(/\s+/g, '_').toLowerCase()}_report.pdf`
    };

    try {
      await setDoc(doc(db, 'reports', newReport.id), newReport);
    } catch (err) {
      console.error("Firebase error saving report:", err);
    }

    setReports(prev => [newReport, ...prev]);
    setUploadSuccess(true);

    // Clear form
    setSelectedStudentId('');
    setReportType('');
    setDiagnosisAr('');
    setDiagnosisEn('');
    setNotesAr('');
    setNotesEn('');
    setDoctorNameAr('');
    setDoctorNameEn('');

    setTimeout(() => {
      setUploadSuccess(false);
    }, 4000);
  };

  // Prepare chart data based on overall state
  // 1. Doctor case loads
  const doctorData = [
    { name: lang === 'ar' ? 'د. ليلى عبد الرحمن' : 'Dr. Layla', cases: appointments.filter(a => a.doctorNameAr.includes('ليلى')).length },
    { name: lang === 'ar' ? 'د. عمر العثمان' : 'Dr. Omar', cases: appointments.filter(a => a.doctorNameAr.includes('عمر')).length },
    { name: lang === 'ar' ? 'د. فيصل الحربي' : 'Dr. Faisal', cases: appointments.filter(a => a.doctorNameAr.includes('فيصل')).length },
    { name: lang === 'ar' ? 'د. سعاد المالكي' : 'Dr. Suad', cases: appointments.filter(a => a.doctorNameAr.includes('سعاد')).length },
  ];

  // 2. Reviews by medical department
  const deptCount: { [key: string]: number } = {};
  appointments.forEach(app => {
    const key = lang === 'ar' ? app.departmentAr : app.departmentEn;
    deptCount[key] = (deptCount[key] || 0) + 1;
  });

  const departmentChartData = Object.keys(deptCount).map(key => ({
    name: key,
    value: deptCount[key],
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="w-full flex flex-col gap-6" id="hospital-portal-container">
      {/* Clinic Header stats bar */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-[2rem] p-6 md:p-8 shadow-md border border-slate-950 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-right md:text-right">
          <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10">
            <Activity className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {lang === 'ar' ? 'عيادة مستشفى الموسوي الأهلي' : 'Al-Moussawi Private Hospital Clinic'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 font-semibold font-sans">
              {lang === 'ar' ? 'شريك الرعاية الطبية المعتمد لشبكة الصحة المدرسية في العراق' : 'Primary health care provider for School Health Network in Iraq'}
            </p>
          </div>
        </div>

        {/* work loads banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full md:w-auto">
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'ar' ? 'مواعيد اليوم' : 'Today Visits'}</p>
            <p className="text-xl font-black text-white mt-1 font-mono">{todayAppointments.length}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'ar' ? 'بانتظار الموافقة' : 'Pending Approvals'}</p>
            <p className="text-xl font-black text-amber-400 mt-1 font-mono">{todayAppointments.filter(a => a.status === 'pending').length}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'ar' ? 'استغاثات نشطة' : 'Active SOS'}</p>
            <p className="text-xl font-black text-red-400 mt-1 font-mono animate-pulse">{activeSOS.length}</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700 px-4 py-3 rounded-2xl text-center shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{lang === 'ar' ? 'التقارير المرفوعة' : 'Total Reports'}</p>
            <p className="text-xl font-black text-emerald-400 mt-1 font-mono">{reports.length}</p>
          </div>
        </div>
      </div>

      {/* Emergency Active SOS Desk (Always visible or highlighted on top when active) */}
      <div className="border border-red-200 bg-red-50/30 rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col gap-4 relative overflow-hidden" id="hospital-sos-desk">
        <div className="absolute -bottom-8 -right-8 text-red-600/5 pointer-events-none">
          <ShieldAlert className="w-48 h-48 fill-red-600/5" />
        </div>

        <div className="flex items-center justify-between border-b border-red-100 pb-3">
          <h3 className="font-black text-red-800 text-sm md:text-base flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600 animate-bounce" />
            <span>{t.emergencyHeader}</span>
          </h3>
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-3 py-1 rounded-full border border-red-200">
            {activeSOS.length} {lang === 'ar' ? 'حالة نشطة' : 'Active alerts'}
          </span>
        </div>

        <p className="text-xs text-red-700 font-sans leading-relaxed">
          {t.emergencyDescription}
        </p>

        {activeSOS.length > 0 ? (
          <div className="flex flex-col gap-3 mt-1 relative z-10" id="active-sos-beacons">
            {activeSOS.map((sos) => (
              <motion.div
                key={sos.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white border-2 border-red-200 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md"
              >
                <div className="flex flex-col gap-1 text-right sm:text-right">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-red-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase animate-pulse">
                      SOS BEACON
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {lang === 'ar' ? sos.studentNameAr : sos.studentNameEn}
                    </span>
                    <span className="text-[10px] text-gray-500">• {sos.id}</span>
                  </div>

                  <p className="text-xs text-gray-700 font-medium mt-2 leading-relaxed">
                    <span className="font-bold text-red-700">{lang === 'ar' ? 'الموقع المدرسي:' : 'GPS School Location:'} </span>
                    {lang === 'ar' ? sos.locationAr : sos.locationEn} ({lang === 'ar' ? sos.schoolNameAr : sos.schoolNameEn})
                  </p>
                  
                  <p className="text-xs text-gray-600 italic mt-1 bg-red-50/50 p-2 rounded-lg border border-red-100">
                    {lang === 'ar' ? sos.descriptionAr : sos.descriptionEn}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-gray-500 mt-2 font-mono">
                    <span>{lang === 'ar' ? `وقت الاستغاثة: ${sos.time}` : `Distress Time: ${sos.time}`}</span>
                    <span>•</span>
                    <span>{lang === 'ar' ? `هاتف الأب: ${sos.phone}` : `Parent: ${sos.phone}`}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleResolveSOS(sos.id, sos.studentId)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-5 rounded-xl cursor-pointer shadow-md shadow-emerald-100 hover:shadow-lg transition-all duration-200 active:scale-95 flex items-shrink-0 items-center gap-1 w-full sm:w-auto justify-center"
                  id={`resolve-sos-btn-${sos.id}`}
                >
                  <Check className="w-4 h-4" />
                  <span>{t.resolveSOS}</span>
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl text-center shadow-sm">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs text-emerald-800 font-bold">
              {lang === 'ar' ? 'جميع الطلاب بأمان. لا توجد استغاثات نشطة حالياً.' : 'System secure. All student wristbands reporting normal vital metrics.'}
            </p>
          </div>
        )}
      </div>

      {/* Grid: Triage desk vs Clinical Report Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's appointments control list */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>{lang === 'ar' ? 'مواعيد المراجعة اليوم وتأكيد الحجوزات' : 'Today Clinic Visits & Appointment Triage'}</span>
          </h3>

          <div className="flex flex-col gap-3 mt-4" id="hospital-appointments-list">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((app) => (
                <div key={app.id} className="bg-slate-50 border border-slate-155 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex flex-col gap-1 text-right md:text-right">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        app.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : app.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {lang === 'ar' 
                          ? (app.status === 'confirmed' ? 'مؤكد ومثبت' : app.status === 'pending' ? 'بانتظار التأكيد' : app.status === 'cancelled' ? 'ملغي' : 'مراجعة مكتملة')
                          : app.status.toUpperCase()
                        }
                      </span>
                      <span className="text-xs font-bold text-slate-900">{lang === 'ar' ? app.studentNameAr : app.studentNameEn}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({app.id})</span>
                    </div>

                    <h4 className="font-semibold text-emerald-800 text-xs mt-1.5">
                      {lang === 'ar' ? app.departmentAr : app.departmentEn} • {lang === 'ar' ? app.doctorNameAr : app.doctorNameEn}
                    </h4>

                    {app.notesAr && (
                      <p className="text-[11px] text-slate-500 italic mt-1 bg-white/70 p-1.5 rounded-md border border-slate-100">
                        {lang === 'ar' ? app.notesAr : app.notesEn}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      {lang === 'ar' ? 'التوقيت اليوم:' : 'Scheduled session today:'} {app.time}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 self-end md:self-center">
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleSetAppointmentStatus(app.id, 'confirmed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                          title={t.confirm}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.confirm}</span>
                        </button>
                        <button
                          onClick={() => handleSetAppointmentStatus(app.id, 'cancelled')}
                          className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] px-3 py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                          title={t.cancel}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>{t.cancel}</span>
                        </button>
                      </>
                    )}
                    {app.status === 'confirmed' && (
                      <button
                        onClick={() => handleSetAppointmentStatus(app.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-lg cursor-pointer transition-all active:scale-95 flex items-center gap-0.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إنهاء الزيارة وتسجيل الفحص' : 'Complete Visit'}</span>
                      </button>
                    )}
                    {(app.status === 'completed' || app.status === 'cancelled') && (
                      <span className="text-xs text-slate-400 italic">
                        {lang === 'ar' ? 'تمت معالجة الموعد' : 'Processed'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic py-6 text-center">{lang === 'ar' ? 'لا توجد مراجعات أو مواعيد مجدولة لليوم.' : 'No scheduled appointment requests today.'}</p>
            )}
          </div>
        </div>

        {/* Clinical Report Uploader Form */}
        <div className="lg:col-span-1 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-emerald-600" />
            <span>{t.uploadReport}</span>
          </h3>

          <AnimatePresence>
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] p-3 rounded-2xl mt-4 flex items-center gap-2 font-sans font-semibold shadow-sm"
                id="uploader-success-msg"
              >
                <CheckCircle className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                <span>{t.uploadReportSuccess}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleUploadReport} className="flex flex-col gap-4 mt-4 font-sans">
            
            {/* Student profiles dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">{t.selectStudent} *</label>
              <select
                required
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-sm"
              >
                <option value="">{lang === 'ar' ? '-- اختر الطالب المستهدف --' : '-- Choose Student Profile --'}</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {lang === 'ar' ? s.nameAr : s.nameEn} ({s.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnostic/Report type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">{t.reportType} *</label>
              <select
                required
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-sm"
              >
                <option value="">{lang === 'ar' ? '-- اختر نوع الفحص الطبي --' : '-- Choose Report Type --'}</option>
                <option value="فحص دم ومناعة">{lang === 'ar' ? 'فحص دم ومناعة (CBC Lab)' : 'Immune Blood Panel (CBC)'}</option>
                <option value="تقرير فحص العيون">{lang === 'ar' ? 'تقرير فحص العيون (Vision)' : 'Ophthalmology Exam'}</option>
                <option value="فحص الأسنان الدوري">{lang === 'ar' ? 'فحص الأسنان الدوري (Dental)' : 'Dental Prophylaxis'}</option>
                <option value="متابعة سكري الأطفال">{lang === 'ar' ? 'متابعة سكري الأطفال (Endo)' : 'Pediatric Diabetes Review'}</option>
                <option value="تخطيط قلب وأوعية">{lang === 'ar' ? 'تخطيط قلب وأوعية (Cardiac)' : 'Electrocardiogram (ECG)'}</option>
              </select>
            </div>

            {/* Diagnosis */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">{t.diagnosisLabel} *</label>
              <textarea
                required
                rows={2}
                value={diagnosisAr}
                onChange={(e) => setDiagnosisAr(e.target.value)}
                placeholder={lang === 'ar' ? 'أدخل التشخيص الطبي بدقة باللغة العربية...' : 'Input clinical diagnosis here...'}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm resize-none"
              />
            </div>

            {/* Optional English translation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">{lang === 'ar' ? 'التشخيص بالإنجليزي (اختياري)' : 'Diagnosis in English (Optional)'}</label>
              <textarea
                rows={1}
                value={diagnosisEn}
                onChange={(e) => setDiagnosisEn(e.target.value)}
                placeholder="English translation of diagnosis..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm resize-none"
              />
            </div>

            {/* Doctor treatment directives */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">{t.doctorNotes} *</label>
              <textarea
                required
                rows={2}
                value={notesAr}
                onChange={(e) => setNotesAr(e.target.value)}
                placeholder={lang === 'ar' ? 'توجيهات الطبيب وإرشادات الوقاية للمدرسة والأهل...' : 'Treatment guidelines for parents and school officers...'}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm resize-none"
              />
            </div>

            {/* Physician name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">{t.doctor} *</label>
              <input
                type="text"
                required
                value={doctorNameAr}
                onChange={(e) => setDoctorNameAr(e.target.value)}
                placeholder={lang === 'ar' ? 'اسم الطبيب الاستشاري المعالج...' : 'Name of clinical physician...'}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl cursor-pointer shadow-md shadow-emerald-100 hover:shadow-lg transition-all duration-200 active:scale-95"
              id="upload-report-submit-btn"
            >
              {t.saveData}
            </button>
          </form>
        </div>
      </div>

      {/* Specialty and Doctor workload Recharts visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Specialty distribution */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>{t.departmentsDistribution}</span>
          </h3>

          <div className="h-64 w-full">
            {departmentChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={75}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} ${lang === 'ar' ? 'مراجعة' : 'cases'}`]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic py-16 text-center">{lang === 'ar' ? 'لا تتوفر إحصائيات كافية للمخطط' : 'No data currently loaded'}</p>
            )}
          </div>
        </div>

        {/* Doctor workload */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-emerald-600" />
            <span>{t.doctorLoad}</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={doctorData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} ${lang === 'ar' ? 'حالة' : 'patients'}`]} />
                <Bar dataKey="cases" fill="#0d9488" radius={[4, 4, 0, 0]}>
                  {doctorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
