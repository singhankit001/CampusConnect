import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../utils/api';
import { Calendar, MapPin, Users, Plus, CheckCircle } from 'lucide-react';
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

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newLoc, setNewLoc] = useState('');
  const [newClubId, setNewClubId] = useState('');
  const [newCap, setNewCap] = useState('100');

  const fetchEvents = async () => {
    try {
      const data = await apiCall<any[]>('/crud/events');
      setEvents(data);
    } catch (err) { console.error(err); }
  };

  const fetchClubs = async () => {
    try {
      const data = await apiCall<any[]>('/crud/clubs');
      setClubs(data);
      if (data.length > 0) setNewClubId(data[0].id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEvents(), fetchClubs()]).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/crud/events', 'POST', { title: newTitle, description: newDesc, date: newDate, time: newTime, location: newLoc, clubId: newClubId || null, capacity: parseInt(newCap) });
      setSuccessMsg('Event scheduled successfully!');
      setNewTitle(''); setNewDesc(''); setNewDate(''); setNewLoc('');
      setShowCreateModal(false);
      fetchEvents();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule event.');
    } finally { setActionLoading(false); }
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/procedures/register-event', 'POST', { userId: user.id, eventId });
      setSuccessMsg('Successfully registered for event!');
      fetchEvents();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally { setActionLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Campus Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Browse upcoming club events, workshops, and sports meets</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Schedule Event
        </Button>
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
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No scheduled events found.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map(ev => (
            <motion.div key={ev.id} variants={item}>
              <Card glass className="h-full flex flex-col justify-between p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-brand-500" />
                      {new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {ev.club && <Badge variant="default">{ev.club.name}</Badge>}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 line-clamp-2">{ev.description}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {ev.location} · {ev.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {ev.capacity} Seats Capacity
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  {user?.role === 'STUDENT' ? (
                    <Button className="w-full" size="sm" onClick={() => handleRegister(ev.id)} isLoading={actionLoading}>
                      Reserve Spot
                    </Button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 block text-center">Organized Event</span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md">
            <Card glass className="p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Schedule Club Event</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><label className={labelCls}>Event Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Flutter Hackathon" className={inputCls} required /></div>
                <div><label className={labelCls}>Description</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Detailed guidelines..." className={`${inputCls} h-20 resize-none`} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Event Date</label><input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Start Time</label><input type="text" value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="14:00" className={inputCls} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Venue</label><input type="text" value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="Auditorium A" className={inputCls} required /></div>
                  <div><label className={labelCls}>Capacity</label><input type="number" value={newCap} onChange={e => setNewCap(e.target.value)} className={inputCls} required /></div>
                </div>
                <div>
                  <label className={labelCls}>Hosting Club (Optional)</label>
                  <select value={newClubId} onChange={e => setNewClubId(e.target.value)} className={inputCls}>
                    <option value="">None (General Event)</option>
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Post Event</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
