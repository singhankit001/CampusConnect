import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiCall } from '../utils/api';
import { Search, Plus, ExternalLink, CheckCircle, Eye, Briefcase } from 'lucide-react';
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

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'warning' | 'success' | 'destructive'> = {
  APPLIED: 'secondary',
  SCREENING: 'warning',
  INTERVIEW: 'default',
  OFFERED: 'success',
  REJECTED: 'destructive',
};

export const PlacementsPage: React.FC = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedIntId, setSelectedIntId] = useState('');

  const [showAppsModal, setShowAppsModal] = useState(false);
  const [activeApps, setActiveApps] = useState<any[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLoc, setNewLoc] = useState('');
  const [newType, setNewType] = useState('Full-time');
  const [newStipend, setNewStipend] = useState('50000');
  const [newDuration, setNewDuration] = useState('6');
  const [newDeadline, setNewDeadline] = useState('');

  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const fetchInternships = async () => {
    try {
      const companyQuery = user?.role === 'RECRUITER' ? `?companyId=${user.details?.companyId}` : '';
      const data = await apiCall<any[]>(`/crud/internships${companyQuery}`);
      setInternships(data.filter(i =>
        i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.company.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } catch (err: any) { setErrorMsg(err.message || 'Failed to load internships.'); }
  };

  const fetchApplications = async () => {
    try {
      const q = user?.role === 'STUDENT' ? `?studentId=${user.profileId}` : user?.role === 'RECRUITER' ? `?companyId=${user.details?.companyId}` : '';
      const data = await apiCall<any[]>(`/crud/applications${q}`);
      setApplications(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchInternships(), fetchApplications()]).finally(() => setLoading(false));
  }, [searchTerm, user]);

  const handleCreateInternship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.details?.companyId) return;
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/crud/internships', 'POST', { companyId: user.details.companyId, title: newTitle, description: newDesc, location: newLoc, type: newType, stipend: parseFloat(newStipend), durationMonths: parseInt(newDuration), deadline: new Date(newDeadline).toISOString() });
      setSuccessMsg('Internship opportunity posted!');
      setNewTitle(''); setNewDesc('');
      setShowCreateModal(false);
      fetchInternships();
    } catch (err: any) { setErrorMsg(err.message || 'Failed to post.'); }
    finally { setActionLoading(false); }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.profileId || !selectedIntId) return;
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall('/procedures/apply-internship', 'POST', { studentId: user.profileId, internshipId: selectedIntId, resumeUrl, coverLetter });
      setSuccessMsg('Applied successfully via stored procedure!');
      setResumeUrl(''); setCoverLetter('');
      setShowApplyModal(false);
      fetchApplications();
    } catch (err: any) { setErrorMsg(err.message || 'Application failed.'); }
    finally { setActionLoading(false); }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setActionLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await apiCall(`/crud/applications/${appId}`, 'PUT', { status: newStatus });
      setSuccessMsg(`Application status updated to ${newStatus}.`);
      fetchApplications();
      if (showAppsModal) {
        const refreshed = await apiCall<any[]>(`/crud/applications?companyId=${user?.details?.companyId}`);
        setActiveApps(refreshed.filter(a => a.internshipId === selectedIntId));
      }
    } catch (err: any) { setErrorMsg(err.message || 'Failed to update.'); }
    finally { setActionLoading(false); }
  };

  const handleOpenAppsModal = (internshipId: string) => {
    setSelectedIntId(internshipId);
    setActiveApps(applications.filter(a => a.internshipId === internshipId));
    setShowAppsModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Placement Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submit applications, review hiring funnels, and manage internship postings</p>
        </div>
        {user?.role === 'RECRUITER' && (
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Post Internship
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
        <div className="relative w-full md:w-96">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by title or company..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500 dark:text-white transition-colors" />
        </div>
        {user?.role === 'STUDENT' && (
          <Badge variant="success">CGPA: {user.details?.cgpa || '0.0'}</Badge>
        )}
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : internships.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Briefcase className="h-10 w-10 text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No internship postings found.</p>
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internships.map(intern => (
            <motion.div key={intern.id} variants={item}>
              <Card glass className="h-full flex flex-col justify-between p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">{intern.type}</Badge>
                    <span className="text-sm font-black text-emerald-500">₹{intern.stipend.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-relaxed">{intern.title}</h3>
                    <p className="text-[11px] text-brand-600 dark:text-brand-400 font-bold mt-0.5">{intern.company.name} · {intern.location}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{intern.description}</p>
                  </div>
                  <div className="flex gap-4 text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Duration: <span className="text-slate-700 dark:text-slate-300 font-bold">{intern.durationMonths} mo</span></span>
                    <span>Deadline: <span className="text-slate-700 dark:text-slate-300 font-bold">{new Date(intern.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-white/5">
                  {user?.role === 'STUDENT' ? (
                    <Button size="sm" onClick={() => { setSelectedIntId(intern.id); setShowApplyModal(true); }}>
                      Apply Now <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  ) : user?.role === 'RECRUITER' ? (
                    <Button size="sm" variant="ghost" onClick={() => handleOpenAppsModal(intern.id)}>
                      <Eye className="h-4 w-4 mr-1.5" /> Candidates ({applications.filter(a => a.internshipId === intern.id).length})
                    </Button>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">Database Entry Verified</span>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Recruiter: Create Internship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-md">
            <Card glass className="p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Post Internship</h2>
              <form onSubmit={handleCreateInternship} className="space-y-4">
                <div><label className={labelCls}>Job Title</label><input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Software Dev Intern" className={inputCls} required /></div>
                <div><label className={labelCls}>Description</label><textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Roles and skills..." className={`${inputCls} h-20 resize-none`} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Location</label><input type="text" value={newLoc} onChange={e => setNewLoc(e.target.value)} placeholder="Bangalore, India" className={inputCls} required /></div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={newType} onChange={e => setNewType(e.target.value)} className={inputCls}>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Remote</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>Stipend (₹/mo)</label><input type="number" value={newStipend} onChange={e => setNewStipend(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Duration (mo)</label><input type="number" value={newDuration} onChange={e => setNewDuration(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Deadline</label><input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} className={inputCls} required /></div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Post Opportunity</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Student: Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Card glass className="w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-white/10">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Submit Application</h2>
              <form onSubmit={handleApply} className="space-y-4">
                <div><label className={labelCls}>Resume PDF URL</label><input type="url" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} placeholder="https://storage.example.com/resume.pdf" className={inputCls} required /></div>
                <div><label className={labelCls}>Cover Letter (Optional)</label><textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} placeholder="Tell the recruiter why you are a great fit..." className={`${inputCls} h-24 resize-none`} /></div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                  <Button type="submit" isLoading={actionLoading}>Apply via Stored Procedure</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Recruiter: View Applicants Modal */}
      {showAppsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-2xl">
            <Card glass className="p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4 mb-5">
                <h2 className="text-base font-display font-bold text-slate-900 dark:text-white">Candidate Profiles</h2>
                <Button size="sm" variant="ghost" onClick={() => setShowAppsModal(false)}>Close</Button>
              </div>
              <div className="space-y-4">
                {activeApps.length === 0 ? (
                  <div className="p-10 text-center text-sm text-slate-400">No applications received yet.</div>
                ) : activeApps.map(app => (
                  <div key={app.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-100 dark:border-white/5">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{app.student.user.firstName} {app.student.user.lastName} <span className="font-normal text-slate-500 dark:text-slate-400">· GPA: {app.student.cgpa}</span></p>
                      <p className="text-[11px] text-slate-400 font-medium">Roll: {app.student.rollNo} · Batch: {app.student.batch}</p>
                      <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="text-[11px] text-brand-500 font-bold hover:underline inline-flex items-center gap-0.5 mt-1">
                        Open Resume <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={STATUS_VARIANT[app.status] || 'secondary'}>{app.status}</Badge>
                      <select value={app.status} onChange={e => handleUpdateStatus(app.id, e.target.value)} disabled={actionLoading}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none">
                        {['APPLIED','SCREENING','INTERVIEW','OFFERED','REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
