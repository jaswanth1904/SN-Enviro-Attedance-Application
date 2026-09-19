import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import TVLiveMap from './components/TVLiveMap';
import { AnimatePresence, motion, useSpring } from 'framer-motion';

// Lazy load heavy components for extreme performance
const Home = lazy(() => import('./components/Home'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const LeaveApplication = lazy(() => import('./components/LeaveApplication'));

// New Geo-Attendance & Live Tracking Components
const GeoAttendanceMark = lazy(() => import('./components/Attendance/GeoAttendanceMark'));
const LateExplanationForm = lazy(() => import('./components/Attendance/LateExplanationForm'));
const PlantSiteLogger = lazy(() => import('./components/Attendance/PlantSiteLogger'));
const LiveTrackingMap = lazy(() => import('./components/Dashboards/LiveTrackingMap'));

// New Admin Panel Components
const AdminLayout = lazy(() => import('./components/AdminPanel/AdminLayout'));
import { Overview, EmployeeManagement, AttendanceManagement, MDAnnouncements, Notifications, LeaveManagement, ReportsAnalytics, DepartmentsSites, Settings } from './components/AdminPanel/AdminPlaceholders';

// Ultra-fast Loading Placeholder
const ComponentLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin"></div>
    <p className="text-sm text-slate-500 font-medium">Loading...</p>
  </div>
);


const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.995 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.005 }}
    transition={{ duration: 0.4, ease: [0.05, 0.7, 0.1, 1] }}
  >
    {children}
  </motion.div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const location = useLocation();

  const openAuth = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-md-surface p-6">
        <div className="flex flex-col items-center gap-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary shadow-lg border border-brand-primary/20"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full"
            />
          </motion.div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-brand-primary uppercase tracking-[0.5em] animate-pulse">Synchronizing Neural Link</p>
            <p className="text-md-on-surface-variant font-medium text-xs mt-3">Authorizing access sequence...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-md-surface text-md-on-surface relative selection:bg-brand-primary/10 selection:text-brand-primary font-sans">
      {!location.pathname.startsWith('/admin') && !location.pathname.startsWith('/tv-map') && <Navbar onAuthClick={openAuth} />}

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <Suspense fallback={<ComponentLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home onAuthClick={openAuth} /></PageWrapper>} />
              <Route path="/dashboard" element={user ? (user.role === 'Admin' || user.role === 'Application Engineer' ? <Navigate to="/admin" /> : <PageWrapper><Dashboard /></PageWrapper>) : <Navigate to="/" />} />
              <Route path="/apply-leave" element={user ? <PageWrapper><LeaveApplication /></PageWrapper> : <Navigate to="/" />} />
              
              {/* New Nested Admin Panel Routes */}
              <Route path="/admin" element={user && (user.role === 'Admin' || user.role === 'Application Engineer') ? <PageWrapper><AdminLayout /></PageWrapper> : <Navigate to="/dashboard" />}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<Overview />} />
                <Route path="employees" element={<EmployeeManagement />} />
                <Route path="attendance" element={<AttendanceManagement />} />
                <Route path="live-tracking" element={<LiveTrackingMap />} />
                <Route path="announcements" element={<MDAnnouncements />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="leaves" element={<LeaveManagement />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="departments" element={<DepartmentsSites />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              
              {/* Dedicated TV Map Route (Bypasses Layout for Fullscreen Immersion) */}
              <Route path="/tv-map" element={<TVLiveMap />} />

              {/* New Futuristic Geo-Attendance Routes */}
              <Route path="/mark-attendance" element={user ? <PageWrapper><GeoAttendanceMark /></PageWrapper> : <Navigate to="/" />} />
              <Route path="/explain-absence/:token" element={<PageWrapper><LateExplanationForm /></PageWrapper>} />
              <Route path="/log-site" element={user ? <PageWrapper><PlantSiteLogger /></PageWrapper> : <Navigate to="/" />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      {!location.pathname.startsWith('/admin') && location.pathname !== '/live-map' && !location.pathname.startsWith('/tv-map') && <Footer />}

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authMode}
          />
        )}
      </AnimatePresence>

      {/* Global Background - Clean Slate */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-slate-50"></div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
