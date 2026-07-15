import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../utils/api';
import { Plus, Upload, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
} as const;
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
} as const;

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAsgId, setSelectedAsgId] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMarks, setNewMarks] = useState('100');
  const [newDueDate, setNewDueDate] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');

  const fetchCourses = async () => {
    try {
      const data = await apiCall<{ courses: any[] }>('/crud/courses');
      setCourses(data.courses);
      if (data.courses.length > 0) setSelectedCourseId(data.courses[0].id);
    } catch (err: any) { console.error(err); }
  };

  const fetchAssignments = async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const data = await apiCall<any[]>(`/crud/assignments?courseId=${selectedCourseId}`);
      setAssignments(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch assignments.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { fetchAssignments(); }, [selectedCourseId]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/crud/assignments', 'POST', { courseId: selectedCourseId, title: newTitle, description: newDesc, maxMarks: parseInt(newMarks), dueDate: new Date(newDueDate).toISOString() });
      setSuccessMsg('Assignment posted successfully!');
      setNewTitle(''); setNewDesc(''); setNewDueDate('');
      setShowCreateModal(false);
      fetchAssignments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post assignment.');
    } finally { setActionLoading(false); }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.profileId || !selectedAsgId) return;
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/procedures/submit-assignment', 'POST', { studentId: user.profileId, assignmentId: selectedAsgId, fileUrl: submitUrl });
      setSuccessMsg('Assignment submitted successfully!');
      setSubmitUrl(''); setShowSubmitModal(false);
      fetchAssignments();
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed.');
    } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Assignment Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit practicals, verify due dates, and monitor graded metrics</p>
        </div>
        {user?.role === 'FACULTY' && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Create Assignment
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

      <Card glass className="p-4 flex items-center justify-between gap-4">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Select Course</span>
        <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none">
          {courses.map(c => <option key={c.id} value={c.id}>{c.code} – {c.title}</option>)}
        </select>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : assignments.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No assignments posted for this course.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {assignments.map(asg => (
            <motion.div key={asg.id} variants={item}>
              <Card glass className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{asg.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{asg.description}</p>
                    <div className="flex flex-wrap gap-3 pt-1">
                      <Badge variant="secondary">Max: {asg.maxMarks} marks</Badge>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        Due: {new Date(asg.dueDate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {user?.role === 'STUDENT' ? (
                      <Button size="sm" onClick={() => { setSelectedAsgId(asg.id); setShowSubmitModal(true); }}>
                        <Upload className="h-4 w-4 mr-1.5" /> Upload Work
                      </Button>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">Submissions Tracked</span>
                    )}
                  </div>
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
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Post Assignment</h2>
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div><label className={labelCls}>Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Relational Calculus Practical" className={inputCls} required /></div>
                <div><label className={labelCls}>Description</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Details of what to implement..." className={`${inputCls} h-24 resize-none`} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Max Marks</label><input type="number" value={newMarks} onChange={e => setNewMarks(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Due Date</label><input type="datetime-local" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className={inputCls} required /></div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Post Assignment</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Card glass className="w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Upload Assignment Work</h2>
              <form onSubmit={handleSubmitAssignment} className="space-y-4">
                <div>
                  <label className={labelCls}>Submission File URL</label>
                  <input type="url" value={submitUrl} onChange={e => setSubmitUrl(e.target.value)} placeholder="https://storage.example.com/my_work.pdf" className={inputCls} required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Submit Work</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
