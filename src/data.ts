/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, Appointment, HealthReport, EmergencyAlert, AnnouncementAlert, HospitalEntity, SchoolEntity, UserAccount } from './types';

// Let's establish today's date as June 25, 2026, matching system metadata
export const CURRENT_DATE_STRING = '2026-06-25';

export const initialSchools: SchoolEntity[] = [
  {
    id: 'SCH-301',
    nameAr: 'مدرسة السياب الابتدائية',
    nameEn: 'Al-Sayyab Primary School',
    studentCount: 1240,
    gradesAr: 'الصف الأول - الصف السادس',
    gradesEn: 'Grade 1 - Grade 6',
    status: 'active',
    locationAr: 'البصرة – العشار – قرب ساحة أم البروم',
    locationEn: 'Basra - Al-Ashar',
    email: 'sayyab.school@sehhati.plus',
    password: 'sayyab2026',
    permissions: ['register_students', 'send_reports', 'receive_alerts'],
    stats: {
      studentCount: 1240,
      reportsCount: 42,
      alertsCount: 15
    }
  },
  {
    id: 'SCH-302',
    nameAr: 'مدرسة الفراهيدي المتوسطة',
    nameEn: 'Al-Farahidi Intermediate School',
    studentCount: 980,
    gradesAr: 'الصف السابع - الصف التاسع',
    gradesEn: 'Grade 7 - Grade 9',
    status: 'active',
    locationAr: 'البصرة – الجبيلة – شارع الفراهيدي',
    locationEn: 'Basra - Al-Jubaila',
    email: 'farahidi.school@sehhati.plus',
    password: 'farahidi2026',
    permissions: ['register_students', 'receive_alerts'],
    stats: {
      studentCount: 980,
      reportsCount: 28,
      alertsCount: 8
    }
  }
];

export const initialUsers: UserAccount[] = [
  { id: 'USR-001', email: 'admin@sehhati.plus', role: 'admin', permissions: 'manage', status: 'active' },
  { id: 'USR-002', email: 'sayyab.school@sehhati.plus', role: 'school', permissions: 'edit', status: 'active' },
  { id: 'USR-003', email: 'farahidi.school@sehhati.plus', role: 'school', permissions: 'edit', status: 'active' },
  { id: 'USR-004', email: 'saadi.hospital@sehhati.plus', role: 'hospital', permissions: 'edit', status: 'active' },
  { id: 'USR-005', email: 'moussawi.hospital@sehhati.plus', role: 'hospital', permissions: 'edit', status: 'active' },
  { id: 'USR-006', email: 'student.ahmed@sehhati.plus', role: 'student', permissions: 'read', status: 'active' }
];

