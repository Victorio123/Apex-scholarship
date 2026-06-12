/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, LogOut, Shield, User as UserIcon, RefreshCw } from 'lucide-react';
import { User, Admin } from '../types';

interface NavbarProps {
  user: User | null;
  admin: Admin | null;
  role: 'user' | 'admin' | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onSeed?: () => void;
}

export default function Navbar({
  user,
  admin,
  role,
  currentView,
  onNavigate,
  onLogout,
  onSeed
}: NavbarProps) {
  const [seeding, setSeeding] = React.useState(false);

  const handleSeedClick = async () => {
    if (onSeed) {
      setSeeding(true);
      await onSeed();
      setSeeding(false);
    }
  };

  return (
    <nav className="border-b border-slate-150 bg-white sticky top-0 z-50 shadow-sm" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-sans font-bold text-xl text-slate-900 tracking-tight block">APEX</span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold block -mt-1">Scholarship Portal</span>
            </div>
          </div>

          {/* Navigation Links / Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'landing' 
                  ? 'text-blue-600 bg-blue-50 font-semibold' 
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
              id="nav-landing"
            >
              Overview
            </button>

            {role === 'user' && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'dashboard' || currentView === 'apply'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
                id="nav-user-dashboard"
              >
                My Application
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'admin-dashboard'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
                id="nav-admin-dashboard"
              >
                Admin Workspace
              </button>
            )}

            {onSeed && (
              <button
                onClick={handleSeedClick}
                disabled={seeding}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors disabled:opacity-50"
                title="Populates the system with high-quality sample applicant profiles for instant scoring evaluation"
                id="nav-seed-action"
              >
                <RefreshCw className={`h-3 w-3 ${seeding ? 'animate-spin' : ''}`} />
                <span>{seeding ? 'Seeding...' : 'Quick Seed Data'}</span>
              </button>
            )}

            <div className="h-6 w-[1px] bg-slate-200"></div>

            {role ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-sm font-medium text-slate-800 flex items-center gap-1">
                    {role === 'admin' ? (
                      <>
                        <Shield className="h-3.5 w-3.5 text-blue-600" />
                        <span>Apex Registrar</span>
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="max-w-[120px] truncate">{user?.name}</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {role === 'admin' ? admin?.email : user?.email}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-all"
                  title="Logout Session"
                  id="nav-logout-btn"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
                id="nav-login-btn"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
