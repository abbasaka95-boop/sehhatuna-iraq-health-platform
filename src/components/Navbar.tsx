/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole } from '../types';
import { translations } from '../data';
import { Activity, ShieldAlert, Heart, Calendar, GraduationCap, Building2, LayoutDashboard, Languages, Clock, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import Logo from './Logo';


interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  activeSosCount: number;
  onJumpToSos: () => void;
  isLoggedIn: boolean;
  loggedInRole: UserRole | null;
  onLogout: () => void;
}

export default function Navbar({
  currentRole,
  setCurrentRole,
  lang,
  setLang,
  activeSosCount,
  onJumpToSos,
  isLoggedIn,
  loggedInRole,
  onLogout,
}: NavbarProps) {
  const t = translations[lang];
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div className="w-full flex flex-col sticky top-0 z-50">
      {/* Dynamic Red SOS Alert Bar */}
      {activeSosCount > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-red-600 text-white text-xs md:text-sm py-2.5 px-4 font-sans flex items-center justify-between shadow-inner select-none relative overflow-hidden"
          id="sos-ticker-banner"
        >
          {/* Pulsing light behind */}
          <div className="absolute inset-0 bg-red-700 animate-pulse opacity-50 pointer-events-none" />
          
          <div className="flex items-center gap-2 z-10 font-bold">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <ShieldAlert className="w-4 h-4" />
            <span>
              {lang === 'ar' 
                ? `تنبيه حرج: هناك ${activeSosCount} حالة استغاثة طبية نشطة من الساعات الذكية للطلاب!`
                : `CRITICAL ALERT: There are ${activeSosCount} active student emergency distress signals!`
              }
            </span>
          </div>
          
          <button
            onClick={onJumpToSos}
            className="z-10 bg-white text-red-700 font-bold px-3 py-1 rounded-full text-xs hover:bg-red-50 transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            id="jump-to-sos-btn"
          >
            {lang === 'ar' ? 'عرض موقع الحالة وتفاصيل الإسعاف' : 'View GPS & Ambulance Status'}
          </button>
        </motion.div>
      )}

      {/* Main Glassmorphic Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm px-6 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Slogan */}
        <div className="flex items-center gap-4">
          <Logo className="w-16 h-16 flex-shrink-0" />
          <div className="flex flex-col text-right md:text-right">
            <h1 className="text-xl md:text-2xl font-black text-slate-800 leading-none flex items-center gap-1.5">
              <span className="text-[#0F3A60]">{lang === 'ar' ? 'صحتي' : 'MyHealth'}</span>
              <span className="text-[#10B981] font-black text-3xl md:text-4xl font-sans leading-none relative -top-1 ml-0.5">+</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200 font-mono self-center">
                v2.6
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-bold tracking-tight mt-1">{t.subtitle}</p>
          </div>
        </div>

        {/* Live Clock / Active User Status */}
        <div className="flex items-center gap-3.5 flex-wrap md:flex-nowrap justify-center">
          {/* Active User Indicator Badge */}
          {isLoggedIn && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-emerald-950 font-extrabold text-xs" id="navbar-user-indicator">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>
                {currentRole === 'admin' && (lang === 'ar' ? 'أدمن النظام' : 'Super Admin')}
                {currentRole === 'school' && (lang === 'ar' ? 'مدرسة السياب' : 'Al-Sayyab School')}
                {currentRole === 'hospital' && (lang === 'ar' ? 'مستشفى البصرة' : 'Basra Hospital')}
                {currentRole === 'student' && (lang === 'ar' ? 'ولي الأمر والكل' : 'Guardian/Student')}
              </span>
            </div>
          )}

          {/* Arabic & English Switcher */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all duration-200 cursor-pointer min-h-[44px] min-w-[44px] shadow-sm"
            id="lang-toggle-btn"
            title="تغيير اللغة / Switch Language"
          >
            <Languages className="w-4 h-4 text-slate-500" />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Time & Counter */}
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs text-slate-600 font-mono min-h-[44px] shadow-sm">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{time || '00:00:00 AM'}</span>
          </div>

          {/* Secure Logout Button */}
          {isLoggedIn && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 hover:shadow transition-all duration-200 cursor-pointer min-h-[44px] shadow-sm"
              id="logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>{lang === 'ar' ? 'خروج' : 'Logout'}</span>
            </button>
          )}
        </div>
      </header>

      {/* Role Navigation Switcher Bar - only accessible if logged in as Admin */}
      {isLoggedIn && loggedInRole === 'admin' && (
        <nav className="bg-[#0F172A] text-slate-100 py-3.5 px-6 md:px-8 shadow-md border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">

        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold">
          <LayoutDashboard className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">{t.switchRole}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap w-full sm:w-auto justify-center">
          {/* Admin Role */}
          <button
            onClick={() => setCurrentRole('admin')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer min-h-[38px] ${
              currentRole === 'admin'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
            id="role-btn-admin"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>{t.role_admin}</span>
          </button>

          {/* Student Role */}
          <button
            onClick={() => setCurrentRole('student')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer min-h-[38px] ${
              currentRole === 'student'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
            id="role-btn-student"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{t.role_student}</span>
          </button>

          {/* School Role */}
          <button
            onClick={() => setCurrentRole('school')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer min-h-[38px] ${
              currentRole === 'school'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
            id="role-btn-school"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{t.role_school}</span>
          </button>

          {/* Hospital Role */}
          <button
            onClick={() => setCurrentRole('hospital')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer min-h-[38px] ${
              currentRole === 'hospital'
                ? 'bg-emerald-600 text-white shadow-md font-bold'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
            id="role-btn-hospital"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.role_hospital}</span>
          </button>
        </div>
      </nav>
      )}
    </div>
  );
}
