import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarDays, 
  Award, 
  Terminal, 
  FileText, 
  MessageSquareHeart, 
  Compass, 
  ClipboardList,
  Receipt
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['ADMIN', 'STUDENT', 'FACULTY', 'RECRUITER'] },
    { name: 'Manage Students', path: '/students', icon: <Users className="h-5 w-5" />, roles: ['ADMIN'] },
    { name: 'Manage Faculty', path: '/faculty', icon: <GraduationCap className="h-5 w-5" />, roles: ['ADMIN'] },
    { name: 'Courses & Schedule', path: '/courses', icon: <BookOpen className="h-5 w-5" />, roles: ['ADMIN', 'FACULTY'] },
    { name: 'Assignments', path: '/assignments', icon: <ClipboardList className="h-5 w-5" />, roles: ['STUDENT', 'FACULTY'] },
    { name: 'Events & Registration', path: '/events', icon: <CalendarDays className="h-5 w-5" />, roles: ['ADMIN', 'STUDENT'] },
    { name: 'Clubs & Members', path: '/clubs', icon: <Compass className="h-5 w-5" />, roles: ['ADMIN', 'STUDENT'] },
    { name: 'Placement Portal', path: '/placements', icon: <Award className="h-5 w-5" />, roles: ['ADMIN', 'STUDENT', 'RECRUITER'] },
    { name: 'Announcements', path: '/announcements', icon: <FileText className="h-5 w-5" />, roles: ['ADMIN', 'STUDENT', 'FACULTY', 'RECRUITER'] },
    { name: 'Fee Management', path: '/fee-management', icon: <Receipt className="h-5 w-5" />, roles: ['ADMIN'] },
    { name: 'Feedback Board', path: '/feedback', icon: <MessageSquareHeart className="h-5 w-5" />, roles: ['ADMIN', 'STUDENT'] },
    { name: 'SQL Analytical Queries', path: '/sql-queries', icon: <Terminal className="h-5 w-5" />, roles: ['ADMIN', 'STUDENT', 'FACULTY', 'RECRUITER'] }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-64 border-r border-white/30 bg-white/20 backdrop-blur-lg shadow-xl dark:bg-slate-900/50 dark:border-white/10 transition-colors duration-300 md:block">
      <div className="flex flex-col h-full py-6 justify-between">
        <div className="px-3 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase px-4 mb-3">
            Workspace
          </p>
          {allowedItems.map(item => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-slate-600 hover:text-slate-900 dark:text-white hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 group focus-ring"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-slate-100 dark:bg-white/10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <span className={`transition-colors ${isActive ? 'text-brand-600 dark:text-brand-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'}`}>
                    {item.icon}
                  </span>
                  <span className={isActive ? 'text-slate-900 dark:text-white font-bold drop-shadow-sm' : 'text-slate-600 dark:text-slate-400'}>
                    {item.name}
                  </span>
                </span>
              </NavLink>
            );
          })}
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              DBMS Live Server
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
