import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import SkipToContent from './components/common/SkipToContent';
import LoadingSpinner from './components/common/LoadingSpinner';
import FloatingChatWidget from './components/chat/FloatingChatWidget';

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
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <SkipToContent />
      <Navbar />

      <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
        <Routes>
          {/* Public Marketplace & Landing Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/classes/:id" element={<ClassDetail />} />

          {/* Protected Member Routes */}
          <Route
            path="/tasks/create"
            element={
              <ProtectedRoute>
                <CreateTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks/:id/edit"
            element={
              <ProtectedRoute>
                <EditTask />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations/:id"
            element={
              <ProtectedRoute>
                <ConversationView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/create"
            element={
              <ProtectedRoute>
                <CreateClass />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/moderation"
            element={
              <AdminRoute>
                <AdminModeration />
              </AdminRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <FloatingChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}

