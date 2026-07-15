import React, { useState, useEffect } from 'react';
import { apiCall } from '../utils/api';
import { Play, FileCode, Terminal, HelpCircle, AlertCircle, Clock, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

interface QueryDefinition {
  id: number;
  title: string;
  purpose: string;
  sql: string;
  explanation: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

export const SqlQueryPage: React.FC = () => {
  const [queries, setQueries] = useState<QueryDefinition[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<QueryDefinition | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [execTime, setExecTime] = useState<number | null>(null);
  const [error, setError] = useState('');

  const fetchQueries = async () => {
    try {
      const data = await apiCall<QueryDefinition[]>('/analytics/queries');
      setQueries(data);
      if (data.length > 0) {
        setSelectedQuery(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch query list.');
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  useEffect(() => {
    setResults(null);
    setExecTime(null);
    setError('');
  }, [selectedQuery]);

  const handleRunQuery = async () => {
    if (!selectedQuery) return;
    setLoading(true);
    setError('');
    setResults(null);

    const startTime = performance.now();

    try {
      const response = await apiCall<any>(`/analytics/queries/${selectedQuery.id}/run`, 'POST');
      const endTime = performance.now();
      setExecTime(Math.round(endTime - startTime));
      setResults(response.results);
    } catch (err: any) {
      setError(err.message || 'SQL compilation or execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const getColumns = () => {
    if (!results || results.length === 0) return [];
    return Object.keys(results[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            SQL Analytical Workbench
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dynamic live demonstration of 15 advanced DBMS evaluation queries
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queries List Sidebar */}
        <div className="lg:col-span-1">
          <Card glass className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase px-2">
              Select SQL Query
            </p>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
              {queries.map(q => (
                <motion.button
                  key={q.id}
                  variants={item}
                  onClick={() => setSelectedQuery(q)}
                  className={`w-full text-left p-3 rounded-xl text-xs font-semibold border transition-all flex items-start gap-3 ${
                    selectedQuery?.id === q.id
                      ? 'bg-brand-500 border-brand-650 text-white shadow-md shadow-brand-500/10'
                      : 'bg-white dark:bg-slate-950/20 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    selectedQuery?.id === q.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {q.id}
                  </span>
                  <span className="line-clamp-2 leading-relaxed">{q.title}</span>
                </motion.button>
              ))}
            </motion.div>
          </Card>
        </div>

        {/* Query details & execution */}
        <div className="lg:col-span-2 space-y-6">
          {selectedQuery ? (
            <div className="space-y-6">
              {/* Card info */}
              <Card glass className="p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-150 dark:border-white/5 pb-4">
                  <h2 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="h-4.5 w-4.5 text-brand-500" />
                    Query #{selectedQuery.id}: {selectedQuery.title.split(':')[0]}
                  </h2>
                  <Button
                    onClick={handleRunQuery}
                    disabled={loading}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-md shadow-emerald-500/10 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Compiling...
                      </span>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 mr-1.5 fill-current" /> Execute Query
                      </>
                    )}
                  </Button>
                </div>

                {/* Purpose */}
                <div className="flex gap-3 bg-brand-50/20 dark:bg-brand-950/10 p-4 rounded-xl border border-brand-100/20 dark:border-white/5">
                  <HelpCircle className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">Evaluation Purpose</h4>
                    <p className="text-xs text-slate-650 dark:text-slate-350 mt-1 leading-relaxed">{selectedQuery.purpose}</p>
                  </div>
                </div>

                {/* SQL Code Block */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-brand-500" /> Relational SQL DML
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">PostgreSQL Dialect</span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-50 text-slate-800 text-xs overflow-x-auto font-mono leading-relaxed border border-slate-200 shadow-inner">
                    <code>{selectedQuery.sql}</code>
                  </pre>
                </div>

                {/* Explanation */}
                <div className="text-xs space-y-1 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                  <h4 className="font-bold text-slate-500 dark:text-slate-400">Join & Execution Plan Explanation</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-1">{selectedQuery.explanation}</p>
                </div>
              </Card>

              {/* Live Output Section */}
              <Card glass className="p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-150 dark:border-white/5 pb-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Query Execution Output
                  </h3>
                  {execTime !== null && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Compiled in {execTime}ms
                    </Badge>
                  )}
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-550 dark:text-rose-450">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Execution Error</p>
                      <p className="mt-1 font-mono text-[11px] leading-relaxed break-all">{error}</p>
                    </div>
                  </motion.div>
                )}

                {results === null && !loading && !error && (
                  <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <Database className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-450 dark:text-slate-500 font-medium">Click "Execute Query" to fetch live data from the PostgreSQL server.</p>
                  </div>
                )}

                {loading && (
                  <div className="p-16 space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                )}

                {results !== null && results.length === 0 && (
                  <div className="p-16 text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <Database className="h-10 w-10 text-slate-350 dark:text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-455 dark:text-slate-500 font-medium">Query executed successfully. Result returned 0 rows.</p>
                  </div>
                )}

                {results !== null && results.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-white/5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <tr className="border-b border-slate-200 dark:border-white/5">
                          {getColumns().map(col => (
                            <th key={col} className="px-4 py-3 font-semibold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {results.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-700 dark:text-slate-300">
                            {getColumns().map(col => {
                              const val = row[col];
                              return (
                                <td key={col} className="px-4 py-3 font-mono text-[11px] truncate max-w-[220px]">
                                  {val === null || val === undefined ? (
                                    <span className="text-slate-400 italic">NULL</span>
                                  ) : typeof val === 'object' ? (
                                    JSON.stringify(val)
                                  ) : (
                                    String(val)
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-16 text-center text-slate-450 dark:text-slate-500">
              No query selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
