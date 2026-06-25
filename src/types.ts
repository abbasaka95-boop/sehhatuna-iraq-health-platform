/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'student' | 'hospital' | 'school' | 'admin';

export interface Student {
  id: string;
  nameAr: string;
  nameEn: string;
  age: number;
  gradeAr: string;
  gradeEn: string;
  status: 'good' | 'review' | 'emergency';
  chronicDiseasesAr: string[];
  chronicDiseasesEn: string[];
  vaccinationsAr: string[];
  vaccinationsEn: string[];
  bloodType: string;
  weight: number; // kg
  height: number; // cm
  parentNameAr: string;
  parentNameEn: string;
  parentPhone: string;
  nationalId: string;
  schoolNameAr: string;
  schoolNameEn: string;
  linkedHospitalNameAr?: string;
  linkedHospitalNameEn?: string;
  parentEmail?: string;
  subscriptionPrice: number;
  subscriptionStatus: 'active' | 'expiring_soon' | 'critical' | 'expired';
  subscriptionExpiry: string; // YYYY-MM-DD
  joinedDate: string; // YYYY-MM-DD
}

export interface Appointment {
  id: string;
  studentId: string;
  studentNameAr: string;
  studentNameEn: string;
  departmentAr: string;
  departmentEn: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  hospitalNameAr: string;
  hospitalNameEn: string;
  doctorNameAr: string;
  doctorNameEn: string;
  notesAr?: string;
  notesEn?: string;
}

export interface HealthReport {
  id: string;
  studentId: string;
  studentNameAr: string;
  studentNameEn: string;
  typeAr: string; // e.g. فحص دم, فحص عيون
  typeEn: string;
  date: string;
  diagnosisAr: string;
  diagnosisEn: string;
  notesAr: string;
  notesEn: string;
  doctorNameAr: string;
  doctorNameEn: string;
  hospitalNameAr: string;
  hospitalNameEn: string;
  attachmentName?: string;
}

export interface EmergencyAlert {
  id: string;
  studentId: string;
  studentNameAr: string;
  studentNameEn: string;
  schoolNameAr: string;
  schoolNameEn: string;
  locationAr: string;
  locationEn: string;
  time: string;
  status: 'active' | 'resolved';
  descriptionAr: string;
  descriptionEn: string;
  phone: string;
}

export interface HospitalEntity {
  id: string;
  nameAr: string;
  nameEn: string;
  locationAr: string;
  locationEn: string;
  doctorsAr: string[];
  doctorsEn: string[];
  departmentsAr: string[];
  departmentsEn: string[];
  doctorsCount: number;
  email: string;
  password?: string;
  permissions: string[]; // e.g. ['upload_reports', 'manage_appointments', 'send_alerts', 'view_history']
  status: 'active' | 'suspended' | 'pending';
  stats: {
    referredStudentsCount: number;
    reportsCount: number;
    appointmentsCount: number;
  };
}

export interface SchoolEntity {
  id: string;
  nameAr: string;
  nameEn: string;
  studentCount: number;
  gradesAr: string;
  gradesEn: string;
  status: 'active' | 'suspended' | 'pending';
  locationAr?: string;
  locationEn?: string;
  email?: string;
  password?: string;
  permissions?: string[];
  stats?: {
    studentCount: number;
    reportsCount: number;
    alertsCount: number;
  };
}

export interface UserAccount {
  id: string;
  email: string;
  role: 'hospital' | 'school' | 'student' | 'admin';
  permissions: 'read' | 'edit' | 'manage';
  status: 'active' | 'suspended';
}

export interface AnnouncementAlert {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  type: 'vaccine' | 'campaign' | 'general' | 'emergency';
  date: string;
  schoolNameAr?: string;
  schoolNameEn?: string;
}
