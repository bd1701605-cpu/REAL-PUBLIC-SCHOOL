
import { User, UserRole, Class, SchoolConfig, Notification, FeeRecord, LeaveRequest, LiveClass, PerformanceRecord, Homework, Submission, Attendance, Message } from '../types';

const STORAGE_KEYS = {
  USERS: 'rps_users',
  CLASSES: 'rps_classes',
  CONFIG: 'rps_config',
  NOTIFICATIONS: 'rps_notifications',
  FEES: 'rps_fees',
  LEAVES: 'rps_leaves',
  LIVE_CLASSES: 'rps_live_classes',
  PERFORMANCE: 'rps_performance',
  HOMEWORK: 'rps_homework',
  SUBMISSIONS: 'rps_submissions',
  ATTENDANCE: 'rps_attendance',
  MESSAGES: 'rps_messages'
};

const INITIAL_CONFIG: SchoolConfig = {
  name: "Real Public School",
  logo: "https://picsum.photos/seed/school/200/200",
  address: "Chhapiya Buzurg, Siwan",
  contact: "+91 7783091380",
  receiptFooter: "This is a computer-generated receipt. Signature not required.",
  receiptPrefix: "778"
};

const INITIAL_CLASSES: Class[] = [
  { id: 'CLASS-101', name: 'Grade 10-A', teacherId: '2' },
  { id: 'CLASS-102', name: 'Grade 10-B', teacherId: '2' },
  { id: 'CLASS-103', name: 'Grade 11-A', teacherId: '4' },
];

const INITIAL_USERS: User[] = [
  { id: '1', uid: 'ADM-001', role: UserRole.ADMIN, name: 'Admin User', email: 'admin@rps.edu', isBlocked: false, assignedClasses: [] },
  { id: '2', uid: 'TCH-001', role: UserRole.TEACHER, name: 'John Smith', email: 'john@rps.edu', assignedClasses: ['CLASS-101', 'CLASS-102'], isBlocked: false },
  { id: '3', uid: 'STD-001', role: UserRole.STUDENT, name: 'Alice Doe', email: 'alice@rps.edu', assignedClasses: ['CLASS-101'], isBlocked: false },
];

export const dbService = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: User[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),
  
  getClasses: (): Class[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return data ? JSON.parse(data) : INITIAL_CLASSES;
  },
  saveClasses: (classes: Class[]) => localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes)),

  getConfig: (): SchoolConfig => {
    const data = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return data ? JSON.parse(data) : INITIAL_CONFIG;
  },
  saveConfig: (config: SchoolConfig) => localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config)),

  getNotifications: (): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [
      { id: '1', title: 'Welcome to RPS', message: 'The school portal is now active.', type: 'INFO' }
    ];
  },
  saveNotifications: (notes: Notification[]) => localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notes)),

  getFees: (): FeeRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FEES);
    return data ? JSON.parse(data) : [
      { id: 'f1', studentId: '3', amount: 5000, status: 'PAID', receiptId: '778301380', months: ['April'] }
    ];
  },
  saveFees: (fees: FeeRecord[]) => localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees)),

  getLeaves: (): LeaveRequest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LEAVES);
    return data ? JSON.parse(data) : [];
  },
  saveLeaves: (leaves: LeaveRequest[]) => localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves)),

  getLiveClasses: (): LiveClass[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LIVE_CLASSES);
    return data ? JSON.parse(data) : [
      { id: 'l1', classId: 'CLASS-101', subject: 'Physics - Optics', teacherName: 'John Smith', link: 'https://meet.google.com', isActive: true }
    ];
  },
  saveLiveClasses: (liveClasses: LiveClass[]) => localStorage.setItem(STORAGE_KEYS.LIVE_CLASSES, JSON.stringify(liveClasses)),

  getPerformance: (): PerformanceRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PERFORMANCE);
    return data ? JSON.parse(data) : [
      { id: 'p1', studentId: '3', subject: 'Mathematics', score: 95, total: 100, grade: 'A+', term: 'First Term', aiRemarks: 'Alice shows exceptional analytical skills.' },
      { id: 'p2', studentId: '3', subject: 'Physics', score: 88, total: 100, grade: 'A', term: 'First Term', aiRemarks: 'Solid performance in mechanics.' }
    ];
  },
  savePerformance: (records: PerformanceRecord[]) => localStorage.setItem(STORAGE_KEYS.PERFORMANCE, JSON.stringify(records)),

  getHomework: (): Homework[] => {
    const data = localStorage.getItem(STORAGE_KEYS.HOMEWORK);
    return data ? JSON.parse(data) : [
      { id: 'hw1', classId: 'CLASS-101', teacherId: '2', title: 'Trigonometry Assignment', description: 'Complete exercises from the textbook.', subject: 'Mathematics', type: 'HOMEWORK' }
    ];
  },
  saveHomework: (hw: Homework[]) => localStorage.setItem(STORAGE_KEYS.HOMEWORK, JSON.stringify(hw)),

  getSubmissions: (): Submission[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return data ? JSON.parse(data) : [];
  },
  saveSubmissions: (sub: Submission[]) => localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(sub)),

  getAttendance: (): Attendance[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : [];
  },
  saveAttendance: (records: Attendance[]) => localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records)),

  getMessages: (): Message[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },
  saveMessages: (msgs: Message[]) => localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs))
};
