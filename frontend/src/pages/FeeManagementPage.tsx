import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Receipt, Search, Plus, Send, CreditCard, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

export const FeeManagementPage: React.FC = () => {
  const [structures] = useState([
    { id: 1, title: 'Tuition Fee - Fall 2026', amount: 150000, department: 'Computer Science', batch: '2024-2028', dueDate: '2026-08-01' },
    { id: 2, title: 'Hostel Fee - Fall 2026', amount: 45000, department: 'All', batch: '2024-2028', dueDate: '2026-12-01' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Fee Administration</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage fee structures, invoices, and collections across the university.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 dark:text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm active:scale-95">
            <Plus className="h-4 w-4" />
            New Structure
          </button>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors shadow-glow active:scale-95">
            <Send className="h-4 w-4" />
            Generate Invoices
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Collections (This Sem)</p>
                <h3 className="text-3xl font-bold font-display mt-2 text-slate-900 dark:text-white">₹45.2M</h3>
              </div>
              <div className="p-3 bg-brand-500/20 text-brand-600 dark:text-brand-400 rounded-xl">
                <Banknote className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Dues</p>
                <h3 className="text-3xl font-bold font-display mt-2 text-slate-900 dark:text-white">₹3.8M</h3>
              </div>
              <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Collection Rate</p>
                <h3 className="text-3xl font-bold font-display mt-2 text-slate-900 dark:text-white">92.4%</h3>
              </div>
              <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 shadow-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display font-semibold">Active Fee Structures</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search structures..." 
              className="pl-9 pr-4 py-2 w-64 text-sm bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Target Dept/Batch</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((structure, index) => (
                  <motion.tr 
                    key={structure.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{structure.title}</td>
                    <td className="px-4 py-4 font-display font-semibold">₹{structure.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs">
                        {structure.department} • {structure.batch}
                      </span>
                    </td>
                    <td className="px-4 py-4">{new Date(structure.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-right">
                      <button className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium text-xs mr-3 transition-colors">
                        Edit
                      </button>
                      <button className="text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium text-xs transition-colors">
                        Delete
                      </button>
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
