import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, GraduationCap, Building2, Activity, Key, Mail, Eye, EyeOff, Sparkles, ArrowRight, ArrowLeft, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './Logo';
import { auth, signInWithEmailAndPassword, db, collection, getDocs } from '../lib/firebase';

interface LoginPortalProps {
  onLoginSuccess: (role: UserRole, email: string) => void;
  lang: 'ar' | 'en';
}

export default function LoginPortal({ onLoginSuccess, lang }: LoginPortalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleType, setSelectedRoleType] = useState<UserRole>('admin');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Hardcoded real-world credentials for different users of the platform
  const credentials = {
    admin: {
      email: 'admin@sehati.gov.iq',
      password: 'admin123',
      nameAr: 'المهندس مصطفى - الأدمن العام',
      nameEn: 'Eng. Mustafa - Super Admin',
      descAr: 'صلاحيات كاملة للتحكم بالنظام، مراقبة المدارس والمستشفيات، وتحديث السجلات والرسوم.',
      descEn: 'Full system control: oversee schools & hospitals, review subscriptions, publish announcements.'
    },
    school: {
      email: 'sayyab@schools.gov.iq',
      password: 'school123',
      nameAr: 'مدرسة السياب الابتدائية',
      nameEn: 'Al-Sayyab Primary School',
      descAr: 'إدارة شؤون الطلاب، تتبع الغياب المرضي، إشراك الطلاب، واستعراض الإحصائيات المدرسية.',
      descEn: 'Manage student records, track sick leaves, add new students, review school statistics.'
    },
    hospital: {
      email: 'basra.gen@hospitals.gov.iq',
      password: 'hospital123',
      nameAr: 'مستشفى البصرة العام',
      nameEn: 'Basra General Hospital',
      descAr: 'إدارة وحجز المواعيد الطبية، رفع نتائج التحاليل والفحوصات، والاستجابة لنداءات SOS الطارئة.',
      descEn: 'Manage appointments, upload laboratory diagnostic reports, respond to student SOS alerts.'
    },
    student: {
      email: 'father@example.com',
      password: 'student123',
      nameAr: 'علي حسن (ولي الأمر والطالب)',
      nameEn: 'Ali Hassan (Parent & Student)',
      descAr: 'استعراض التقرير الصحي، المواعيد المجدولة، تتبع اللقاحات، وإطلاق بلاغات الاستغاثة SOS.',
      descEn: 'View physical checkups, upcoming appointments, vaccinations history, and trigger SOS alerts.'
    }
  };

  const handleQuickFill = (role: UserRole) => {
    setSelectedRoleType(role);
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const targetCreds = credentials[selectedRoleType];
    const emailTrimmed = email.trim();
    
    if (emailTrimmed === targetCreds.email && password === targetCreds.password) {
      try {
        await signInWithEmailAndPassword(auth, emailTrimmed, password);
        onLoginSuccess(selectedRoleType, emailTrimmed);
      } catch {
        onLoginSuccess(selectedRoleType, emailTrimmed);
      }
      return;
    }

    // Check Nhost for custom users (created via admin panel)
    try {
      const userSnap = await getDocs(collection(db, 'users'));
      const matched = userSnap.docs.map((d: any) => d.data()).find((u: any) => u.email === emailTrimmed && u.password === password);
      if (matched) {
        onLoginSuccess(matched.role || selectedRoleType, emailTrimmed);
        return;
      }
    } catch {}

    setError(lang === 'ar' 
      ? 'اسم المستخدم أو كلمة المرور غير صحيحة للدور المحدد! يرجى استخدام المعطيات المحددة بالأسفل.' 
      : 'Invalid username or password for this role! Please use the autofill presets below.'
    );
    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row min-h-[calc(100vh-180px)] rounded-[2.5rem] overflow-hidden bg-white shadow-xl border border-slate-200" id="login-portal-wrapper">
      
      {/* Left Column: Visual Slogan & Description of Sehati+ */}
      <div className="w-full lg:w-5/12 bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden" id="login-brand-sidebar">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 z-10">
          <Logo className="w-14 h-14 shrink-0 bg-white/5 p-2 rounded-2xl" />
          <div>
            <h2 className="text-xl font-black flex items-center gap-1">
              <span>{lang === 'ar' ? 'صحتي' : 'MyHealth'}</span>
              <span className="text-[#10B981] text-2xl">+</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lang === 'ar' ? 'بوابة الصحة المدرسية الموحدة في العراق' : 'Unified Iraq School Health Portal'}</p>
          </div>
        </div>

        <div className="my-12 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full w-fit text-xs font-bold"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{lang === 'ar' ? 'النظام المتكامل المعتمد وطنياً' : 'National Accredited Health System'}</span>
          </motion.div>

          <h3 className="text-2xl md:text-3xl font-black mt-4 leading-tight">
            {lang === 'ar' 
              ? 'تغطية ورعاية طبية شاملة لـ ٣ مليون طالب عراقي' 
              : 'Complete Healthcare & Safety for 3M Iraqi Students'
            }
          </h3>
          <p className="text-slate-400 text-xs md:text-sm mt-4 leading-relaxed font-sans">
            {lang === 'ar'
              ? 'منظومة تفاعلية موحدة تربط المدارس، والمراكز الصحية الإقليمية، والمستشفيات العامة، وأولياء الأمور لتتبع اللقاحات، الكشوفات الدورية، وحالات الاستغاثة الفورية عبر الساعات الذكية.'
              : 'An integrated network linking primary schools, regional hospitals, and active guardians to seamlessly track vaccinations, medical checkups, and instant cellular SOS safety beacons.'
            }
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 font-bold block">{lang === 'ar' ? 'المستشفيات المرتبطة' : 'Linked Hospitals'}</span>
              <span className="text-lg font-mono font-bold text-emerald-400">120+</span>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 font-bold block">{lang === 'ar' ? 'المدارس المسجلة' : 'Registered Schools'}</span>
              <span className="text-lg font-mono font-bold text-emerald-400">1,450+</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 z-10 border-t border-white/5 pt-4">
          <p>{lang === 'ar' ? 'جمهورية العراق - وزارة الصحة والبيئة بالتنسيق مع وزارة التربية ٢٠٢٦' : 'Republic of Iraq - Ministry of Health & Ministry of Education 2026'}</p>
        </div>
      </div>

      {/* Right Column: Secure Interactive Login Form */}
      <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-between bg-[#F8FAFC]">
        <div className="max-w-md w-full mx-auto" id="login-form-container">
          <div className="text-right sm:text-right">
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              {lang === 'ar' ? 'مرحباً بك في منصة صحتي+' : 'Welcome back to Sehati+'}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 font-semibold">
              {lang === 'ar' 
                ? 'اختر نوع الحساب وقم بتسجيل الدخول لبدء المراقبة والمتابعة الفورية'
                : 'Select account role type and enter credentials to gain authorized access'
              }
            </p>
          </div>

          {/* Role Type Selector Tabs (Super Admin, School, Hospital, Student) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRoleType === 'admin'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'أدمن النظام' : 'Admin'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('school')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRoleType === 'school'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'المدرسة' : 'School'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('hospital')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRoleType === 'hospital'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'المستشفى' : 'Hospital'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('student')}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                selectedRoleType === 'student'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span className="text-[10px] font-bold">{lang === 'ar' ? 'الطالب' : 'Student'}</span>
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs font-bold mt-4 text-right flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Secure Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-5 text-right font-sans">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 justify-end">
                <span>{lang === 'ar' ? 'البريد الإلكتروني المعتمد' : 'Authorized Email Address'}</span>
                <Mail className="w-3 h-3 text-slate-400" />
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@sehati.gov.iq"
                className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-right"
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 justify-end">
                <span>{lang === 'ar' ? 'كلمة المرور الأمنية' : 'Security Password'}</span>
                <Key className="w-3 h-3 text-slate-400" />
              </label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-right w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer shadow hover:shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>{lang === 'ar' ? 'تسجيل الدخول الآمن' : 'Authorize Secure Session'}</span>
                  {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Autofill Presets Assistant Panel (المستخدمين المتاحين للتجربة السريعة) */}
        <div className="mt-8 border-t border-slate-200 pt-6 max-w-md w-full mx-auto text-right">
          <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1 justify-end mb-3">
            <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold">
              {lang === 'ar' ? 'اضغط للاختيار والتعبئة الفورية' : 'Click to Auto-Fill'}
            </span>
            <span>{lang === 'ar' ? 'المستخدمين التجريبيين للمنصة' : 'Interactive Demo Credentials'}</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Super Admin Preset */}
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="p-3 bg-white border border-slate-150 rounded-2xl text-right hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-800 block group-hover:text-emerald-800 transition-colors">
                  {lang === 'ar' ? '١. الأدمن الرئيسي الموحد' : '1. System Administrator'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{credentials.admin.email}</span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 opacity-80 group-hover:scale-110 transition-transform" />
            </button>

            {/* School Authority Preset */}
            <button
              type="button"
              onClick={() => handleQuickFill('school')}
              className="p-3 bg-white border border-slate-150 rounded-2xl text-right hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-800 block group-hover:text-emerald-800 transition-colors">
                  {lang === 'ar' ? '٢. مدرسة السياب الابتدائية' : '2. School Principal'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{credentials.school.email}</span>
              </div>
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0 opacity-80 group-hover:scale-110 transition-transform" />
            </button>

            {/* Partner Hospital Preset */}
            <button
              type="button"
              onClick={() => handleQuickFill('hospital')}
              className="p-3 bg-white border border-slate-150 rounded-2xl text-right hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-800 block group-hover:text-emerald-800 transition-colors">
                  {lang === 'ar' ? '٣. مستشفى البصرة العام' : '3. Hospital Desk'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{credentials.hospital.email}</span>
              </div>
              <Activity className="w-5 h-5 text-emerald-600 shrink-0 opacity-80 group-hover:scale-110 transition-transform" />
            </button>

            {/* Student/Parent Preset */}
            <button
              type="button"
              onClick={() => handleQuickFill('student')}
              className="p-3 bg-white border border-slate-150 rounded-2xl text-right hover:border-emerald-500 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-800 block group-hover:text-emerald-800 transition-colors">
                  {lang === 'ar' ? '٤. ولي الأمر والطالب' : '4. Student & Parent'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{credentials.student.email}</span>
              </div>
              <GraduationCap className="w-5 h-5 text-emerald-600 shrink-0 opacity-80 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