export const initialStudents: Student[] = [
  {
    id: 'STU-101',
    nameAr: 'أحمد علي الموسوي',
    nameEn: 'Ahmed Ali Al-Moussawi',
    age: 12,
    gradeAr: 'الصف السادس - أ',
    gradeEn: 'Grade 6 - A',
    status: 'good',
    chronicDiseasesAr: [],
    chronicDiseasesEn: [],
    vaccinationsAr: ['الحصبة', 'شلل الأطفال', 'الثلاثي البكتيري'],
    vaccinationsEn: ['Measles', 'Polio', 'DPT'],
    bloodType: 'O+',
    weight: 42,
    height: 148,
    parentNameAr: 'علي الموسوي',
    parentNameEn: 'Ali Al-Moussawi',
    parentPhone: '0771234567',
    nationalId: '1098273645',
    schoolNameAr: 'مدرسة السياب الابتدائية',
    schoolNameEn: 'Al-Sayyab Primary School',
    subscriptionPrice: 150000, // دينار عراقي سنوياً
    subscriptionStatus: 'active',
    subscriptionExpiry: '2027-03-15', // Active (>3 months)
    joinedDate: '2025-09-01',
  },
  {
    id: 'STU-102',
    nameAr: 'سارة حيدر الأسدي',
    nameEn: 'Sara Haider Al-Asadi',
    age: 10,
    gradeAr: 'الصف الخامس - ب',
    gradeEn: 'Grade 5 - B',
    status: 'review',
    chronicDiseasesAr: ['الربو الشعبي'],
    chronicDiseasesEn: ['Asthma'],
    vaccinationsAr: ['الحصبة', 'شلل الأطفال', 'التهاب الكبد ب'],
    vaccinationsEn: ['Measles', 'Polio', 'Hepatitis B'],
    bloodType: 'A-',
    weight: 34,
    height: 135,
    parentNameAr: 'حيدر الأسدي',
    parentNameEn: 'Haider Al-Asadi',
    parentPhone: '0789876543',
    nationalId: '1082736452',
    schoolNameAr: 'مدرسة السياب الابتدائية',
    schoolNameEn: 'Al-Sayyab Primary School',
    subscriptionPrice: 150000,
    subscriptionStatus: 'expiring_soon',
    subscriptionExpiry: '2026-08-20', // Yellow (expires in ~55 days - less than 3 months)
    joinedDate: '2024-09-01',
  },
  {
    id: 'STU-103',
    nameAr: 'يزيد رائد التميمي',
    nameEn: 'Yazeed Raid Al-Tamimi',
    age: 14,
    gradeAr: 'الصف الثامن - ج',
    gradeEn: 'Grade 8 - C',
    status: 'emergency',
    chronicDiseasesAr: ['حساسية الفول السوداني الشديدة'],
    chronicDiseasesEn: ['Severe Peanut Allergy'],
    vaccinationsAr: ['الحصبة', 'الجديري المائي'],
    vaccinationsEn: ['Measles', 'Varicella'],
    bloodType: 'B+',
    weight: 56,
    height: 162,
    parentNameAr: 'رائد التميمي',
    parentNameEn: 'Raid Al-Tamimi',
    parentPhone: '07503322110',
    nationalId: '1055273849',
    schoolNameAr: 'مدرسة الفراهيدي المتوسطة',
    schoolNameEn: 'Al-Farahidi Intermediate School',
    subscriptionPrice: 200000,
    subscriptionStatus: 'critical',
    subscriptionExpiry: '2026-07-12', // Red (expires in ~17 days - less than 1 month)
    joinedDate: '2023-09-01',
  },
  {
    id: 'STU-104',
    nameAr: 'فاطمة حسين الخفاجي',
    nameEn: 'Fatimah Hussein Al-Khafaji',
    age: 11,
    gradeAr: 'الصف السادس - ب',
    gradeEn: 'Grade 6 - B',
    status: 'good',
    chronicDiseasesAr: ['السكري من النوع الأول'],
    chronicDiseasesEn: ['Type 1 Diabetes'],
    vaccinationsAr: ['الحصبة', 'شلل الأطفال', 'المكورات الرئوية'],
    vaccinationsEn: ['Measles', 'Polio', 'Pneumococcal'],
    bloodType: 'AB+',
    weight: 38,
    height: 142,
    parentNameAr: 'حسين الخفاجي',
    parentNameEn: 'Hussein Al-Khafaji',
    parentPhone: '07701122334',
    nationalId: '1029384756',
    schoolNameAr: 'مدرسة السياب الابتدائية',
    schoolNameEn: 'Al-Sayyab Primary School',
    subscriptionPrice: 150000,
    subscriptionStatus: 'expired',
    subscriptionExpiry: '2026-06-15', // Expired (Gray/Past due)
    joinedDate: '2024-09-01',
  },
  {
    id: 'STU-105',
    nameAr: 'ريان جعفر السعدي',
    nameEn: 'Rayan Jaafar Al-Saadi',
    age: 13,
    gradeAr: 'الصف السابع - أ',
    gradeEn: 'Grade 7 - A',
    status: 'good',
    chronicDiseasesAr: [],
    chronicDiseasesEn: [],
    vaccinationsAr: ['الحصبة', 'شلل الأطفال'],
    vaccinationsEn: ['Measles', 'Polio'],
    bloodType: 'O-',
    weight: 48,
    height: 155,
    parentNameAr: 'جعفر السعدي',
    parentNameEn: 'Jaafar Al-Saadi',
    parentPhone: '07807766554',
    nationalId: '1066483920',
    schoolNameAr: 'مدرسة الفراهيدي المتوسطة',
    schoolNameEn: 'Al-Farahidi Intermediate School',
    subscriptionPrice: 200000,
    subscriptionStatus: 'active',
    subscriptionExpiry: '2026-12-01', // Active (>3 months)
    joinedDate: '2025-09-01',
  }
];

