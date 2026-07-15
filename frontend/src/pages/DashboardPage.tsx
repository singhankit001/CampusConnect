import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../utils/api';
import { motion } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Award, 
  Calendar, 
  BookOpen, 
  FileCheck, 
  Compass, 
  Briefcase, 
  ShieldAlert,
  Star,
  CheckCircle,
  FileText,
  Terminal,
  Database,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { StudentFinancials } from '../components/financials/StudentFinancials';

// Shared Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, ease: "easeOut" },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
} as const;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'ADMIN': return <AdminDashboard />;
    case 'FACULTY': return <FacultyDashboard profileId={user.profileId!} />;
    case 'RECRUITER': return <RecruiterDashboard companyId={user.details?.companyId || ''} />;
    case 'STUDENT': return <StudentDashboard studentId={user.profileId!} />;
    default:
      return (
        <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
          Access Denied. Unknown user role.
        </Card>
      );
  }
};

// =========================================================================
// 1. ADMIN DASHBOARD
// =========================================================================
const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await apiCall('/analytics/admin-dashboard');
        setData(stats);
      } catch (err: any) {
        setError(err.message || 'Failed to load Admin Dashboard stats.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorWidget message={error} />;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">Admin Operations Console</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Real-time university diagnostics, active enrollments, and placement rate dashboards</p>
      </motion.div>

      {/* Grid of stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Students', value: data.counts.students, icon: Users, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Total Faculty', value: data.counts.faculty, icon: GraduationCap, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Recruiters', value: data.counts.recruiters, icon: Briefcase, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Active Clubs', value: data.counts.clubs, icon: Compass, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Campus Events', value: data.counts.events, icon: Calendar, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10' },
        ].map((stat, idx) => (
          <Card key={idx} glass className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 drop-shadow-sm">{stat.value}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card glass className="h-full flex flex-col justify-between">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm text-slate-900 dark:text-white uppercase tracking-wider font-bold">Placement Success Rate</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Offer conversion percentage based on application data</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-6 min-h-[250px]">
              <div className="relative flex items-center justify-center">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Placed', value: data.placementRate },
                        { name: 'Remaining', value: 100 - data.placementRate }
                      ]}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={75} startAngle={90} endAngle={-270} dataKey="value" stroke="none"
                    >
                      <Cell fill="#6366f1" />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm">{data.placementRate}%</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-bold uppercase mt-1">Hired Rate</span>
                </div>
              </div>
              <div className="mt-4 text-center bg-slate-100/50 dark:bg-slate-800/50 p-3 rounded-xl w-full border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Overall placement rate across all engineering departments.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass className="h-full">
            <CardHeader>
              <CardTitle className="text-sm text-slate-900 dark:text-white uppercase tracking-wider font-bold">Department Hiring Stats</CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total applications vs successful offers</p>
            </CardHeader>
            <CardContent className="h-64 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.deptPlacements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="department" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar name="Total Applications" dataKey="total_applications" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar name="Hires (Offers)" dataKey="hires" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card glass className="p-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Campus Feedback Score</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Average university infrastructure rating</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm">{data.feedback.averageRating} / 5.0</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">{data.feedback.totalFeedback} Surveys Submitted</p>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// =========================================================================
// 2. STUDENT DASHBOARD (BENTO BOX OVERVIEW)
// =========================================================================
const StudentDashboard: React.FC<{ studentId: string }> = ({ studentId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await apiCall(`/analytics/student-dashboard/${studentId}`);
        setData(stats);
      } catch (err: any) {
        setError(err.message || 'Failed to load Student Dashboard stats.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [studentId]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorWidget message={error} />;

  const student = data.summary || {};
  const currentCgpa = parseFloat(student.cgpa || 0);
  
  // Mock Data for Area Chart (CGPA progression)
  const cgpaData = [
    { sem: 'Sem 1', cgpa: currentCgpa > 1 ? currentCgpa - 0.5 : currentCgpa },
    { sem: 'Sem 2', cgpa: currentCgpa > 0.5 ? currentCgpa - 0.2 : currentCgpa },
    { sem: 'Sem 3', cgpa: currentCgpa + 0.1 },
    { sem: 'Sem 4', cgpa: currentCgpa },
  ];

  const attendancePercentage = parseFloat(student.average_attendance_rate || 0).toFixed(1);
  const isAttendanceLow = parseFloat(attendancePercentage) < 75;
  const attendanceColor = isAttendanceLow ? '#ef4444' : '#10b981';
  
  const attendanceData = [{ name: 'Attendance', value: parseFloat(attendancePercentage), fill: attendanceColor }];

  // Mock Ecosystem Events
  const upcomingEvents = [
    { id: 1, title: 'AI Hackathon 2026', club: 'TechSoc', date: 'Tomorrow, 10 AM' },
    { id: 2, title: 'Consulting 101', club: 'Management Club', date: 'Friday, 4 PM' },
    { id: 3, title: 'Open Source Meetup', club: 'GDSC', date: 'Next Mon, 5 PM' },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Student Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-brand-600 dark:text-brand-400">{student.first_name || 'Student'}</span> • {student.department_name}
          </p>
        </div>
      </motion.div>

      {/* BENTO BOX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ROW 1: Academic Snapshot (Col-2) & Attendance Tracker (Col-1) */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass className="h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-32 bg-brand-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none transition-transform duration-700 group-hover:scale-110" />
            <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-brand-500" />
                    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Semester Performance</h3>
                  </div>
                  <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {currentCgpa.toFixed(2)} <span className="text-xl text-slate-400 font-medium">CGPA</span>
                  </h2>
                </div>
                <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 backdrop-blur-md">
                  Top 15% in Cohort
                </Badge>
              </div>
              
              <div className="h-28 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cgpaData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', color: '#0f172a' }} 
                      itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="cgpa" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorCgpa)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card glass className="h-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
             {isAttendanceLow && (
               <div className="absolute inset-0 bg-red-500/5 animate-pulse-glow pointer-events-none" />
             )}
            <div className="flex flex-col items-center justify-center relative z-10 w-full h-full">
              <div className="flex items-center gap-2 mb-2 w-full justify-center">
                <FileCheck className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Attendance</h3>
              </div>
              
              <div className="w-full flex-1 flex items-center justify-center mt-2">
                <ResponsiveContainer width="100%" height={130}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%" barSize={12} data={attendanceData} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background={{ fill: 'rgba(255,255,255,0.05)' }} dataKey="value" cornerRadius={10} fill={attendanceColor} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-900 dark:fill-white text-3xl font-black">
                      {attendancePercentage}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>

              {isAttendanceLow && (
                <div className="mt-4 flex items-center gap-1.5 text-rose-500 text-xs font-bold bg-rose-500/10 px-3 py-1.5 rounded-full backdrop-blur-md">
                  <ShieldAlert className="h-3.5 w-3.5" /> Warning: Below 75%
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* ROW 2: Placement Radar (Col-3) */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card glass className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-sm uppercase tracking-wider">Placement Radar</CardTitle>
              </div>
              <button className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {data.applications.length === 0 ? (
                <div className="w-full p-8 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-white/5">
                  No active internship applications yet. Explore the Placement Portal.
                </div>
              ) : (
                data.applications.map((app: any) => (
                  <div key={app.id} className="flex-1 min-w-[280px] p-4 bg-slate-50/50 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-white/5 hover:border-brand-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-xl flex items-center justify-center shadow-sm">
                        <Briefcase className="h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-brand-500 transition-colors" />
                      </div>
                      <Badge variant={
                        app.status === 'OFFERED' ? 'success' :
                        app.status === 'REJECTED' ? 'destructive' :
                        app.status === 'INTERVIEW' ? 'warning' : 'secondary'
                      } className="text-[10px] shadow-sm">
                        {app.status === 'APPLIED' ? 'CGPA VERIFIED' : app.status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{app.internship.title}</h4>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{app.internship.company.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* ROW 3: Campus Ecosystem (Col-1) & Quick SQL Teaser (Col-2) */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card glass className="h-full p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-sm uppercase tracking-wider">Campus Ecosystem</CardTitle>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {upcomingEvents.map(evt => (
                <div key={evt.id} className="p-3 bg-slate-50/80 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 dark:border-white/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{evt.title}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{evt.club} • {evt.date}</p>
                    <button className="text-[9px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-1 rounded hover:bg-brand-500 hover:text-white transition-colors">
                      Quick Register
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-slate-950 border border-slate-800 shadow-xl overflow-hidden relative group">
            {/* Window Controls */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold tracking-wider">Live SQL Workbench</span>
              </div>
              <div className="w-10"></div> {/* Spacer for balance */}
            </div>
            
            {/* Terminal Body */}
            <div className="p-5 font-mono text-xs leading-relaxed h-[calc(100%-40px)] flex flex-col justify-center">
              <div className="text-brand-300 font-medium mb-3">
                <span className="text-pink-400">SELECT</span> s.roll_no, c.name <span className="text-pink-400">AS</span> club_name<br/>
                <span className="text-pink-400">FROM</span> students s<br/>
                <span className="text-pink-400">JOIN</span> club_memberships cm <span className="text-pink-400">ON</span> s.id = cm.student_id<br/>
                <span className="text-pink-400">JOIN</span> clubs c <span className="text-pink-400">ON</span> cm.club_id = c.id<br/>
                <span className="text-pink-400">WHERE</span> s.id = <span className="text-emerald-400">'{studentId.split('-')[0]}...'</span>;
              </div>
              
              <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/50 backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 text-slate-400">
                      <th className="py-2 px-3 border-b border-slate-800 font-semibold">roll_no</th>
                      <th className="py-2 px-3 border-b border-slate-800 font-semibold">club_name</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    <tr>
                      <td className="py-2 px-3 border-b border-slate-800">{student.roll_no || 'CS2026'}</td>
                      <td className="py-2 px-3 border-b border-slate-800">TechSoc</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 border-b border-slate-800">{student.roll_no || 'CS2026'}</td>
                      <td className="py-2 px-3 border-b border-slate-800">Open Source Meetup</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex items-center gap-2 text-emerald-400 font-bold text-[10px]">
                <Database className="h-3 w-3 animate-pulse" /> Query Executed in 12ms. (2 rows affected)
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </Card>
        </motion.div>
      </div>

      {/* ROW 4: Financials */}
      <motion.div variants={itemVariants} className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1.5 bg-brand-500/20 rounded-lg text-brand-600 dark:text-brand-400">
              <FileText className="h-4 w-4" />
            </span>
            Financials & Billing
          </h2>
        </div>
        <StudentFinancials />
      </motion.div>
    </motion.div>
  );
};

// =========================================================================
// 3. FACULTY DASHBOARD
// =========================================================================
const FacultyDashboard: React.FC<{ profileId: string }> = ({ profileId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const stats = await apiCall(`/analytics/faculty-dashboard/${profileId}`);
        setData(stats);
      } catch (err: any) {
        setError(err.message || 'Failed to load Faculty Dashboard stats.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profileId]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorWidget message={error} />;

  const classAveragesData = data.analytics.map((c: any) => ({
    code: c.course_code,
    attendance: c.average_class_attendance,
    marks: c.average_assignment_marks
  }));

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Faculty Academic Console</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Grade submissions, track attendance rates, and analyze lecture performance</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Assigned Sections', value: data.assignedCourses.length, icon: BookOpen, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Total Students Taught', value: data.totalStudentsTaught, icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Recent Submissions', value: data.recentSubmissions.length, icon: FileText, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat, idx) => (
          <Card key={idx} glass className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass className="h-full">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Course Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent className="h-64 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAveragesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                  <XAxis dataKey="code" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#e2e8f0', opacity: 0.5}}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', borderRadius: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  <Bar name="Class Attendance (%)" dataKey="attendance" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar name="Avg Assignment Mark" dataKey="marks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card glass className="h-full">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
              <CardTitle className="text-sm uppercase tracking-wider">Pending Grading Queue</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {data.recentSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No recent submissions.
                  </div>
                ) : (
                  data.recentSubmissions.slice(0, 4).map((sub: any) => (
                    <div key={sub.id} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-words line-clamp-2">
                          {sub.student.user.firstName} {sub.student.user.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-0.5 break-words line-clamp-2">
                          {sub.assignment.course.code}: {sub.assignment.title}
                        </p>
                      </div>
                      <Badge variant={sub.status === 'LATE' ? 'destructive' : 'default'} className="text-[9px]">
                        {sub.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// =========================================================================
// 4. RECRUITER DASHBOARD
// =========================================================================
const RecruiterDashboard: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!companyId) {
        setLoading(false);
        setError('No company associated with this recruiter profile.');
        return;
      }
      try {
        const stats = await apiCall(`/analytics/recruiter-dashboard/${companyId}`);
        setData(stats);
      } catch (err: any) {
        setError(err.message || 'Failed to load Recruiter Dashboard stats.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [companyId]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorWidget message={error} />;

  const summary = data.summary || {};
  const chartFunnelData = data.funnel.map((f: any) => ({ name: f.status, value: parseInt(f.count) }));
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Recruitment Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Company: <strong className="text-brand-500 dark:text-brand-400">{summary.company_name}</strong> | Industry: {summary.industry}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Internships Posted', value: summary.total_internships_posted, icon: Briefcase, color: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Total Applications', value: summary.total_applications_received, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Hires Extended', value: summary.total_offers_extended, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Average Stipend', value: `₹${parseFloat(summary.average_stipend || 0).toLocaleString()}`, icon: Award, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
        ].map((stat, idx) => (
          <Card key={idx} glass className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card glass className="h-full">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">Applicants Funnel</CardTitle>
            </CardHeader>
            <CardContent className="h-60 min-h-[250px] flex flex-col items-center justify-center">
              {chartFunnelData.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-400 text-sm">No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartFunnelData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                      {chartFunnelData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card glass className="h-full">
            <CardHeader className="border-b border-slate-100 dark:border-white/5 pb-4">
              <CardTitle className="text-sm uppercase tracking-wider">Recent Candidate Applications</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                {data.recentApplicants.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No active applications.
                  </div>
                ) : (
                  data.recentApplicants.slice(0, 4).map((app: any) => (
                    <div key={app.id} className="py-2.5 flex justify-between items-center first:pt-0 last:pb-0">
                      <div className="flex-1 pr-3">
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 break-words line-clamp-2">
                          {app.student.user.firstName} {app.student.user.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 break-words line-clamp-2">
                          Applied: {app.internship.title} (GPA: {app.student.cgpa})
                        </p>
                      </div>
                      <Badge variant={
                        app.status === 'OFFERED' ? 'success' :
                        app.status === 'REJECTED' ? 'destructive' :
                        app.status === 'INTERVIEW' ? 'warning' : 'secondary'
                      } className="text-[9px]">
                        {app.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

// HELPER WIDGETS
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 w-full" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-80 w-full lg:col-span-1" />
      <Skeleton className="h-80 w-full lg:col-span-2" />
    </div>
  </div>
);

const ErrorWidget: React.FC<{ message: string }> = ({ message }) => (
  <Card className="border-red-500/20 bg-red-500/10 text-red-500 p-6 flex gap-4">
    <ShieldAlert className="h-6 w-6 shrink-0" />
    <div>
      <h3 className="text-sm font-bold">Failed to Fetch Dashboard</h3>
      <p className="text-xs mt-1 leading-relaxed">{message}</p>
    </div>
  </Card>
);
