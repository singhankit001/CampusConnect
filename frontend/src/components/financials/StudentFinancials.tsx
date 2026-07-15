import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Download, IndianRupee, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const mockBills = [
  { id: '1', structure: { title: 'Tuition Fee - Fall 2026' }, amount: 150000, status: 'PAID', dueDate: '2026-08-01' },
  { id: '2', structure: { title: 'Hostel Fee - Fall 2026' }, amount: 45000, status: 'PENDING', dueDate: '2026-12-01' },
  { id: '3', structure: { title: 'Library Fee - Annual' }, amount: 5000, status: 'OVERDUE', dueDate: '2026-05-01' }
];

export const StudentFinancials: React.FC = () => {
  const totalDue = mockBills.filter(b => b.status !== 'PAID').reduce((acc, curr) => acc + curr.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-md border border-emerald-500/30">Paid</span>;
      case 'PENDING': return <span className="px-2 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold rounded-md border border-amber-500/30">Pending</span>;
      case 'OVERDUE': return <span className="px-2 py-1 bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-md border border-rose-500/30">Overdue</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass dark:shadow-glass-dark">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-500/20 rounded-xl text-brand-600 dark:text-brand-400">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Amount Due</p>
                <p className="text-2xl font-bold font-display text-slate-900 dark:text-white">
                  ₹{totalDue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass dark:shadow-glass-dark">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Upcoming Deadline</p>
                <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                  1 Dec 2026
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass dark:shadow-glass-dark">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Last Payment</p>
                <p className="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">
                  Successful
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass dark:shadow-glass-dark">
        <CardHeader>
          <CardTitle className="font-display font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-brand-500" />
            Fee Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Fee Title</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockBills.map((bill, index) => (
                  <motion.tr 
                    key={bill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{bill.structure.title}</td>
                    <td className="px-4 py-4 font-display font-semibold">₹{bill.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4">{getStatusBadge(bill.status)}</td>
                    <td className="px-4 py-4 text-right">
                      {bill.status === 'PAID' ? (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-glow transition-all active:scale-95">
                          <Download className="h-3.5 w-3.5" /> Receipt
                        </button>
                      ) : (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all active:scale-95">
                          Pay Now
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
