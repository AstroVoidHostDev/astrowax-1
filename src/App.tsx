import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { UploadProvider } from './context/UploadContext';

import Layout from './components/Layout';
import { GlobalBackground } from './components/GlobalBackground';
import { TutorialOverlay } from './components/TutorialOverlay';
import { SystemUpdateListener } from './components/SystemUpdateListener';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ServerList from './pages/ServerList';
import CreateServer from './pages/CreateServer';
import ServerView from './pages/ServerView';
import AccountPage from './pages/AccountPage';
import AdminServers from './pages/AdminServers';
import AdminSettingsPage from './pages/AdminSettingsPage';
import ApiKeysPage from './pages/ApiKeysPage';
import Nodes from './pages/Nodes';

// ============================================
// AstroWax Panel V1.80 — App Router
// ============================================

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0612]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: '2px solid rgba(168,85,247,.2)',
              borderTopColor: '#a855f7',
              borderRightColor: '#c084fc',
            }}
          />
          <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0612]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-full animate-spin"
            style={{
              border: '2px solid rgba(168,85,247,.2)',
              borderTopColor: '#a855f7',
              borderRightColor: '#c084fc',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes inside Layout */}
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/servers" element={<ServerList />} />
                <Route path="/servers/create" element={<CreateServer />} />
                <Route path="/servers/:id/*" element={<ServerView />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/admin/servers" element={<AdminServers />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/api-keys" element={<ApiKeysPage />} />
                <Route path="/nodes" element={<Nodes />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <UploadProvider>
          <Router>
            {/* ═══ Global wallpaper background ═══ */}
            <GlobalBackground />

            {/* ═══ Main app ═══ */}
            <div className="relative z-10">
              <AppRoutes />
            </div>

            {/* ═══ System update listener ═══ */}
            <SystemUpdateListener />
          </Router>
        </UploadProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}