import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SkipToContent from './components/common/SkipToContent';
import LoadingSpinner from './components/common/LoadingSpinner';
import FloatingChatWidget from './components/chat/FloatingChatWidget';
import PageTransition from './components/common/PageTransition';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import CreateTask from './pages/CreateTask';
import EditTask from './pages/EditTask';
import ConversationView from './pages/ConversationView';
import Classes from './pages/Classes';
import ClassDetail from './pages/ClassDetail';
import CreateClass from './pages/CreateClass';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import AdminModeration from './pages/AdminModeration';
import NotFound from './pages/NotFound';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { currentUser, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying administrative access..." />;
  }

  if (!currentUser || userProfile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <SkipToContent />
      <Navbar />

      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Marketplace & Landing Routes */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
            <Route path="/tasks" element={<PageTransition><Tasks /></PageTransition>} />
            <Route path="/tasks/:id" element={<PageTransition><TaskDetail /></PageTransition>} />
            <Route path="/classes" element={<PageTransition><Classes /></PageTransition>} />
            <Route path="/classes/:id" element={<PageTransition><ClassDetail /></PageTransition>} />
            <Route path="/users/:id" element={<PageTransition><UserProfile /></PageTransition>} />
            <Route path="/profile/:id" element={<PageTransition><UserProfile /></PageTransition>} />

            {/* Protected Member Routes */}
            <Route
              path="/tasks/create"
              element={
                <ProtectedRoute>
                  <PageTransition><CreateTask /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id/edit"
              element={
                <ProtectedRoute>
                  <PageTransition><EditTask /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations/:id"
              element={
                <ProtectedRoute>
                  <PageTransition><ConversationView /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/classes/create"
              element={
                <ProtectedRoute>
                  <PageTransition><CreateClass /></PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageTransition><Dashboard /></PageTransition>
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin/moderation"
              element={
                <AdminRoute>
                  <PageTransition><AdminModeration /></PageTransition>
                </AdminRoute>
              }
            />

            {/* 404 Catch-All */}
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
      <FloatingChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
