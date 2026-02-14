
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, UserRole, SchoolConfig, LiveClass, PerformanceRecord, Homework, Submission, FeeRecord, Attendance, Class, Message } from './types';
import { dbService } from './services/dbService';
import { geminiService } from './services/geminiService';
import { 
  Users, BookOpen, CreditCard, Bell, LogOut, LayoutDashboard, 
  Calendar, Bus, MessageSquare, ClipboardList, CheckCircle, XCircle,
  ShieldCheck, FileText, Menu, X, Plus, Trash2, Lock, Unlock, Download, Send,
  User as UserIcon, Mail, MapPin, Phone, Award, Briefcase, GraduationCap, Video, ExternalLink, Sparkles, Printer, Save, Loader2, Clock, Check, Receipt, Settings, ChevronLeft, ChevronRight, Hash, Activity
} from 'lucide-react';

// --- Shared Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }: { icon: any, label: string, active: boolean, onClick: () => void, collapsed: boolean }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : ""}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <div className="flex-shrink-0">
      <Icon size={22} className={active ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
    </div>
    {!collapsed && <span className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
  </button>
);

const Card = ({ children, title, className = "" }: { children?: React.ReactNode, title?: string, className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
    {title && <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>}
    {children}
  </div>
);

// --- Chat Module ---

const ChatModule = ({ currentUser }: { currentUser: User }) => {
  const [messages, setMessages] = useState<Message[]>(dbService.getMessages());
  const [users] = useState<User[]>(dbService.getUsers());
  const [classes] = useState<Class[]>(dbService.getClasses());
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(dbService.getMessages());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeRoomId]);

  const rooms = useMemo(() => {
    const list: { id: string, name: string, type: 'DM' | 'GROUP', icon?: any, role?: UserRole }[] = [];

    if (currentUser.role === UserRole.ADMIN) {
      list.push({ id: 'ROOM_ADMINS', name: 'Administration HQ', type: 'GROUP' });
    }
    
    currentUser.assignedClasses.forEach(classId => {
      const cls = classes.find(c => c.id === classId);
      list.push({ id: `ROOM_${classId}`, name: `${cls?.name || classId} Group`, type: 'GROUP' });
    });

    users.filter(u => u.id !== currentUser.id && !u.isBlocked).forEach(u => {
      let canSee = false;
      if (currentUser.role === UserRole.ADMIN) canSee = true;
      else if (currentUser.role === UserRole.TEACHER) {
        if (u.role === UserRole.ADMIN) canSee = true;
        if (u.role === UserRole.STUDENT && u.assignedClasses.some(cid => currentUser.assignedClasses.includes(cid))) canSee = true;
      }
      else if (currentUser.role === UserRole.STUDENT) {
        if (u.role === UserRole.ADMIN) canSee = true;
        if (u.role === UserRole.TEACHER && currentUser.assignedClasses.some(cid => u.assignedClasses.includes(cid))) canSee = true;
      }

      if (canSee) {
        list.push({ id: u.id, name: u.name, type: 'DM', role: u.role });
      }
    });

    return list;
  }, [currentUser, users, classes]);

  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  const currentMessages = messages.filter(m => {
    if (activeRoom?.type === 'GROUP') {
      return m.receiverId === activeRoomId;
    } else {
      return (m.senderId === currentUser.id && m.receiverId === activeRoomId) ||
             (m.senderId === activeRoomId && m.receiverId === currentUser.id);
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeRoomId) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      senderId: currentUser.id,
      receiverId: activeRoomId,
      text: inputText.trim(),
      timestamp: Date.now()
    };

    const updated = [...messages, newMessage];
    setMessages(updated);
    dbService.saveMessages(updated);
    setInputText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[700px] animate-in fade-in duration-500">
      <Card className="lg:col-span-1 overflow-hidden flex flex-col p-0 border-none shadow-xl ring-1 ring-slate-100" title="">
        <div className="p-6 border-b border-slate-50 bg-white">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Institutional Threads</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Encrypted Network</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
          {rooms.map(room => (
            <button 
              key={room.id} 
              onClick={() => setActiveRoomId(room.id)}
              className={`w-full flex items-center space-x-4 p-4 rounded-3xl transition-all border-2 text-left group ${
                activeRoomId === room.id 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white border-transparent hover:border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative flex-shrink-0 shadow-sm ${
                activeRoomId === room.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
              }`}>
                {room.type === 'GROUP' ? <Hash size={24} /> : <UserIcon size={24} />}
                {room.type === 'DM' && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm truncate ${activeRoomId === room.id ? 'text-white' : 'text-slate-800'}`}>{room.name}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${activeRoomId === room.id ? 'text-blue-100/80' : 'text-slate-400'}`}>
                  {room.type === 'GROUP' ? 'Broadcast Unit' : room.role}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2 flex flex-col h-full p-0 overflow-hidden border-none shadow-xl ring-1 ring-slate-100" title="">
        {activeRoom ? (
          <>
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black shadow-sm">
                  {activeRoom.type === 'GROUP' ? <Hash size={24} /> : activeRoom.name[0]}
                </div>
                <div>
                  <h3 className="text-md font-black text-slate-900 tracking-tight">{activeRoom.name}</h3>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Operational & Secure
                  </p>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fcfdfe]">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-50">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} />
                   </div>
                   <p className="font-black uppercase tracking-[0.2em] text-[10px]">No communication logged.</p>
                </div>
              ) : (
                currentMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  const sender = users.find(u => u.id === msg.senderId);
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] space-y-1`}>
                        {!isMe && activeRoom.type === 'GROUP' && (
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-1">{sender?.name}</p>
                        )}
                        <div className={`p-5 rounded-3xl shadow-sm text-sm font-medium ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white border-2 border-slate-50 text-slate-700 rounded-tl-none'
                        }`}>
                          {msg.text}
                          <div className={`text-[9px] font-bold mt-2 opacity-50 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-50 flex items-center space-x-4">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Draft secure response..." 
                className="flex-1 outline-none text-sm px-8 py-5 bg-slate-50 rounded-[28px] font-bold border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all shadow-inner" 
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-blue-600 text-white p-5 rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                <Send size={24} />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
             <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mb-6">
                <ShieldCheck size={48} className="opacity-20" />
             </div>
             <p className="font-black uppercase tracking-[0.4em] text-xs">Select a secure channel.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

// --- Attendance Tracker ---

const AttendanceTracker = ({ role, classIds, studentId }: { role: UserRole, classIds: string[], studentId: string }) => {
  const [attendance, setAttendance] = useState<Attendance[]>(dbService.getAttendance());
  const [students, setStudents] = useState<User[]>([]);
  const [allClasses] = useState<Class[]>(dbService.getClasses());
  const [selectedClassId, setSelectedClassId] = useState(classIds[0] || '');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const poll = setInterval(() => {
      setIsSyncing(true);
      const latest = dbService.getAttendance();
      setAttendance(latest);
      setTimeout(() => setIsSyncing(false), 500);
    }, 3000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if ((role === UserRole.TEACHER || role === UserRole.ADMIN) && selectedClassId) {
      const allUsers = dbService.getUsers();
      setStudents(allUsers.filter(u => u.role === UserRole.STUDENT && u.assignedClasses.includes(selectedClassId)));
    }
  }, [role, selectedClassId]);

  const markAttendance = (sId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    const record: Attendance = {
      id: Math.random().toString(36).substring(7),
      studentId: sId,
      classId: selectedClassId || 'GENERAL',
      status
    };
    const updated = [...attendance, record];
    setAttendance(updated);
    dbService.saveAttendance(updated);
  };

  const getTodayStatus = (sId: string) => {
    return attendance.find(a => a.studentId === sId && a.classId === selectedClassId)?.status;
  };

  if (role === UserRole.TEACHER || role === UserRole.ADMIN) {
    const dropdownClasses = role === UserRole.ADMIN ? allClasses : allClasses.filter(c => classIds.includes(c.id));

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Attendance</h2>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time Compliance Network</p>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
            {isSyncing && <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-widest"><Activity size={14} className="mr-1 animate-pulse" /> Syncing</div>}
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="flex-1 md:flex-none border-2 border-slate-50 rounded-2xl px-8 py-4 text-sm font-black outline-none focus:border-blue-600 bg-white shadow-xl ring-1 ring-slate-100 transition-all"
            >
              <option value="">Select Unit...</option>
              {dropdownClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name} ({cls.id})</option>
              ))}
            </select>
          </div>
        </div>

        <Card title={`Registry for Unit: ${allClasses.find(c => c.id === selectedClassId)?.name || 'Unselected'}`}>
          <div className="space-y-3">
            {students.length === 0 ? (
              <div className="text-center py-24 border-4 border-dashed rounded-[48px] bg-slate-50/50 text-slate-300 font-bold italic">
                 <ClipboardList size={48} className="mx-auto mb-4 opacity-20" />
                 <p className="uppercase tracking-widest text-xs">No learner records found in this operational unit.</p>
              </div>
            ) : (
              students.map(s => {
                const todayStatus = getTodayStatus(s.id);
                return (
                  <div key={s.id} className="flex flex-col sm:flex-row items-center justify-between p-6 border-2 border-slate-50 rounded-[32px] bg-white hover:border-blue-100 transition-all shadow-sm group">
                    <div className="flex items-center space-x-6 mb-4 sm:mb-0">
                      <div className="relative">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=random&bold=true&size=128`} className="w-16 h-16 rounded-2xl shadow-md border-2 border-white group-hover:scale-105 transition-transform" />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${todayStatus === 'PRESENT' ? 'bg-emerald-500' : todayStatus === 'ABSENT' ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-800">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase font-black tracking-widest">{s.uid}</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-50 p-1.5 rounded-2xl space-x-1">
                      {(['PRESENT', 'ABSENT', 'LATE'] as const).map(status => {
                        const isActive = todayStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => markAttendance(s.id, status)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              isActive 
                                ? status === 'PRESENT' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 
                                  status === 'ABSENT' ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 
                                  'bg-amber-600 text-white shadow-lg shadow-amber-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                            }`}
                          >
                            {status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    );
  }

  const myRecords = attendance.filter(a => a.studentId === studentId);
  const stats = {
    present: myRecords.filter(r => r.status === 'PRESENT').length,
    absent: myRecords.filter(r => r.status === 'ABSENT').length,
    late: myRecords.filter(r => r.status === 'LATE').length,
    total: myRecords.length
  };
  const percentage = stats.total > 0 ? ((stats.present + stats.late * 0.5) / stats.total * 100).toFixed(1) : '100';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center py-10 bg-blue-600 text-white border-none shadow-blue-100 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Compliance Rate</p>
          <p className="text-4xl font-black">{percentage}%</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Present</p>
          <p className="text-4xl font-black text-emerald-600">{stats.present}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Absent</p>
          <p className="text-4xl font-black text-red-600">{stats.absent}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Late</p>
          <p className="text-4xl font-black text-amber-600">{stats.late}</p>
        </Card>
      </div>

      <Card title="Attendance Registry">
        <div className="space-y-3">
          {myRecords.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic text-sm">Registry is currently empty.</div>
          ) : (
            myRecords.map(r => (
              <div key={r.id} className="flex items-center justify-between p-4 border rounded-2xl bg-white shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${
                    r.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 
                    r.status === 'ABSENT' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Unit Verification ({r.classId})</p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                  r.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 
                  r.status === 'ABSENT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {r.status}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// --- Fee Management Component ---

const FeeManagement = ({ studentId, isAdmin = false }: { studentId?: string, isAdmin?: boolean }) => {
  const [fees, setFees] = useState<FeeRecord[]>(dbService.getFees());
  const [users] = useState<User[]>(dbService.getUsers());
  const [showAdd, setShowAdd] = useState(false);
  const [newFee, setNewFee] = useState({ 
    studentId: '', 
    amount: 0, 
    status: 'PAID' as 'PAID' | 'PENDING', 
    months: [] as string[] 
  });

  const students = users.filter(u => u.role === UserRole.STUDENT);
  const config = dbService.getConfig();

  const handleAddFee = () => {
    if (!newFee.studentId || !newFee.amount) return;
    const fee: FeeRecord = {
      id: Math.random().toString(36).substring(7),
      studentId: newFee.studentId,
      amount: newFee.amount,
      status: newFee.status,
      receiptId: `${config.receiptPrefix}${Math.floor(100000 + Math.random() * 900000)}`,
      months: newFee.months
    };
    const updated = [...fees, fee];
    setFees(updated);
    dbService.saveFees(updated);
    setShowAdd(false);
    setNewFee({ studentId: '', amount: 0, status: 'PAID', months: [] });
  };

  const toggleMonth = (month: string) => {
    setNewFee(prev => ({
      ...prev,
      months: prev.months.includes(month) 
        ? prev.months.filter(m => m !== month) 
        : [...prev.months, month]
    }));
  };

  const handlePrint = (fee: FeeRecord) => {
    const student = users.find(u => u.id === fee.studentId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Institutional Receipt - ${fee.receiptId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #fff; line-height: 1.5; }
            .receipt { border: 2px solid #e2e8f0; padding: 40px; border-radius: 24px; max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 4px solid #3b82f6; padding-bottom: 24px; margin-bottom: 32px; }
            .school-info h1 { font-size: 28px; font-weight: 800; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: -0.025em; }
            .school-info p { margin: 4px 0 0 0; color: #64748b; font-size: 14px; font-weight: 600; }
            .receipt-meta { text-align: right; }
            .receipt-meta h2 { margin: 0; font-size: 20px; font-weight: 800; color: #3b82f6; }
            .receipt-meta p { margin: 4px 0 0 0; font-family: monospace; font-size: 16px; font-weight: 700; color: #1e293b; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; }
            .detail-box h3 { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 4px; }
            .detail-box p { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { text-align: left; padding: 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #64748b; }
            td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 15px; color: #1e293b; }
            .total-row { background: #f8fafc; font-weight: 800; font-size: 18px; }
            .footer { margin-top: 48px; text-align: center; border-top: 1px dashed #e2e8f0; pt: 24px; font-size: 12px; color: #94a3b8; }
            .stamp { border: 4px solid #10b981; color: #10b981; padding: 10px 20px; border-radius: 12px; font-weight: 800; display: inline-block; transform: rotate(-10deg); margin-top: 24px; opacity: 0.8; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="receipt">
            <div class="header">
              <div class="school-info">
                <h1>${config.name}</h1>
                <p>${config.address}</p>
                <p>Contact: ${config.contact}</p>
              </div>
              <div class="receipt-meta">
                <h2>OFFICIAL RECEIPT</h2>
                <p>#${fee.receiptId}</p>
              </div>
            </div>
            
            <div class="details-grid">
              <div class="detail-box">
                <h3>Learner Identity</h3>
                <p>${student?.name || 'N/A'}</p>
                <p style="font-size: 13px; color: #64748b; margin-top: 2px;">UID: ${student?.uid || 'N/A'}</p>
              </div>
              <div class="detail-box" style="text-align: right;">
                <h3>Date of Issue</h3>
                <p>${new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Academic Period / Description</th>
                  <th style="text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Tuition & Institutional Charges</strong><br/>
                    <span style="font-size: 12px; color: #64748b;">Period: ${fee.months?.join(', ') || 'N/A'}</span>
                  </td>
                  <td style="text-align: right; font-weight: 700;">₹${fee.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr class="total-row">
                  <td style="text-align: right; border-bottom: none;">GRAND TOTAL PAID</td>
                  <td style="text-align: right; color: #3b82f6; border-bottom: none;">₹${fee.amount.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            <div style="text-align: right;">
              <div class="stamp">PAID</div>
            </div>

            <div class="footer">
              <p>${config.receiptFooter}</p>
              <p style="margin-top: 8px;">System Generated Document • Real Public School Ecosystem</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredFeesTable = isAdmin ? fees : fees.filter(f => f.studentId === studentId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card title={isAdmin ? "Institutional Revenue Ledger" : "Financial Records"}>
        {isAdmin && (
          <div className="flex justify-between items-center mb-8">
            <p className="text-sm text-slate-500 font-medium">Global fee collection registry.</p>
            <button 
              onClick={() => setShowAdd(true)}
              className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-black shadow-xl transition-all active:scale-95 group"
            >
              <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-black tracking-tight text-md">Record Transaction</span>
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.1em] py-4">
                <th className="pb-4 px-2">Learner Identity</th>
                <th className="pb-4 px-2">Receipt ID</th>
                <th className="pb-4 px-2">Amount</th>
                <th className="pb-4 px-2 text-center">Status</th>
                <th className="pb-4 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredFeesTable.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-300 font-bold italic">No financial ledger entries found.</td>
                </tr>
              ) : (
                filteredFeesTable.slice().reverse().map(f => {
                  const student = users.find(u => u.id === f.studentId);
                  return (
                    <tr key={f.id} className="text-sm group hover:bg-slate-50/50 transition-colors">
                      <td className="py-6 px-2">
                        <div>
                          <p className="font-black text-slate-800 text-md">{student?.name || 'Unknown'}</p>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{student?.uid}</p>
                        </div>
                      </td>
                      <td className="py-6 px-2">
                         <span className="text-blue-600 font-black text-md">#{f.receiptId}</span>
                      </td>
                      <td className="py-6 px-2 font-black text-slate-900 text-lg">₹{f.amount.toLocaleString('en-IN')}</td>
                      <td className="py-6 px-2 text-center">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          f.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-6 px-2 text-right">
                        <button 
                          onClick={() => handlePrint(f)}
                          className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm bg-white"
                        >
                          <Printer size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[48px] p-12 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Record Fiscal Entry</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Revenue Module</p>
               </div>
               <button onClick={() => setShowAdd(false)} className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={28} /></button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Target Student Identity</label>
                <select 
                  value={newFee.studentId} 
                  onChange={e => setNewFee({...newFee, studentId: e.target.value})}
                  className="w-full border-2 border-slate-50 rounded-[28px] px-8 py-5 outline-none focus:border-blue-600 bg-slate-50 font-black text-lg transition-all appearance-none"
                >
                  <option value="">Select identity...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.uid})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Collection Amount (INR)</label>
                  <input 
                    type="number" 
                    value={newFee.amount} 
                    onChange={e => setNewFee({...newFee, amount: Number(e.target.value)})}
                    className="w-full border-2 border-slate-50 rounded-[28px] px-8 py-5 outline-none focus:border-blue-600 bg-slate-50 font-black text-2xl"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Fiscal Status</label>
                  <select 
                    value={newFee.status} 
                    onChange={e => setNewFee({...newFee, status: e.target.value as 'PAID' | 'PENDING'})}
                    className="w-full border-2 border-slate-50 rounded-[28px] px-8 py-5 outline-none focus:border-blue-600 bg-slate-50 font-black text-lg appearance-none"
                  >
                    <option value="PAID">COMPLETED (PAID)</option>
                    <option value="PENDING">RECEIVABLE (PENDING)</option>
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Select Applicable Months</label>
                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                       <button
                          key={m}
                          onClick={() => toggleMonth(m)}
                          className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                             newFee.months.includes(m)
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                : 'bg-white border-slate-50 text-slate-400 hover:border-blue-100'
                          }`}
                       >
                          {m}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="flex space-x-6 pt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 px-8 py-5 border-2 border-slate-100 rounded-[28px] font-black text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest text-xs">Dismiss</button>
                <button 
                  onClick={handleAddFee} 
                  disabled={!newFee.studentId || !newFee.amount}
                  className="flex-[2] px-8 py-5 bg-blue-600 text-white rounded-[28px] font-black shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none uppercase tracking-[0.15em] text-xs"
                >
                  Commit Ledger Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Admin User Management Component ---

const AdminUserManagement = () => {
  const [users, setUsers] = useState<User[]>(dbService.getUsers());
  const [classes, setClasses] = useState<Class[]>(dbService.getClasses());
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ 
    name: '', 
    email: '', 
    role: UserRole.STUDENT,
    assignedClasses: [] as string[]
  });

  const toggleBlock = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u);
    setUsers(updated);
    dbService.saveUsers(updated);
  };

  const handleClassToggle = (classId: string) => {
    setNewUser(prev => {
      if (prev.role === UserRole.STUDENT) {
        return { ...prev, assignedClasses: [classId] };
      } else {
        const isSelected = prev.assignedClasses.includes(classId);
        return {
          ...prev,
          assignedClasses: isSelected 
            ? prev.assignedClasses.filter(id => id !== classId)
            : [...prev.assignedClasses, classId]
        };
      }
    });
  };

  const addUser = () => {
    if (newUser.role === UserRole.STUDENT && newUser.assignedClasses.length !== 1) {
      alert("Students must be assigned to exactly ONE class.");
      return;
    }
    if (newUser.role === UserRole.TEACHER && newUser.assignedClasses.length === 0) {
      alert("Teachers must be assigned to at least ONE class.");
      return;
    }

    const prefix = newUser.role === UserRole.ADMIN ? 'ADM' : newUser.role === UserRole.TEACHER ? 'TCH' : 'STD';
    const uid = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const user: User = {
      id: Math.random().toString(36).substring(7),
      uid,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      assignedClasses: newUser.assignedClasses,
      isBlocked: false
    };
    const updated = [...users, user];
    setUsers(updated);
    dbService.saveUsers(updated);
    setShowAdd(false);
    setNewUser({ name: '', email: '', role: UserRole.STUDENT, assignedClasses: [] });
  };

  return (
    <Card title="Registry Governance">
      <div className="flex justify-between items-center mb-8">
        <p className="text-slate-500 text-sm font-medium">Provision and manage secure access credentials.</p>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-black shadow-xl transition-all active:scale-95 group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-black tracking-tight text-md">Generate Credential</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-slate-50 text-slate-400 text-[11px] font-black uppercase tracking-[0.2em]">
              <th className="pb-4 px-2">Identity (UID)</th>
              <th className="pb-4 px-2">Legal Name</th>
              <th className="pb-4 px-2">System Role</th>
              <th className="pb-4 px-2">Assigned Unit(s)</th>
              <th className="pb-4 px-2">Status</th>
              <th className="pb-4 px-2 text-right">Governance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(u => (
              <tr key={u.id} className="text-sm group hover:bg-slate-50/50 transition-colors">
                <td className="py-6 px-2">
                   <span className="font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{u.uid}</span>
                </td>
                <td className="py-6 px-2 font-bold text-slate-700">{u.name}</td>
                <td className="py-6 px-2">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                    u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                    u.role === UserRole.TEACHER ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-6 px-2">
                   <div className="flex flex-wrap gap-1">
                      {u.assignedClasses.map(cid => (
                        <span key={cid} className="text-[9px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase">{cid}</span>
                      ))}
                      {u.assignedClasses.length === 0 && <span className="text-slate-300 italic text-[10px]">Unassigned</span>}
                   </div>
                </td>
                <td className="py-6 px-2">
                  {u.isBlocked ? (
                    <span className="text-red-500 flex items-center space-x-1.5 font-bold"><Lock size={16} /> <span>Restricted</span></span>
                  ) : (
                    <span className="text-emerald-500 flex items-center space-x-1.5 font-bold"><Unlock size={16} /> <span>Authorized</span></span>
                  )}
                </td>
                <td className="py-6 px-2 text-right">
                  <button 
                    onClick={() => toggleBlock(u.id)}
                    title={u.isBlocked ? "Restore Access" : "Suspend Access"}
                    className={`p-2.5 rounded-xl transition-all ${u.isBlocked ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
                  >
                    {u.isBlocked ? <Unlock size={20} /> : <Lock size={20} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-[48px] p-12 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Provision Identity</h3>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Credential Generation Module</p>
               </div>
               <button onClick={() => setShowAdd(false)} className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-400"><X size={28} /></button>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Full Legal Name</label>
                  <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full border-2 border-slate-50 rounded-[28px] px-8 py-5 outline-none focus:border-blue-600 bg-slate-50 font-bold" placeholder="e.g. Rahul Verma" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Institutional Email</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full border-2 border-slate-50 rounded-[28px] px-8 py-5 outline-none focus:border-blue-600 bg-slate-50 font-bold" placeholder="name@school.edu" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">System Role</label>
                <div className="flex gap-4">
                  {[UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN].map(role => (
                    <button 
                      key={role}
                      onClick={() => setNewUser({...newUser, role, assignedClasses: []})}
                      className={`flex-1 py-4 rounded-[28px] border-2 font-black text-xs transition-all ${
                        newUser.role === role 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                          : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {newUser.role !== UserRole.ADMIN && (
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">
                    {newUser.role === UserRole.STUDENT ? 'Assign Mandatory Unit (Exactly 1)' : 'Assign Educator Unit(s)'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {classes.map(cls => (
                      <button
                        key={cls.id}
                        onClick={() => handleClassToggle(cls.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          newUser.assignedClasses.includes(cls.id)
                            ? 'bg-white border-blue-600 ring-2 ring-blue-50'
                            : 'bg-slate-50 border-slate-50 opacity-60'
                        }`}
                      >
                        <p className={`font-black text-xs ${newUser.assignedClasses.includes(cls.id) ? 'text-blue-600' : 'text-slate-500'}`}>{cls.id}</p>
                        <p className="text-[10px] text-slate-400 font-bold truncate">{cls.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-6 pt-6">
                <button onClick={() => setShowAdd(false)} className="flex-1 px-8 py-5 border-2 border-slate-100 rounded-[28px] font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest text-xs">Dismiss</button>
                <button 
                  onClick={addUser} 
                  disabled={!newUser.name || !newUser.email}
                  className="flex-[2] px-8 py-5 bg-blue-600 text-white rounded-[28px] font-black shadow-2xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                  Generate UID & Commit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// --- Progress Report View ---

const ProgressReportView = ({ student }: { student: User }) => {
  const [records] = useState<PerformanceRecord[]>(dbService.getPerformance());
  const myRecords = records.filter(r => r.studentId === student.id);

  const averageScore = myRecords.length > 0 
    ? (myRecords.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / myRecords.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-100 flex flex-col items-center justify-center py-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-x-12 -translate-y-12"></div>
          <Award size={32} className="mb-4 opacity-80 group-hover:scale-110 transition-transform" />
          <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Scholastic Index</p>
          <p className="text-4xl font-black">{averageScore}%</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10">
          <BookOpen size={32} className="mb-4 text-blue-600 opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Subjects Evaluated</p>
          <p className="text-4xl font-black text-slate-800">{new Set(myRecords.map(r => r.subject)).size}</p>
        </Card>
        <Card className="flex flex-col items-center justify-center py-10">
          <CheckCircle size={32} className="mb-4 text-emerald-500 opacity-20" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Ratio</p>
          <p className="text-4xl font-black text-emerald-600">100%</p>
        </Card>
      </div>

      <Card title="Institutional Academic Transcript">
        <div className="space-y-6">
          {myRecords.length === 0 ? (
            <div className="text-center py-20 text-slate-300 font-bold italic border-2 border-dashed rounded-[40px]">No evaluation records available in transcript.</div>
          ) : (
            myRecords.map(r => (
              <div key={r.id} className="p-8 border-2 border-slate-50 rounded-[40px] bg-white hover:border-blue-100 transition-all shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-xl uppercase tracking-widest">{r.subject}</span>
                    <h4 className="text-2xl font-black text-slate-800 mt-3">{r.term} Assessment</h4>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-3xl font-black text-blue-600 leading-none">{r.score}<span className="text-slate-300 text-sm font-bold ml-1">/{r.total}</span></p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Quantitative Metric</p>
                    </div>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-blue-100">
                      {r.grade}
                    </div>
                  </div>
                </div>
                {r.aiRemarks && (
                  <div className="p-6 bg-slate-50 rounded-[28px] flex items-start space-x-4 border border-slate-100">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Sparkles className="text-amber-500" size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Evaluator Remarks</p>
                      <p className="text-sm text-slate-700 italic font-bold leading-relaxed">"{r.aiRemarks}"</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

// --- Progress Summary Component (For Admins) ---

const ProgressSummary = () => {
   const [records] = useState<PerformanceRecord[]>(dbService.getPerformance());
   return (
      <Card title="Global Evaluation Stream">
         <div className="space-y-4">
            {records.slice(-5).reverse().map(r => (
               <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all">
                  <div className="flex items-center space-x-4">
                     <div className="p-3 bg-white rounded-xl shadow-sm"><Hash size={18} className="text-blue-600" /></div>
                     <div>
                        <p className="font-black text-slate-800 text-sm">{r.subject}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.term}</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className="font-black text-blue-600 text-lg">{r.grade}</p>
                     <p className="text-[10px] font-black text-slate-400">{r.score}/{r.total}</p>
                  </div>
               </div>
            ))}
         </div>
      </Card>
   );
};

// --- Profile View Component ---

const ProfileViewDisplay = ({ user }: { user: User }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card title="" className="p-0 overflow-hidden border-none shadow-2xl ring-1 ring-slate-100">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
           <div className="absolute -bottom-16 left-12">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=128&background=random&bold=true`} 
                className="w-32 h-32 rounded-[40px] border-8 border-white shadow-xl"
                alt={user.name}
              />
           </div>
        </div>
        <div className="pt-20 pb-12 px-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <p className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mt-2 flex items-center">
                 <ShieldCheck size={16} className="mr-2" />
                 {user.role} Identity Verified
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-3 rounded-2xl border-2 border-slate-100 text-center">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">System ID</p>
               <p className="font-mono font-black text-slate-800">{user.uid}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
             <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                   <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><Mail size={20} /></div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="font-bold text-slate-700">{user.email}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                   <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><Briefcase size={20} /></div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department Access</p>
                      <p className="font-bold text-slate-700">{user.assignedClasses.join(', ') || 'Global Access'}</p>
                   </div>
                </div>
             </div>
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Security</h4>
                <div className="p-6 rounded-[32px] bg-emerald-50 border-2 border-emerald-100 flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                         <Check size={24} />
                      </div>
                      <p className="font-black text-emerald-700 uppercase tracking-wider text-xs">Auth Status: Secure</p>
                   </div>
                   <Unlock size={20} className="text-emerald-400" />
                </div>
             </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Results Management Component ---

const ResultsManager = ({ teacher }: { teacher: User }) => {
  const [results, setResults] = useState<PerformanceRecord[]>(dbService.getPerformance());
  const [students] = useState<User[]>(dbService.getUsers().filter(u => u.role === UserRole.STUDENT));
  const [showAdd, setShowAdd] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newResult, setNewResult] = useState({
    studentId: '',
    subject: '',
    score: 0,
    total: 100,
    grade: 'A',
    term: 'First Term',
    aiRemarks: ''
  });

  const handleAdd = async () => {
    if (!newResult.studentId || !newResult.subject) return;
    
    const record: PerformanceRecord = {
      id: Math.random().toString(36).substring(7),
      ...newResult
    };
    
    const updated = [...results, record];
    setResults(updated);
    dbService.savePerformance(updated);
    setShowAdd(false);
    setNewResult({ studentId: '', subject: '', score: 0, total: 100, grade: 'A', term: 'First Term', aiRemarks: '' });
  };

  const generateAI = async () => {
    const student = students.find(s => s.id === newResult.studentId);
    if (!student) return;
    setIsGenerating(true);
    const perf = `${newResult.score}/${newResult.total} in ${newResult.subject} for ${newResult.term}`;
    const remarks = await geminiService.generateRemarks(student.name, perf);
    setNewResult(prev => ({ ...prev, aiRemarks: remarks }));
    setIsGenerating(false);
  };

  return (
    <Card title="Academic Performance Orchestration">
       <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-slate-500 font-medium">Manage learner outcomes and qualitative evaluations.</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-blue-700 shadow-xl transition-all active:scale-95 group"
          >
            <Plus size={20} />
            <span className="font-black tracking-tight text-sm">Issue Assessment</span>
          </button>
       </div>

       <div className="space-y-4">
          {results.slice().reverse().map(r => {
             const student = students.find(s => s.id === r.studentId);
             return (
                <div key={r.id} className="p-6 border-2 border-slate-50 rounded-[32px] bg-white hover:border-blue-100 transition-all shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black">
                         {r.grade}
                      </div>
                      <div>
                         <p className="font-black text-slate-800">{student?.name || 'Unknown'}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.subject} • {r.term}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-6">
                      <div className="text-right">
                         <p className="font-black text-blue-600 text-xl">{r.score}/{r.total}</p>
                         <p className="text-[10px] font-black text-slate-400 uppercase">Assessment Score</p>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = results.filter(rec => rec.id !== r.id);
                          setResults(updated);
                          dbService.savePerformance(updated);
                        }}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
             );
          })}
       </div>

       {showAdd && (
          <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
             <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
                <h3 className="text-2xl font-black text-slate-900 mb-8">Record Performance Data</h3>
                <div className="grid grid-cols-2 gap-6 mb-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Learner Identity</label>
                      <select 
                        value={newResult.studentId} 
                        onChange={e => setNewResult({...newResult, studentId: e.target.value})}
                        className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold"
                      >
                         <option value="">Select student...</option>
                         {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.uid})</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Academic Subject</label>
                      <input 
                        type="text" 
                        value={newResult.subject} 
                        onChange={e => setNewResult({...newResult, subject: e.target.value})}
                        className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold"
                        placeholder="e.g. Mathematics"
                      />
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-6 mb-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Score</label>
                      <input type="number" value={newResult.score} onChange={e => setNewResult({...newResult, score: Number(e.target.value)})} className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Total</label>
                      <input type="number" value={newResult.total} onChange={e => setNewResult({...newResult, total: Number(e.target.value)})} className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold" />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Grade</label>
                      <input type="text" value={newResult.grade} onChange={e => setNewResult({...newResult, grade: e.target.value})} className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold" />
                   </div>
                </div>
                <div className="mb-8">
                   <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualitative Remarks</label>
                      <button 
                        onClick={generateAI}
                        disabled={isGenerating || !newResult.studentId || !newResult.subject}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center space-x-1.5 hover:text-blue-800 disabled:opacity-50"
                      >
                         {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                         <span>AI Generate Remarks</span>
                      </button>
                   </div>
                   <textarea 
                     rows={3} 
                     value={newResult.aiRemarks} 
                     onChange={e => setNewResult({...newResult, aiRemarks: e.target.value})}
                     className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-medium text-sm"
                     placeholder="Scholastic feedback..."
                   />
                </div>
                <div className="flex space-x-4">
                   <button onClick={() => setShowAdd(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]">Cancel</button>
                   <button onClick={handleAdd} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 uppercase tracking-widest text-[10px]">Commit Record</button>
                </div>
             </div>
          </div>
       )}
    </Card>
  );
};

// --- Homework Management Components ---

const HomeworkTeacherManager = ({ teacher }: { teacher: User }) => {
  const [homework, setHomework] = useState<Homework[]>(dbService.getHomework());
  const [showAdd, setShowAdd] = useState(false);
  const [newHw, setNewHw] = useState({
    title: '',
    description: '',
    subject: '',
    type: 'HOMEWORK' as 'HOMEWORK' | 'NOTES',
    classId: teacher.assignedClasses[0] || ''
  });

  const handleAdd = () => {
    if (!newHw.title || !newHw.classId) return;
    const hw: Homework = {
      id: Math.random().toString(36).substring(7),
      teacherId: teacher.id,
      ...newHw
    };
    const updated = [...homework, hw];
    setHomework(updated);
    dbService.saveHomework(updated);
    setShowAdd(false);
    setNewHw({ title: '', description: '', subject: '', type: 'HOMEWORK', classId: teacher.assignedClasses[0] || '' });
  };

  return (
    <Card title="Assignment & Resource Repository">
       <div className="flex justify-between items-center mb-8">
          <p className="text-sm text-slate-500 font-medium">Distribute tasks and educational materials to target units.</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-[#0f172a] text-white px-6 py-3 rounded-2xl flex items-center space-x-2 hover:bg-black shadow-xl transition-all active:scale-95 group"
          >
            <Plus size={20} />
            <span className="font-black tracking-tight text-sm">Issue Task</span>
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {homework.filter(h => h.teacherId === teacher.id).map(h => (
             <div key={h.id} className="p-8 border-2 border-slate-50 rounded-[32px] bg-white hover:border-blue-100 transition-all shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                   <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                      h.type === 'HOMEWORK' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                   }`}>
                      {h.type}
                   </span>
                   <button 
                    onClick={() => {
                       const updated = homework.filter(hw => hw.id !== h.id);
                       setHomework(updated);
                       dbService.saveHomework(updated);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>
                <h4 className="text-xl font-black text-slate-800 mb-2">{h.title}</h4>
                <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">{h.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <div className="flex items-center space-x-2">
                      <div className="p-2 bg-slate-50 rounded-lg"><BookOpen size={14} className="text-slate-400" /></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.subject}</span>
                   </div>
                   <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg uppercase">{h.classId}</span>
                </div>
             </div>
          ))}
       </div>

       {showAdd && (
          <div className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
             <div className="bg-white rounded-[40px] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-black text-slate-900 mb-8">Publish New Task</h3>
                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target Unit</label>
                         <select 
                           value={newHw.classId} 
                           onChange={e => setNewHw({...newHw, classId: e.target.value})}
                           className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold appearance-none"
                         >
                            {teacher.assignedClasses.map(cid => <option key={cid} value={cid}>{cid}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Asset Type</label>
                         <select 
                           value={newHw.type} 
                           onChange={e => setNewHw({...newHw, type: e.target.value as 'HOMEWORK' | 'NOTES'})}
                           className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold appearance-none"
                         >
                            <option value="HOMEWORK">Assignment</option>
                            <option value="NOTES">Resource/Notes</option>
                         </select>
                      </div>
                   </div>
                   <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                      <input type="text" value={newHw.title} onChange={e => setNewHw({...newHw, title: e.target.value})} className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold" />
                   </div>
                   <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subject</label>
                      <input type="text" value={newHw.subject} onChange={e => setNewHw({...newHw, subject: e.target.value})} className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-bold" />
                   </div>
                   <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Instructional Body</label>
                      <textarea rows={4} value={newHw.description} onChange={e => setNewHw({...newHw, description: e.target.value})} className="w-full border-2 border-slate-50 rounded-3xl px-5 py-4 outline-none focus:border-blue-600 bg-slate-50 font-medium text-sm" />
                   </div>
                   <div className="flex space-x-4">
                      <button onClick={() => setShowAdd(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px]">Dismiss</button>
                      <button onClick={handleAdd} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 uppercase tracking-widest text-[10px]">Publish Asset</button>
                   </div>
                </div>
             </div>
          </div>
       )}
    </Card>
  );
};

const HomeworkStudentView = ({ student }: { student: User }) => {
  const [homework] = useState<Homework[]>(dbService.getHomework());
  const myHw = homework.filter(h => student.assignedClasses.includes(h.classId));

  return (
    <Card title="Task & Resource Dashboard">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myHw.length === 0 ? (
             <div className="col-span-full py-20 text-center border-2 border-dashed rounded-[40px] text-slate-300 font-bold italic">No active tasks assigned to your unit.</div>
          ) : (
             myHw.map(h => (
                <div key={h.id} className="p-8 border-2 border-slate-50 rounded-[40px] bg-white hover:border-blue-100 transition-all shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                         h.type === 'HOMEWORK' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                         {h.type}
                      </span>
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Clock size={16} /></div>
                   </div>
                   <h4 className="text-xl font-black text-slate-800 mb-2">{h.title}</h4>
                   <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">{h.description}</p>
                   <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center space-x-2">
                         <div className="p-2 bg-slate-50 rounded-lg"><BookOpen size={14} className="text-slate-400" /></div>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h.subject}</span>
                      </div>
                      <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center space-x-1 hover:underline">
                         <span>Access Asset</span>
                         <ChevronRight size={12} />
                      </button>
                   </div>
                </div>
             ))
          )}
       </div>
    </Card>
  );
};

// --- App Core ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(dbService.getConfig());
  const [loginUid, setLoginUid] = useState('');
  const [error, setError] = useState('');
  const [activeLiveClasses, setActiveLiveClasses] = useState<LiveClass[]>(dbService.getLiveClasses());
  const [attendanceStats, setAttendanceStats] = useState({ compliance: '0', count: 0 });

  useEffect(() => {
    const updateMetrics = () => {
      setActiveLiveClasses(dbService.getLiveClasses());
      const attendance = dbService.getAttendance();
      const allStudents = dbService.getUsers().filter(u => u.role === UserRole.STUDENT);
      if (allStudents.length > 0) {
        const presentCount = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const compliance = ((presentCount / allStudents.length) * 100).toFixed(1);
        setAttendanceStats({ compliance, count: presentCount });
      }
    };
    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = dbService.getUsers();
    const user = users.find(u => u.uid === loginUid);
    if (user) {
      if (user.isBlocked) {
        setError('Security Restriction: Your access has been suspended.');
      } else {
        setCurrentUser(user);
        setError('');
      }
    } else {
      setError('Authorization Error: Invalid Identity Credential (UID).');
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-20 left-20 w-96 h-96 bg-blue-400 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-[120px]"></div>
        </div>
        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-[48px] shadow-2xl shadow-blue-100 p-12 border-2 border-white">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
                <img src={schoolConfig.logo} alt="Logo" className="w-16 h-16 rounded-full" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{schoolConfig.name}</h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Institutional Management Ecosystem</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Identity Credential (UID)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors"><ShieldCheck size={20} /></div>
                  <input type="text" required value={loginUid} onChange={(e) => setLoginUid(e.target.value.toUpperCase())} className="w-full pl-16 pr-6 py-5 rounded-3xl border-2 border-slate-50 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all font-mono font-black text-lg placeholder:font-sans placeholder:text-base placeholder:text-slate-300" placeholder="STD-001 / TCH-001" />
                </div>
              </div>
              {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-start space-x-3 border-2 border-red-100 animate-shake"><XCircle size={18} className="flex-shrink-0 mt-0.5" /><span>{error}</span></div>}
              <button type="submit" className="w-full bg-[#0f172a] text-white font-black py-5 rounded-3xl hover:bg-black shadow-2xl shadow-slate-200 transition-all active:scale-[0.96] flex items-center justify-center space-x-3 group"><span>Authorize Access</span><ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const classLiveSessions = activeLiveClasses.filter(l => currentUser.assignedClasses.includes(l.classId));

  return (
    <DashboardLayout user={currentUser} onLogout={() => setCurrentUser(null)} schoolConfig={schoolConfig}>
      {(activeTab, setActiveTab) => (
        <div className="space-y-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && currentUser.role === UserRole.ADMIN && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="flex flex-col justify-between group hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-6"><div className="p-4 bg-blue-100 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform"><Users size={28} /></div><span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-tighter">Live</span></div>
                <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Population</p><p className="text-3xl font-black text-slate-900 tracking-tighter">{dbService.getUsers().length}</p></div>
              </Card>
              <Card className="flex flex-col justify-between group hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-6"><div className="p-4 bg-amber-100 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform"><ClipboardList size={28} /></div><span className="text-[10px] font-black bg-amber-50 text-amber-600 px-2 py-1 rounded-lg uppercase tracking-tighter">{attendanceStats.compliance}%</span></div>
                <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Daily Compliance</p><p className="text-3xl font-black text-slate-900 tracking-tighter">{attendanceStats.count}</p></div>
              </Card>
              <Card className="flex flex-col justify-between group hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-6"><div className="p-4 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:scale-110 transition-transform"><CreditCard size={28} /></div><span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-tighter">Fiscal</span></div>
                <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Collections</p><p className="text-3xl font-black text-slate-900 tracking-tighter">₹{dbService.getFees().reduce((acc, f) => acc + f.amount, 0).toLocaleString('en-IN')}</p></div>
              </Card>
              <Card className="flex flex-col justify-between group hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex justify-between items-start mb-6"><div className="p-4 bg-purple-100 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform"><Bell size={28} /></div><span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-1 rounded-lg uppercase tracking-tighter">Active</span></div>
                <div><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Alert Queue</p><p className="text-3xl font-black text-slate-900 tracking-tighter">{dbService.getNotifications().length}</p></div>
              </Card>
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                 <AdminUserManagement />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-1">
                 <ProgressSummary />
              </div>
            </div>
          )}
          {activeTab === 'profile' && <ProfileViewDisplay user={currentUser} />}
          {activeTab === 'users' && <AdminUserManagement />}
          {activeTab === 'live_classes' && currentUser.role === UserRole.TEACHER && <LiveClassManager teacher={currentUser} />}
          {activeTab === 'results' && currentUser.role === UserRole.TEACHER && <ResultsManager teacher={currentUser} />}
          {activeTab === 'my_results' && <ProgressReportView student={currentUser} />}
          {activeTab === 'homework' && currentUser.role === UserRole.TEACHER && <HomeworkTeacherManager teacher={currentUser} />}
          {activeTab === 'my_homework' && currentUser.role === UserRole.STUDENT && <HomeworkStudentView student={currentUser} />}
          {activeTab === 'my_fees' && <FeeManagement studentId={currentUser.id} />}
          {activeTab === 'fees_admin' && <FeeManagement isAdmin />}
          {activeTab === 'receipt_settings' && currentUser.role === UserRole.ADMIN && <ReceiptSettings config={schoolConfig} onSave={(newConfig) => { setSchoolConfig(newConfig); dbService.saveConfig(newConfig); alert('Receipt parameters synchronized.'); }} />}
          {(activeTab === 'attendance' || activeTab === 'my_attendance') && <AttendanceTracker role={currentUser.role} classIds={currentUser.assignedClasses} studentId={currentUser.id} />}
          {activeTab === 'chat' && <ChatModule currentUser={currentUser} />}
          {activeTab === 'config' && <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-3xl">System Configuration Node Active</div>}
        </div>
      )}
    </DashboardLayout>
  );
}

// --- Supporting Components ---

const ReceiptSettings = ({ config, onSave }: { config: SchoolConfig, onSave: (config: SchoolConfig) => void }) => {
  const [localConfig, setLocalConfig] = useState(config);
  return (
    <Card title="Financial Receipt Orchestration">
      <div className="space-y-6">
        <p className="text-sm text-slate-500 font-medium">Configure global parameters for financial documentation.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Receipt Serial Prefix</label><input type="text" value={localConfig.receiptPrefix} onChange={e => setLocalConfig({...localConfig, receiptPrefix: e.target.value})} className="w-full border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-blue-600 bg-slate-50 font-black text-lg" /></div>
          <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Contact</label><input type="text" value={localConfig.contact} onChange={e => setLocalConfig({...localConfig, contact: e.target.value})} className="w-full border-2 border-slate-50 rounded-2xl p-4 outline-none focus:border-blue-600 bg-slate-50 font-bold" /></div>
        </div>
        <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Mandatory Receipt Footer</label><textarea rows={4} value={localConfig.receiptFooter} onChange={e => setLocalConfig({...localConfig, receiptFooter: e.target.value})} className="w-full border-2 border-slate-100 rounded-3xl p-6 outline-none focus:border-blue-600 bg-slate-50 font-medium" /></div>
        <button onClick={() => onSave(localConfig)} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-3"><Save size={20} /><span>Synchronize Template</span></button>
      </div>
    </Card>
  );
};

const LiveClassManager = ({ teacher }: { teacher: User }) => {
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(dbService.getLiveClasses());
  const [showAdd, setShowAdd] = useState(false);
  const [newLive, setNewLive] = useState({ subject: '', link: '', classId: teacher.assignedClasses[0] || '' });
  const addLive = () => {
    const session: LiveClass = { id: Math.random().toString(36).substring(7), classId: newLive.classId, subject: newLive.subject, teacherName: teacher.name, link: newLive.link, isActive: true };
    const updated = [...liveClasses, session];
    setLiveClasses(updated); dbService.saveLiveClasses(updated); setShowAdd(false);
  };
  return (
    <Card title="Virtual Classroom Streams">
       <div className="flex justify-between items-center mb-6"><button onClick={() => setShowAdd(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold shadow-lg shadow-blue-200"><Video size={18} /><span>Launch Stream</span></button></div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{liveClasses.filter(l => l.teacherName === teacher.name).map(s => <div key={s.id} className="p-4 border rounded-2xl flex justify-between items-center"><p className="font-black text-slate-800">{s.subject}</p><a href={s.link} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-xl"><ExternalLink size={20}/></a></div>)}</div>
       {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"><div className="bg-white p-12 rounded-[40px] w-full max-w-md shadow-2xl"><h3 className="text-2xl font-black mb-6">Start Live Session</h3><div className="space-y-4"><input type="text" placeholder="Subject" className="w-full p-4 border rounded-2xl font-bold" value={newLive.subject} onChange={e => setNewLive({...newLive, subject: e.target.value})} /><input type="text" placeholder="Meeting Link" className="w-full p-4 border rounded-2xl font-bold" value={newLive.link} onChange={e => setNewLive({...newLive, link: e.target.value})} /><button onClick={addLive} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black">Publish Stream</button></div></div></div>
       )}
    </Card>
  );
};

const DashboardLayout = ({ user, onLogout, schoolConfig, children }: { user: User, onLogout: () => void, schoolConfig: SchoolConfig, children?: (activeTab: string, setActiveTab: (t: string) => void) => React.ReactNode }) => {
  const [activeTab, setActiveTab] = useState(user.role === UserRole.ADMIN ? 'dashboard' : 'profile');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const menuItems = useMemo(() => {
    const common = [{ id: 'profile', icon: UserIcon, label: 'Profile' }, { id: 'chat', icon: MessageSquare, label: 'Messages' }];
    if (user.role === UserRole.ADMIN) return [{ id: 'dashboard', icon: LayoutDashboard, label: 'Analytics' }, ...common, { id: 'users', icon: Users, label: 'User Master' }, { id: 'attendance', icon: ClipboardList, label: 'Attendance Monitor' }, { id: 'fees_admin', icon: CreditCard, label: 'Fee Portal' }, { id: 'receipt_settings', icon: Settings, label: 'Receipt Setup' }];
    if (user.role === UserRole.TEACHER) return [...common, { id: 'live_classes', icon: Video, label: 'Virtual Hub' }, { id: 'attendance', icon: ClipboardList, label: 'Attendance' }, { id: 'results', icon: BookOpen, label: 'Evaluations' }, { id: 'homework', icon: FileText, label: 'Assignments' }];
    return [...common, { id: 'my_attendance', icon: ClipboardList, label: 'Attendance' }, { id: 'my_fees', icon: CreditCard, label: 'Fees & Receipts' }, { id: 'my_results', icon: BookOpen, label: 'Evaluations' }, { id: 'my_homework', icon: FileText, label: 'Homework' }];
  }, [user.role]);
  return (
    <div className="min-h-screen flex bg-[#f8fafc]"><aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-100 shadow-2xl lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-24' : 'w-72'} transition-all duration-300`}><div className="flex flex-col h-full"><div className="p-6 border-b flex items-center justify-between"><div className="flex items-center space-x-3"><img src={schoolConfig.logo} className="w-10 h-10 rounded-full shadow-lg" alt="Logo" />{!isCollapsed && <span className="font-black text-slate-800 text-sm truncate">{schoolConfig.name}</span>}</div></div><nav className="flex-1 p-4 space-y-2 overflow-y-auto">{menuItems.map(item => (<SidebarItem key={item.id} {...item} collapsed={isCollapsed} active={activeTab === item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} />))}</nav><div className="p-4 border-t"><button onClick={onLogout} className="w-full flex items-center space-x-3 p-4 text-red-500 hover:bg-red-50 rounded-2xl font-black"><LogOut size={22} />{!isCollapsed && <span>Logout</span>}</button></div></div></aside><main className="flex-1 overflow-y-auto"><header className="h-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 flex items-center justify-between px-8"><button className="lg:hidden p-2 bg-slate-50 rounded-xl" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button><h2 className="text-xl font-black text-slate-800 capitalize">{activeTab.replace('_', ' ')}</h2><div className="flex items-center space-x-4"><p className="text-right hidden sm:block"><span className="block text-xs font-black text-slate-900">{user.name}</span><span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.uid}</span></p><img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-10 h-10 rounded-[14px] shadow-sm" /></div></header><div className="p-8">{children?.(activeTab, setActiveTab)}</div></main></div>
  );
};
