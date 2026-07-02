import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import type { UserRole } from './contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Layout
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ParallaxBackground } from './components/ParallaxBackground';
import { CustomCursor } from './components/ui/CustomCursor';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManageStudents } from './pages/ManageStudents';
import { ManageFaculty } from './pages/ManageFaculty';
import { CoursesPage } from './pages/CoursesPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { EventsPage } from './pages/EventsPage';
import { ClubsPage } from './pages/ClubsPage';
import { PlacementsPage } from './pages/PlacementsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { SqlQueryPage } from './pages/SqlQueryPage';
import { FeeManagementPage } from './pages/FeeManagementPage';

// ---------- Route Guard ----------
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Restoring Session…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ---------- Authenticated Layout Shell ----------
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen transition-colors duration-300 relative overflow-hidden">
      <Navbar />
      <Sidebar />
      <main className="pt-16 md:pl-64 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-4rem)]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

// ---------- Root App ----------
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
            Loading CampusConnect…
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <CustomCursor />
      <ParallaxBackground />
      <div className="absolute inset-0 bg-noise opacity-[0.08] mix-blend-overlay pointer-events-none z-0 fixed"></div>
      <div className="fixed inset-0 bg-white/20 pointer-events-none z-0"></div>
      
      <Routes>
        {/* Public Route */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppShell><DashboardPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppShell><ManageStudents /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppShell><ManageFaculty /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}>
            <AppShell><CoursesPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/assignments"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'FACULTY']}>
            <AppShell><AssignmentsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
            <AppShell><EventsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/clubs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
            <AppShell><ClubsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/placements"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT', 'RECRUITER']}>
            <AppShell><PlacementsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/announcements"
        element={
          <ProtectedRoute>
            <AppShell><AnnouncementsPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/feedback"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'STUDENT']}>
            <AppShell><FeedbackPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/sql-queries"
        element={
          <ProtectedRoute>
            <AppShell><SqlQueryPage /></AppShell>
          </ProtectedRoute>
        }
      />

      <Route
        path="/fee-management"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AppShell><FeeManagementPage /></AppShell>
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
    </>
  );
}

export default App;