export const initialHospitals: HospitalEntity[] = [
  {
    id: 'HOS-401',
    nameAr: 'مستشفى السعدي الأهلي',
    nameEn: 'Al-Saadi Private Hospital',
    locationAr: 'البصرة – حي الجزيرة',
    locationEn: 'Basra – Al-Jazeera District',
    doctorsAr: ['د. عباس التميمي', 'د. زينب الجادري'],
    doctorsEn: ['Dr. Abbas Al-Tamimi', 'Dr. Zainab Al-Jaderi'],
    departmentsAr: ['طب الأسنان الوقائي', 'الطب العام والأطفال'],
    departmentsEn: ['Preventive Dentistry', 'Pediatric General Medicine'],
    doctorsCount: 15,
    email: 'saadi@sehati.com',
    password: 'password123',
    permissions: ['upload_reports', 'manage_appointments', 'send_alerts', 'view_history'],
    status: 'active',
    stats: {
      referredStudentsCount: 48,
      reportsCount: 35,
      appointmentsCount: 52
    }
  },
  {
    id: 'HOS-402',
    nameAr: 'مستشفى الموسوي الأهلي',
    nameEn: 'Al-Moussawi Private Hospital',
    locationAr: 'البصرة – حي الحسين',
    locationEn: 'Basra – Al-Hussein Quarter',
    doctorsAr: ['د. علي السعدي', 'د. ميثم الموسوي'],
    doctorsEn: ['Dr. Ali Al-Saadi', 'Dr. Maitham Al-Moussawi'],
    departmentsAr: ['الغدد الصماء والسكري', 'طب العيون والمنتظر'],
    departmentsEn: ['Endocrinology & Diabetes', 'Ophthalmology'],
    doctorsCount: 12,
    email: 'hospital@sehati.com',
    password: 'password123',
    permissions: ['upload_reports', 'manage_appointments', 'send_alerts', 'view_history'],
    status: 'active',
    stats: {
      referredStudentsCount: 120,
      reportsCount: 84,
      appointmentsCount: 134
    }
  },
  {
    id: 'HOS-403',
    nameAr: 'مستشفى دار الشفاء الأهلية',
    nameEn: 'Dar Al-Shifa Hospital',
    locationAr: 'البصرة – حي العشار',
    locationEn: 'Basra – Al-Ashar District',
    doctorsAr: ['د. ميثم الموسوي'],
    doctorsEn: ['Dr. Maitham Al-Moussawi'],
    departmentsAr: ['طب العيون والمنتظر'],
    departmentsEn: ['Ophthalmology'],
    doctorsCount: 8,
    email: 'daralshifa@sehati.com',
    password: 'password123',
    permissions: ['upload_reports', 'manage_appointments', 'view_history'],
    status: 'active',
    stats: {
      referredStudentsCount: 15,
      reportsCount: 10,
      appointmentsCount: 18
    }
  }
];

