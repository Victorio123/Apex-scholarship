/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ApplicantDashboard from './components/ApplicantDashboard';
import AdminDashboard from './components/AdminDashboard';
import { User, Admin, Application } from './types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  // Session details stored in localStorage for secure, offline-safe testing
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('apex_token'));
  const [role, setRole] = useState<'user' | 'admin' | null>(() => {
    return (localStorage.getItem('apex_role') as 'user' | 'admin' | null) || null;
  });
  
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activeApplication, setActiveApplication] = useState<Application | null>(null);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  
  // Views navigation controls
  const [currentView, setCurrentView] = useState<string>('landing');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Verify and load active token profiles on startup
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setRole(data.role);
          if (data.role === 'admin') {
            setAdmin(data.admin);
            setCurrentView('admin-dashboard');
          } else {
            setUser(data.user);
            setCurrentView('dashboard');
          }
        } else {
          // Stale or invalid token, clean up quietly
          handleLogout();
        }
      } catch (err) {
        showToast('Offline mode or backend currently booting.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Read applicant records once authenticated
  useEffect(() => {
    if (!token) return;
    
    if (role === 'user') {
      const fetchMyApplication = async () => {
        try {
          const res = await fetch('/api/application/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setActiveApplication(data.application);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchMyApplication();
    } else if (role === 'admin') {
      const fetchAdminApplications = async () => {
        try {
          const res = await fetch('/api/admin/applications', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setAllApplications(data.applications);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchAdminApplications();
    }
  }, [token, role]);

  const handleRefreshData = async () => {
    if (!token) return;
    
    if (role === 'user') {
      try {
        const res = await fetch('/api/application/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setActiveApplication(data.application);
        }
      } catch (e) {
        console.error(e);
      }
    } else if (role === 'admin') {
      try {
        const res = await fetch('/api/admin/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAllApplications(data.applications);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAuthSuccess = (data: { role: 'user' | 'admin'; token: string; user?: User; admin?: Admin }) => {
    setToken(data.token);
    setRole(data.role);
    localStorage.setItem('apex_token', data.token);
    localStorage.setItem('apex_role', data.role);
    
    if (data.role === 'admin') {
      setAdmin(data.admin || null);
      setCurrentView('admin-dashboard');
      showToast('Welcome Back, Registrar.');
    } else {
      setUser(data.user || null);
      setCurrentView('dashboard');
      showToast('Scholar session initialized successfully.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    setAdmin(null);
    setActiveApplication(null);
    setAllApplications([]);
    localStorage.removeItem('apex_token');
    localStorage.removeItem('apex_role');
    setCurrentView('landing');
    showToast('Session logged out successfully.');
  };

  const handleSeedMockData = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'Seeded sample applicant profiles.');
        handleRefreshData();
      } else {
        showToast(data.message || 'Seeding failed.', 'error');
      }
    } catch (e) {
      showToast('Seeding error.', 'error');
    }
  };

  const handleStartApplicationAction = () => {
    if (token) {
      if (role === 'user') {
        setCurrentView('dashboard');
      } else if (role === 'admin') {
        setCurrentView('admin-dashboard');
      }
    } else {
      setCurrentView('auth');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-800" id="app-root">
      
      {/* Global Navbar */}
      <Navbar
        user={user}
        admin={admin}
        role={role}
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
        onSeed={handleSeedMockData}
      />

      {/* Global Interactive Notification Toasts */}
      {toast && (
        <div 
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border flex items-center space-x-2.5 transition-all animate-bounce ${
            toast.type === 'success' 
              ? 'bg-emerald-900 border-emerald-800 text-emerald-100' 
              : 'bg-red-950 border-red-900 text-red-100'
          }`}
          id="toast-notification"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1" id="main-content-view">
        {loading ? (
          <div className="h-[calc(100vh-4rem)] flex flex-col justify-center items-center space-y-4" id="view-loading-state">
            <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-mono text-xs">Authenticating secure secure tokens...</p>
          </div>
        ) : (
          <>
            {currentView === 'landing' && (
              <LandingPage 
                onStartApplication={handleStartApplicationAction}
                isLoggedIn={!!token}
              />
            )}
            
            {currentView === 'auth' && (
              <AuthPage 
                onAuthSuccess={handleAuthSuccess}
                onNavigateLanding={() => setCurrentView('landing')}
              />
            )}
            
            {currentView === 'dashboard' && role === 'user' && (
              <ApplicantDashboard
                token={token!}
                application={activeApplication}
                onRefresh={handleRefreshData}
              />
            )}
            
            {currentView === 'admin-dashboard' && role === 'admin' && (
              <AdminDashboard
                token={token!}
                applications={allApplications}
                onRefresh={handleRefreshData}
              />
            )}
          </>
        )}
      </main>

    </div>
  );
}
