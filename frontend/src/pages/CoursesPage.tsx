import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../utils/api';
import { Search, Plus, Trash2, ArrowRight, CheckCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
} as const;
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
} as const;

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1';

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCredits, setNewCredits] = useState('3');
  const [newDeptId, setNewDeptId] = useState('');

  const fetchCourses = async () => {
    try {
      const data = await apiCall<{ courses: any[] }>(`/crud/courses?search=${searchTerm}&departmentId=${selectedDept}`);
      setCourses(data.courses);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch courses.');
    }
  };

  const fetchDepartments = async () => {
    try {
      const depts = await apiCall<any[]>('/departments');
      setDepartments(depts);
      if (depts.length > 0) setNewDeptId(depts[0].id);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCourses(), fetchDepartments()]).finally(() => setLoading(false));
  }, [searchTerm, selectedDept]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/crud/courses', 'POST', { code: newCode, title: newTitle, credits: parseInt(newCredits), departmentId: newDeptId });
      setSuccessMsg('Course created successfully!');
      setNewCode(''); setNewTitle('');
      setShowCreateModal(false);
      fetchCourses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create course.');
    } finally { setActionLoading(false); }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Delete this course? All associated enrollments and assignments will be removed.')) return;
    setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall(`/crud/courses/${id}`, 'DELETE');
      setSuccessMsg('Course deleted successfully.');
      fetchCourses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Delete failed.');
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user?.profileId) return;
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/procedures/enroll-student', 'POST', { studentId: user.profileId, courseId, semester: 'Fall 2026', academicYear: '2026' });
      setSuccessMsg('Successfully enrolled via stored procedure!');
      fetchCourses();
    } catch (err: any) {
      setErrorMsg(err.message || 'Enrollment failed.');
    } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">University Courses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage core syllabus curriculum, departments, and course enrollments</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Add New Course
          </Button>
        )}
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}
        </motion.div>
      )}
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm font-semibold">
          {errorMsg}
        </motion.div>
      )}

      <Card glass className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by code or title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500 dark:text-white transition-colors" />
        </div>
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}
          className="w-full md:w-56 px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.code} - {d.name}</option>)}
        </select>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No courses matching filters found.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map(course => (
            <motion.div key={course.id} variants={item}>
              <Card glass className="h-full flex flex-col justify-between p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">{course.code}</Badge>
                    <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">{course.credits} Credits</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed line-clamp-1">{course.title}</h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">{course.department.name}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  {user?.role === 'STUDENT' ? (
                    <Button size="sm" variant="ghost" onClick={() => handleEnroll(course.id)} isLoading={actionLoading}>
                      Register Section <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Ongoing Session</span>
                  )}
                  {user?.role === 'ADMIN' && (
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteCourse(course.id)} className="text-rose-500 hover:bg-rose-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Card glass className="w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Add Curriculum Course</h2>
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div><label className={labelCls}>Course Code</label><input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="e.g. CS302" className={inputCls} required /></div>
                <div><label className={labelCls}>Course Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Database Management Systems" className={inputCls} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Credits</label><input type="number" min="1" max="6" value={newCredits} onChange={e => setNewCredits(e.target.value)} className={inputCls} required /></div>
                  <div>
                    <label className={labelCls}>Department</label>
                    <select value={newDeptId} onChange={e => setNewDeptId(e.target.value)} className={inputCls} required>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Add Course</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