export const initialAppointments: Appointment[] = [
  {
    id: 'APP-201',
    studentId: 'STU-102',
    studentNameAr: 'سارة حيدر الأسدي',
    studentNameEn: 'Sara Haider Al-Asadi',
    departmentAr: 'طب العيون والمنتظر',
    departmentEn: 'Ophthalmology',
    date: '2026-06-25', // Today
    time: '09:30 AM',
    status: 'pending',
    hospitalNameAr: 'مستشفى دار الشفاء الأهلية',
    hospitalNameEn: 'Dar Al-Shifa Hospital',
    doctorNameAr: 'د. ميثم الموسوي',
    doctorNameEn: 'Dr. Maitham Al-Moussawi',
    notesAr: 'فحص دوري لقصر النظر ومتابعة النظارات الطبية',
    notesEn: 'Routine eye examination for myopia checkup',
  },
  {
    id: 'APP-202',
    studentId: 'STU-101',
    studentNameAr: 'أحمد علي الموسوي',
    studentNameEn: 'Ahmed Ali Al-Moussawi',
    departmentAr: 'طب الأسنان الوقائي',
    departmentEn: 'Preventive Dentistry',
    date: '2026-06-26', // Tomorrow
    time: '11:00 AM',
    status: 'confirmed',
    hospitalNameAr: 'مستشفى السعدي الأهلي',
    hospitalNameEn: 'Al-Saadi Private Hospital',
    doctorNameAr: 'د. عباس التميمي',
    doctorNameEn: 'Dr. Abbas Al-Tamimi',
    notesAr: 'فحص وتنظيف الأسنان الدوري',
    notesEn: 'Routine dental scaling and exam',
  },
  {
    id: 'APP-203',
    studentId: 'STU-104',
    studentNameAr: 'فاطمة حسين الخفاجي',
    studentNameEn: 'Fatimah Hussein Al-Khafaji',
    departmentAr: 'الغدد الصماء والسكري',
    departmentEn: 'Endocrinology & Diabetes',
    date: '2026-06-25', // Today
    time: '01:15 PM',
    status: 'confirmed',
    hospitalNameAr: 'مستشفى الموسوي الأهلي',
    hospitalNameEn: 'Al-Moussawi Private Hospital',
    doctorNameAr: 'د. علي السعدي',
    doctorNameEn: 'Dr. Ali Al-Saadi',
    notesAr: 'متابعة قراءات السكر وتعديل جرعات الأنسولين',
    notesEn: 'Insulin dosing adjustments and glucose review',
  },
  {
    id: 'APP-204',
    studentId: 'STU-105',
    studentNameAr: 'ريان جعفر السعدي',
    studentNameEn: 'Rayan Jaafar Al-Saadi',
    departmentAr: 'الطب العام والأطفال',
    departmentEn: 'Pediatric General Medicine',
    date: '2026-06-20',
    time: '08:00 AM',
    status: 'completed',
    hospitalNameAr: 'مستشفى السعدي الأهلي',
    hospitalNameEn: 'Al-Saadi Private Hospital',
    doctorNameAr: 'د. زينب الجادري',
    doctorNameEn: 'Dr. Zainab Al-Jaderi',
    notesAr: 'فحص ما قبل النشاط الرياضي المدرسي',
    notesEn: 'Pre-athletic sports clearance examination',
  }
];

export const initialReports: HealthReport[] = [
  {
    id: 'REP-301',
    studentId: 'STU-101',
    studentNameAr: 'أحمد علي الموسوي',
    studentNameEn: 'Ahmed Ali Al-Moussawi',
    typeAr: 'تقرير طبي عام',
    typeEn: 'General Health Assessment',
    date: '2026-05-12',
    diagnosisAr: 'صحة ممتازة ولا توجد أعراض مرضية. نسبة الهيموجلوبين مثالية.',
    diagnosisEn: 'Excellent physical fitness with optimal hemoglobin levels.',
    notesAr: 'يُنصح بالاستمرار في ممارسة الرياضة والغذاء الصحي المتكامل.',
    notesEn: 'Advised to maintain active routine and balanced diet.',
    doctorNameAr: 'د. زينب الجادري',
    doctorNameEn: 'Dr. Zainab Al-Jaderi',
    hospitalNameAr: 'مستشفى السعدي الأهلي',
    hospitalNameEn: 'Al-Saadi Private Hospital',
    attachmentName: 'general_fitness_report.pdf'
  },
  {
    id: 'REP-302',
    studentId: 'STU-102',
    studentNameAr: 'سارة حيدر الأسدي',
    studentNameEn: 'Sara Haider Al-Asadi',
    typeAr: 'فحص عيون ونظر',
    typeEn: 'Ophthalmology Diagnostic',
    date: '2026-03-04',
    diagnosisAr: 'ضعف نظر بسيط (قصر نظر -1.25 في كلتا العينين).',
    diagnosisEn: 'Mild myopia diagnosed (-1.25 Diopters in both eyes).',
    notesAr: 'تم وصف نظارات طبية للقراءة ورؤية السبورة المدرسية بدقة.',
    notesEn: 'Prescribed corrective eyeglasses for distance and reading.',
    doctorNameAr: 'د. ميثم الموسوي',
    doctorNameEn: 'Dr. Maitham Al-Moussawi',
    hospitalNameAr: 'مستشفى دار الشفاء الأهلية',
    hospitalNameEn: 'Dar Al-Shifa Hospital',
    attachmentName: 'eyeglass_prescription_2026.pdf'
  },
  {
    id: 'REP-303',
    studentId: 'STU-104',
    studentNameAr: 'فاطمة حسين الخفاجي',
    studentNameEn: 'Fatimah Hussein Al-Khafaji',
    typeAr: 'تحليل السكري التراكمي HbA1c',
    typeEn: 'HbA1c Diabetes Lab Test',
    date: '2026-06-10',
    diagnosisAr: 'معدل السكري التراكمي 7.2٪ (تحسن ملحوظ عن الفحص السابق 8.1٪).',
    diagnosisEn: 'HbA1c level is 7.2% (demonstrates progress from 8.1% previously).',
    notesAr: 'الاستمرار في مراقبة مستوى الجلوكوز اليومي، وجرعات الأنسولين منتظمة.',
    notesEn: 'Continue regular insulin regimen and close carbohydrate monitoring.',
    doctorNameAr: 'د. علي السعدي',
    doctorNameEn: 'Dr. Ali Al-Saadi',
    hospitalNameAr: 'مستشفى الموسوي الأهلي',
    hospitalNameEn: 'Al-Moussawi Private Hospital',
    attachmentName: 'hba1c_blood_lab_report.pdf'
  }
];

