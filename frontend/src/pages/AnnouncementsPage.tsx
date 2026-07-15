import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { Plus, BellRing, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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

const TYPE_VARIANT: Record<string, 'default' | 'secondary' | 'warning' | 'success'> = {
  ALL: 'secondary',
  STUDENTS: 'default',
  FACULTY: 'warning',
  DEPARTMENT: 'success',
};

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('ALL');
  const [newDeptId, setNewDeptId] = useState('');

  const fetchAnnouncements = async () => {
    try {
      const data = await apiCall<any[]>('/crud/announcements');
      setAnnouncements(data);
    } catch (err) { console.error(err); }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiCall<any[]>('/departments');
      setDepartments(data);
      if (data.length > 0) setNewDeptId(data[0].id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchAnnouncements(), fetchDepartments()]).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/crud/announcements', 'POST', { title: newTitle, content: newContent, type: newType, departmentId: newType === 'DEPARTMENT' ? newDeptId : null });
      setSuccessMsg('Announcement broadcasted successfully!');
      setNewTitle(''); setNewContent('');
      setShowCreateModal(false);
      fetchAnnouncements();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post bulletin.');
    } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">University Announcements</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Official bulletins, exam schedules, and department broadcasts</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'FACULTY') && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Post Bulletin
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

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <BellRing className="h-10 w-10 text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No active bulletins posted.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {announcements.map(ann => (
            <motion.div key={ann.id} variants={item}>
              <Card glass className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <BellRing className="h-3.5 w-3.5 text-brand-500" />
                        {new Date(ann.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <Badge variant={TYPE_VARIANT[ann.type] || 'secondary'}>
                        {ann.type}{ann.department ? ` · ${ann.department.code}` : ''}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">{ann.title}</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap shrink-0">
                    By {ann.creator.firstName} {ann.creator.lastName}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-4">
                  {ann.content}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Card glass className="w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Post Bulletin Announcement</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><label className={labelCls}>Bulletin Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Practical Exam Guidelines" className={inputCls} required /></div>
                <div><label className={labelCls}>Content</label><textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Body of the announcement..." className={`${inputCls} h-28 resize-none`} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Target Audience</label>
                    <select value={newType} onChange={e => setNewType(e.target.value)} className={inputCls}>
                      <option value="ALL">All Users</option>
                      <option value="STUDENTS">Students Only</option>
                      <option value="FACULTY">Faculty Only</option>
                      <option value="DEPARTMENT">Specific Dept.</option>
                    </select>
                  </div>
                  {newType === 'DEPARTMENT' && (
                    <div>
                      <label className={labelCls}>Department</label>
                      <select value={newDeptId} onChange={e => setNewDeptId(e.target.value)} className={inputCls} required>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Broadcast Bulletin</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
