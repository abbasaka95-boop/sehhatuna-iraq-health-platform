/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, Appointment, AnnouncementAlert, HospitalEntity, HealthReport, EmergencyAlert, SchoolEntity, UserAccount } from '../types';
import { translations, CURRENT_DATE_STRING } from '../data';
import { 
  LayoutDashboard, Coins, Users, Calendar, AlertCircle, Heart, Bell, 
  Clock, ShieldCheck, CheckCircle2, DollarSign, RefreshCw, Star, HelpCircle,
  Plus, Trash2, Edit3, Lock, Shield, ToggleLeft, ToggleRight, Activity, FileText,
  MapPin, GraduationCap, Percent, Check, AlertTriangle, Eye, Settings, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, doc, setDoc, deleteDoc } from '../lib/firebase';

interface UnifiedDashboardProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  reports: HealthReport[];
  setReports: React.Dispatch<React.SetStateAction<HealthReport[]>>;
  emergencies: EmergencyAlert[];
  announcements: AnnouncementAlert[];
  hospitals: HospitalEntity[];
  setHospitals: React.Dispatch<React.SetStateAction<HospitalEntity[]>>;
  schools: SchoolEntity[];
  setSchools: React.Dispatch<React.SetStateAction<SchoolEntity[]>>;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  lang: 'ar' | 'en';
}