export const initialEmergencies: EmergencyAlert[] = [
  {
    id: 'SOS-901',
    studentId: 'STU-103',
    studentNameAr: 'يزيد رائد التميمي',
    studentNameEn: 'Yazeed Raid Al-Tamimi',
    schoolNameAr: 'مدرسة الفراهيدي المتوسطة',
    schoolNameEn: 'Al-Farahidi Intermediate School',
    locationAr: 'فناء الرياضة المدرسي',
    locationEn: 'School Playground Yard',
    time: '10:15 AM',
    status: 'active',
    descriptionAr: 'صعوبة شديدة في التنفس مع ظهور طفح جلدي حاد نتيجة ملامسة مادة تحتوي على الفول السوداني.',
    descriptionEn: 'Anaphylactic shock following accidental contact with peanut traces, severe dyspnea.',
    phone: '07503322110'
  }
];

export const initialAnnouncements: AnnouncementAlert[] = [
  {
    id: 'ANN-001',
    titleAr: 'حملة التلقيح الوطنية ضد شلل الأطفال والحصبة',
    titleEn: 'National Polio and Measles Vaccine Campaign',
    descriptionAr: 'تعلن دائرة الصحة بالتنسيق مع المدارس عن بدء حملة التلقيح الشاملة للطلبة من عمر 6 إلى 12 سنة ابتداءً من الأسبوع القادم.',
    descriptionEn: 'The Health Directorate, in coordination with schools, announces the launch of the vaccine drive for children aged 6-12 starting next week.',
    type: 'vaccine',
    date: '2026-06-20',
    schoolNameAr: 'جميع المدارس الشريكة',
    schoolNameEn: 'All Partnering Schools'
  },
  {
    id: 'ANN-002',
    titleAr: 'ندوة التوعية بمرض السكري لطلبة المدارس',
    titleEn: 'Diabetes Awareness & Nutrition Seminar',
    descriptionAr: 'تنظم عيادة مستشفى الموسوي الأهلي ندوة صحية توعوية وإرشادية حول العادات الغذائية السليمة للتعامل مع سكري الأطفال يوم الأحد القادم.',
    descriptionEn: 'Al-Moussawi Private Hospital organizes a nutritional guidance seminar for parents and students on pediatric diabetic care.',
    type: 'campaign',
    date: '2026-06-24',
    schoolNameAr: 'مستشفى الموسوي الأهلي',
    schoolNameEn: 'Al-Moussawi Private Hospital'
  }
];

