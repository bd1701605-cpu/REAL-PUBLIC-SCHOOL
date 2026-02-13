
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT'
}

export interface SchoolConfig {
  name: string;
  logo: string;
  address: string;
  contact: string;
  receiptFooter: string;
  receiptPrefix: string;
}

export interface User {
  id: string; // Internal ID
  uid: string; // Public UID (STD-..., TCH-...)
  role: UserRole;
  name: string;
  email: string;
  assignedClasses: string[]; // List of Class IDs
  isBlocked: boolean;
  avatar?: string;
}

export interface PerformanceRecord {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  total: number;
  grade: string;
  term: string;
  aiRemarks?: string;
}

export interface Homework {
  id: string;
  classId: string;
  teacherId: string;
  title: string;
  description: string;
  subject: string;
  type: 'HOMEWORK' | 'NOTES';
}

export interface Submission {
  id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  content: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string; // Head teacher
  logo?: string;
}

export interface LiveClass {
  id: string;
  classId: string;
  subject: string;
  teacherName: string;
  link: string;
  isActive: boolean;
}

export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amount: number;
  status: 'PAID' | 'PENDING';
  receiptId: string;
  months?: string[];
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  classId: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'URGENT' | 'EVENT';
  targetRole?: UserRole;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // Can be a User ID or a Room/Group ID
  text: string;
  timestamp: number;
}
