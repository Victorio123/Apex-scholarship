/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Lock, User, Globe, ArrowRight, ShieldAlert, CheckCircle, Sparkles, LogIn } from 'lucide-react';
import { ELIGIBLE_NATIONALITIES } from '../lib/constants';

interface AuthPageProps {
  onAuthSuccess: (data: { role: 'user' | 'admin'; token: string; user?: any; admin?: any }) => void;
  onNavigateLanding: () => void;
}

export default function AuthPage({ onAuthSuccess, onNavigateLanding }: AuthPageProps) {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [nationality, setNationality] = React.useState('Nigeria');
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // Quick Account Login Action (For development evaluation ease)
  const handleQuickLogin = async (type: 'admin' | 'applicant_1' | 'applicant_2') => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    let targetEmail = 'admin@apex.org';
    let targetPassword = 'admin123';

    if (type === 'applicant_1') {
      targetEmail = 'adekunle@gmail.com';
      targetPassword = 'password123';
    } else if (type === 'applicant_2') {
      targetEmail = 'chinedu@gmail.com';
      targetPassword = 'password123';
    }

    try {
      // Auto-seeds the data first to ensure these records exist
      await fetch('/api/seed', { method: 'POST' }).catch(() => {});

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        setTimeout(() => {
          onAuthSuccess({
            role: data.role,
            token: data.token,
            user: data.user,
            admin: data.admin
          });
        }, 600);
      } else {
        setErrorMsg(data.message || 'Quick login failed. Please register a new user account.');
      }
    } catch (e) {
      setErrorMsg('Failed to process login connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isLogin && !agreedToTerms) {
      setErrorMsg('You must certify that you agree to all official Apex Scholarship disclaimers.');
      setLoading(false);
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email, password } 
      : { name, email, password, nationality };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Authenticated successfully.');
        setTimeout(() => {
          onAuthSuccess({
            role: data.role,
            token: data.token,
            user: data.user,
            admin: data.admin
          });
        }, 1000);
      } else {
        setErrorMsg(data.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg('Network error. Unable to connect to Apex database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-12 bg-slate-50" id="auth-page-container">
      
      {/* Editorial Information Column (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-blue-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700 via-blue-900 to-slate-950 opacity-90 z-0"></div>
        
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-blue-300">Apex Scholarship Registrar</span>
          <h2 className="text-3xl font-sans font-extrabold tracking-tight mt-3 text-white leading-tight">
            Objective Graduate Scholarship Vetting
          </h2>
          <p className="text-blue-100 text-sm mt-3 leading-relaxed">
            The Apex Scholarship Portal delivers structured, automated score evaluation for African graduates. Our administrative platform operates with total transparency across approved regional hubs.
          </p>
        </div>

        {/* Scoring Threshold Quick Guide */}
        <div className="relative z-10 bg-slate-950/40 backdrop-blur-md rounded-xl p-6 border border-white/10 my-6">
          <h4 className="font-sans font-bold text-sm text-yellow-400 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Scorecard Vetting Metrics</span>
          </h4>
          <ul className="text-xs space-y-2.5 text-blue-100">
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Academic Merit Results</span>
              <strong className="font-mono text-emerald-400">Max 30 Points</strong>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span>University Admission letter quality</span>
              <strong className="font-mono text-emerald-400">Max 20 Points</strong>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span>SOP Personal Statement</span>
              <strong className="font-mono text-emerald-400">Max 20 Points</strong>
            </li>
            <li className="flex justify-between border-b border-white/5 pb-1.5">
              <span>Leadership Profile / Experience</span>
              <strong className="font-mono text-emerald-400">Max 15 Points</strong>
            </li>
            <li className="flex justify-between pb-1.5">
              <span>Document file checklist complete</span>
              <strong className="font-mono text-emerald-400">Max 15 Points</strong>
            </li>
          </ul>
        </div>

        <div className="relative z-10 text-xs text-blue-300 font-mono flex items-center justify-between">
          <span>Apex Foundation Program</span>
          <span>Security Level: SSL Encrypted</span>
        </div>
      </div>

      {/* Main Interactive Form Column */}
      <div className="lg:col-span-7 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 bg-white">
        <div className="max-w-md w-full mx-auto">
          
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="auth-title">
              {isLogin ? 'Sign in to Apex Scholarship' : 'Register Applicant Account'}
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              {isLogin ? 'Enter your registered email and password.' : 'Eligible for Nigeria, Ghana, Gambia, Tunisia and Kenya only.'}
            </p>
          </div>

          {/* Core Demo Access Callout Banner (EXTREMELY FRIENDLY) */}
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 space-y-2" id="demo-quick-login-callout">
            <div className="font-bold flex items-center gap-1 text-slate-900">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span>One-Click Development Evaluation Logins</span>
            </div>
            <p className="text-slate-500">
              Click any button below to instantly populate sample data and bypass typing. This allows you to evaluate the applicant status page or the scorer admin dashboard smoothly.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold rounded-lg transition-colors border border-blue-200 cursor-pointer"
                id="btn-demo-admin"
              >
                Login as Registrar (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('applicant_1')}
                className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                id="btn-demo-user-1"
              >
                Login as Adekunle (Scholar)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('applicant_2')}
                className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg transition-colors border border-amber-200 cursor-pointer"
                id="btn-demo-user-2"
              >
                Login as Chinedu (Under Review)
              </button>
            </div>
          </div>

          {/* Form Actions Status */}
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-start gap-2 animate-pulse" id="auth-error-banner">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2" id="auth-success-banner">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            
            {/* Name Input (Register Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="reg-name">
                  Full Name
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    id="reg-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-350 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="e.g. Adekunle Alao"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="auth-email">
                Primary Email Address
              </label>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  id="auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-350 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="auth-password">
                  Security Password
                </label>
              </div>
              <div className="relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-350 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Nationality Selection (Register Only) */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="reg-nationality">
                  Nationality / Country of Citizenship
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Globe className="h-4 w-4" />
                  </div>
                  <select
                    id="reg-nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-350 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  >
                    {ELIGIBLE_NATIONALITIES.map((n) => (
                      <option key={n.code} value={n.code}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Apex Foundation only reviews applications from students holding passports of Nigeria, Ghana, Tunisia, Kenya, or Gambia.
                </p>
              </div>
            )}

            {/* Terms Consent Checklist (Register Only) */}
            {!isLogin && (
              <div className="relative flex items-start gap-2 pb-2">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                    required
                  />
                </div>
                <div className="text-xs">
                  <label htmlFor="terms" className="font-semibold text-slate-700 leading-normal cursor-pointer block select-none">
                    I declare and certify my credentials
                  </label>
                  <p className="text-[10px] text-slate-400 leading-normal block">
                    I agree to the €13,000/yr tuition policy cap list & certify that I have secured university admission prior to application submission.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              id="auth-submit-btn"
            >
              {loading ? (
                <span>Validating Session...</span>
              ) : (
                <>
                  <LogIn className="mr-1.5 h-4 w-4" />
                  <span>{isLogin ? 'Log In to System' : 'Submit Registration'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Form Type */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline"
              id="auth-toggle-type-btn"
            >
              {isLogin 
                ? "Don't have an applicant account? Register Here" 
                : 'Already have an applicant or admin account? Log In'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Apex Registrar Vetting</span>
            <button 
              onClick={onNavigateLanding} 
              className="text-slate-500 hover:text-blue-600 underline cursor-pointer"
              id="auth-back-home"
            >
              ← Back to Overview
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