// Complete Multi-lingual Translations Dictionary
export const translations = {
  ar: {
    title: 'صحتي',
    subtitle: 'رعاية صحية تبدأ من المدرسة',
    systemStatistics: 'إحصائيات المنصة الشاملة',
    searchPlaceholder: 'ابحث بالاسم، الرقم الأكاديمي، أو رقم الهوية...',
    emergencySOS: 'حالة طوارئ نشطة (SOS)',
    sosTriggered: 'تم تفعيل إنذار طوارئ فوري!',
    addStudent: 'إضافة طالب جديد',
    bookAppointment: 'حجز موعد طبي',
    uploadReport: 'رفع تقرير صحي',
    notifications: 'التنبيهات والإشعارات',
    allRightsReserved: 'جميع الحقوق محفوظة © منصة صحتي المدرسية في العراق ٢٠٢٦',
    
    // Roles
    role_student: 'بوابة الطالب / ولي الأمر',
    role_hospital: 'لوحة إدارة المستشفى',
    role_school: 'لوحة إدارة المدرسة',
    role_admin: 'لوحة التحكم الموحدة',
    switchRole: 'تبديل دور المستخدم الحالي:',
    loggedAs: 'أنت تتصفح بصفتك:',
    
    // Status badges
    status_good: 'سليم وجيد',
    status_review: 'بحاجة لمراجعة',
    status_emergency: 'حالة طارئة حرجة',

    // Subscriptions colors
    sub_active: 'اشتراك ساري (متبقي أكثر من ٣ أشهر)',
    sub_expiring_soon: 'يوشك على الانتهاء (أقل من ٣ أشهر)',
    sub_critical: 'حرج جداً (أقل من شهر)',
    sub_expired: 'منتهي الصلاحية',

    // Dashboard labels
    studentName: 'اسم الطالب',
    grade: 'الصف الدراسي',
    bloodType: 'فصيلة الدم',
    weight: 'الوزن (كجم)',
    height: 'الطول (سم)',
    nationalId: 'رقم الهوية الوطنية',
    age: 'العمر (سنوات)',
    parentName: 'اسم ولي الأمر',
    parentPhone: 'رقم جوال ولي الأمر',
    schoolName: 'اسم المدرسة',
    chronicDiseases: 'الأمراض المزمنة / الحساسية',
    vaccinations: 'اللقاحات والتطعيمات المستلمة',
    noChronic: 'لا توجد أمراض مزمنة مسجلة',
    noVaccines: 'لم يتم تسجيل لقاحات مؤخراً',

    // Appointments UI
    appointments: 'المواعيد الطبية',
    nextAppointment: 'الموعد القادم',
    noAppointments: 'لا توجد مواعيد مجدولة حالياً',
    department: 'القسم الطبي',
    date: 'التاريخ',
    time: 'الوقت',
    status: 'حالة الموعد',
    doctor: 'الطبيب المعالج',
    hospital: 'المستشفى / المركز الصحي',
    notes: 'ملاحظات وتوجيهات',
    confirm: 'تأكيد الموعد',
    cancel: 'إلغاء الموعد',
    actions: 'إجراءات',
    addAppointmentSuccess: 'تم حجز الموعد الطبي وإرسال تنبيه فوري لهاتف الطالب وولي أمره بنجاح!',

    // Reports UI
    healthRecord: 'الملف الصحي للطلاب',
    reportsAndLabs: 'التقارير الطبية ونتائج الفحوصات المخبرية',
    uploadReportSuccess: 'تم رفع التقرير الطبي بنجاح وربطه بالملف الصحي للطالب وإشعار المدرسة!',
    reportType: 'نوع الفحص',
    diagnosis: 'التشخيص الطبي',
    doctorNotes: 'توجيهات الطبيب',
    attachment: 'المرفق الطبي',
    downloadPdf: 'تحميل التقرير (PDF)',
    noReports: 'لا توجد تقارير طبية مرفوعة بعد.',

    // School UI
    totalStudents: 'إجمالي الطلاب المسجلين',
    subscribedStudents: 'الطلاب المشتركون في البرنامج',
    emergencyCount: 'الحالات الحرجة والطارئة',
    subscriptionRatio: 'نسبة اشتراك الطلاب المسجلين',
    monthlyHealthReports: 'التقارير والإحصائيات المدرسية الشهرية',
    schoolAlerts: 'التنبيهات والحملات الصحية النشطة للمدرسة',
    monthlySummary: 'ملخص شامل للحالة الصحية العامة ومقارنة النسب خلال العام الدراسي.',
    exportCSV: 'تصدير البيانات (Excel/CSV)',
    addSuccess: 'تم تسجيل الطالب في النظام المدرسي بنجاح وربطه بالصحة المدرسية!',
    
    // Subscriptions stats
    subManagement: 'إدارة وتتبع الاشتراكات السنوية',
    totalRevenue: 'إجمالي الإيرادات المحققة (سنوي)',
    averageSubValue: 'متوسط قيمة الاشتراك السنوي',
    activeSubs: 'الاشتراكات الفعالة',
    expiredSubs: 'الاشتراكات المنتهية',
    countdownLegend: 'مؤشر انتهاء صلاحية الاشتراك السنوي للطلاب:',
    daysRemaining: 'يوم متبقي',
    expiredDaysAgo: 'يوم مضى منذ الانتهاء',

    // Emergency UI
    emergencyHeader: 'لوحة التحكم بالحالات الطارئة SOS',
    emergencyDescription: 'هذا القسم يراقب إرسال إحداثيات زر الطوارئ من الساعات الذكية للطلاب أو المدرسة إلى طوارئ المستشفى مباشرة.',
    activeSOSAlerts: 'بلاغات الاستغاثة الحالية النشطة',
    resolveSOS: 'تم التعامل مع الحالة وإسعافها بنجاح',
    triggerSOSBtn: 'إطلاق استغاثة تجريبية (SOS)',
    sosTriggerMsg: 'تم إرسال إحداثيات الاستغاثة فوراً إلى أقرب سيارة إسعاف ومستشفى، وإبلاغ ولي الأمر والمدرسة بالتوازي.',

    // Interactive components labels
    departmentsDistribution: 'توزيع الحالات والمراجعات الطبية حسب التخصص',
    doctorLoad: 'إحصائيات الأطباء وأحمال العمل اليومية (عدد الحالات اليوم)',
    confirmBooking: 'تأكيد الحجز',
    selectStudent: 'اختر الطالب',
    selectDept: 'اختر القسم الطبي',
    selectHospital: 'اختر المستشفى',
    selectDoctor: 'اختر الطبيب',
    selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت',
    diagnosisLabel: 'التشخيص الطبي للحالة',
    notesLabel: 'توجيهات وإرشادات إضافية',
    saveData: 'حفظ البيانات وإرسال التنبيهات',

    // General terms
    addBtn: 'إضافة',
    closeBtn: 'إغلاق',
    filterByStatus: 'تصفية حسب الحالة الصحية:',
    all: 'الكل',
    filterBySub: 'تصفية حسب الاشتراك:',
    saveBtn: 'حفظ والتسجيل',
    requiredField: 'هذا الحقل مطلوب',
  },
  en: {
    title: 'MyHealth',
    subtitle: 'School Health Management System',
    systemStatistics: 'Unified Platform Statistics',
    searchPlaceholder: 'Search by student name, ID, or national identification...',
    emergencySOS: 'Active Emergency Alert (SOS)',
    sosTriggered: 'Emergency SOS Signal Triggered Successfully!',
    addStudent: 'Register New Student',
    bookAppointment: 'Book Medical Appointment',
    uploadReport: 'Upload Medical Report',
    notifications: 'Notifications & Broadcasts',
    allRightsReserved: 'All rights reserved © MyHealth Iraq School Health Platform 2026',
    
    // Roles
    role_student: 'Student & Parent Portal',
    role_hospital: 'Hospital Administration Panel',
    role_school: 'School Administration Panel',
    role_admin: 'Unified System Dashboard',
    switchRole: 'Switch Current Simulator Role:',
    loggedAs: 'You are viewing as:',
    
    // Status badges
    status_good: 'Healthy / Stable',
    status_review: 'Requires Medical Review',
    status_emergency: 'Critical Emergency',

    // Subscriptions colors
    sub_active: 'Active Subscription (> 3 months)',
    sub_expiring_soon: 'Expiring Soon (< 3 months)',
    sub_critical: 'Critical Attention (< 1 month)',
    sub_expired: 'Expired / Past Due',

    // Dashboard labels
    studentName: 'Student Name',
    grade: 'Grade Level',
    bloodType: 'Blood Type',
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    nationalId: 'National ID Number',
    age: 'Age (years)',
    parentName: 'Guardian Name',
    parentPhone: 'Guardian Mobile',
    schoolName: 'School Name',
    chronicDiseases: 'Chronic Conditions & Allergies',
    vaccinations: 'Received Vaccinations',
    noChronic: 'No chronic diseases recorded',
    noVaccines: 'No vaccines registered recently',

    // Appointments UI
    appointments: 'Medical Appointments',
    nextAppointment: 'Upcoming Appointment',
    noAppointments: 'No medical appointments scheduled',
    department: 'Medical Specialty',
    date: 'Date',
    time: 'Time',
    status: 'Appointment Status',
    doctor: 'Assigned Doctor',
    hospital: 'Assigned Healthcare Center',
    notes: 'Clinical Instructions',
    confirm: 'Confirm Appointment',
    cancel: 'Cancel Appointment',
    actions: 'Actions',
    addAppointmentSuccess: 'Medical appointment booked successfully! Notifications dispatched to both student and parent mobile devices.',

    // Reports UI
    healthRecord: 'Students Health Dossier',
    reportsAndLabs: 'Medical Diagnostic Reports & Lab Results',
    uploadReportSuccess: 'Medical report successfully recorded in student medical history. School authority notified.',
    reportType: 'Type of Diagnostic',
    diagnosis: 'Clinical Diagnosis',
    doctorNotes: 'Doctor Guidance',
    attachment: 'Medical Document',
    downloadPdf: 'Download PDF Report',
    noReports: 'No diagnostic reports uploaded yet.',

    // School UI
    totalStudents: 'Total Enrolled Students',
    subscribedStudents: 'Subscribed Students Count',
    emergencyCount: 'Critical Chronic Alerts',
    subscriptionRatio: 'School Enrollment Subscription Ratio',
    monthlyHealthReports: 'Monthly Comprehensive Health Dossier',
    schoolAlerts: 'Active Campaigns & Vaccine Guidelines',
    monthlySummary: 'Analytical insights and comparisons on the health progression across the school quarters.',
    exportCSV: 'Export Table Data (CSV/Excel)',
    addSuccess: 'Student registered and integrated into the School Health network successfully!',
    
    // Subscriptions stats
    subManagement: 'Annual Student Subscription Registry',
    totalRevenue: 'Total Earned Subscription Revenue (Annual)',
    averageSubValue: 'Average Subscription Value',
    activeSubs: 'Active Accounts',
    expiredSubs: 'Past Due Accounts',
    countdownLegend: 'Subscription expiration tracking calendar thresholds:',
    daysRemaining: 'Days Left',
    expiredDaysAgo: 'Days Elapsed Since Expiry',

    // Emergency UI
    emergencyHeader: 'SOS Emergency Response Control Desk',
    emergencyDescription: 'This interface tracks real-time cellular satellite coordinate uploads from smart wristbands or schools directly to our clinic triage units.',
    activeSOSAlerts: 'Active Distress Beacon Signals',
    resolveSOS: 'Resolve Distress Case (Triage Completed)',
    triggerSOSBtn: 'Trigger Test Beacon (SOS Signal)',
    sosTriggerMsg: 'GPS Coordinates dispatched immediately to nearby paramedic responders, notifying the parents and school simultaneously.',

    // Interactive components labels
    departmentsDistribution: 'Medical Review Distribution by Department',
    doctorLoad: 'Physician Case Count & Daily Patient Volume',
    confirmBooking: 'Confirm Appointment Booking',
    selectStudent: 'Select Student Profile',
    selectDept: 'Select Specialty',
    selectHospital: 'Select Hospital Clinic',
    selectDoctor: 'Select Physician',
    selectDate: 'Select Calendar Date',
    selectTime: 'Select Session Time',
    diagnosisLabel: 'Clinical Examination Diagnosis',
    notesLabel: 'Additional Treatment Directives',
    saveData: 'Commit Health Entry & Broadcast Alerts',

    // General terms
    addBtn: 'Create',
    closeBtn: 'Close',
    filterByStatus: 'Filter by Health Status:',
    all: 'All Profiles',
    filterBySub: 'Filter by Subscription Expiry:',
    saveBtn: 'Save & Dispatch',
    requiredField: 'This field is strictly required',
  }
};
