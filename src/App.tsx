/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { UserRole, Appointment, EmergencyAlert, HealthReport, AnnouncementAlert, HospitalEntity, Student, SchoolEntity, UserAccount } from './types';
import { 
  initialStudents, 
  initialAppointments, 
  initialReports, 
  initialEmergencies, 
  initialAnnouncements, 
  initialHospitals,
  initialSchools,
  initialUsers,
  translations 
} from './data';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import UnifiedDashboard from './components/UnifiedDashboard';
import LoginPortal from './components/LoginPortal';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity, ShieldAlert, Sparkles, AlertCircle, Building, Users } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, writeBatch, doc } from 'firebase/firestore';

export default function App() {
  // Secure authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loggedInRole, setLoggedInRole] = useState<UserRole | null>(null);

  // Simulator configurations
  const [currentRole, setCurrentRole] = useState<UserRole>('admin'); // Admin Unified is default to showcase stats!
  const [lang, setLang] = useState<'ar' | 'en'>('ar'); // Arabic is primary default

  // Shared reactive state representing the unified persistent platform
  const [students, setStudents] = useState<Student[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementAlert[]>([]);
  const [hospitals, setHospitals] = useState<HospitalEntity[]>([]);
  const [schools, setSchools] = useState<SchoolEntity[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);

  useEffect(() => {
    // Check if we need to seed the database
    const seedFirebase = async () => {
      if (localStorage.getItem('seeded_firebase_v1') === 'true') return;
      try {
        const batch = writeBatch(db);
        initialStudents.forEach(item => batch.set(doc(db, 'students', item.id), item));
        initialAppointments.forEach(item => batch.set(doc(db, 'appointments', item.id), item));
        initialReports.forEach(item => batch.set(doc(db, 'reports', item.id), item));
        initialEmergencies.forEach(item => batch.set(doc(db, 'emergencies', item.id), item));
        initialAnnouncements.forEach(item => batch.set(doc(db, 'announcements', item.id), item));
        initialHospitals.forEach(item => batch.set(doc(db, 'hospitals', item.id), item));
        initialSchools.forEach(item => batch.set(doc(db, 'schools', item.id), item));
        initialUsers.forEach(item => batch.set(doc(db, 'users', item.id), item));
        await batch.commit();
        localStorage.setItem('seeded_firebase_v1', 'true');
      } catch (err) {
        console.error("Seeding error:", err);
      }
    };
    seedFirebase();

    const unsubApps = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      setAppointments(snapshot.docs.map(doc => doc.data() as Appointment));
    }, (err) => console.error("Firebase error appointments:", err));

    const unsubEmgs = onSnapshot(collection(db, 'emergencies'), (snapshot) => {
      setEmergencies(snapshot.docs.map(doc => doc.data() as EmergencyAlert));
    }, (err) => console.error("Firebase error emergencies:", err));

    const unsubReps = onSnapshot(collection(db, 'reports'), (snapshot) => {
      setReports(snapshot.docs.map(doc => doc.data() as HealthReport));
    }, (err) => console.error("Firebase error reports:", err));

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      setStudents(snapshot.docs.map(doc => doc.data() as Student));
    }, (err) => console.error("Firebase error students:", err));

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      setAnnouncements(snapshot.docs.map(doc => doc.data() as AnnouncementAlert));
    }, (err) => console.error("Firebase error announcements:", err));

    const unsubHospitals = onSnapshot(collection(db, 'hospitals'), (snapshot) => {
      setHospitals(snapshot.docs.map(doc => doc.data() as HospitalEntity));
    }, (err) => console.error("Firebase error hospitals:", err));

    const unsubSchools = onSnapshot(collection(db, 'schools'), (snapshot) => {
      setSchools(snapshot.docs.map(doc => doc.data() as SchoolEntity));
    }, (err) => console.error("Firebase error schools:", err));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as UserAccount));
    }, (err) => console.error("Firebase error users:", err));

    return () => {
      unsubApps();
      unsubEmgs();
      unsubReps();
      unsubStudents();
      unsubAnnouncements();
      unsubHospitals();
      unsubSchools();
      unsubUsers();
    };
  }, []);

  const t = translations[lang];

  // Ref to jump to emergency response desk
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleJumpToSos = () => {
    // Switch to hospital role where the SOS desk is active
    setCurrentRole('hospital');
    setTimeout(() => {
      const sosElement = document.getElementById('hospital-sos-desk');
      if (sosElement) {
        sosElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Flash effect
        sosElement.classList.add('ring-4', 'ring-red-500', 'ring-offset-2');
        setTimeout(() => {
          sosElement.classList.remove('ring-4', 'ring-red-500', 'ring-offset-2');
        }, 3000);
      }
    }, 100);
  };

  const activeSosCount = emergencies.filter(e => e.status === 'active').length;

  return (
    <div 
      className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans selection:bg-emerald-500 selection:text-white"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      id="app-root-container"
    >
      {/* Shared Header Navigation with real-time tickers */}
      <Navbar 
        currentRole={currentRole} 
        setCurrentRole={setCurrentRole} 
        lang={lang} 
        setLang={setLang}
        activeSosCount={activeSosCount}
        onJumpToSos={handleJumpToSos}
        isLoggedIn={isLoggedIn}
        loggedInRole={loggedInRole}
        onLogout={async () => {
          try {
            await signOut(auth);
          } catch (error) {
            console.error("Error signing out:", error);
          }
          setIsLoggedIn(false);
          setUserEmail('');
          setLoggedInRole(null);
        }}
      />

      {/* Simulator Guidance Banner */}
      {isLoggedIn && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-b border-emerald-50 py-3 px-4 md:px-8 text-xs text-gray-700 font-sans flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="font-semibold text-emerald-950">
              {lang === 'ar' 
                ? 'محاكي بوابة التبادل الفوري الموحدة للصحة المدرسية:' 
                : 'Unified School Health Live Exchange Simulator:'
              }
            </span>
            <span className="text-gray-600">
              {lang === 'ar'
                ? 'تغيير المواعيد، رفع الفحوصات، أو تفعيل استغاثة SOS في أي دور ينعكس فوراً وتلقائياً على الأدوار الأخرى!'
                : 'Actions taken in any dashboard (uploading lab results, booking, triggering SOS) dynamically propagate across all user portals instantly!'
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-full border border-emerald-200">
              {lang === 'ar' ? 'تزامن كامل (3M مشترك)' : 'Full Sync Active (3M Database)'}
            </span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6" ref={mainContentRef}>
        
        {/* Animated Role Dashboard Container / Login Screen */}
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="w-full flex-1 flex flex-col"
            >
              <LoginPortal 
                lang={lang} 
                onLoginSuccess={(role, email) => {
                  setUserEmail(email);
                  setCurrentRole(role);
                  setLoggedInRole(role);
                  setIsLoggedIn(true);
                }} 
              />
            </motion.div>
          ) : (
            <motion.div
              key={currentRole}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full flex-1 flex flex-col"
            >
              {currentRole === 'admin' && (
                <UnifiedDashboard 
                  students={students}
                  setStudents={setStudents}
                  appointments={appointments}
                  setAppointments={setAppointments}
                  reports={reports}
                  setReports={setReports}
                  emergencies={emergencies}
                  announcements={announcements}
                  hospitals={hospitals}
                  setHospitals={setHospitals}
                  schools={schools}
                  setSchools={setSchools}
                  users={users}
                  setUsers={setUsers}
                  lang={lang}
                />
              )}

              {currentRole === 'student' && (
                <StudentDashboard 
                  students={students}
                  setStudents={setStudents}
                  appointments={appointments}
                  setAppointments={setAppointments}
                  reports={reports}
                  announcements={announcements}
                  emergencies={emergencies}
                  setEmergencies={setEmergencies}
                  lang={lang}
                />
              )}

              {currentRole === 'hospital' && (
                <HospitalDashboard 
                  students={students}
                  setStudents={setStudents}
                  appointments={appointments}
                  setAppointments={setAppointments}
                  reports={reports}
                  setReports={setReports}
                  emergencies={emergencies}
                  setEmergencies={setEmergencies}
                  hospitals={hospitals}
                  setHospitals={setHospitals}
                  lang={lang}
                />
              )}

              {currentRole === 'school' && (
                <SchoolDashboard 
                  students={students}
                  setStudents={setStudents}
                  announcements={announcements}
                  setAnnouncements={setAnnouncements}
                  lang={lang}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Aesthetic Footer */}
      <footer className="bg-white border-t border-emerald-50/50 py-6 text-center text-xs text-gray-500 font-sans tracking-tight">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-100" />
            <span className="font-bold text-gray-800">{t.title}</span>
            <span className="text-gray-400">|</span>
            <span>{t.subtitle}</span>
          </div>
          <p>{t.allRightsReserved}</p>
        </div>
      </footer>
    </div>
  );
}
