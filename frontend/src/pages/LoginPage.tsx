import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Mail, Sparkles, ShieldCheck, GraduationCap, Compass, Briefcase, Zap, ArrowRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hoverRole, setHoverRole] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your credentials ✨');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Let’s double-check those credentials 🧐');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'student' | 'faculty' | 'recruiter') => {
    setPassword('password123');
    setError('');
    switch (role) {
      case 'admin': setEmail('admin@campusconnect.edu'); break;
      case 'student': setEmail('student1@campusconnect.edu'); break;
      case 'faculty': setEmail('faculty.alan@campusconnect.edu'); break;
      case 'recruiter': setEmail('recruiter.google@google.com'); break;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: import('framer-motion').Variants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(4px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 transition-colors duration-500 relative overflow-hidden bg-transparent">
      {/* Animated Glowing Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-brand-600/20 blur-[140px] z-0"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[140px] z-0"
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] glass-card p-8 sm:p-10 rounded-[2.5rem] relative z-10"
      >
        {/* Branding header */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-10">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="h-16 w-16 rounded-3xl bg-gradient-to-br from-brand-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-brand-500/30 mb-6 relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Sparkles className="h-8 w-8 text-white absolute top-2 right-2 opacity-70 animate-pulse" />
            <span className="text-3xl">🎓</span>
          </motion.div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 text-center mb-3">
            CampusConnect
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 text-center font-medium flex items-center gap-2">
            Elevating education to the next level <Zap className="w-4 h-4 text-brand-500 dark:text-brand-400" />
          </p>
        </motion.div>

        {/* Quick fill buttons */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent flex-1"></div>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">
              Fast-Track Demo Access
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'admin', icon: ShieldCheck, label: 'Admin', color: 'text-brand-400', bg: 'hover:bg-brand-500/10 hover:border-brand-500/30' },
              { id: 'student', icon: GraduationCap, label: 'Student', color: 'text-blue-400', bg: 'hover:bg-blue-500/10 hover:border-blue-500/30' },
              { id: 'faculty', icon: Compass, label: 'Faculty', color: 'text-emerald-400', bg: 'hover:bg-emerald-500/10 hover:border-emerald-500/30' },
              { id: 'recruiter', icon: Briefcase, label: 'Recruiter', color: 'text-amber-400', bg: 'hover:bg-amber-500/10 hover:border-amber-500/30' }
            ].map((role) => (
              <motion.button
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setHoverRole(role.id)}
                onHoverEnd={() => setHoverRole(null)}
                onClick={() => handleQuickFill(role.id as any)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all ${role.bg} ${hoverRole === role.id ? 'shadow-lg shadow-black/5 dark:shadow-black/20' : ''}`}
              >
                <role.icon className={`h-4 w-4 ${role.color}`} />
                {role.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Log In Form */}
        <motion.form variants={itemVariants} onSubmit={handleLogin} className="space-y-5">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400 flex items-center justify-center gap-2 shadow-inner"
              >
                <Heart className="w-4 h-4 animate-pulse text-red-500" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <Mail className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@campusconnect.edu"
                className="pl-12 h-14 bg-slate-100 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl focus:border-brand-500/50 focus:ring-brand-500/20 transition-all text-base placeholder:text-slate-400 dark:placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 uppercase tracking-wider">Secure Password</label>
            <div className="relative group">
              <KeyRound className="absolute top-1/2 -translate-y-1/2 left-4 h-5 w-5 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-12 h-14 bg-slate-100 dark:bg-black/20 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl focus:border-brand-500/50 focus:ring-brand-500/20 transition-all text-base placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-[0.2em]"
                required
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="pt-2">
            <Button
              type="submit"
              isLoading={loading}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg shadow-brand-500/25 border-0 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="flex items-center justify-center gap-2 relative z-10">
                Unlock Experience <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>
        </motion.form>


      </motion.div>
    </div>
  );
};
