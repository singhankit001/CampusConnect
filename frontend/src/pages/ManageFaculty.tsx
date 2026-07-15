import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { Search, Plus, Trash2, CheckCircle, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1';

export const ManageFaculty: React.FC = () => {
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [_total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [departmentId, setDepartmentId] = useState('');
  const [officeHours, setOfficeHours] = useState('Mon/Wed 14:00 - 16:00');

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const data = await apiCall<{ faculty: any[]; total: number }>(
        `/crud/faculty?search=${searchTerm}&departmentId=${deptFilter}&page=${page}&limit=10`
      );
      setFaculties(data.faculty);
      setTotal(data.total);
    } catch (err: any) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const data = await apiCall<any[]>('/departments');
      setDepartments(data);
      if (data.length > 0) setDepartmentId(data[0].id);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDepartments(); }, []);
  useEffect(() => { fetchFaculty(); }, [searchTerm, deptFilter, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    try {
      await apiCall('/crud/faculty', 'POST', { email, password, firstName, lastName, designation, departmentId, officeHours });
      setSuccessMsg('Faculty registered successfully!');
      setEmail(''); setFirstName(''); setLastName('');
      setShowCreateModal(false);
      fetchFaculty();
    } catch (err: any) { setErrorMsg(err.message || 'Creation failed.'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this faculty member? All teaching assignments will be unlinked.')) return;
    try {
      await apiCall(`/crud/faculty/${id}`, 'DELETE');
      setSuccessMsg('Faculty record deleted.');
      fetchFaculty();
    } catch (err: any) { setErrorMsg(err.message || 'Delete failed.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Manage Faculty</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure faculty profiles, academic designations, and office hours</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Faculty
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

      <Card glass className="p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute top-1/2 -translate-y-1/2 left-3.5 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search by name or designation..." value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-brand-500 dark:text-white transition-colors" />
        </div>
        <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          className="w-full md:w-52 px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
        </select>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : faculties.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No faculty matching filters found.</p>
        </div>
      ) : (
        <Card glass className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Faculty Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Designation</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Office Hours</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {faculties.map(fac => (
                  <tr key={fac.id} className="hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{fac.user.firstName} {fac.user.lastName}</td>
                    <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400">{fac.user.email}</td>
                    <td className="px-5 py-4 text-brand-600 dark:text-brand-400 font-medium">{fac.designation}</td>
                    <td className="px-5 py-4"><Badge variant="secondary">{fac.department.code}</Badge></td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">{fac.officeHours || 'N/A'}</td>
                    <td className="px-5 py-4 text-center">
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(fac.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 px-5 py-4">
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {faculties.length} records shown
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button size="sm" variant="ghost" onClick={() => setPage(p => p + 1)} disabled={faculties.length < 10}>Next</Button>
            </div>
          </div>
        </Card>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Card glass className="w-full max-w-lg p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Register Faculty Profile</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>First Name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Designation</label><input type="text" value={designation} onChange={e => setDesignation(e.target.value)} className={inputCls} required /></div>
                  <div>
                    <label className={labelCls}>Department</label>
                    <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={inputCls} required>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                    </select>
                  </div>
                </div>
                <div><label className={labelCls}>Office Hours</label><input type="text" value={officeHours} onChange={e => setOfficeHours(e.target.value)} className={inputCls} required /></div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit">Create Faculty</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
