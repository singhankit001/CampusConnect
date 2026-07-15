import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { Search, Plus, Trash2, CheckCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors';
const labelCls = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1';

export const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
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
  const [rollNo, setRollNo] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [batch, setBatch] = useState('2023-2027');
  const [cgpa, setCgpa] = useState('8.0');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await apiCall<{ students: any[]; total: number }>(
        `/crud/students?search=${searchTerm}&departmentId=${deptFilter}&page=${page}&limit=10`
      );
      setStudents(data.students);
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
  useEffect(() => { fetchStudents(); }, [searchTerm, deptFilter, page]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(''); setErrorMsg('');
    try {
      await apiCall('/crud/students', 'POST', { email, password, firstName, lastName, rollNo, departmentId, batch, cgpa: parseFloat(cgpa) });
      setSuccessMsg('Student registered successfully!');
      setEmail(''); setFirstName(''); setLastName(''); setRollNo('');
      setShowCreateModal(false);
      fetchStudents();
    } catch (err: any) { setErrorMsg(err.message || 'Creation failed.'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this student and their login credentials?')) return;
    try {
      await apiCall(`/crud/students/${id}`, 'DELETE');
      setSuccessMsg('Student records purged.');
      fetchStudents();
    } catch (err: any) { setErrorMsg(err.message || 'Delete failed.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">Manage Students</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete student registry, CGPA stats, and enrollment management</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="h-4 w-4 mr-1.5" /> Add Student
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
          <input type="text" placeholder="Search by name or roll number..." value={searchTerm}
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
      ) : students.length === 0 ? (
        <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 dark:text-slate-400 mx-auto" />
          <p className="text-sm text-slate-400 font-medium">No students matching search criteria.</p>
        </div>
      ) : (
        <Card glass className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Roll No</th>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Batch</th>
                  <th className="px-5 py-3.5">CGPA</th>
                  <th className="px-5 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4 font-mono font-bold text-brand-600 dark:text-brand-400 text-[11px]">{student.rollNo}</td>
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">{student.user.firstName} {student.user.lastName}</td>
                    <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400">{student.user.email}</td>
                    <td className="px-5 py-4"><Badge variant="secondary">{student.department.code}</Badge></td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">{student.batch}</td>
                    <td className="px-5 py-4 font-bold text-emerald-500">{student.cgpa.toFixed(2)}</td>
                    <td className="px-5 py-4 text-center">
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(student.id)} className="opacity-0 group-hover:opacity-100 text-rose-500 hover:bg-rose-500/10 transition-all">
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
              Showing {students.length} of {total} records
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button size="sm" variant="ghost" onClick={() => setPage(p => p + 1)} disabled={students.length < 10}>Next</Button>
            </div>
          </div>
        </Card>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
            <Card glass className="w-full max-w-lg p-6 shadow-2xl border border-slate-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-5">Enroll New Student</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>First Name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} required /></div>
                  <div><label className={labelCls}>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputCls} required /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className={labelCls}>Roll Number</label><input type="text" value={rollNo} onChange={e => setRollNo(e.target.value)} placeholder="ROLL2023-1099" className={inputCls} required /></div>
                  <div>
                    <label className={labelCls}>Department</label>
                    <select value={departmentId} onChange={e => setDepartmentId(e.target.value)} className={inputCls} required>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.code}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>Batch</label><input type="text" value={batch} onChange={e => setBatch(e.target.value)} className={inputCls} required /></div>
                </div>
                <div><label className={labelCls}>CGPA (0–10)</label><input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={e => setCgpa(e.target.value)} className={inputCls} required /></div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                  <Button type="submit">Create Student</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};