export default function UnifiedDashboard({
  students,
  setStudents,
  appointments,
  setAppointments,
  reports,
  setReports,
  emergencies,
  announcements,
  hospitals,
  setHospitals,
  schools,
  setSchools,
  users,
  setUsers,
  lang,
}: UnifiedDashboardProps) {
  const t = translations[lang];

  // Selected student id for quick renewal simulation
  const [renewingStudentId, setRenewingStudentId] = useState<string | null>(null);
  const [successRenewMessage, setSuccessRenewMessage] = useState<string>('');

  // 1. Initial State Data (Interactive Entities managed inside)
  const [activityLogs, setActivityLogs] = useState<any[]>([
    {
      id: 'LOG-001',
      type: 'sos',
      msgAr: 'نداء استغاثة عاجل (SOS) للطالب "علي حسن" في مدرسة السياب بسبب ضيق تنفس حاد. تم التوجيه الطبي الفوري للمستشفى والاتصال بولي أمره.',
      msgEn: 'Urgent SOS distress alert for "Ali Hassan" at Al-Sayyab School due to asthma outbreak. Hospital paramedics notified.',
      timestamp: 'منذ دقيقة',
      initiatorAr: 'مدرسة السياب الابتدائية',
      initiatorEn: 'Al-Sayyab School'
    },
    {
      id: 'LOG-002',
      type: 'report',
      msgAr: 'تم رفع تقرير فحص الدم الدوري للطالبة "فاطمة ميثم" من قبل مستشفى السعدي الأهلي بنجاح.',
      msgEn: 'Periodic blood checkup report uploaded for student "Fatima Maitham" by Al-Saadi Hospital.',
      timestamp: 'منذ ساعتين',
      initiatorAr: 'مستشفى السعدي الأهلي',
      initiatorEn: 'Al-Saadi Hospital'
    },
    {
      id: 'LOG-003',
      type: 'appointment',
      msgAr: 'تم تأكيد موعد الكشف السريري القادم للطالب "أحمد ساجد" في عيادات مستشفى الموسوي التخصصي.',
      msgEn: 'Upcoming clinical checkup appointment confirmed for student "Ahmed Sajid" at Al-Moussawi Specialist Clinics.',
      timestamp: 'منذ 3 ساعات',
      initiatorAr: 'مستشفى الموسوي العام',
      initiatorEn: 'Al-Moussawi Hospital'
    },
    {
      id: 'LOG-004',
      type: 'student',
      msgAr: 'تم تسجيل ملف طبي متكامل للطالب "علي حسن" بنجاح وربطه بـمدرسة النور ومستشفى البصرة العام.',
      msgEn: 'Comprehensive medical folder initialized for student "Ali Hassan", linked to Al-Noor School & Basra General Hospital.',
      timestamp: 'منذ 5 ساعات',
      initiatorAr: 'مدرسة النور الابتدائية',
      initiatorEn: 'Al-Noor School'
    },
    {
      id: 'LOG-005',
      type: 'school',
      msgAr: 'تم تفعيل حساب مدرسة السياب الابتدائية في المنصة وإرسال بيانات الاعتماد والترخيص عبر البريد الإلكتروني.',
      msgEn: 'Al-Sayyab Primary School account activated. Authorization parameters successfully dispatched via SMTP gateway.',
      timestamp: 'أمس',
      initiatorAr: 'لوحة تحكم الأدمن',
      initiatorEn: 'Admin Portal'
    },
    {
      id: 'LOG-006',
      type: 'hospital',
      msgAr: 'تم إضافة وتوثيق "مستشفى الموسوي العام" ضمن قائمة مقدمي الرعاية الصحية المعتمدين وتفعيل صلاحيات حجز المواعيد.',
      msgEn: 'Hospital entity "Al-Moussawi General" successfully validated and added to accredited health providers.',
      timestamp: 'منذ يومين',
      initiatorAr: 'لوحة تحكم الأدمن',
      initiatorEn: 'Admin Portal'
    }
  ]);

  const [activeSosNotification, setActiveSosNotification] = useState<boolean>(true);

  // Active Tab: 'overview' | 'schools_hospitals' | 'students_permissions' | 'announcements_broad'
  const [activeTab, setActiveTab] = useState<'overview' | 'schools_hospitals' | 'students_permissions' | 'announcements_broad'>('overview');

  // Sub Tabs for entities or user listings
  const [entitySubTab, setEntitySubTab] = useState<'schools' | 'hospitals'>('schools');
  const [userSubTab, setUserSubTab] = useState<'students' | 'users'>('students');

  // 2. Forms Toggles & Dynamic inputs
  // Hospital Form State
  const [showHospitalForm, setShowHospitalForm] = useState(false);
  const [editingHospitalId, setEditingHospitalId] = useState<string | null>(null);
  const [hNameAr, setHNameAr] = useState('');
  const [hNameEn, setHNameEn] = useState('');
  const [hLocAr, setHLocAr] = useState('');
  const [hLocEn, setHLocEn] = useState('');
  const [hDocsAr, setHDocsAr] = useState('');
  const [hDocsEn, setHDocsEn] = useState('');
  const [hDeptsAr, setHDeptsAr] = useState('');
  const [hDeptsEn, setHDeptsEn] = useState('');
  const [hEmail, setHEmail] = useState('');
  const [hPassword, setHPassword] = useState('');
  const [hDoctorsCount, setHDoctorsCount] = useState<number>(10);
  const [hStatus, setHStatus] = useState<'active' | 'suspended' | 'pending'>('active');
  const [hPermUpload, setHPermUpload] = useState(true);
  const [hPermAppointments, setHPermAppointments] = useState(true);
  const [hPermAlerts, setHPermAlerts] = useState(true);
  const [hPermHistory, setHPermHistory] = useState(true);
  const [hospitalSuccessAlert, setHospitalSuccessAlert] = useState<{ show: boolean; msgAr: string; msgEn: string } | null>(null);

  // School Form State
  const [showSchoolForm, setShowSchoolForm] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [sNameAr, setSNameAr] = useState('');
  const [sNameEn, setSNameEn] = useState('');
  const [sCount, setSCount] = useState(100);
  const [sGradesAr, setSGradesAr] = useState('');
  const [sGradesEn, setSGradesEn] = useState('');
  const [sLocAr, setSLocAr] = useState('');
  const [sLocEn, setSLocEn] = useState('');
  const [sEmail, setSEmail] = useState('');
  const [sPassword, setSPassword] = useState('');
  const [sStatus, setSStatus] = useState<'active' | 'suspended' | 'pending'>('active');
  const [sPermRegister, setSPermRegister] = useState(true);
  const [sPermSend, setSPermSend] = useState(true);
  const [sPermReceive, setSPermReceive] = useState(true);
  const [schoolSuccessAlert, setSchoolSuccessAlert] = useState<{ show: boolean; msgAr: string; msgEn: string } | null>(null);

  // Student Form State
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [stNameAr, setStNameAr] = useState('');
  const [stNameEn, setStNameEn] = useState('');
  const [stAge, setStAge] = useState(12);
  const [stGradeAr, setStGradeAr] = useState('');
  const [stGradeEn, setStGradeEn] = useState('');
  const [stSchoolAr, setStSchoolAr] = useState('');
  const [stSchoolEn, setStSchoolEn] = useState('');
  const [stNationalId, setStNationalId] = useState('');
  const [stParentAr, setStParentAr] = useState('');
  const [stParentEn, setStParentEn] = useState('');
  const [stParentPhone, setStParentPhone] = useState('');
  const [stBloodType, setStBloodType] = useState('O+');
  const [stChronicAr, setStChronicAr] = useState('');
  const [stChronicEn, setStChronicEn] = useState('');
  const [stVaccAr, setStVaccAr] = useState('');
  const [stVaccEn, setStVaccEn] = useState('');
  const [stHospitalAr, setStHospitalAr] = useState('');
  const [stHospitalEn, setStHospitalEn] = useState('');
  const [stParentEmail, setStParentEmail] = useState('');
  const [studentSuccessAlert, setStudentSuccessAlert] = useState<{ show: boolean; msgAr: string; msgEn: string } | null>(null);

  // User Form State
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('');
  const [uRole, setURole] = useState<'hospital' | 'school' | 'student' | 'admin'>('student');
  const [uPermissions, setUPermissions] = useState<'read' | 'edit' | 'manage'>('read');

  // Announcement Form State
  const [annTitleAr, setAnnTitleAr] = useState('');
  const [annTitleEn, setAnnTitleEn] = useState('');
  const [annDescAr, setAnnDescAr] = useState('');
  const [annDescEn, setAnnDescEn] = useState('');
  const [annType, setAnnType] = useState<'vaccine' | 'campaign' | 'general'>('general');
  const [annSchoolAr, setAnnSchoolAr] = useState('إدارة المنصة الموحدة');
  const [annSchoolEn, setAnnSchoolEn] = useState('Unified Platform Management');

  // 3. Subscription Helper calculations
  const totalRevenue = students.reduce((sum, s) => sum + s.subscriptionPrice, 0);
  const getDaysRemaining = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr);
    const today = new Date(CURRENT_DATE_STRING);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Perform subscription renewal simulation
  const handleRenewSubscription = (studentId: string) => {
    setRenewingStudentId(studentId);
    setTimeout(() => {
      const today = new Date(CURRENT_DATE_STRING);
      today.setFullYear(today.getFullYear() + 1);
      const newExpiryStr = today.toISOString().split('T')[0];

      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            subscriptionExpiry: newExpiryStr,
            subscriptionStatus: 'active',
            subscriptionPrice: s.subscriptionPrice + 150000
          };
        }
        return s;
      }));

      const targetSt = students.find(s => s.id === studentId);
      const studentName = targetSt?.nameAr || '';
      const studentNameEn = targetSt?.nameEn || 'Student';
      setActivityLogs(prev => [
        {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'subscription',
          msgAr: `تم سداد الرسوم وتجديد الاشتراك السنوي للطالب [${studentName}] بنجاح لمدة عام إضافي.`,
          msgEn: `Yearly subscription fee renewed for student [${studentNameEn}] for another calendar year.`,
          timestamp: 'الآن',
          initiatorAr: 'بوابة الدفع الإلكتروني',
          initiatorEn: 'Payment Gateway'
        },
        ...prev
      ]);

      setSuccessRenewMessage(lang === 'ar' 
        ? `تم معالجة الدفعة السنوية بنجاح! تم تجديد اشتراك الطالب [${studentName}] وتثبيته كنشاط ساري باللون الأخضر لمدة عام.` 
        : `Transaction authorized! Subscription extended to Active Green status for 1 year.`
      );
      setRenewingStudentId(null);
      setTimeout(() => {
        setSuccessRenewMessage('');
      }, 5000);
    }, 1200);
  };

  // 4. Entity Mutators (Schools & Hospitals)
  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hNameAr) return;

    // Auto-generate English values if not provided
    const finalNameEn = hNameEn || hNameAr;
    const finalLocAr = hLocAr || 'البصرة';
    const finalLocEn = hLocEn || hLocAr || 'Basra';

    const docArArray = hDocsAr.split(',').map(s => s.trim()).filter(Boolean);
    const docEnArray = hDocsEn.split(',').map(s => s.trim()).filter(Boolean);
    const finalDocArArray = docArArray.length ? docArArray : ['د. طبيب جديد'];
    const finalDocEnArray = docEnArray.length ? docEnArray : (docArArray.length ? docArArray : ['Dr. New Physician']);

    const deptArArray = hDeptsAr.split(',').map(s => s.trim()).filter(Boolean);
    const deptEnArray = hDeptsEn.split(',').map(s => s.trim()).filter(Boolean);
    const finalDeptArArray = deptArArray.length ? deptArArray : ['الطب العام'];
    const finalDeptEnArray = deptEnArray.length ? deptEnArray : (deptArArray.length ? deptArArray : ['General Medicine']);

    // Build permissions list
    const activePerms: string[] = [];
    if (hPermUpload) activePerms.push('upload_reports');
    if (hPermAppointments) activePerms.push('manage_appointments');
    if (hPermAlerts) activePerms.push('send_alerts');
    if (hPermHistory) activePerms.push('view_history');

    // Auto-generate password if blank
    const finalPassword = hPassword || `sehati_${Math.floor(1000 + Math.random() * 9000)}`;
    const finalEmail = hEmail || `${finalNameEn.toLowerCase().replace(/[^a-z0-9]/g, '')}@sehati.com`;

    if (editingHospitalId) {
      const updated = {
        nameAr: hNameAr,
        nameEn: finalNameEn,
        locationAr: finalLocAr,
        locationEn: finalLocEn,
        doctorsAr: finalDocArArray,
        doctorsEn: finalDocEnArray,
        departmentsAr: finalDeptArArray,
        departmentsEn: finalDeptEnArray,
        email: finalEmail,
        password: finalPassword,
        doctorsCount: hDoctorsCount,
        status: hStatus,
        permissions: activePerms,
      };

      try {
        await setDoc(doc(db, 'hospitals', editingHospitalId), updated, { merge: true });
      } catch (err) {
        console.error("Error updating hospital:", err);
      }

      setHospitals(prev => prev.map(h => h.id === editingHospitalId ? { ...h, ...updated } : h));

      setActivityLogs(prev => [
        {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'hospital',
          msgAr: `تم تحديث بيانات حساب المستشفى [${hNameAr}] وتعديل الصلاحيات الإدارية والتشغيلية الممنوحة له.`,
          msgEn: `Hospital [${finalNameEn}] configurations and authorized parameters updated by system admin.`,
          timestamp: 'الآن',
          initiatorAr: 'لوحة تحكم الأدمن',
          initiatorEn: 'Admin Portal'
        },
        ...prev
      ]);

      setHospitalSuccessAlert({
        show: true,
        msgAr: `تم تحديث بيانات حساب المستشفى [${hNameAr}] بنجاح!`,
        msgEn: `Hospital [${finalNameEn}] updated successfully!`
      });
      setTimeout(() => setHospitalSuccessAlert(null), 6000);

      setEditingHospitalId(null);
    } else {
      const generatedId = `HOS-${Math.floor(100 + Math.random() * 900)}`;
      const newHospital: HospitalEntity = {
        id: generatedId,
        nameAr: hNameAr,
        nameEn: finalNameEn,
        locationAr: finalLocAr,
        locationEn: finalLocEn,
        doctorsAr: finalDocArArray,
        doctorsEn: finalDocEnArray,
        departmentsAr: finalDeptArArray,
        departmentsEn: finalDeptEnArray,
        doctorsCount: hDoctorsCount,
        email: finalEmail,
        password: finalPassword,
        permissions: activePerms,
        status: hStatus,
        stats: {
          referredStudentsCount: 0,
          reportsCount: 0,
          appointmentsCount: 0
        }
      };

      try {
        await setDoc(doc(db, 'hospitals', generatedId), newHospital);
      } catch (err) {
        console.error("Error adding hospital:", err);
      }

      setHospitals(prev => [...prev, newHospital]);

      setActivityLogs(prev => [
        {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'hospital',
          msgAr: `تم إنشاء وتفعيل حساب المستشفى الجديد [${hNameAr}] ومنحه معرف المستشفى الشريك: ${generatedId}.`,
          msgEn: `New accredited hospital [${finalNameEn}] successfully authorized and registered under partner ID: ${generatedId}.`,
          timestamp: 'الآن',
          initiatorAr: 'لوحة تحكم الأدمن',
          initiatorEn: 'Admin Portal'
        },
        ...prev
      ]);

      setHospitalSuccessAlert({
        show: true,
        msgAr: `تم إنشاء حساب المستشفى [${hNameAr}] بنجاح داخل النظام! الرمز المعتمد: ${generatedId} • تم إرسال بريد تفعيل الحساب لـ [${finalEmail}] بكلمة مرور مؤقتة: [${finalPassword}].`,
        msgEn: `Hospital [${finalNameEn}] created successfully! Clinical ID: ${generatedId} • Activation email dispatched to [${finalEmail}] with temporary password: [${finalPassword}].`
      });
      setTimeout(() => setHospitalSuccessAlert(null), 10000);
    }

    // Reset Form
    setHNameAr(''); setHNameEn(''); setHLocAr(''); setHLocEn('');
    setHDocsAr(''); setHDocsEn(''); setHDeptsAr(''); setHDeptsEn('');
    setHEmail(''); setHPassword(''); setHDoctorsCount(10); setHStatus('active');
    setHPermUpload(true); setHPermAppointments(true); setHPermAlerts(true); setHPermHistory(true);
    setShowHospitalForm(false);
  };

  const handleEditHospital = (h: HospitalEntity) => {
    setEditingHospitalId(h.id);
    setHNameAr(h.nameAr);
    setHNameEn(h.nameEn);
    setHLocAr(h.locationAr);
    setHLocEn(h.locationEn);
    setHDocsAr(h.doctorsAr.join(', '));
    setHDocsEn(h.doctorsEn.join(', '));
    setHDeptsAr(h.departmentsAr.join(', '));
    setHDeptsEn(h.departmentsEn.join(', '));
    setHEmail(h.email || '');
    setHPassword(h.password || '');
    setHDoctorsCount(h.doctorsCount || 10);
    setHStatus(h.status || 'active');
    setHPermUpload(h.permissions.includes('upload_reports'));
    setHPermAppointments(h.permissions.includes('manage_appointments'));
    setHPermAlerts(h.permissions.includes('send_alerts'));
    setHPermHistory(h.permissions.includes('view_history'));
    setShowHospitalForm(true);
  };

  const handleDeleteHospital = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'hospitals', id));
    } catch (err) {
      console.error("Error deleting hospital:", err);
    }
    setHospitals(prev => prev.filter(h => h.id !== id));
  };

  const toggleHospitalStatus = async (id: string) => {
    const target = hospitals.find(h => h.id === id);
    if (!target) return;
    let nextStatus: 'active' | 'suspended' | 'pending' = 'active';
    if (target.status === 'active') nextStatus = 'suspended';
    else if (target.status === 'suspended') nextStatus = 'pending';
    else nextStatus = 'active';

    try {
      await setDoc(doc(db, 'hospitals', id), { status: nextStatus }, { merge: true });
    } catch (err) {
      console.error("Error toggling hospital status:", err);
    }

    setHospitals(prev => prev.map(h => {
      if (h.id === id) {
        return { ...h, status: nextStatus };
      }
      return h;
    }));
  };

  // Schools Mutators
  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sNameAr) return;

    const finalNameEn = sNameEn || sNameAr;
    const finalGradesAr = sGradesAr || 'الصف الأول - السادس';
    const finalGradesEn = sGradesEn || sGradesAr || 'Grade 1 - Grade 6';
    const finalLocAr = sLocAr || 'البصرة – حي الجامعة';
    const finalLocEn = sLocEn || sLocAr || 'Basra - University District';

    const activePerms: string[] = [];
    if (sPermRegister) activePerms.push('register_students');
    if (sPermSend) activePerms.push('send_reports');
    if (sPermReceive) activePerms.push('receive_alerts');

    const finalPassword = sPassword || `sehati_sch_${Math.floor(1000 + Math.random() * 9000)}`;
    const finalEmail = sEmail || `${finalNameEn.toLowerCase().replace(/[^a-z0-9]/g, '')}@sehati.com`;

    if (editingSchoolId) {
      const updated = {
        nameAr: sNameAr,
        nameEn: finalNameEn,
        studentCount: sCount,
        gradesAr: finalGradesAr,
        gradesEn: finalGradesEn,
        locationAr: finalLocAr,
        locationEn: finalLocEn,
        email: finalEmail,
        password: finalPassword,
        status: sStatus,
        permissions: activePerms,
      };

      try {
        await setDoc(doc(db, 'schools', editingSchoolId), updated, { merge: true });
      } catch (err) {
        console.error("Error updating school:", err);
      }

      setSchools(prev => prev.map(s => s.id === editingSchoolId ? {
        ...s,
        ...updated,
        stats: s.stats || {
          studentCount: sCount,
          reportsCount: 0,
          alertsCount: 0
        }
      } : s));
      setActivityLogs(prev => [
        {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'school',
          msgAr: `تم تحديث بيانات حساب المدرسة [${sNameAr}] وتعديل الطاقة الاستيعابية والصلاحيات الإدارية بنجاح.`,
          msgEn: `School [${finalNameEn}] configurations and active parameters updated by system admin.`,
          timestamp: 'الآن',
          initiatorAr: 'لوحة تحكم الأدمن',
          initiatorEn: 'Admin Portal'
        },
        ...prev
      ]);
      setSchoolSuccessAlert({
        show: true,
        msgAr: `تم تحديث بيانات حساب المدرسة [${sNameAr}] بنجاح!`,
        msgEn: `School [${finalNameEn}] updated successfully!`
      });
      setTimeout(() => setSchoolSuccessAlert(null), 6000);
      setEditingSchoolId(null);
    } else {
      const generatedId = `SCH-${Math.floor(300 + Math.random() * 699)}`;
      const newSchool: SchoolEntity = {
        id: generatedId,
        nameAr: sNameAr,
        nameEn: finalNameEn,
        studentCount: sCount,
        gradesAr: finalGradesAr,
        gradesEn: finalGradesEn,
        locationAr: finalLocAr,
        locationEn: finalLocEn,
        email: finalEmail,
        password: finalPassword,
        status: sStatus,
        permissions: activePerms,
        stats: {
          studentCount: sCount,
          reportsCount: Math.floor(Math.random() * 15) + 5,
          alertsCount: Math.floor(Math.random() * 8) + 2
        }
      };

      try {
        await setDoc(doc(db, 'schools', generatedId), newSchool);
      } catch (err) {
        console.error("Error adding school:", err);
      }

      setSchools(prev => [...prev, newSchool]);
      setActivityLogs(prev => [
        {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'school',
          msgAr: `تم تسجيل المدرسة الجديدة [${sNameAr}] في المنصة وإصدار ترخيص التشغيل بالرمز المعتمد: ${generatedId}.`,
          msgEn: `New school entity [${finalNameEn}] successfully authorized and registered with ID: ${generatedId}.`,
          timestamp: 'الآن',
          initiatorAr: 'لوحة تحكم الأدمن',
          initiatorEn: 'Admin Portal'
        },
        ...prev
      ]);
      setSchoolSuccessAlert({
        show: true,
        msgAr: `تم إنشاء حساب المدرسة [${sNameAr}] بنجاح داخل النظام! الرمز المعتمد: ${generatedId} • تم إرسال بريد تفعيل الحساب لـ [${finalEmail}] بكلمة مرور مؤقتة: [${finalPassword}] وتفعيل كافة الصلاحيات المحددة.`,
        msgEn: `School [${finalNameEn}] created successfully! Entity ID: ${generatedId} • Activation email dispatched to [${finalEmail}] with temporary password: [${finalPassword}].`
      });
      setTimeout(() => setSchoolSuccessAlert(null), 10000);
    }

    setSNameAr(''); setSNameEn(''); setSCount(100); setSGradesAr(''); setSGradesEn('');
    setSLocAr(''); setSLocEn(''); setSEmail(''); setSPassword(''); setSStatus('active');
    setSPermRegister(true); setSPermSend(true); setSPermReceive(true);
    setShowSchoolForm(false);
  };

  const handleEditSchool = (sch: SchoolEntity) => {
    setEditingSchoolId(sch.id);
    setSNameAr(sch.nameAr);
    setSNameEn(sch.nameEn);
    setSCount(sch.studentCount);
    setSGradesAr(sch.gradesAr);
    setSGradesEn(sch.gradesEn);
    setSLocAr(sch.locationAr || '');
    setSLocEn(sch.locationEn || '');
    setSEmail(sch.email || '');
    setSPassword(sch.password || '');
    setSStatus(sch.status || 'active');
    setSPermRegister(sch.permissions ? sch.permissions.includes('register_students') : true);
    setSPermSend(sch.permissions ? sch.permissions.includes('send_reports') : true);
    setSPermReceive(sch.permissions ? sch.permissions.includes('receive_alerts') : true);
    setShowSchoolForm(true);
  };

  const handleDeleteSchool = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'schools', id));
    } catch (err) {
      console.error("Error deleting school:", err);
    }
    setSchools(prev => prev.filter(s => s.id !== id));
  };

  const toggleSchoolStatus = async (id: string) => {
    const target = schools.find(s => s.id === id);
    if (!target) return;
    let nextStatus: 'active' | 'suspended' | 'pending' = 'active';
    if (target.status === 'active') nextStatus = 'suspended';
    else if (target.status === 'suspended') nextStatus = 'pending';
    else nextStatus = 'active';

    try {
      await setDoc(doc(db, 'schools', id), { status: nextStatus }, { merge: true });
    } catch (err) {
      console.error("Error toggling school status:", err);
    }

    setSchools(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  // 5. Students Mutators & Association
  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stNameAr || !stSchoolAr) return;

    const finalStNameEn = stNameEn || stNameAr;
    const finalGradeAr = stGradeAr || 'الصف السادس';
    const finalGradeEn = stGradeEn || stGradeAr || 'Grade 6';
    const finalParentAr = stParentAr || 'ولي أمر الطالب';
    const finalParentEn = stParentEn || stParentAr || 'Student Guardian';

    const chrAr = stChronicAr ? stChronicAr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const chrEn = stChronicEn ? stChronicEn.split(',').map(s => s.trim()).filter(Boolean) : chrAr;
    const vacAr = stVaccAr ? stVaccAr.split(',').map(s => s.trim()).filter(Boolean) : ['الحصبة', 'شلل الأطفال'];
    const vacEn = stVaccEn ? stVaccEn.split(',').map(s => s.trim()).filter(Boolean) : (stVaccAr ? stVaccAr.split(',').map(s => s.trim()).filter(Boolean) : ['Measles', 'Polio']);

    // Find school details to get nameEn matching nameAr
    const matchingSchool = schools.find(sch => sch.nameAr === stSchoolAr);
    const resolvedSchoolEn = matchingSchool ? matchingSchool.nameEn : 'Partner School';

    // Find hospital details
    const matchingHospital = hospitals.find(h => h.nameAr === stHospitalAr);
    const resolvedHospitalEn = matchingHospital ? matchingHospital.nameEn : (stHospitalAr || 'Basra General Hospital');
    const finalHospitalAr = stHospitalAr || 'مستشفى البصرة العام';

    if (editingStudentId) {
      const updated = {
        nameAr: stNameAr,
        nameEn: finalStNameEn,
        age: Number(stAge),
        gradeAr: finalGradeAr,
        gradeEn: finalGradeEn,
        schoolNameAr: stSchoolAr,
        schoolNameEn: resolvedSchoolEn,
        linkedHospitalNameAr: finalHospitalAr,
        linkedHospitalNameEn: resolvedHospitalEn,
        parentEmail: stParentEmail,
        nationalId: stNationalId || '1029384756',
        parentNameAr: finalParentAr,
        parentNameEn: finalParentEn,
        parentPhone: stParentPhone || '07701234567',
        bloodType: stBloodType || 'O+',
        chronicDiseasesAr: chrAr,
        chronicDiseasesEn: chrEn,
        vaccinationsAr: vacAr,
        vaccinationsEn: vacEn,
      };

      try {
        await setDoc(doc(db, 'students', editingStudentId), updated, { merge: true });
      } catch (err) {
        console.error("Error updating student:", err);
      }

      setStudents(prev => prev.map(s => s.id === editingStudentId ? { ...s, ...updated } : s));

      setActivityLogs(prev => [
        {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'student',
          msgAr: `تم تحديث الملف الطبي الشامل للطالب [${stNameAr}] وتفاصيل الاتصال الخاصة بولي أمره.`,
          msgEn: `Student [${finalStNameEn}] unified health profile modified and synchronized by admin.`,
          timestamp: 'الآن',
          initiatorAr: 'لوحة تحكم الأدمن',
          initiatorEn: 'Admin Portal'
        },
        ...prev
      ]);
      setStudentSuccessAlert({
        show: true,
        msgAr: `تم تحديث بيانات الملف الطبي للطالب [${stNameAr}] بنجاح في النظام!`,
        msgEn: `Student [${finalStNameEn}] medical profile updated successfully!`
      });
      setTimeout(() => setStudentSuccessAlert(null), 6000);
      setEditingStudentId(null);
    } else {
      const newStudent: Student = {
        id: `STU-${Math.floor(100 + Math.random() * 900)}`,
        nameAr: stNameAr,
        nameEn: finalStNameEn,
        age: Number(stAge),
        gradeAr: finalGradeAr,
        gradeEn: finalGradeEn,
        status: 'good',
        chronicDiseasesAr: chrAr,
        chronicDiseasesEn: chrEn,
        vaccinationsAr: vacAr,
        vaccinationsEn: vacEn,
        bloodType: stBloodType,
        weight: 45,
        height: 145,
        parentNameAr: finalParentAr,
        parentNameEn: finalParentEn,
        parentPhone: stParentPhone || '07701234567',
        parentEmail: stParentEmail || 'parent@sehati.com',
        nationalId: stNationalId || '1029384756',
        schoolNameAr: stSchoolAr,
        schoolNameEn: resolvedSchoolEn,
        linkedHospitalNameAr: finalHospitalAr,
        linkedHospitalNameEn: resolvedHospitalEn,
        subscriptionPrice: 150000,
        subscriptionStatus: 'active',
        subscriptionExpiry: '2027-06-30',
        joinedDate: CURRENT_DATE_STRING
      };

      try {
        await setDoc(doc(db, 'students', newStudent.id), newStudent);
      } catch (err) {
        console.error("Error adding student:", err);
      }

      setStudents(prev => [newStudent, ...prev]);
      setActivityLogs(prev => [
        {
          id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
          type: 'student',
          msgAr: `تم تسجيل ملف طبي وصحي متكامل للطالب الجديد [${stNameAr}] وربطه بمدرسة [${stSchoolAr}] والمركز الصحي [${finalHospitalAr}].`,
          msgEn: `New student medical card initialized for [${finalStNameEn}] under [${resolvedSchoolEn}] and linked to [${resolvedHospitalEn}].`,
          timestamp: 'الآن',
          initiatorAr: 'لوحة تحكم الأدمن',
          initiatorEn: 'Admin Portal'
        },
        ...prev
      ]);
      setStudentSuccessAlert({
        show: true,
        msgAr: `تم إنشاء الملف الطبي للطالب [${stNameAr}] بنجاح وربطه بمدرسة [${stSchoolAr}] ومستشفى [${finalHospitalAr}]. تم إرسال إشعار تفعيل الحساب لولي الأمر على البريد الإلكتروني: [${stParentEmail || 'parent@sehati.com'}].`,
        msgEn: `Student [${finalStNameEn}] medical folder created and linked to school ${stSchoolAr} & hospital ${finalHospitalAr}. Guardian activation notification dispatched to [${stParentEmail || 'parent@sehati.com'}].`
      });
      setTimeout(() => setStudentSuccessAlert(null), 10000);
    }

    // Reset Form
    setStNameAr(''); setStNameEn(''); setStAge(12); setStGradeAr(''); setStGradeEn('');
    setStSchoolAr(''); setStSchoolEn(''); setStNationalId(''); setStParentAr('');
    setStParentEn(''); setStParentPhone(''); setStChronicAr(''); setStChronicEn('');
    setStVaccAr(''); setStVaccEn(''); setStHospitalAr(''); setStHospitalEn(''); setStParentEmail('');
    setShowStudentForm(false);
  };

  const handleEditStudent = (st: Student) => {
    setEditingStudentId(st.id);
    setStNameAr(st.nameAr);
    setStNameEn(st.nameEn);
    setStAge(st.age);
    setStGradeAr(st.gradeAr);
    setStGradeEn(st.gradeEn);
    setStSchoolAr(st.schoolNameAr);
    setStSchoolEn(st.schoolNameEn);
    setStNationalId(st.nationalId);
    setStParentAr(st.parentNameAr);
    setStParentEn(st.parentNameEn);
    setStParentPhone(st.parentPhone);
    setStBloodType(st.bloodType);
    setStChronicAr(st.chronicDiseasesAr.join(', '));
    setStChronicEn(st.chronicDiseasesEn.join(', '));
    setStVaccAr(st.vaccinationsAr.join(', '));
    setStVaccEn(st.vaccinationsEn.join(', '));
    setStHospitalAr(st.linkedHospitalNameAr || '');
    setStHospitalEn(st.linkedHospitalNameEn || '');
    setStParentEmail(st.parentEmail || '');
    setShowStudentForm(true);
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (err) {
      console.error("Error deleting student:", err);
    }
    setStudents(prev => prev.filter(st => st.id !== id));
  };

  // 6. User Accounts Mutators
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uEmail) return;

    if (editingUserId) {
      const updated: Record<string, any> = {
        email: uEmail,
        role: uRole,
        permissions: uPermissions
      };
      if (uPassword) updated.password = uPassword;

      try {
        await setDoc(doc(db, 'users', editingUserId), updated, { merge: true });
      } catch (err) {
        console.error("Error updating user:", err);
      }

      setUsers(prev => prev.map(u => u.id === editingUserId ? { ...u, ...updated } : u));
      setEditingUserId(null);
    } else {
      const newUser: UserAccount = {
        id: `USR-${Math.floor(100 + Math.random() * 900)}`,
        email: uEmail,
        password: uPassword || 'sehhati2026',
        role: uRole,
        permissions: uPermissions,
        status: 'active'
      };

      try {
        await setDoc(doc(db, 'users', newUser.id), newUser);
      } catch (err) {
        console.error("Error adding user:", err);
      }

      setUsers(prev => [...prev, newUser]);
    }

    setUEmail(''); setUPassword('');
    setShowUserForm(false);
  };

  const handleEditUser = (u: UserAccount) => {
    setEditingUserId(u.id);
    setUEmail(u.email);
    setURole(u.role);
    setUPermissions(u.permissions);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const toggleUserStatus = async (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    const nextStatus = target.status === 'active' ? 'suspended' : 'active';

    try {
      await setDoc(doc(db, 'users', id), { status: nextStatus }, { merge: true });
    } catch (err) {
      console.error("Error toggling user status:", err);
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
  };

  // 7. General Broadcasts Mutators
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitleAr || !annDescAr) return;

    const newBroadcast: AnnouncementAlert = {
      id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
      titleAr: annTitleAr,
      titleEn: annTitleEn || annTitleAr,
      descriptionAr: annDescAr,
      descriptionEn: annDescEn || annDescAr,
      type: annType as 'vaccine' | 'campaign' | 'general' | 'emergency',
      date: CURRENT_DATE_STRING,
      schoolNameAr: annSchoolAr,
      schoolNameEn: annSchoolEn
    };

    try {
      await setDoc(doc(db, 'announcements', newBroadcast.id), newBroadcast);
    } catch (err) {
      console.error("Error adding announcement:", err);
    }
    
    setAnnTitleAr(''); setAnnTitleEn(''); setAnnDescAr(''); setAnnDescEn('');
  };

  const handleDeleteBroadcast = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };


  // 8. Dynamic Sickness Statistics Calculations for Sickness Absence Rates and Medical Conditions
  const studentsWithChronic = students.filter(s => s.chronicDiseasesAr.length > 0).length;
  const totalStudentsCount = students.length;
  
  // Hardcoded statistical rates for dashboard showcase
  const diseaseBreakdown = [
    { nameAr: 'مرض السكري / الأطفال', nameEn: 'Diabetes (Pediatric)', count: students.filter(s => s.chronicDiseasesAr.some(d => d.includes('سكري') || d.includes('السكري'))).length || 1, percentage: '20%' },
    { nameAr: 'الحساسية الغذائية / الصدمات', nameEn: 'Food Allergies', count: students.filter(s => s.chronicDiseasesAr.some(d => d.includes('حساسية') || d.includes('الفول'))).length || 2, percentage: '40%' },
    { nameAr: 'الربو ومشاكل التنفس', nameEn: 'Asthma / Respiratory', count: 1, percentage: '20%' },
    { nameAr: 'صعوبات أخرى', nameEn: 'Other Challenges', count: 1, percentage: '20%' }
  ];

  return (
    <div className="w-full flex flex-col gap-6" id="admin-unified-portal">
      
      {/* Platform Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{lang === 'ar' ? 'نظرة عامة والتقارير الصحية' : 'Overview & Health Reports'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('schools_hospitals')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'schools_hospitals' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{lang === 'ar' ? 'إدارة المدارس والمستشفيات' : 'Schools & Hospitals'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('students_permissions')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'students_permissions' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'ar' ? 'الطلبة والصلاحيات والحسابات' : 'Students & Accounts'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('announcements_broad')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeTab === 'announcements_broad' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{lang === 'ar' ? 'لوحة التنبيهات والبث العام' : 'General Broadcasts'}</span>
          </button>
        </div>

        <div className="text-left md:text-right font-sans">
          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">{lang === 'ar' ? 'مستوى الوصول الحالي' : 'Active Authorization Level'}</span>
          <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 inline-block mt-1">
            ⚡ {lang === 'ar' ? 'مدير النظام (إدارة كاملة)' : 'System Admin (Super-User)'}
          </span>
        </div>
      </div>

      {/* RENDER TAB 1: OVERVIEW & SYSTEM REPORTS */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">

          {/* Urgent Admin Alarm / Active SOS Alert Banner */}
          {activeSosNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-rose-50 border-2 border-rose-200 rounded-[2rem] p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse"
              id="admin-sos-alert-banner"
            >
              <div className="flex items-center gap-3.5 text-right md:text-right w-full">
                <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
                  <AlertTriangle className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-rose-950 text-sm">{lang === 'ar' ? 'تنبيه استغاثة طارئ نشط بالمنصة (SOS)' : 'Urgent SOS Alert Active'}</h4>
                  <p className="text-xs text-rose-800 mt-1">
                    {lang === 'ar' 
                      ? 'تلقى النظام نداء استغاثة عاجل من مدرسة السياب الابتدائية للطالب "علي حسن". يرجى المتابعة فوراً مع مستشفى البصرة العام للتأكد من وصول المسعفين.'
                      : 'Immediate clinical dispatch requested for student "Ali Hassan" at Al-Sayyab School. Coordinate with Basra General.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                <button 
                  onClick={() => {
                    setActiveSosNotification(false);
                    setActivityLogs(prev => [
                      {
                        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
                        type: 'sos',
                        msgAr: 'تم إنهاء وتوثيق نداء الاستغاثة الطارئ للطالب "علي حسن" كحالة مستقرة ومعالجة.',
                        msgEn: 'SOS Emergency alert resolved for student "Ali Hassan" and logged in historical logs.',
                        timestamp: 'الآن',
                        initiatorAr: 'الأدمن الرئيسي',
                        initiatorEn: 'Super Admin'
                      },
                      ...prev
                    ]);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-95 whitespace-nowrap"
                >
                  {lang === 'ar' ? 'حل الإشعار وأرشفته' : 'Resolve & Archive'}
                </button>
                <button 
                  onClick={() => setActiveSosNotification(false)}
                  className="text-rose-700 hover:text-rose-900 font-extrabold text-xs px-3 py-2 cursor-pointer whitespace-nowrap hover:bg-rose-100/50 rounded-xl transition-all"
                >
                  {lang === 'ar' ? 'تجاهل الإشعار' : 'Dismiss'}
                </button>
              </div>
            </motion.div>
          )}
          
          {/* Dynamic Platform Core Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Schools registered count */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="text-right sm:text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'المدارس المسجلة بالمنصة' : 'Registered School Units'}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{schools.length}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  {lang === 'ar' ? 'تغطي فئات ابتدائية ومتوسطة' : 'Primary & Intermediate coverage'}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-emerald-800 flex-shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            {/* Total Active Hospitals */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="text-right sm:text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'المستشفيات والعيادات المعتمدة' : 'Accredited Hospitals'}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{hospitals.length}</h3>
                <p className="text-[10px] text-emerald-600 mt-1 font-sans font-semibold">
                  {lang === 'ar' ? '↑ متصلة بصفة فورية' : 'Live integration active'}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-emerald-800 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
            </div>

            {/* Total Students */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="text-right sm:text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'الطلاب المسجلين محلياً' : 'Registered Active Students'}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalStudentsCount}</h3>
                <p className="text-[10px] text-slate-400 mt-1 font-sans">
                  {lang === 'ar' ? 'ضمن نطاق المحاكاة الساري' : 'Within simulator database scope'}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-emerald-800 flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Total active public alerts */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
              <div className="text-right sm:text-right">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{lang === 'ar' ? 'حملات التوعية والتنبيهات' : 'Broadcasted Campaigns'}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">{announcements.length}</h3>
                <p className="text-[10px] text-amber-600 mt-1 font-sans font-semibold">
                  {lang === 'ar' ? 'موزعة على كافة المدارس' : 'Broadcasted to all centers'}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl text-emerald-800 flex-shrink-0">
                <Bell className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* LIVE PORTAL OPERATIONS: Activity Log & Appointments & Reports */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* 1. Live Activity Feed (لوحة النشاط المباشر) */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 xl:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
                    <span>{lang === 'ar' ? 'لوحة النشاط والمراقبة الحية' : 'Live Activity Ticker'}</span>
                  </h3>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {lang === 'ar' 
                    ? 'رصد فوري متكامل للعمليات الجارية في المدارس والمستشفيات الشريكة لضمان سلامة الحركة الميدانية.'
                    : 'Real-time telemetry and operation tracking across partnered institutions for streamlined oversight.'}
                </p>

                {/* Vertical Timeline Activity List */}
                <div className="flex flex-col gap-4 mt-5 max-h-[360px] overflow-y-auto pr-1">
                  {activityLogs.map((log) => {
                    return (
                      <div key={log.id} className="relative flex gap-3 text-right">
                        {/* Timeline dot and line */}
                        <div className="flex flex-col items-center">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            log.type === 'sos' ? 'bg-rose-600 animate-ping' : 'bg-slate-300'
                          } z-10 shrink-0 mt-1.5`} />
                          <div className="w-0.5 bg-slate-100 flex-1 my-1" />
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-3 py-2.5 rounded-2xl flex-1 text-right flex flex-col gap-1 hover:shadow-sm transition-all">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded border bg-white text-slate-500">
                              {log.id}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {log.timestamp}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-700 leading-relaxed font-sans font-medium">
                            {lang === 'ar' ? log.msgAr : log.msgEn}
                          </p>

                          <div className="flex items-center gap-1 mt-1 border-t border-slate-250/30 pt-1 justify-end">
                            <span className="text-[9px] text-slate-400 font-bold">
                              {lang === 'ar' ? 'بواسطة:' : 'By:'}
                            </span>
                            <span className="text-[9px] text-emerald-800 font-extrabold">
                              {lang === 'ar' ? log.initiatorAr : log.initiatorEn}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                <span>{lang === 'ar' ? '* الرصد متاح على مدار الساعة' : '* Real-time active stream'}</span>
                <button 
                  onClick={() => {
                    setActivityLogs(prev => [
                      {
                        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
                        type: 'student',
                        msgAr: 'طلب نظام: تم تحديث وتزامن البيانات مع قاعدة البيانات المركزية لوزارة الصحة العرقية.',
                        msgEn: 'System Request: Databases synchronized with central Health Ministry servers.',
                        timestamp: 'الآن',
                        initiatorAr: 'خادم موازنة الحمل',
                        initiatorEn: 'Load Balancer Gateway'
                      },
                      ...prev
                    ]);
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer"
                >
                  {lang === 'ar' ? 'تحديث وتزامن يدوي' : 'Force Sync'}
                </button>
              </div>
            </div>

            {/* 2. Upcoming Appointments Scheduler Table (جدول المواعيد القادمة وحالتها) */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 xl:col-span-2 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="text-right sm:text-right">
                    <h3 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      <span>{lang === 'ar' ? 'جدول المواعيد الطبية المجدولة' : 'Partners Medical Appointments Scheduler'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {lang === 'ar' 
                        ? 'مراقبة المواعيد الطبية المحجوزة للطلاب، وتأكيدها أو إلغائها أو تعليمها كمكتملة مباشرة.'
                        : 'Monitor clinical reservations, verify student schedules, and manage active slots.'}
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 font-mono">
                    {appointments.length} {lang === 'ar' ? 'مواعيد إجمالية' : 'Total Appts'}
                  </span>
                </div>

                {/* Responsive Appointment list */}
                <div className="overflow-x-auto rounded-2xl border border-slate-100 mt-4">
                  <table className="w-full text-right sm:text-right text-xs font-sans text-gray-700">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-150">
                      <tr>
                        <th className="px-4 py-3">{lang === 'ar' ? 'الطالب' : 'Student Name'}</th>
                        <th className="px-4 py-3">{lang === 'ar' ? 'المستشفى الشريك' : 'Partner Hospital'}</th>
                        <th className="px-4 py-3">{lang === 'ar' ? 'العيادة / التخصص' : 'Department'}</th>
                        <th className="px-4 py-3">{lang === 'ar' ? 'التوقيت والتاريخ' : 'Date & Time'}</th>
                        <th className="px-4 py-3">{lang === 'ar' ? 'الحالة الحالية' : 'Current Status'}</th>
                        <th className="px-4 py-3 text-center">{lang === 'ar' ? 'تحكم الأدمن' : 'Admin Operations'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {appointments.slice(0, 5).map((appt) => {
                        let statusBadge = '';
                        let statusTextAr = '';
                        let statusTextEn = '';

                        if (appt.status === 'confirmed') {
                          statusBadge = 'bg-emerald-500/10 text-emerald-800 border-emerald-200';
                          statusTextAr = 'مؤكد ومثبت';
                          statusTextEn = 'Confirmed';
                        } else if (appt.status === 'pending') {
                          statusBadge = 'bg-amber-500/10 text-amber-800 border-amber-200 animate-pulse';
                          statusTextAr = 'قيد الانتظار';
                          statusTextEn = 'Pending';
                        } else if (appt.status === 'completed') {
                          statusBadge = 'bg-blue-500/10 text-blue-800 border-blue-200';
                          statusTextAr = 'مكتمل ومعالج';
                          statusTextEn = 'Completed';
                        } else {
                          statusBadge = 'bg-slate-500/10 text-slate-800 border-slate-200';
                          statusTextAr = 'ملغي';
                          statusTextEn = 'Cancelled';
                        }

                        return (
                          <tr key={appt.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              <div>{lang === 'ar' ? appt.studentNameAr : appt.studentNameEn}</div>
                              <div className="text-[9px] text-slate-400 font-mono mt-0.5">ID: {appt.studentId}</div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-700 font-semibold">
                              {lang === 'ar' ? appt.hospitalNameAr : appt.hospitalNameEn}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 font-medium">
                              {lang === 'ar' ? appt.departmentAr : appt.departmentEn}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-slate-800 font-bold">
                              <div>{appt.date}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{appt.time}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold border ${statusBadge}`}>
                                {lang === 'ar' ? statusTextAr : statusTextEn}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center flex items-center justify-center gap-1.5 min-h-[50px]">
                              {appt.status === 'pending' && (
                                <button 
                                  onClick={() => {
                                    setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'confirmed' } : a));
                                    setActivityLogs(prev => [
                                      {
                                        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
                                        type: 'appointment',
                                        msgAr: `قام الأدمن بتأكيد موعد الطالب [${appt.studentNameAr}] في مستشفى [${appt.hospitalNameAr}].`,
                                        msgEn: `Admin confirmed appointment for student [${appt.studentNameEn}] at [${appt.hospitalNameEn}].`,
                                        timestamp: 'الآن',
                                        initiatorAr: 'الأدمن الرئيسي',
                                        initiatorEn: 'Super Admin'
                                      },
                                      ...prev
                                    ]);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                                >
                                  {lang === 'ar' ? 'تأكيد' : 'Confirm'}
                                </button>
                              )}
                              {appt.status === 'confirmed' && (
                                <button 
                                  onClick={() => {
                                    setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'completed' } : a));
                                    setActivityLogs(prev => [
                                      {
                                        id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
                                        type: 'appointment',
                                        msgAr: `تم تحديث الموعد للطالب [${appt.studentNameAr}] في مستشفى [${appt.hospitalNameAr}] كحالة مكتملة بنجاح.`,
                                        msgEn: `Appointment for student [${appt.studentNameEn}] marked as completed by system administrator.`,
                                        timestamp: 'الآن',
                                        initiatorAr: 'الأدمن الرئيسي',
                                        initiatorEn: 'Super Admin'
                                      },
                                      ...prev
                                    ]);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                                >
                                  {lang === 'ar' ? 'إكمال' : 'Complete'}
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'cancelled' } : a));
                                  setActivityLogs(prev => [
                                    {
                                      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
                                      type: 'appointment',
                                      msgAr: `قام الأدمن بإلغاء موعد الطالب [${appt.studentNameAr}] في مستشفى [${appt.hospitalNameAr}].`,
                                      msgEn: `Admin cancelled appointment for student [${appt.studentNameEn}] at [${appt.hospitalNameEn}].`,
                                      timestamp: 'الآن',
                                      initiatorAr: 'الأدمن الرئيسي',
                                      initiatorEn: 'Super Admin'
                                    },
                                    ...prev
                                  ]);
                                }}
                                className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-slate-100 bg-white font-bold text-[10px] px-2 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                              >
                                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3 text-[10px] text-slate-400 font-sans flex items-center justify-between">
                <span>{lang === 'ar' ? '* تظهر المواعيد الـ 5 الأقرب زمنياً' : '* Showing top 5 scheduled medical slots'}</span>
                <span className="text-slate-400 font-bold">{lang === 'ar' ? 'المنصة متصلة بقاعدة البيانات الموحدة للمستشفيات' : 'Connected to live hospital servers'}</span>
              </div>
            </div>

          </div>

          {/* System Reports, Health Statistics & Absence Triage */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Health Triage & Illnesses Distribution */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    <span>{lang === 'ar' ? 'إحصائيات الملف الصحي المدرسي العام والغياب المرضي' : 'Unified Health Stats & Sickness Absences'}</span>
                  </h3>
                  <span className="text-[10px] text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-full">LIVE</span>
                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {lang === 'ar' 
                    ? 'يقوم النظام بفرز الحالات المزمنة ومتابعة نسب الغياب بشكل آلي لتسهيل التدخل الطبي المبكر من قبل المستشفيات الشريكة.' 
                    : 'Automatic health triage of chronic conditions and sickness-related absences across registered educational sectors.'
                  }
                </p>

                {/* Absence Rates & Health Indicators metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  
                  {/* Absenteeism metric card */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">{lang === 'ar' ? 'نسبة الغياب المرضي العام' : 'Average Sickness Absence Rate'}</span>
                      <h4 className="text-2xl font-black text-slate-900 mt-1 font-mono">1.8%</h4>
                      <p className="text-[9px] text-emerald-600 mt-0.5 font-sans font-bold">
                        {lang === 'ar' ? '↓ أقل من المعدل الوطني (2.4%)' : '↓ Below national target (2.4%)'}
                      </p>
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl">
                      <Percent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Vaccinations coverage */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">{lang === 'ar' ? 'نسبة استكمال اللقاحات' : 'Vaccine Campaign Coverage'}</span>
                      <h4 className="text-2xl font-black text-slate-900 mt-1 font-mono">98.4%</h4>
                      <p className="text-[9px] text-emerald-600 mt-0.5 font-sans font-bold">
                        {lang === 'ar' ? 'حملة شلل الأطفال والحصبة المحدثة' : 'Polio & Measles comprehensive'}
                      </p>
                    </div>
                    <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Chronic Diseases Breakdown Interactive Display */}
                <div className="mt-6 flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-slate-700">{lang === 'ar' ? 'توزيع الحالات المرضية المزمنة المرصودة:' : 'Chronic Conditions Prevalence:'}</h4>
                  
                  <div className="flex flex-col gap-3 mt-1">
                    {diseaseBreakdown.map((dis, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span>{lang === 'ar' ? dis.nameAr : dis.nameEn}</span>
                          <span className="font-mono">{dis.percentage} ({dis.count} {lang === 'ar' ? 'طلاب' : 'students'})</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-500 h-full rounded-full" 
                            style={{ width: dis.percentage }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3.5 mt-4 text-[10px] text-slate-400 font-sans">
                {lang === 'ar' ? '* البيانات محدثة تلقائياً بناءً على إدخالات المدارس والعيادات الشريكة.' : '* Synchronized automatically with primary clinical checkups and registers.'}
              </div>
            </div>

            {/* Sickness Absence Monthly Trend (Bento Card style with custom static graph) */}
            <div className="bg-[#0F172A] text-white rounded-[2rem] p-6 md:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-white text-sm md:text-base border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>{lang === 'ar' ? 'مؤشر الغياب المرضي الشهري' : 'Monthly Sickness Absences'}</span>
                </h3>

                <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                  {lang === 'ar' 
                    ? 'رصد وتقييم التغيير الربعي لنسب الغياب لمكافحة الأوبئة الموسمية والإنفلونزا.' 
                    : 'Quarterly review of sickness-related absenteeism to preempt seasonal outbreaks.'
                  }
                </p>

                {/* Custom designed visual chart */}
                <div className="flex items-end justify-between h-40 gap-3 mt-8 px-2 font-mono">
                  {[
                    { month: 'Jan', val: 70, label: '٢,١%' },
                    { month: 'Feb', val: 50, label: '١,٥%' },
                    { month: 'Mar', val: 40, label: '١,٢%' },
                    { month: 'Apr', val: 30, label: '٠,٩%' },
                    { month: 'May', val: 65, label: '١,٩%' },
                    { month: 'Jun', val: 20, label: '٠,٦%' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.label}</span>
                      <div 
                        className="w-full bg-emerald-500/80 hover:bg-emerald-400 transition-all rounded-t-md relative" 
                        style={{ height: `${item.val}%` }}
                      >
                        {/* Little indicator point */}
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-300 rounded-full" />
                      </div>
                      <span className="text-[9px] text-slate-500 font-sans">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 mt-4 text-[10px] text-slate-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span>{lang === 'ar' ? 'تحديث تلقائي: الفصل الدراسي الثاني ممتد ومستقر' : 'Current school term stability level is: Optimal'}</span>
              </div>
            </div>
          </div>

          {/* MEDICAL REPORTS AUDIT FEED (مراجعة وتقارير الطلاب) */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200" id="admin-medical-reports-audit">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-3.5 gap-4">
              <div className="text-right sm:text-right">
                <h3 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <span>{lang === 'ar' ? 'مستودع ومراجعة التقارير الطبية الدورية للطلاب' : 'Periodic Medical Reports & Clinical Audit Feed'}</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 font-sans">
                  {lang === 'ar' 
                    ? 'مراجعة التقارير الطبية وفحوصات الطلاب الدورية الصادرة من المستشفيات المعتمدة لمتابعة الحالة الصحية وتطبيق الحجر أو الإعفاء المدرسي عند الحاجة.'
                    : 'Systematic overview of primary diagnostics, blood panels, and checkups compiled by school physicals and partner doctors.'}
                </p>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                {reports.length} {lang === 'ar' ? 'تقارير مرفوعة' : 'Reports Logged'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
              {reports.slice(0, 3).map((rep) => (
                <div key={rep.id} className="border border-slate-150 p-5 rounded-2xl bg-slate-50 flex flex-col justify-between gap-3 shadow-sm hover:border-slate-300 hover:shadow transition-all text-right">
                  <div>
                    <div className="flex justify-between items-start gap-2 border-b border-slate-200/50 pb-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs">{lang === 'ar' ? rep.studentNameAr : rep.studentNameEn}</h4>
                        <span className="text-[9px] text-slate-400 font-mono block">STU ID: {rep.studentId}</span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-150">
                        {rep.id}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold text-[10px] block">{lang === 'ar' ? 'نوع الفحص والتشخيص:' : 'Diagnostic Category:'}</span>
                        <span className="font-extrabold text-indigo-950 text-xs">
                          {lang === 'ar' ? rep.typeAr : rep.typeEn} • {lang === 'ar' ? rep.diagnosisAr : rep.diagnosisEn}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-slate-400 font-bold text-[10px] block">{lang === 'ar' ? 'ملاحظات الطبيب وتوصياته:' : 'Clinical Findings & Recs:'}</span>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-sans bg-white p-2 rounded-xl border border-slate-100 mt-1">
                          {lang === 'ar' ? rep.notesAr : rep.notesEn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/50 pt-2 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>🩺 {lang === 'ar' ? rep.doctorNameAr : rep.doctorNameEn}</span>
                      <span>🏥 {lang === 'ar' ? rep.hospitalNameAr : rep.hospitalNameEn}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-mono">
                      <span>📅 {rep.date}</span>
                      <span className="text-emerald-750 font-extrabold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {lang === 'ar' ? 'تم المراجعة والاعتماد' : 'Verified by Admin'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Fee Registry & Expiry Panel */}
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col gap-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-3.5 gap-4">
              <div className="text-right sm:text-right">
                <h3 className="font-bold text-gray-900 text-sm md:text-base flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  <span>{t.subManagement}</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-1 font-sans">
                  {t.countdownLegend}
                </p>
              </div>

              {/* Color Indicators Legend */}
              <div className="flex flex-wrap gap-2 text-[10px] font-bold font-sans">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                  🟢 {lang === 'ar' ? 'أخضر: ساري (> ٣ أشهر)' : 'Green: Active (> 3 mo)'}
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md">
                  🟡 {lang === 'ar' ? 'أصفر: ينتهي قريبًا (< ٣ أشهر)' : 'Yellow: Expiring (< 3 mo)'}
                </span>
                <span className="bg-rose-50 text-rose-800 border border-rose-250 px-2.5 py-1 rounded-md">
                  🔴 {lang === 'ar' ? 'أحمر: حرج (< شهر متبقي)' : 'Red: Critical (< 1 mo)'}
                </span>
                <span className="bg-gray-100 text-gray-600 border border-gray-300 px-2.5 py-1 rounded-md">
                  ⚫ {lang === 'ar' ? 'رمادي: منتهي وموقوف' : 'Gray: Past Due'}
                </span>
              </div>
            </div>

            {/* Dynamic transaction renewal feedback message */}
            <AnimatePresence>
              {successRenewMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl flex items-center gap-3 font-sans font-bold shadow-sm"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{successRenewMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Billing Registry list */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-right sm:text-right text-xs font-sans text-gray-700">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-150">
                  <tr>
                    <th className="px-5 py-3">{lang === 'ar' ? 'اسم الطالب المشترك' : 'Subscribed Student'}</th>
                    <th className="px-5 py-3">{t.schoolName}</th>
                    <th className="px-5 py-3">{lang === 'ar' ? 'تاريخ انتهاء الاشتراك السنوي' : 'Registry Expiry Date'}</th>
                    <th className="px-5 py-3">{lang === 'ar' ? 'الأيام المتبقية' : 'Remaining Duration'}</th>
                    <th className="px-5 py-3">{lang === 'ar' ? 'الرسوم المدفوعة' : 'Fee Tallied'}</th>
                    <th className="px-5 py-3 text-center">{lang === 'ar' ? 'بوابة الدفع والتجديد' : 'Payment Portal Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => {
                    const daysLeft = getDaysRemaining(student.subscriptionExpiry);
                    
                    let rowBg = '';
                    let textClass = '';
                    let statusLabelAr = '';
                    let statusLabelEn = '';

                    if (daysLeft <= 0) {
                      rowBg = 'bg-gray-50/50';
                      textClass = 'text-gray-500 border-gray-300 bg-gray-100';
                      statusLabelAr = `منتهي منذ ${Math.abs(daysLeft)} يوم`;
                      statusLabelEn = `Expired ${Math.abs(daysLeft)} days ago`;
                    } else if (daysLeft <= 30) {
                      rowBg = 'bg-rose-50/20';
                      textClass = 'text-red-800 border-red-200 bg-red-100 animate-pulse';
                      statusLabelAr = `حرج: متبقي ${daysLeft} يوم!`;
                      statusLabelEn = `Critical: ${daysLeft} days left!`;
                    } else if (daysLeft <= 90) {
                      rowBg = 'bg-amber-50/10';
                      textClass = 'text-amber-800 border-amber-200 bg-amber-100';
                      statusLabelAr = `يوشك: متبقي ${daysLeft} يوم`;
                      statusLabelEn = `Expiring: ${daysLeft} days`;
                    } else {
                      rowBg = 'bg-white';
                      textClass = 'text-emerald-800 border-emerald-200 bg-emerald-100';
                      statusLabelAr = `نشط: متبقي ${daysLeft} يوم`;
                      statusLabelEn = `Active: ${daysLeft} days`;
                    }

                    return (
                      <tr key={student.id} className={`${rowBg} hover:bg-gray-50/50 transition-all`}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg bg-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center">
                              {student.nameAr[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-gray-900">{lang === 'ar' ? student.nameAr : student.nameEn}</span>
                              <span className="text-[10px] text-gray-500 font-mono">{student.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-gray-600">
                          {lang === 'ar' ? student.schoolNameAr : student.schoolNameEn}
                        </td>
                        <td className="px-5 py-4 font-mono font-medium text-gray-800">
                          {student.subscriptionExpiry}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${textClass}`}>
                            {lang === 'ar' ? statusLabelAr : statusLabelEn}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-bold font-mono text-gray-900">
                          {student.subscriptionPrice.toLocaleString()} د.ع
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleRenewSubscription(student.id)}
                            disabled={renewingStudentId === student.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-emerald-100 hover:shadow-md cursor-pointer min-h-[38px] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {renewingStudentId === student.id ? (
                              <span className="flex items-center gap-1">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>{lang === 'ar' ? 'جاري السداد...' : 'Securing...'}</span>
                              </span>
                            ) : (
                              <span>{lang === 'ar' ? 'تجديد الاشتراك السنوي' : 'Renew Subscription'}</span>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: SCHOOLS & HOSPITALS MANAGEMENT */}
      {activeTab === 'schools_hospitals' && (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          
          {/* Sub Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex gap-2">
              <button 
                onClick={() => setEntitySubTab('schools')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  entitySubTab === 'schools' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'إدارة المدارس والمنشآت التعليمية' : 'Manage Schools & Districts'}
              </button>

              <button 
                onClick={() => setEntitySubTab('hospitals')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  entitySubTab === 'hospitals' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'إدارة المستشفيات والعيادات المعتمدة' : 'Manage Accredited Hospitals'}
              </button>
            </div>

            <button 
              onClick={() => {
                if (entitySubTab === 'schools') {
                  setEditingSchoolId(null);
                  setSNameAr(''); setSNameEn(''); setSCount(100); setSGradesAr(''); setSGradesEn('');
                  setSLocAr(''); setSLocEn(''); setSEmail(''); setSPassword(''); setSStatus('active');
                  setSPermRegister(true); setSPermSend(true); setSPermReceive(true);
                  setShowSchoolForm(!showSchoolForm);
                } else {
                  setEditingHospitalId(null);
                  setHNameAr(''); setHNameEn(''); setHLocAr(''); setHLocEn('');
                  setHDocsAr(''); setHDocsEn(''); setHDeptsAr(''); setHDeptsEn('');
                  setShowHospitalForm(!showHospitalForm);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{entitySubTab === 'schools' ? (lang === 'ar' ? 'إضافة مدرسة جديدة' : 'Add New School') : (lang === 'ar' ? 'إضافة مستشفى جديد' : 'Add New Hospital')}</span>
            </button>
          </div>

          {/* SCHOOLS MANAGEMENT INTERFACE */}
          {entitySubTab === 'schools' && (
            <div className="flex flex-col gap-6">

              {/* School Success Notification Alert */}
              <AnimatePresence>
                {schoolSuccessAlert && schoolSuccessAlert.show && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-5 rounded-2xl flex items-start gap-3.5 shadow-md text-right font-sans border-dashed"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-extrabold text-emerald-900">{lang === 'ar' ? 'إشعار نجاح العملية!' : 'Action Completed Successfully!'}</span>
                      <p className="leading-relaxed font-semibold">
                        {lang === 'ar' ? schoolSuccessAlert.msgAr : schoolSuccessAlert.msgEn}
                      </p>
                      <div className="flex items-center gap-2 mt-2 bg-emerald-100/50 px-2.5 py-1 rounded-lg text-[10px] text-emerald-800 font-mono w-fit">
                        <span>SMTP Dispatched Connection</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Add/Edit School Form */}
              {showSchoolForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleSaveSchool}
                  className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col gap-4 font-sans text-right"
                >
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    <span>{editingSchoolId ? (lang === 'ar' ? 'تعديل بيانات المدرسة' : 'Edit School Details') : (lang === 'ar' ? 'تسجيل مدرسة جديدة بالنظام' : 'Register New School Entity')}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'اسم المدرسة (بالعربية)' : 'School Name (Arabic)'}</label>
                      <input 
                        type="text" 
                        required
                        value={sNameAr}
                        onChange={(e) => setSNameAr(e.target.value)}
                        placeholder="مثال: مدرسة الجاحظ الابتدائية"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الموقع والعنوان التفصيلي' : 'Location & Detailed Address'}</label>
                      <input 
                        type="text" 
                        required
                        value={sLocAr}
                        onChange={(e) => setSLocAr(e.target.value)}
                        placeholder="مثال: البصرة – حي الجامعة"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'عدد الطلاب الإجمالي' : 'Total Registered Students'}</label>
                      <input 
                        type="number" 
                        required
                        value={sCount}
                        onChange={(e) => setSCount(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'المراحل الدراسية والصفوف' : 'Educational Stages & Grades'}</label>
                      <input 
                        type="text" 
                        required
                        value={sGradesAr}
                        onChange={(e) => setSGradesAr(e.target.value)}
                        placeholder="مثال: الصف الأول - السادس"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        {lang === 'ar' ? 'البريد الإلكتروني (تسجيل الدخول)' : 'Login Email'}
                      </label>
                      <input 
                        type="email" 
                        value={sEmail}
                        onChange={(e) => setSEmail(e.target.value)}
                        placeholder="school@sehati.com"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        {lang === 'ar' ? 'كلمة المرور (اتركها فارغة للتوليد التلقائي)' : 'Password (leave blank to auto-generate)'}
                      </label>
                      <input 
                        type="text" 
                        value={sPassword}
                        onChange={(e) => setSPassword(e.target.value)}
                        placeholder={lang === 'ar' ? 'كلمة مرور مخصصة أو توليد تلقائي' : 'Custom password or auto'}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'حالة الحساب الافتراضية' : 'Default Account Status'}</label>
                      <select 
                        value={sStatus}
                        onChange={(e) => setSStatus(e.target.value as 'active' | 'suspended' | 'pending')}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-right cursor-pointer"
                      >
                        <option value="active">{lang === 'ar' ? 'نشط ومفعل' : 'Active'}</option>
                        <option value="pending">{lang === 'ar' ? 'بانتظار التفعيل' : 'Pending Activation'}</option>
                        <option value="suspended">{lang === 'ar' ? 'موقوف مؤقتاً' : 'Suspended'}</option>
                      </select>
                    </div>
                  </div>

                  {/* School Permissions Selection */}
                  <div className="bg-slate-100/50 p-4 rounded-xl mt-2">
                    <h5 className="text-[10px] font-bold text-slate-600 mb-2.5">
                      {lang === 'ar' ? 'صلاحيات المدرسة المفعلة بعد الإضافة' : 'Authorized School Permissions'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                        <input 
                          type="checkbox" 
                          checked={sPermRegister} 
                          onChange={(e) => setSPermRegister(e.target.checked)}
                          className="accent-emerald-600 h-4 w-4"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">
                          {lang === 'ar' ? 'تسجيل الطلاب ومتابعة حالتهم الصحية' : 'Register & Monitor Students'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                        <input 
                          type="checkbox" 
                          checked={sPermSend} 
                          onChange={(e) => setSPermSend(e.target.checked)}
                          className="accent-emerald-600 h-4 w-4"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">
                          {lang === 'ar' ? 'إرسال تقارير شهرية إلى المستشفى' : 'Send Reports to Hospital'}
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50">
                        <input 
                          type="checkbox" 
                          checked={sPermReceive} 
                          onChange={(e) => setSPermReceive(e.target.checked)}
                          className="accent-emerald-600 h-4 w-4"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">
                          {lang === 'ar' ? 'استقبال التنبيهات الطبية من المستشفيات' : 'Receive Medical Alerts'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowSchoolForm(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      {lang === 'ar' ? 'حفظ المدرسة' : 'Save School'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Schools List Registry */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-right text-xs font-sans text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-150">
                    <tr>
                      <th className="px-5 py-3">{lang === 'ar' ? 'رمز التعريف' : 'School ID'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'المدرسة والموقع' : 'School Entity & Location'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'إحصائيات المدرسة' : 'School Stats'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'الصفوف والمراحل' : 'Covered Stages'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'الصلاحيات النشطة' : 'Active Permissions'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'حالة التفعيل' : 'Platform Status'}</th>
                      <th className="px-5 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {schools.map((sch) => {
                      let statusBadgeClass = '';
                      let statusText = '';
                      if (sch.status === 'active') {
                        statusBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                        statusText = lang === 'ar' ? 'نشط ومفعل' : 'Active';
                      } else if (sch.status === 'pending') {
                        statusBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                        statusText = lang === 'ar' ? 'بانتظار التفعيل' : 'Pending Activation';
                      } else {
                        statusBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
                        statusText = lang === 'ar' ? 'موقوف مؤقتاً' : 'Suspended';
                      }

                      return (
                        <tr key={sch.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="px-5 py-4 font-mono font-bold text-slate-500">{sch.id}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col text-right">
                              <span className="font-bold text-slate-800">{lang === 'ar' ? sch.nameAr : sch.nameEn}</span>
                              <span className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{lang === 'ar' ? sch.locationAr : sch.locationEn}</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono mt-0.5">{sch.email || 'school@sehhati.plus'}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1 text-[11px] text-right">
                              <div><span className="text-slate-400 font-bold">{lang === 'ar' ? 'الطلاب:' : 'Students:'}</span> <span className="font-mono font-black text-slate-700">{(sch.studentCount || 0).toLocaleString()}</span></div>
                              <div><span className="text-slate-400 font-bold">{lang === 'ar' ? 'التقارير:' : 'Reports:'}</span> <span className="font-mono font-black text-slate-700">{sch.stats?.reportsCount || 0}</span></div>
                              <div><span className="text-slate-400 font-bold">{lang === 'ar' ? 'التنبيهات:' : 'Alerts:'}</span> <span className="font-mono font-black text-slate-700">{sch.stats?.alertsCount || 0}</span></div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-semibold">{lang === 'ar' ? sch.gradesAr : sch.gradesEn}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {(!sch.permissions || sch.permissions.length === 0) && (
                                <span className="text-[10px] text-slate-400">{lang === 'ar' ? 'لا توجد صلاحيات' : 'No Permissions'}</span>
                              )}
                              {sch.permissions?.includes('register_students') && (
                                <span className="px-1.5 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded text-[9px] font-bold">
                                  {lang === 'ar' ? 'تسجيل طلاب' : 'Reg Students'}
                                </span>
                              )}
                              {sch.permissions?.includes('send_reports') && (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[9px] font-bold">
                                  {lang === 'ar' ? 'رفع تقارير' : 'Send Reports'}
                                </span>
                              )}
                              {sch.permissions?.includes('receive_alerts') && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded text-[9px] font-bold">
                                  {lang === 'ar' ? 'استقبال تنبيهات' : 'Recv Alerts'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${statusBadgeClass}`}>
                              {statusText}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => toggleSchoolStatus(sch.id)}
                                title={lang === 'ar' ? 'تبديل الحالة' : 'Toggle Status'}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                              >
                                {sch.status === 'active' ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                              </button>
                              <button 
                                onClick={() => handleEditSchool(sch)}
                                className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteSchool(sch.id)}
                                className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HOSPITALS MANAGEMENT INTERFACE */}
          {entitySubTab === 'hospitals' && (
            <div className="flex flex-col gap-6">

              {/* Success Notification Alert */}
              <AnimatePresence>
                {hospitalSuccessAlert && hospitalSuccessAlert.show && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-5 rounded-2xl flex items-start gap-3.5 shadow-md text-right font-sans border-dashed"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-emerald-900">
                        {lang === 'ar' ? 'تمت العملية بنجاح! 🎉' : 'Action Completed Successfully! 🎉'}
                      </p>
                      <p className="text-xs font-medium leading-relaxed mt-1.5 text-slate-800">
                        {lang === 'ar' ? hospitalSuccessAlert.msgAr : hospitalSuccessAlert.msgEn}
                      </p>
                      <div className="mt-3 text-[10px] bg-emerald-100/80 inline-flex items-center gap-2 px-3 py-1 rounded-full text-emerald-800 font-bold border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{lang === 'ar' ? 'بريد تفعيل الحساب قيد الإرسال حالياً' : 'Activation email being dispatched'}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Add/Edit Hospital Form */}
              {showHospitalForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleSaveHospital}
                  className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col gap-4 font-sans text-right"
                >
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>{editingHospitalId ? (lang === 'ar' ? 'تعديل بيانات المركز الطبي' : 'Edit Hospital Details') : (lang === 'ar' ? 'اعتماد مستشفى وشريك رعاية طبي جديد' : 'Accredit New Hospital Partner')}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'اسم المستشفى (بالعربية)' : 'Hospital Name (Arabic)'}</label>
                      <input 
                        type="text" 
                        required
                        value={hNameAr}
                        onChange={(e) => setHNameAr(e.target.value)}
                        placeholder="مثال: مستشفى الموسوي الأهلي"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الموقع الجغرافي / العنوان (بالعربية)' : 'Location (Arabic)'}</label>
                      <input 
                        type="text" 
                        value={hLocAr}
                        onChange={(e) => setHLocAr(e.target.value)}
                        placeholder="مثال: حي الحسين"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الأطباء المعتمدين (مفصولين بفاصلة)' : 'Doctors list (comma separated)'}</label>
                      <input 
                        type="text" 
                        value={hDocsAr}
                        onChange={(e) => setHDocsAr(e.target.value)}
                        placeholder="د. علي السعدي, د. عباس التميمي"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الأقسام المتاحة (مفصولين بفاصلة)' : 'Departments list (comma separated)'}</label>
                      <input 
                        type="text" 
                        value={hDeptsAr}
                        onChange={(e) => setHDeptsAr(e.target.value)}
                        placeholder="طب العيون, طب الأطفال, الغدد الصماء"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        {lang === 'ar' ? 'البريد الإلكتروني (يستخدم لتسجيل الدخول)' : 'Login Email'}
                      </label>
                      <input 
                        type="email" 
                        required
                        value={hEmail}
                        onChange={(e) => setHEmail(e.target.value)}
                        placeholder="hospital@sehati.com"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        {lang === 'ar' ? 'كلمة المرور (اتركها فارغة للتوليد التلقائي)' : 'Password (Leave empty to auto-generate)'}
                      </label>
                      <input 
                        type="text" 
                        value={hPassword}
                        onChange={(e) => setHPassword(e.target.value)}
                        placeholder={lang === 'ar' ? 'توليد تلقائي آمن' : 'Auto-generated secure password'}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        {lang === 'ar' ? 'عدد الأطباء المسجلين الكلي' : 'Registered Doctors Total Count'}
                      </label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={hDoctorsCount}
                        onChange={(e) => setHDoctorsCount(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        {lang === 'ar' ? 'حالة الحساب المبدئية' : 'Initial Account Status'}
                      </label>
                      <select 
                        value={hStatus}
                        onChange={(e) => setHStatus(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="active">{lang === 'ar' ? 'نشط ومفعل وجاهز' : 'Active & Ready'}</option>
                        <option value="pending">{lang === 'ar' ? 'بانتظار التفعيل' : 'Pending Activation'}</option>
                        <option value="suspended">{lang === 'ar' ? 'موقوف مؤقتاً' : 'Suspended'}</option>
                      </select>
                    </div>

                    {/* Permissions checklist */}
                    <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                      <label className="text-xs font-bold text-slate-700 block mb-2">
                        {lang === 'ar' ? 'صلاحيات وامتيازات المستشفى داخل النظام:' : 'Hospital Permissions & Privileges:'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-150">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={hPermUpload}
                            onChange={(e) => setHPermUpload(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            {lang === 'ar' ? 'رفع التقارير والفحوصات' : 'Upload Reports'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={hPermAppointments}
                            onChange={(e) => setHPermAppointments(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            {lang === 'ar' ? 'إدارة وتعديل المواعيد' : 'Manage Appointments'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={hPermAlerts}
                            onChange={(e) => setHPermAlerts(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            {lang === 'ar' ? 'إرسال تنبيهات وإشعارات' : 'Send Alerts'}
                          </span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={hPermHistory}
                            onChange={(e) => setHPermHistory(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                          />
                          <span className="text-xs text-slate-700 font-medium">
                            {lang === 'ar' ? 'عرض سجل الطلاب المحالين' : 'View Student History'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowHospitalForm(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      {lang === 'ar' ? 'اعتماد المستشفى' : 'Save Hospital'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Hospitals List Registry */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
                <table className="w-full text-right text-xs font-sans text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-150">
                    <tr>
                      <th className="px-5 py-3.5">{lang === 'ar' ? 'الرمز والاتصال' : 'Clinical ID & Contact'}</th>
                      <th className="px-5 py-3.5">{lang === 'ar' ? 'المستشفى الشريك' : 'Hospital Partner'}</th>
                      <th className="px-5 py-3.5">{lang === 'ar' ? 'الموقع / العنوان' : 'Location'}</th>
                      <th className="px-5 py-3.5">{lang === 'ar' ? 'الأقسام والصلاحيات الممنوحة' : 'Specialties & Perms'}</th>
                      <th className="px-5 py-3.5 text-center">{lang === 'ar' ? 'إحصائيات الأداء المتراكم' : 'Referral/Clinical Stats'}</th>
                      <th className="px-5 py-3.5">{lang === 'ar' ? 'حالة الحساب' : 'Account Status'}</th>
                      <th className="px-5 py-3.5 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hospitals.map((h) => (
                      <tr key={h.id} className="hover:bg-gray-50/50 transition-all">
                        {/* ID & Contact info */}
                        <td className="px-5 py-4">
                          <span className="font-mono font-bold text-slate-500 block text-xs">{h.id}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{h.email}</span>
                        </td>
                        {/* Hospital Partner Name & Doctors */}
                        <td className="px-5 py-4 font-bold text-slate-800">
                          <div className="flex flex-col gap-1">
                            <span>{lang === 'ar' ? h.nameAr : h.nameEn}</span>
                            <span className="text-[9px] bg-teal-50 text-teal-800 border border-teal-100 px-1.5 py-0.5 rounded font-extrabold w-fit font-sans">
                              {lang === 'ar' ? `عدد الأطباء: ${h.doctorsCount ?? 10}` : `Doctors: ${h.doctorsCount ?? 10}`}
                            </span>
                          </div>
                        </td>
                        {/* Location */}
                        <td className="px-5 py-4 text-slate-600 font-medium">
                          {lang === 'ar' ? h.locationAr : h.locationEn}
                        </td>
                        {/* Specialties & Permissions */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {(lang === 'ar' ? h.departmentsAr : h.departmentsEn).map((dept, idx) => (
                                <span key={idx} className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-sans font-semibold">
                                  {dept}
                                </span>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {(h.permissions || []).map((perm, idx) => {
                                let labelAr = '';
                                let labelEn = '';
                                if (perm === 'upload_reports') { labelAr = 'رفع تقارير طبية'; labelEn = 'Upload Reports'; }
                                else if (perm === 'manage_appointments') { labelAr = 'إدارة مواعيد'; labelEn = 'Manage Appts'; }
                                else if (perm === 'send_alerts') { labelAr = 'إرسال تنبيهات'; labelEn = 'Send Alerts'; }
                                else if (perm === 'view_history') { labelAr = 'عرض السجلات'; labelEn = 'View History'; }
                                return (
                                  <span key={idx} className="bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                    {lang === 'ar' ? labelAr : labelEn}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                        {/* Combined Live Statistics */}
                        <td className="px-5 py-4">
                          <div className="grid grid-cols-3 gap-2 text-center text-[10px] bg-slate-50/50 border border-slate-150 p-2 rounded-xl max-w-[240px] mx-auto">
                            <div>
                              <span className="block font-black text-slate-800 text-xs">
                                {h.stats?.referredStudentsCount ?? 0}
                              </span>
                              <span className="text-[8px] font-extrabold text-slate-400 block mt-0.5">
                                {lang === 'ar' ? 'طلاب محالين' : 'Referred'}
                              </span>
                            </div>
                            <div className="border-r border-slate-200">
                              <span className="block font-black text-slate-800 text-xs">
                                {h.stats?.reportsCount ?? 0}
                              </span>
                              <span className="text-[8px] font-extrabold text-slate-400 block mt-0.5">
                                {lang === 'ar' ? 'تقارير مرفوعة' : 'Reports'}
                              </span>
                            </div>
                            <div className="border-r border-slate-200">
                              <span className="block font-black text-slate-800 text-xs">
                                {h.stats?.appointmentsCount ?? 0}
                              </span>
                              <span className="text-[8px] font-extrabold text-slate-400 block mt-0.5">
                                {lang === 'ar' ? 'مواعيد مؤكدة' : 'Appointments'}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* Status Badge */}
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border inline-block ${
                            h.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : h.status === 'pending'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {h.status === 'active' 
                              ? (lang === 'ar' ? 'نشط ومفعل' : 'Active') 
                              : h.status === 'pending'
                              ? (lang === 'ar' ? 'بانتظار التفعيل' : 'Pending Activation')
                              : (lang === 'ar' ? 'موقف الخدمة' : 'Suspended')
                            }
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => toggleHospitalStatus(h.id)}
                              title={lang === 'ar' ? 'تغيير حالة الحساب دورياً' : 'Cycle Account Status'}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                              {h.status === 'active' ? (
                                <ToggleRight className="w-4 h-4 text-emerald-600 animate-pulse" />
                              ) : h.status === 'pending' ? (
                                <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
                              ) : (
                                <ToggleLeft className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <button 
                              onClick={() => handleEditHospital(h)}
                              title={lang === 'ar' ? 'تعديل بيانات الحساب' : 'Edit Account'}
                              className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteHospital(h.id)}
                              title={lang === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
                              className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 3: STUDENTS & USER ROLES ACCOUNTS */}
      {activeTab === 'students_permissions' && (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200">
          
          {/* Sub Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <div className="flex gap-2">
              <button 
                onClick={() => setUserSubTab('students')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  userSubTab === 'students' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'الطلاب والملفات المدرسية المرتبطة' : 'Students & School Registries'}
              </button>

              <button 
                onClick={() => setUserSubTab('users')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  userSubTab === 'users' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang === 'ar' ? 'حسابات المستخدمين وتوزيع الصلاحيات' : 'User Roles & Access Levels'}
              </button>
            </div>

            <button 
              onClick={() => {
                if (userSubTab === 'students') {
                  setEditingStudentId(null);
                  setStNameAr(''); setStNameEn(''); setStAge(12); setStGradeAr(''); setStGradeEn('');
                  setStSchoolAr(''); setStSchoolEn(''); setStNationalId(''); setStParentAr('');
                  setStParentEn(''); setStParentPhone(''); setStChronicAr(''); setStChronicEn('');
                  setStVaccAr(''); setStVaccEn(''); setStHospitalAr(''); setStHospitalEn(''); setStParentEmail('');
                  setShowStudentForm(!showStudentForm);
                } else {
                  setEditingUserId(null);
                  setUEmail(''); setURole('student'); setUPermissions('read');
                  setShowUserForm(!showUserForm);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{userSubTab === 'students' ? (lang === 'ar' ? 'تسجيل طالب جديد' : 'Register Student') : (lang === 'ar' ? 'إنشاء حساب مستخدم' : 'Create Account')}</span>
            </button>
          </div>

          {/* SUBTAB 1: STUDENTS REGISTRY & LINKAGE */}
          {userSubTab === 'students' && (
            <div className="flex flex-col gap-6">

              {/* Student Success Notification Alert */}
              <AnimatePresence>
                {studentSuccessAlert && studentSuccessAlert.show && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-emerald-50 border-2 border-emerald-300 text-emerald-950 p-5 rounded-2xl flex items-start gap-3.5 shadow-md text-right font-sans border-dashed"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="font-extrabold text-emerald-900">{lang === 'ar' ? 'تم تسجيل الطالب بنجاح ورسم الملف الطبي!' : 'Student Registered Successfully!'}</span>
                      <p className="leading-relaxed font-semibold">
                        {lang === 'ar' ? studentSuccessAlert.msgAr : studentSuccessAlert.msgEn}
                      </p>
                      <div className="flex items-center gap-2 mt-2 bg-emerald-100/50 px-2.5 py-1 rounded-lg text-[10px] text-emerald-800 font-mono w-fit">
                        <span>Parent Alert Dispatched (SMS/Email)</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Register Student Form */}
              {showStudentForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleSaveStudent}
                  className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col gap-4 font-sans text-right"
                >
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span>{editingStudentId ? (lang === 'ar' ? 'تعديل الملف الطبي للطالب' : 'Edit Student Medical Folder') : (lang === 'ar' ? 'تسجيل طالب وربطه بالمدرسة المعتمدة' : 'Register & Link New Student to School')}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'اسم الطالب (بالعربية)' : 'Student Name (Arabic)'}</label>
                      <input 
                        type="text" 
                        required
                        value={stNameAr}
                        onChange={(e) => setStNameAr(e.target.value)}
                        placeholder="مثال: ريان جعفر السعدي"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'الصف والمجموعة الدراسية' : 'Grade & Division'}</label>
                      <input 
                        type="text" 
                        required
                        value={stGradeAr}
                        onChange={(e) => setStGradeAr(e.target.value)}
                        placeholder="مثال: الصف السادس - أ"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'ربط بالمدرسة المعتمدة' : 'Link to Registered School'}</label>
                      <select 
                        required
                        value={stSchoolAr}
                        onChange={(e) => setStSchoolAr(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="">{lang === 'ar' ? '-- اختر المدرسة --' : '-- Select School --'}</option>
                        {schools.map(sch => (
                          <option key={sch.id} value={sch.nameAr}>
                            {lang === 'ar' ? sch.nameAr : sch.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'العمر (بالسنوات)' : 'Age (Years)'}</label>
                      <input 
                        type="number" 
                        required
                        value={stAge}
                        onChange={(e) => setStAge(Number(e.target.value))}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'رقم الهوية الوطنية / الأكاديمي' : 'National ID / Academic Code'}</label>
                      <input 
                        type="text" 
                        required
                        value={stNationalId}
                        onChange={(e) => setStNationalId(e.target.value)}
                        placeholder="1029384756"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'فصيلة الدم' : 'Blood Type'}</label>
                      <select 
                        value={stBloodType}
                        onChange={(e) => setStBloodType(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bt => (
                          <option key={bt} value={bt}>{bt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'اسم ولي الأمر والقرابة' : 'Guardian Name'}</label>
                      <input 
                        type="text" 
                        required
                        value={stParentAr}
                        onChange={(e) => setStParentAr(e.target.value)}
                        placeholder="جعفر السعدي"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'هاتف التواصل لولي الأمر' : 'Guardian Mobile Phone'}</label>
                      <input 
                        type="tel" 
                        required
                        value={stParentPhone}
                        onChange={(e) => setStParentPhone(e.target.value)}
                        placeholder="07701122334"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'البريد الإلكتروني لولي الأمر' : 'Parent Email'}</label>
                      <input 
                        type="email" 
                        required
                        value={stParentEmail}
                        onChange={(e) => setStParentEmail(e.target.value)}
                        placeholder="father@example.com"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-right"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'ربط بالمستشفى المسؤول' : 'Link to Responsible Hospital'}</label>
                      <select 
                        required
                        value={stHospitalAr}
                        onChange={(e) => setStHospitalAr(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer text-right"
                      >
                        <option value="">{lang === 'ar' ? '-- اختر المستشفى --' : '-- Select Hospital --'}</option>
                        {hospitals.map(h => (
                          <option key={h.id} value={h.nameAr}>
                            {lang === 'ar' ? h.nameAr : h.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'حالة الحساسية / أمراض مزمنة (مفصولة بفاصلة)' : 'Chronic Conditions (comma separated)'}</label>
                      <input 
                        type="text" 
                        value={stChronicAr}
                        onChange={(e) => setStChronicAr(e.target.value)}
                        placeholder="مثال: الربو الشعبي, حساسية الفول"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowStudentForm(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      {lang === 'ar' ? 'حفظ وتسجيل الطالب' : 'Save Student'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Students Table listing */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-right text-xs font-sans text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-150">
                    <tr>
                      <th className="px-5 py-3">{lang === 'ar' ? 'الرقم الأكاديمي' : 'ID'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'الطالب' : 'Student Name'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'المدرسة والمستشفى المرتبط' : 'School & Hospital'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'الصف الدراسي' : 'Grade / Age'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'الحالة الصحية العامة' : 'Chronic Alerts'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'رقم ولي الأمر' : 'Guardian Mobile'}</th>
                      <th className="px-5 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-5 py-4 font-mono font-bold text-slate-500">{st.id}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="font-bold text-slate-900">{lang === 'ar' ? st.nameAr : st.nameEn}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{lang === 'ar' ? `الهوية: ${st.nationalId}` : `ID: ${st.nationalId}`}</div>
                          {st.parentEmail && (
                            <div className="text-[10px] text-indigo-600 font-mono mt-0.5">{st.parentEmail}</div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="font-extrabold text-slate-800">{lang === 'ar' ? st.schoolNameAr : st.schoolNameEn}</div>
                          <div className="text-[10px] text-slate-500 font-semibold mt-1 flex items-center gap-1 justify-end">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                            <span>{lang === 'ar' ? `المستشفى: ${st.linkedHospitalNameAr || 'مستشفى البصرة العام'}` : `Hospital: ${st.linkedHospitalNameEn || 'Basra General Hospital'}`}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="text-slate-700 font-semibold">{lang === 'ar' ? st.gradeAr : st.gradeEn}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{lang === 'ar' ? `${st.age} سنة` : `${st.age} years`}</div>
                        </td>
                        <td className="px-5 py-4">
                          {st.chronicDiseasesAr.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(lang === 'ar' ? st.chronicDiseasesAr : st.chronicDiseasesEn).map((cd, idx) => (
                                <span key={idx} className="bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 rounded text-[10px] font-sans font-bold flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                  <span>{cd}</span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 text-[10px]">
                              ✓ {lang === 'ar' ? 'سليم ولا توجد أمراض' : 'No chronic conditions'}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600 font-medium">
                          {st.parentPhone}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleEditStudent(st)}
                              className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(st.id)}
                              className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 2: ACCESS CONTROL & PERMISSIONS */}
          {userSubTab === 'users' && (
            <div className="flex flex-col gap-6">
              
              {/* Account Form */}
              {showUserForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleSaveUser}
                  className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col gap-4 font-sans text-right"
                >
                  <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-2">
                    <Lock className="w-5 h-5 text-emerald-600" />
                    <span>{editingUserId ? (lang === 'ar' ? 'تعديل صلاحيات الحساب' : 'Edit Account Permissions') : (lang === 'ar' ? 'إنشاء حساب جديد وتوزيع صلاحيات المنصة' : 'Create New Account & Allocate Rights')}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'البريد الإلكتروني للحساب' : 'Account Email'}</label>
                      <input 
                        type="email" 
                        required
                        value={uEmail}
                        onChange={(e) => setUEmail(e.target.value)}
                        placeholder="example@sehhati.plus"
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                      <input 
                        type="text"
                        value={uPassword}
                        onChange={(e) => setUPassword(e.target.value)}
                        placeholder={lang === 'ar' ? 'sehhati2026 (افتراضي)' : 'sehhati2026 (default)'}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'دور المستخدم الافتراضي' : 'Assigned User Role'}</label>
                      <select 
                        value={uRole}
                        onChange={(e) => setURole(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="admin">{lang === 'ar' ? 'مدير النظام (Admin)' : 'System Admin'}</option>
                        <option value="hospital">{lang === 'ar' ? 'مستشفى / عيادة (Hospital)' : 'Hospital Clinic'}</option>
                        <option value="school">{lang === 'ar' ? 'إدارة مدرسة (School)' : 'School Office'}</option>
                        <option value="student">{lang === 'ar' ? 'طالب / ولي أمر (Student/Parent)' : 'Student / Parent'}</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'نوع الصلاحية والوصول' : 'Permission Level'}</label>
                      <select 
                        value={uPermissions}
                        onChange={(e) => setUPermissions(e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        <option value="read">{lang === 'ar' ? 'قراءة فقط (Read Only)' : 'Read Only'}</option>
                        <option value="edit">{lang === 'ar' ? 'إضافة وتعديل (Edit & Add)' : 'Add, Edit & Save'}</option>
                        <option value="manage">{lang === 'ar' ? 'إدارة وتحكم كامل (Full Management)' : 'Full Management'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowUserForm(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button 
                      type="submit" 
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm"
                    >
                      {lang === 'ar' ? 'حفظ الحساب وتخصيص الصلاحيات' : 'Save Account'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Accounts Table Listing */}
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-right text-xs font-sans text-gray-700">
                  <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-150">
                    <tr>
                      <th className="px-5 py-3">{lang === 'ar' ? 'رقم المستخدم' : 'Account ID'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'البريد الإلكتروني' : 'User Email Address'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'دور المستخدم' : 'Platform Role'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'مستوى الصلاحية' : 'Permission Level'}</th>
                      <th className="px-5 py-3">{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th className="px-5 py-3 text-center">{lang === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-5 py-4 font-mono font-bold text-slate-500">{u.id}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className="text-slate-700 font-bold bg-slate-100 px-2.5 py-1 rounded text-[10px] font-sans">
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                            u.permissions === 'manage' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : u.permissions === 'edit'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {u.permissions === 'manage' ? (lang === 'ar' ? 'إدارة كاملة' : 'Full Management') : u.permissions === 'edit' ? (lang === 'ar' ? 'قراءة وتعديل' : 'Read & Write') : (lang === 'ar' ? 'قراءة فقط' : 'Read Only')}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${
                            u.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {u.status === 'active' ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'موقوف' : 'Suspended')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => toggleUserStatus(u.id)}
                              title={lang === 'ar' ? 'تبديل القفل' : 'Suspend user'}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
                            >
                              {u.status === 'active' ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                            </button>
                            <button 
                              onClick={() => handleEditUser(u)}
                              className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={u.email === 'admin@sehhati.plus'}
                              className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 4: GENERAL ANNOUNCEMENTS & CAMPAIGNS BROADCASTS */}
      {activeTab === 'announcements_broad' && (
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-200 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* New Broadcast Form */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-l border-slate-100 pb-6 lg:pb-0 lg:pl-6">
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <Bell className="w-5 h-5 text-emerald-600" />
              <span>{lang === 'ar' ? 'إنشاء وبث حملة توعية عامة' : 'Broadcast Public Campaign'}</span>
            </h3>

            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4 mt-4 font-sans text-right">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'عنوان التنبيه (بالعربية)' : 'Alert Title (Arabic)'}</label>
                <input 
                  type="text" 
                  required
                  value={annTitleAr}
                  onChange={(e) => setAnnTitleAr(e.target.value)}
                  placeholder="مثال: حملة التلقيح الوطنية ضد شلل الأطفال"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'عنوان التنبيه (بالإنجليزية)' : 'Alert Title (English)'}</label>
                <input 
                  type="text" 
                  value={annTitleEn}
                  onChange={(e) => setAnnTitleEn(e.target.value)}
                  placeholder="Example: National Polio Vaccine Campaign"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'نوع الحملة' : 'Alert / Campaign Type'}</label>
                <select 
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="vaccine">{lang === 'ar' ? 'حملة تلقيحات وتطعيمات (Vaccine)' : 'Vaccine Drive'}</option>
                  <option value="campaign">{lang === 'ar' ? 'ندوة وإرشاد صحي (Campaign)' : 'Awareness Seminar'}</option>
                  <option value="general">{lang === 'ar' ? 'إشعار إداري عام (General)' : 'Administrative Notice'}</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'جهة الإصدار والمسؤولية' : 'Issuing Authority / Agency'}</label>
                <input 
                  type="text" 
                  value={annSchoolAr}
                  onChange={(e) => setAnnSchoolAr(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'جهة الإصدار بالإنجليزية' : 'Issuing Authority (English)'}</label>
                <input 
                  type="text" 
                  value={annSchoolEn}
                  onChange={(e) => setAnnSchoolEn(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-left"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'تفاصيل ونص التنبيه الكامل (بالعربية)' : 'Broadcast Content (Arabic)'}</label>
                <textarea 
                  required
                  rows={4}
                  value={annDescAr}
                  onChange={(e) => setAnnDescAr(e.target.value)}
                  placeholder="مثال: يرجى العلم ببدء الجولة الثانية من التطعيم..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'تفاصيل ونص التنبيه (بالإنجليزية)' : 'Broadcast Content (English)'}</label>
                <textarea 
                  rows={3}
                  value={annDescEn}
                  onChange={(e) => setAnnDescEn(e.target.value)}
                  placeholder="Example: Please be notified that the second polio immunization wave starts next Sunday..."
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 text-left resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer mt-2"
              >
                <span>{lang === 'ar' ? 'بث الإعلان لكافة الشركاء' : 'Dispatch & Broadcast Alert'}</span>
              </button>
            </form>
          </div>

          {/* Broadcasts History list */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 text-sm md:text-base border-b border-slate-100 pb-3.5 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              <span>{lang === 'ar' ? 'سجل التنبيهات السابقة والمنشورة' : 'Broadcasts & Alerts History Logs'}</span>
            </h3>

            <div className="flex flex-col gap-4" id="broadcasts-history-logs">
              {announcements.map((ann) => (
                <div key={ann.id} className="border border-slate-150 p-5 rounded-2xl bg-slate-50 flex flex-col gap-2.5 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                        ann.type === 'vaccine'
                          ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/25'
                          : ann.type === 'campaign'
                            ? 'bg-blue-500/10 text-blue-800 border-blue-500/25'
                            : 'bg-slate-500/10 text-slate-800 border-slate-500/25'
                      }`}>
                        {lang === 'ar' 
                          ? (ann.type === 'vaccine' ? 'حملة تطعيم' : ann.type === 'campaign' ? 'توعية وإرشاد' : 'إشعار عام')
                          : ann.type.toUpperCase()
                        }
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
                    </div>

                    <button 
                      onClick={() => handleDeleteBroadcast(ann.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded-lg border border-slate-200 bg-white shadow-sm hover:bg-rose-50 transition-all cursor-pointer"
                      title={lang === 'ar' ? 'حذف البلاغ' : 'Delete announcement'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-extrabold text-slate-850 text-xs mt-1 leading-snug">
                    {lang === 'ar' ? ann.titleAr : ann.titleEn}
                  </h4>
                  
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                    {lang === 'ar' ? ann.descriptionAr : ann.descriptionEn}
                  </p>

                  {ann.schoolNameAr && (
                    <span className="text-[9px] text-slate-500 font-sans border-t border-slate-200/80 pt-1.5 mt-1 block">
                      {lang === 'ar' ? `المصدر والمسؤولية: ${ann.schoolNameAr}` : `Source Agency: ${ann.schoolNameEn}`}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
