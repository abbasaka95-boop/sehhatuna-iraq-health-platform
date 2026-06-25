/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Appointment, HealthReport, AnnouncementAlert, EmergencyAlert } from '../types';
import { translations, CURRENT_DATE_STRING } from '../data';
import { 
  Heart, Calendar, FileText, Bell, AlertTriangle, ShieldAlert,
  User, Plus, CheckCircle, Smartphone, Download, Sparkles, ChevronRight, Scale, Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, setDoc } from '../lib/firebase';

interface StudentDashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  reports: HealthReport[];
  announcements: AnnouncementAlert[];
  emergencies: EmergencyAlert[];
  setEmergencies: React.Dispatch<React.SetStateAction<EmergencyAlert[]>>;
  lang: 'ar' | 'en';
}

export default function StudentDashboard({
  students,
  setStudents,
  appointments,
  setAppointments,
  reports,
  announcements,
  emergencies,
  setEmergencies,
  lang,
}: StudentDashboardProps) {
  const t = translations[lang];

  // Active student ID for browsing (Ahmed Al-Otaibi is default STU-101)
  const [activeStudentId, setActiveStudentId] = useState<string>('STU-101');
  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  // Form states for booking an appointment
  const [dept, setDept] = useState<string>('');
  const [hospital, setHospital] = useState<string>('');
  const [doctor, setDoctor] = useState<string>('');
  const [appDate, setAppDate] = useState<string>('');
  const [appTime, setAppTime] = useState<string>('');
  const [appNotes, setAppNotes] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // PDF download simulation modal
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);

  // Filter appointments for active student
  const studentAppointments = appointments.filter(app => app.studentId === activeStudent.id);
  // Filter reports for active student
  const studentReports = reports.filter(rep => rep.studentId === activeStudent.id);

  // Simulated GPS SOS trigger
  const handleTriggerSOS = async () => {
    // Check if there is already an active SOS for this student
    const existingActive = emergencies.find(e => e.studentId === activeStudent.id && e.status === 'active');
    if (existingActive) return;

    // Create new SOS
    const newSOS: EmergencyAlert = {
      id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
      studentId: activeStudent.id,
      studentNameAr: activeStudent.nameAr,
      studentNameEn: activeStudent.nameEn,
      schoolNameAr: activeStudent.schoolNameAr,
      schoolNameEn: activeStudent.schoolNameEn,
      locationAr: lang === 'ar' ? 'فناء المدرسة / القاعة الرياضية' : 'School Yard / Sports Hall',
      locationEn: 'School Yard / Sports Hall',
      time: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'active',
      descriptionAr: lang === 'ar' 
        ? 'حالة طارئة حرجة مرسلة عبر الساعة الذكية للطالب - استشعار اضطراب نبضات القلب وصعوبة التنفس.' 
        : 'Critical emergency beacon broadcasted from student smart wearable device - rapid pulse detected.',
      descriptionEn: 'Critical emergency beacon broadcasted from student smart wearable device - rapid pulse detected.',
      phone: activeStudent.parentPhone,
    };

    try {
      await setDoc(doc(db, 'emergencies', newSOS.id), newSOS);
    } catch (err) {
      console.error("Firebase error saving SOS:", err);
    }

    // Update student status to emergency
    setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, status: 'emergency' } : s));
    setEmergencies(prev => [newSOS, ...prev]);

    // Optional: play browser sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      // Audio context might be blocked by browser policy, ignore
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dept || !hospital || !doctor || !appDate || !appTime) return;

    const newApp: Appointment = {
      id: `APP-${Math.floor(100 + Math.random() * 900)}`,
      studentId: activeStudent.id,
      studentNameAr: activeStudent.nameAr,
      studentNameEn: activeStudent.nameEn,
      departmentAr: lang === 'ar' ? dept : `${dept} Specialty`,
      departmentEn: lang === 'en' ? dept : `Pediatric ${dept}`,
      date: appDate,
      time: appTime,
      status: 'pending',
      hospitalNameAr: lang === 'ar' ? hospital : `${hospital} Hospital`,
      hospitalNameEn: lang === 'en' ? hospital : `${hospital} Health Center`,
      doctorNameAr: lang === 'ar' ? doctor : `Dr. ${doctor}`,
      doctorNameEn: lang === 'en' ? doctor : `Dr. ${doctor}`,
      notesAr: appNotes,
      notesEn: appNotes,
    };

    try {
      await setDoc(doc(db, 'appointments', newApp.id), newApp);
    } catch (err) {
      console.error("Firebase error saving appointment:", err);
    }

    setAppointments(prev => [newApp, ...prev]);
    setBookingSuccess(true);
    
    // Clear form
    setDept('');
    setHospital('');
    setDoctor('');
    setAppDate('');
    setAppTime('');
    setAppNotes('');

    setTimeout(() => {
      setBookingSuccess(false);
    }, 4000);
  };

  // Simulate PDF download
  const triggerPdfDownload = (report: HealthReport) => {
    setDownloadingReportId(report.id);
    setTimeout(() => {
      setDownloadingReportId(null);
      // Create printable summary
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Sehhatuna Health Report - ${report.id}</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; direction: ${lang === 'ar' ? 'rtl' : 'ltr'}; }
                .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; text-align: center; }
                .logo { color: #059669; font-size: 28px; font-weight: bold; margin-bottom: 5px; }
                .sub { color: #666; font-size: 14px; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; }
                .card h3 { margin-top: 0; color: #065f46; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
                .footer { margin-top: 50px; font-size: 12px; color: #9ca3af; text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 20px; }
                .stamp { text-align: right; margin-top: 40px; font-weight: bold; color: #065f46; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">صحتي+ • MyHealth+</div>
                <div class="sub">التقرير الطبي الرسمي الموثق المربوط بالصحة المدرسية في العراق</div>
              </div>
              <div class="grid">
                <div class="card">
                  <h3>بيانات الطالب / Student Details</h3>
                  <p><strong>الاسم / Name:</strong> ${lang === 'ar' ? report.studentNameAr : report.studentNameEn}</p>
                  <p><strong>رقم الهوية:</strong> ${activeStudent.nationalId}</p>
                  <p><strong>المدرسة / School:</strong> ${lang === 'ar' ? activeStudent.schoolNameAr : activeStudent.schoolNameEn}</p>
                  <p><strong>الصف / Grade:</strong> ${lang === 'ar' ? activeStudent.gradeAr : activeStudent.gradeEn}</p>
                </div>
                <div class="card">
                  <h3>بيانات الفحص / Diagnostic Details</h3>
                  <p><strong>رقم التقرير / Report ID:</strong> ${report.id}</p>
                  <p><strong>نوع التحليل:</strong> ${lang === 'ar' ? report.typeAr : report.typeEn}</p>
                  <p><strong>التاريخ / Date:</strong> ${report.date}</p>
                  <p><strong>المستشفى / Hospital:</strong> ${lang === 'ar' ? report.hospitalNameAr : report.hospitalNameEn}</p>
                  <p><strong>الطبيب / Doctor:</strong> ${lang === 'ar' ? report.doctorNameAr : report.doctorNameEn}</p>
                </div>
              </div>
              <div class="card" style="margin-bottom: 30px;">
                <h3>التشخيص الطبي / Diagnosis</h3>
                <p>${lang === 'ar' ? report.diagnosisAr : report.diagnosisEn}</p>
              </div>
              <div class="card">
                <h3>إرشادات وتوجيهات الطبيب / Medical Directives</h3>
                <p>${lang === 'ar' ? report.notesAr : report.notesEn}</p>
              </div>
              <div class="stamp">
                <p>مختوم وموثق إلكترونياً من قبل الإدارة الطبية لمنصة صحتي+</p>
                <p>Signature: Digital Verified MD</p>
              </div>
              <div class="footer">
                <p>هذا التقرير تم إصداره بصفة رسمية وموثوقة من النظام الموحد لربط المدارس والمستشفيات التخصصية.</p>
                <p>MyHealth+ Integrated School Health Network 2026. Official electronic diagnostic dossier.</p>
              </div>
              <script>window.print();</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }, 1000);
  };

  return (
    <div className="w-full flex flex-col gap-6" id="student-portal-container">
      {/* Top Welcome Panel with Parent Account Switcher */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md hover:shadow-slate-100 transition-all duration-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xl shadow-inner shadow-emerald-100 flex-shrink-0">
            {activeStudent.nameAr[0]}
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-sans tracking-wide uppercase">
              {lang === 'ar' ? 'الملف الصحي للطلاب الموحد' : 'Unified Student Dossier'}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mt-1.5">
              {lang === 'ar' ? `مرحباً، ${activeStudent.nameAr} 👋` : `Welcome, ${activeStudent.nameEn} 👋`}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-semibold font-sans">
              {lang === 'ar' 
                ? `رقم الهوية: ${activeStudent.nationalId} | مدرسة: ${activeStudent.schoolNameAr}` 
                : `National ID: ${activeStudent.nationalId} | School: ${activeStudent.schoolNameEn}`
              }
            </p>
          </div>
        </div>

        {/* Parent Multi-Child Quick Switcher */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="text-right sm:text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {lang === 'ar' ? 'متابعة الأبناء (بوابة ولي الأمر)' : 'Parent Guardian Switcher'}
            </p>
            <p className="text-xs font-bold text-slate-700">
              {lang === 'ar' ? `محمود العتيبي / خالد الدوسري` : `Guardian Account Portal`}
            </p>
          </div>
          <select
            value={activeStudentId}
            onChange={(e) => setActiveStudentId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-sans font-medium focus:ring-2 focus:ring-emerald-500 outline-none w-full sm:w-48 cursor-pointer shadow-sm"
            id="parent-child-dropdown"
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {lang === 'ar' ? s.nameAr : s.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid Layout: Health Card & SOS Beacon vs Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student Health Card & SOS Wearable Panel */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Health Card */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col gap-5 relative overflow-hidden">
            {/* Subtle medical cross logo in background */}
            <div className="absolute -bottom-8 -right-8 text-emerald-500/5 pointer-events-none">
              <Heart className="w-48 h-48 fill-emerald-500/5" />
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600" />
                <span>{lang === 'ar' ? 'بطاقة الحالة الصحية الذكية' : 'Smart Health Status Card'}</span>
              </h3>
              
              {/* Status Badge */}
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full border shadow-sm flex items-center gap-1 ${
                activeStudent.status === 'good'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : activeStudent.status === 'review'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-red-50 text-red-700 border-red-200 animate-pulse'
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  activeStudent.status === 'good' 
                    ? 'bg-emerald-500' 
                    : activeStudent.status === 'review' 
                      ? 'bg-amber-500' 
                      : 'bg-red-500 animate-ping'
                }`} />
                {t[`status_${activeStudent.status}`]}
              </span>
            </div>

            {/* Vital Signs Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.bloodType}</p>
                <p className="text-base font-black text-slate-800 mt-1 font-mono">{activeStudent.bloodType}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.weight}</p>
                <p className="text-base font-black text-slate-800 mt-1 font-mono">{activeStudent.weight}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.height}</p>
                <p className="text-base font-black text-slate-800 mt-1 font-mono">{activeStudent.height}</p>
              </div>
            </div>

            {/* Bio Details List */}
            <div className="flex flex-col gap-3.5 text-xs text-slate-700 mt-2">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">{t.grade}</span>
                <span className="font-semibold text-slate-800">{lang === 'ar' ? activeStudent.gradeAr : activeStudent.gradeEn}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">{t.age}</span>
                <span className="font-semibold text-slate-800">{activeStudent.age} {lang === 'ar' ? 'سنة' : 'Years'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">{t.parentName}</span>
                <span className="font-semibold text-slate-800">{lang === 'ar' ? activeStudent.parentNameAr : activeStudent.parentNameEn}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-slate-400 font-medium">{t.parentPhone}</span>
                <span className="font-mono font-semibold text-slate-800">{activeStudent.parentPhone}</span>
              </div>
            </div>

            {/* Chronic Conditions & Allergies */}
            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 mt-1">
              <p className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{t.chronicDiseases}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(lang === 'ar' ? activeStudent.chronicDiseasesAr : activeStudent.chronicDiseasesEn).length > 0 ? (
                  (lang === 'ar' ? activeStudent.chronicDiseasesAr : activeStudent.chronicDiseasesEn).map((d, i) => (
                    <span key={i} className="bg-rose-100/80 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-200">
                      {d}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">{t.noChronic}</span>
                )}
              </div>
            </div>

            {/* Received Vaccinations */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{t.vaccinations}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(lang === 'ar' ? activeStudent.vaccinationsAr : activeStudent.vaccinationsEn).length > 0 ? (
                  (lang === 'ar' ? activeStudent.vaccinationsAr : activeStudent.vaccinationsEn).map((v, i) => (
                    <span key={i} className="bg-emerald-100/60 text-emerald-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200">
                      {v}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">{t.noVaccines}</span>
                )}
              </div>
            </div>
          </div>

          {/* Smart Wearable SOS Panic Trigger - Dark Bento Highlight Card */}
          <div className="bg-[#0F172A] text-slate-100 rounded-[2rem] p-6 md:p-8 border border-slate-800 shadow-md relative overflow-hidden">
            {/* Blinking red ring */}
            <div className="absolute top-5 right-5 h-3 w-3 rounded-full bg-red-500 animate-ping" />

            <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2 mb-2">
              <Smartphone className="w-5 h-5 text-red-500 animate-bounce" />
              <span>{lang === 'ar' ? 'الساعة الطبية الذكية SOS' : 'Smart Watch SOS Panic Trigger'}</span>
            </h3>
            
            <p className="text-xs text-slate-300 font-sans leading-relaxed mb-4">
              {lang === 'ar'
                ? 'محاكاة لزر الطوارئ SOS المدمج في ساعة الطالب. عند الضغط عليه، يرسل إحداثيات GPS ونبضات القلب مباشرة إلى غرف طوارئ المستشفى والمدرسة والأسرة.'
                : 'Simulate the emergency SOS button on the student’s smart watch. Triggering it uploads GPS telemetry directly to hospital triage rooms.'
              }
            </p>

            <button
              onClick={handleTriggerSOS}
              disabled={activeStudent.status === 'emergency'}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs shadow-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                activeStudent.status === 'emergency'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-700'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/30 hover:shadow-lg'
              }`}
              id="sos-trigger-panic-btn"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>
                {activeStudent.status === 'emergency'
                  ? (lang === 'ar' ? 'الاستغاثة نشطة بالفعل!' : 'SOS Active - Rescue En Route!')
                  : (lang === 'ar' ? 'محاكاة ضغط زر SOS الاستغاثة' : 'Press to Trigger SOS Emergency')
                }
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Book Appointment Form & Clinical Diagnostics Archive */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Interactive Scheduling Form */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'ar' ? 'حجز موعد طبي جديد (عيادات الصحة المدرسية)' : 'Book School Health Clinic Appointment'}</span>
            </h3>

            <AnimatePresence>
              {bookingSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl mt-4 flex items-center gap-3 font-sans font-semibold shadow-sm"
                  id="booking-success-msg"
                >
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{t.addAppointmentSuccess}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleBookAppointment} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 font-sans">
              
              {/* Medical specialty */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">{t.selectDept} *</label>
                <select
                  required
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-sm"
                >
                  <option value="">{lang === 'ar' ? '-- اختر القسم الطبي --' : '-- Select Specialty --'}</option>
                  <option value="الطب العام والأطفال">{lang === 'ar' ? 'الطب العام والأطفال' : 'General & Pediatric Medicine'}</option>
                  <option value="طب الأسنان الوقائي">{lang === 'ar' ? 'طب الأسنان الوقائي' : 'Preventive Dentistry'}</option>
                  <option value="طب العيون والمنتظر">{lang === 'ar' ? 'طب العيون والمنتظر' : 'Ophthalmology & Vision Clinic'}</option>
                  <option value="الأنف والأذن والحنجرة">{lang === 'ar' ? 'الأنف والأذن والحنجرة' : 'ENT Specialty'}</option>
                  <option value="الغدد الصماء والسكري">{lang === 'ar' ? 'الغدد الصماء والسكري' : 'Endocrinology & Diabetes'}</option>
                </select>
              </div>

              {/* Clinic Hospital */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">{t.selectHospital} *</label>
                <select
                  required
                  value={hospital}
                  onChange={(e) => setHospital(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-sm"
                >
                  <option value="">{lang === 'ar' ? '-- اختر المستشفى المعتمد --' : '-- Select Healthcare Center --'}</option>
                  <option value="مستشفى السعدي الأهلي">{lang === 'ar' ? 'مستشفى السعدي الأهلي' : 'Al-Saadi Private Hospital'}</option>
                  <option value="مستشفى الموسوي الأهلي">{lang === 'ar' ? 'مستشفى الموسوي الأهلي' : 'Al-Moussawi Private Hospital'}</option>
                  <option value="مستشفى دار الشفاء الأهلية">{lang === 'ar' ? 'مستشفى دار الشفاء الأهلية' : 'Dar Al-Shifa Hospital'}</option>
                </select>
              </div>

              {/* Doctor */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">{t.selectDoctor} *</label>
                <select
                  required
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-sm"
                >
                  <option value="">{lang === 'ar' ? '-- اختر الطبيب الاستشاري --' : '-- Select Consultant --'}</option>
                  <option value="د. ميثم الموسوي">{lang === 'ar' ? 'د. ميثم الموسوي (العيون)' : 'Dr. Maitham Al-Moussawi (Ophthalmology)'}</option>
                  <option value="د. علي السعدي">{lang === 'ar' ? 'د. علي السعدي (السكري والأطفال)' : 'Dr. Ali Al-Saadi (Diabetes)'}</option>
                  <option value="د. عباس التميمي">{lang === 'ar' ? 'د. عباس التميمي (الأسنان)' : 'Dr. Abbas Al-Tamimi (Dentistry)'}</option>
                  <option value="د. زينب الجادري">{lang === 'ar' ? 'د. زينب الجادري (عام وأطفال)' : 'Dr. Zainab Al-Jaderi (General)'}</option>
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">{t.selectDate} *</label>
                <input
                  type="date"
                  required
                  min={CURRENT_DATE_STRING}
                  value={appDate}
                  onChange={(e) => setAppDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                />
              </div>

              {/* Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">{t.selectTime} *</label>
                <select
                  required
                  value={appTime}
                  onChange={(e) => setAppTime(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer shadow-sm"
                >
                  <option value="">{lang === 'ar' ? '-- اختر توقيت الموعد --' : '-- Select Session --'}</option>
                  <option value="08:30 AM">08:30 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="01:15 PM">01:15 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                </select>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-600">{t.notesLabel}</label>
                <textarea
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  rows={2}
                  placeholder={lang === 'ar' ? 'اكتب أي أعراض يعاني منها الطالب أو توجيهات إضافية...' : 'Write down current symptoms or special medical requests...'}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm resize-none"
                />
              </div>

              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-6 rounded-2xl cursor-pointer shadow-md shadow-emerald-100 hover:shadow-lg transition-all duration-200 active:scale-95"
                  id="submit-book-btn"
                >
                  {t.confirmBooking}
                </button>
              </div>
            </form>
          </div>

          {/* Active Booked Appointments List */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>{t.appointments} ({studentAppointments.length})</span>
            </h3>

            {studentAppointments.length > 0 ? (
              <div className="flex flex-col gap-3 mt-4" id="appointments-list">
                {studentAppointments.map((app) => (
                  <div key={app.id} className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-slate-300 transition-all duration-200">
                    <div className="flex flex-col gap-1">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border w-fit ${
                        app.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : app.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : app.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                      }`}>
                        {lang === 'ar' 
                          ? (app.status === 'confirmed' ? 'مؤكد ومثبت' : app.status === 'pending' ? 'بانتظار التأكيد' : app.status === 'cancelled' ? 'ملغي' : 'مكتمل')
                          : app.status.toUpperCase()
                        }
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">
                        {lang === 'ar' ? app.departmentAr : app.departmentEn}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-sans">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-700">{lang === 'ar' ? app.doctorNameAr : app.doctorNameEn}</span>
                        <span>•</span>
                        <span>{lang === 'ar' ? app.hospitalNameAr : app.hospitalNameEn}</span>
                      </p>
                      {app.notesAr && (
                        <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-100/50 p-2 rounded-lg border border-slate-250/50">
                          {lang === 'ar' ? app.notesAr : app.notesEn}
                        </p>
                      )}
                    </div>

                    <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                      <div className="font-sans">
                        <p className="text-xs font-bold text-slate-800">{app.date}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{app.time}</p>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/40 px-2 py-0.5 rounded-md border border-emerald-200/50 mt-1">
                        {app.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4 italic text-center py-6">{t.noAppointments}</p>
            )}
          </div>

          {/* Clinical Diagnostic Reports Archive */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{t.reportsAndLabs}</span>
            </h3>

            {studentReports.length > 0 ? (
              <div className="flex flex-col gap-4 mt-4" id="clinical-reports-list">
                {studentReports.map((rep) => (
                  <div key={rep.id} className="border border-slate-200/80 p-5 rounded-2xl bg-white flex flex-col gap-3.5 shadow-sm hover:border-slate-300 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <span className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200 font-sans">
                          {lang === 'ar' ? rep.typeAr : rep.typeEn}
                        </span>
                        <h4 className="font-bold text-slate-800 text-sm mt-1.5 flex items-center gap-1.5">
                          <span>{lang === 'ar' ? rep.hospitalNameAr : rep.hospitalNameEn}</span>
                        </h4>
                      </div>
                      <div className="text-right sm:text-right font-sans">
                        <p className="text-xs font-semibold text-slate-800">{rep.date}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-0.5 font-mono">{rep.id}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-150 text-xs text-slate-700 flex flex-col gap-1 leading-relaxed">
                      <p className="font-bold text-slate-900">{lang === 'ar' ? 'التشخيص الطبي:' : 'Clinical Diagnosis:'}</p>
                      <p className="text-slate-700">{lang === 'ar' ? rep.diagnosisAr : rep.diagnosisEn}</p>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-slate-100">
                      <p className="font-sans text-slate-500">
                        {lang === 'ar' ? 'بإشراف د.' : 'Conducted by Dr.'} <span className="font-bold text-slate-800">{lang === 'ar' ? rep.doctorNameAr : rep.doctorNameEn}</span>
                      </p>

                      {/* Download Simulated Official PDF Button */}
                      <button
                        onClick={() => triggerPdfDownload(rep)}
                        disabled={downloadingReportId === rep.id}
                        className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-all duration-200 shadow-sm cursor-pointer min-h-[38px] active:scale-95 disabled:cursor-not-allowed"
                        id={`download-pdf-btn-${rep.id}`}
                      >
                        {downloadingReportId === rep.id ? (
                          <>
                            <span className="h-3.5 w-3.5 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
                            <span>{lang === 'ar' ? 'جاري التصدير...' : 'Exporting...'}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            <span>{t.downloadPdf}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4 italic text-center py-6">{t.noReports}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
