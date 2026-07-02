import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { Users, Sparkles, Plus, CheckCircle } from 'lucide-react';
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

const CATEGORY_COLORS: Record<string, string> = {
  Tech: 'default',
  Cultural: 'warning',
  Sports: 'success',
  'Social Service': 'secondary',
};

export const ClubsPage: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState('Tech');
  const [newPresId, setNewPresId] = useState('');

  const fetchClubs = async () => {
    try {
      const data = await apiCall<any[]>('/crud/clubs');
      setClubs(data);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiCall<{ students: any[] }>('/crud/students?limit=100');
      setStudents(data.students);
      if (data.students.length > 0) setNewPresId(data.students[0].id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchClubs(), fetchStudents()]).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/crud/clubs', 'POST', { name: newName, description: newDesc, category: newCat, presidentId: newPresId });
      setSuccessMsg('Club registered successfully!');
      setNewName(''); setNewDesc('');
      setShowCreateModal(false);
      fetchClubs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Creation failed.');
    } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Student Clubs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore registered clubs, coordinator committees, and cultural societies</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Register New Club
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {clubs.map(club => (
            <motion.div key={club.id} variants={item}>
              <Card glass className="h-full flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant={(CATEGORY_COLORS[club.category] as any) || 'default'}>{club.category}</Badge>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                      <Users className="h-3.5 w-3.5" />
                      <span>Active Members</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">{club.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">{club.description}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3 rounded-xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">President</p>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {club.president.user.firstName} {club.president.user.lastName}
                      <span className="text-slate-400 font-normal"> ({club.president.rollNo})</span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5 justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Authorized Campus Club
                  </span>
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
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Register Student Club</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><label className={labelCls}>Club Name</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Science & Astro Club" className={inputCls} required /></div>
                <div><label className={labelCls}>Description</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Objectives and weekly meetings..." className={`${inputCls} h-20 resize-none`} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={newCat} onChange={e => setNewCat(e.target.value)} className={inputCls}>
                      <option>Tech</option>
                      <option>Cultural</option>
                      <option>Sports</option>
                      <option value="Social Service">Social Service</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>President (Student)</label>
                    <select value={newPresId} onChange={e => setNewPresId(e.target.value)} className={inputCls} required>
                      {students.map(s => <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Register Club</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
