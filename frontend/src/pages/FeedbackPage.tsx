import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquareHeart, Star, Plus, CheckCircle, Send } from 'lucide-react';
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

const CATEGORY_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  ACADEMIC: 'default',
  FACILITIES: 'success',
  FACULTY: 'warning',
  GENERAL: 'secondary',
};

const renderStars = (count: number) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < count ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
    ))}
  </div>
);

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('ACADEMIC');

  const fetchFeedbacks = async () => {
    try {
      const data = await apiCall<any[]>('/crud/feedbacks');
      setFeedbacks(data);
    } catch (err) { console.error(err); }
  };

  const fetchCourses = async () => {
    try {
      const data = await apiCall<{ courses: any[] }>('/crud/courses?limit=100');
      setCourses(data.courses);
      if (data.courses.length > 0) setSelectedCourse(data.courses[0].id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchFeedbacks(), fetchCourses()]).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/crud/feedbacks', 'POST', { courseId: selectedCourse, rating, comment, category });
      setSuccessMsg('Feedback submitted successfully. Thank you!');
      setComment(''); setRating(5);
      setShowCreateModal(false);
      fetchFeedbacks();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit feedback.');
    } finally { setActionLoading(false); }
  };

  const avgRating = feedbacks.length > 0 ? feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Feedback Board</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Student experience feedback, course evaluations, and facility ratings</p>
        </div>
        {user?.role === 'STUDENT' && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Submit Feedback
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

      {/* Summary Stats */}
      {!loading && feedbacks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card glass className="p-5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Surveys</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{feedbacks.length}</p>
          </Card>
          <Card glass className="p-5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-black text-amber-500">{avgRating.toFixed(1)}</p>
              {renderStars(Math.round(avgRating))}
            </div>
          </Card>
          <Card glass className="p-5">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">By Category</p>
            <div className="flex flex-wrap gap-1.5">
              {(['ACADEMIC', 'FACILITIES', 'FACULTY', 'GENERAL'] as const).map(cat => {
                const count = feedbacks.filter(f => f.category === cat).length;
                return count > 0 ? <Badge key={cat} variant={CATEGORY_VARIANT[cat]}>{cat}: {count}</Badge> : null;
              })}
            </div>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <MessageSquareHeart className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-400 font-medium">No feedback submissions yet.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {feedbacks.map(fb => (
            <motion.div key={fb.id} variants={item}>
              <Card glass className="p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={CATEGORY_VARIANT[fb.category] || 'secondary'}>{fb.category}</Badge>
                      {renderStars(fb.rating)}
                      <span className="text-[11px] text-slate-400 font-semibold">
                        {new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{fb.comment}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold pt-1">
                      <span>Course: <span className="text-slate-700 dark:text-slate-300">{fb.course?.name || 'N/A'}</span></span>
                      <span>By: <span className="text-slate-700 dark:text-slate-300">{fb.student?.user?.firstName} {fb.student?.user?.lastName}</span></span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-black text-amber-500">{fb.rating}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">/ 5</p>
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
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <MessageSquareHeart className="h-5 w-5 text-brand-500" /> Submit Feedback
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Course</label>
                    <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className={inputCls} required>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                      <option value="ACADEMIC">Academic</option>
                      <option value="FACILITIES">Facilities</option>
                      <option value="FACULTY">Faculty</option>
                      <option value="GENERAL">General</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Rating</label>
                  <div className="flex items-center gap-1.5 py-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button key={i} type="button" onClick={() => setRating(i + 1)} className="focus:outline-none transition-transform hover:scale-125">
                        <Star className={`h-7 w-7 transition-colors ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-bold text-slate-500">{rating} / 5</span>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Your Feedback</label>
                  <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience, suggestions, or concerns..." className={`${inputCls} h-24 resize-none`} required />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Submit
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
