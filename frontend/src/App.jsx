import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { AnimatePresence, motion, useSpring } from 'framer-motion';

// Lazy load heavy components for extreme performance
const Home = lazy(() => import('./components/Home'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const LeaveApplication = lazy(() => import('./components/LeaveApplication'));

// Ultra-fast Loading Placeholder
const ComponentLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
    <div className="relative w-16 h-16">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 border-4 border-brand-primary/10 border-t-brand-primary rounded-full shadow-lg shadow-brand-primary/20"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-2 border-4 border-brand-secondary/10 border-t-brand-secondary rounded-full"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-4 border-4 border-brand-tertiary/10 border-t-brand-tertiary rounded-full"
      />
    </div>
    <p className="text-[10px] text-brand-primary font-black uppercase tracking-[0.4em] animate-pulse">Synchronizing Nexus...</p>
  </div>
);

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const springX = useSpring(0, { stiffness: 400, damping: 35 });
  const springY = useSpring(0, { stiffness: 400, damping: 35 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      springX.set(e.clientX - 6);
      springY.set(e.clientY - 6);

      const target = e.target;
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer');
    };
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [springX, springY]);

  return (
    <div className="hidden lg:block">
      {/* Primary Dot - Multichrome cycle */}
      <motion.div
        className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full pointer-events-none z-[99999] shadow-xl"
        style={{ x: springX, y: springY }}
        animate={{
          scale: isClicking ? 0.6 : isPointer ? 1.4 : 1,
          backgroundColor: isPointer ? '#26a69a' : isClicking ? '#ec407a' : '#5c6bc0',
        }}
        transition={{ backgroundColor: { duration: 0.4 } }}
      />
      {/* Ambient Aura */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-brand-primary/20 pointer-events-none z-[99998]"
        animate={{
          x: position.x - 16,
          y: position.y - 16,
          scale: isPointer ? [1, 2.5, 2.2] : 1,
          opacity: isPointer ? 0.4 : 0.1,
          borderColor: isPointer ? '#26a69a' : '#5c6bc0'
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 200,
          scale: { duration: 0.5 }
        }}
      />
    </div>
  );
};

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
      <CustomCursor />
      <Navbar onAuthClick={openAuth} />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <Suspense fallback={<ComponentLoader />}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageWrapper><Home onAuthClick={openAuth} /></PageWrapper>} />
              <Route path="/dashboard" element={user ? <PageWrapper><Dashboard /></PageWrapper> : <Navigate to="/" />} />
              <Route path="/apply-leave" element={user ? <PageWrapper><LeaveApplication /></PageWrapper> : <Navigate to="/" />} />
              <Route path="/admin" element={user && (user.role === 'Admin' || user.role === 'Application Engineer') ? <PageWrapper><AdminDashboard /></PageWrapper> : <Navigate to="/" />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>

      <Footer />

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialMode={authMode}
          />
        )}
      </AnimatePresence>

      {/* Global Background Accents - Nature Themed */}
      <div className="fixed inset-0 pointer-events-none -z-10 bg-md-surface overflow-hidden">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-brand-primary/5 blur-[120px] rounded-full -mr-[30vw] -mt-[30vw]" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-md-tertiary/5 blur-[120px] rounded-full -ml-[20vw] -mb-[20vw]" />
      </div>
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
