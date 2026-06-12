/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  SlidersHorizontal, 
  FileCheck, 
  Download, 
  TrendingUp, 
  GraduationCap, 
  CheckCircle, 
  X, 
  Award, 
  ChevronRight,
  Sparkles,
  User as UserIcon,
  BookOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Application, DocumentFile } from '../types';
import { APPROVED_UNIVERSITIES, ELIGIBLE_COURSES } from '../lib/constants';

interface AdminDashboardProps {
  token: string;
  applications: Application[];
  onRefresh: () => void;
}

export default function AdminDashboard({ token, applications, onRefresh }: AdminDashboardProps) {
  // Filters & State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUni, setSelectedUni] = useState('All Universities');
  const [selectedCourse, setSelectedCourse] = useState('All Courses');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  
  // Cycle settings
  const [maxFullScholarships, setMaxFullScholarships] = useState(5);

  // Active reviewing details
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Reviewing Form Inputs
  const [academicScore, setAcademicScore] = useState(0);
  const [admissionScore, setAdmissionScore] = useState(0);
  const [statementScore, setStatementScore] = useState(0);
  const [leadershipScore, setLeadershipScore] = useState(0);
  const [documentScore, setDocumentScore] = useState(0);
  const [decisionStatus, setDecisionStatus] = useState<Application['status']>('under_review');
  const [decisionTier, setDecisionTier] = useState<Application['scholarship_type']>('none');

  const [savingReview, setSavingReview] = useState(false);
  const [errorReview, setErrorReview] = useState<string | null>(null);
  const [successReview, setSuccessReview] = useState<string | null>(null);

  const handleOpenReview = (app: Application) => {
    setSelectedApp(app);
    setAcademicScore(app.academic_score || 0);
    setAdmissionScore(app.admission_score || 0);
    setStatementScore(app.statement_score || 0);
    setLeadershipScore(app.leadership_score || 0);
    setDocumentScore(app.document_score || 0);
    setDecisionStatus(app.status !== 'pending' ? app.status : 'under_review');
    setDecisionTier(app.scholarship_type || 'none');
    setErrorReview(null);
    setSuccessReview(null);
  };

  // Calculates sums
  const totalCalculatedScore = academicScore + admissionScore + statementScore + leadershipScore + documentScore;

  // Reactively auto-suggests status & tier based on official limits
  React.useEffect(() => {
    if (selectedApp) {
      if (totalCalculatedScore >= 85) {
        setDecisionStatus('accepted');
        setDecisionTier('full');
      } else if (totalCalculatedScore >= 70) {
        setDecisionStatus('accepted');
        setDecisionTier('partial');
      } else {
        setDecisionStatus('rejected');
        setDecisionTier('none');
      }
    }
  }, [totalCalculatedScore, selectedApp]);

  // Statistics calculation
  const totalAppsCount = applications.length;
  const pendingCount = applications.filter(a => a.status === 'pending').length;
  const reviewingCount = applications.filter(a => a.status === 'under_review').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;
  const rejectedCount = applications.filter(a => a.status === 'rejected').length;

  const fullScholarshipsAllocated = applications.filter(a => a.status === 'accepted' && a.scholarship_type === 'full').length;
  const partialScholarshipsAllocated = applications.filter(a => a.status === 'accepted' && a.scholarship_type === 'partial').length;

  const acceptanceRate = totalAppsCount > 0 ? Math.round((acceptedCount / totalAppsCount) * 100) : 0;
  
  // Average score of reviewed applications
  const scoredApps = applications.filter(a => a.score > 0);
  const averageScore = scoredApps.length > 0 
    ? Math.round(scoredApps.reduce((acc, a) => acc + a.score, 0) / scoredApps.length) 
    : 0;

  // Filter logic
  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      (app.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (app.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUni = selectedUni === 'All Universities' || app.university_name === selectedUni;
    const matchesCourse = selectedCourse === 'All Courses' || app.course === selectedCourse;
    const matchesStatus = selectedStatus === 'All Statuses' || app.status === selectedStatus;

    return matchesSearch && matchesUni && matchesCourse && matchesStatus;
  });

  const getStatusColor = (status: Application['status'], type: Application['scholarship_type']) => {
    if (status === 'accepted') {
      return type === 'full' 
        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
        : 'bg-blue-100 text-blue-800 border border-blue-200';
    }
    if (status === 'rejected') {
      return 'bg-red-100 text-red-800 border border-red-200';
    }
    if (status === 'under_review') {
      return 'bg-indigo-105 bg-indigo-50 text-indigo-800 border border-indigo-200 animate-pulse';
    }
    return 'bg-amber-50 text-amber-805 border border-amber-200';
  };

  const downloadFile = (fileObj: DocumentFile, defaultName: string) => {
    if (!fileObj || !fileObj.base64) return;
    const linkSource = `data:${fileObj.type};base64,${fileObj.base64}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileObj.name || defaultName;
    downloadLink.click();
  };

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSavingReview(true);
    setErrorReview(null);
    setSuccessReview(null);

    // Guard to check budget cycle limit overflow before allocating
    if (decisionTier === 'full' && decisionStatus === 'accepted' && selectedApp.scholarship_type !== 'full') {
      if (fullScholarshipsAllocated >= maxFullScholarships) {
        const acceptOverride = window.confirm(
          `Alert! Elite Tier slots are fully occupied (${fullScholarshipsAllocated}/${maxFullScholarships} slots). Do you want to exceed the cycle budget?`
        );
        if (!acceptOverride) {
          setSavingReview(false);
          return;
        }
      }
    }

    try {
      const res = await fetch(`/api/admin/applications/${selectedApp.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          academic_score: Number(academicScore),
          admission_score: Number(admissionScore),
          statement_score: Number(statementScore),
          leadership_score: Number(leadershipScore),
          document_score: Number(documentScore),
          status: decisionStatus,
          scholarship_type: decisionTier
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessReview('Academic review score published successfully!');
        setSelectedApp(data.application); // Refresh panel state
        onRefresh(); // Refresh global lists
        setTimeout(() => {
          setSelectedApp(null); // Close modal automatically
        }, 1200);
      } else {
        setErrorReview(data.message || 'Error occurred publishing committee decision.');
      }
    } catch (e) {
      setErrorReview('Database communication loss.');
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="admin-workspace-container">
      
      {/* Header Visual Bar */}
      <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden" id="admin-header-card">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <SlidersHorizontal className="h-44 w-44" />
        </div>
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="text-blue-400 text-xs font-bold font-mono tracking-widest uppercase">Secretariat Registry Hub</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Apex Scholarship Registrar Evaluation Panel
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Assess credentials, verify regional eligibility limits, and assign tuition scorecard points out of 100 points maximum. Decisions are released instantly to student dashboards.
          </p>
        </div>
      </div>

      {/* Statistics Counter Widgets Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="admin-analytics-row">
        
        <div className="bg-white rounded-xl p-4 border border-slate-205 border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Filed</span>
            <strong className="text-xl font-mono text-slate-800 block">{totalAppsCount}</strong>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="bg-amber-50 text-amber-600 p-2.5 rounded-lg">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending review</span>
            <strong className="text-xl font-mono text-slate-800 block">{pendingCount}</strong>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Elite Full Tier</span>
            <strong className="text-xl font-mono text-slate-800 block">{fullScholarshipsAllocated}</strong>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-lg">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Acceptance %</span>
            <strong className="text-xl font-mono text-slate-800 block">{acceptanceRate}%</strong>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
          <div className="bg-slate-50 text-slate-600 p-2.5 rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Scored Avg</span>
            <strong className="text-xl font-mono text-slate-800 block">{averageScore} <span className="text-xs text-slate-400">/100</span></strong>
          </div>
        </div>

      </div>

      {/* Cycle Limits Setting / Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" id="cycle-limits-card">
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>Cycle Budget Allocations Limits Guard</span>
          </h4>
          <p className="text-slate-600 text-xs">
            Admin configure maximum Elite Full Scholarships slots available per cycle. This acts as a protective limit against charitable resource exhaustion.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0 bg-white p-2.5 rounded-lg border border-amber-100">
          <span className="text-[11px] text-slate-500 font-semibold font-mono">CYCLE SLOTS LIMIT:</span>
          <input
            type="number"
            min="1"
            max="100"
            value={maxFullScholarships}
            onChange={(e) => setMaxFullScholarships(Number(e.target.value))}
            className="w-14 text-center font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1 px-1.5 text-xs focus:ring-1 focus:ring-amber-500"
            title="Update maximum slots"
          />
          <span className="text-[10px] text-slate-400 font-mono">
            ({fullScholarshipsAllocated} / {maxFullScholarships} Filled)
          </span>
        </div>
      </div>

      {/* Core Vetting Search Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-4" id="admin-filters-panel">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Filters & Search Queue</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Search bar */}
          <div className="relative rounded-md shadow-xs col-span-1 sm:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Search Name, Email, ID..."
            />
          </div>

          {/* Select Uni Filter */}
          <div>
            <select
              id="uni-filter-select"
              value={selectedUni}
              onChange={(e) => setSelectedUni(e.target.value)}
              className="block w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All Universities">All Universities</option>
              {APPROVED_UNIVERSITIES.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Select Course Filter */}
          <div>
            <select
              id="course-filter-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="block w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All Courses">All Courses</option>
              {ELIGIBLE_COURSES.map((name, idx) => (
                <option key={idx} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="status-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full py-1.5 px-3 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Applicant List Section / Review Modal Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-evaluation-sections">
        
        {/* Left Column: Applications Table List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden" id="applicant-list-section">
          
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Scholarship Applications ({filteredApps.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Click a row to open scoring panel</span>
          </div>

          {filteredApps.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs font-mono space-y-2">
              <p>No scholarship applicant records matched the active filter conditions.</p>
              <p className="text-[10px] text-slate-300">Try selecting "All Statuses" or clearing your search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="admin-table">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-5 py-3">Applicant / ID</th>
                    <th className="px-5 py-3">University / Course</th>
                    <th className="px-5 py-3">Academic Base</th>
                    <th className="px-5 py-3 text-center">Score</th>
                    <th className="px-5 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => (
                    <tr 
                      key={app.id}
                      onClick={() => handleOpenReview(app)}
                      className={`cursor-pointer transition-colors text-xs hover:bg-blue-50/50 ${
                        selectedApp?.id === app.id ? 'bg-blue-50/70 border-l-4 border-blue-600' : ''
                      }`}
                      id={`table-row-${app.id}`}
                    >
                      <td className="px-5 py-4 space-y-1 max-w-[160px]">
                        <div className="font-extrabold text-slate-800 truncate" title={app.user_name}>{app.user_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1.5">
                          <span>{app.user_nationality}</span>
                          <span>•</span>
                          <span className="truncate" title={app.user_email}>{app.user_email}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 space-y-1 max-w-[180px]">
                        <div className="font-semibold text-slate-700 truncate" title={app.university_name}>{app.university_name}</div>
                        <div className="text-[10px] text-slate-405 text-slate-400 block truncate">{app.course}</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono text-blue-600 font-semibold">{app.gpa_or_grade}</span>
                        <span className="text-[9px] text-slate-400 block capitalize">{app.admission_status} Offer</span>
                      </td>

                      <td className="px-5 py-4 text-center font-mono font-bold text-slate-800">
                        {app.score > 0 ? (
                          <span className="bg-slate-50 border border-slate-150 py-1 px-1.5 rounded" title="Total score metrics">
                            {app.score}
                          </span>
                        ) : (
                          <span className="text-slate-350 italic text-[10px] block">Unscored</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight capitalize ${getStatusColor(app.status, app.scholarship_type)}`}>
                          {app.status === 'accepted' ? `${app.scholarship_type} funding` : app.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Right Column: Active Interactive Scoring Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-150 shadow-sm p-6 space-y-6" id="review-scoring-section">
          
          {!selectedApp ? (
            <div className="h-full flex flex-col justify-center items-center text-center p-12 text-slate-400 space-y-3 min-h-[400px]">
              <div className="bg-slate-50 text-slate-300 p-4 rounded-full border border-slate-100">
                <SlidersHorizontal className="h-10 w-10" />
              </div>
              <h4 className="font-sans font-bold text-sm text-slate-650">Scoring & Decisions Hub</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                Select an applicant from the table queue on the left to start academic credentials vetting, inspect PDFs, and assign scorecard review values.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header Profile Details */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-blue-600 font-semibold uppercase">Review Queue Portal</span>
                  <h3 className="font-sans font-extrabold text-base text-slate-900 leading-tight">
                    {selectedApp.user_name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5" />
                    <span>ID: {selectedApp.id.toUpperCase()} ({selectedApp.user_nationality})</span>
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded"
                  title="Close panel view"
                  id="btn-close-scorer-pane"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Status Alert feedback */}
              {errorReview && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg animate-pulse" id="review-error">
                  {errorReview}
                </div>
              )}
              
              {successReview && (
                <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs rounded-lg" id="review-success">
                  {successReview}
                </div>
              )}

              {/* Documents and Vetting Files Checklist */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest block font-mono">
                  Submitted PDF validation certificates
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(selectedApp.documents || {}).map(([key, val]) => {
                    const docObj = val as DocumentFile;
                    if (!docObj) return null;
                    return (
                      <div key={key} className="p-2 border border-slate-150 rounded bg-slate-50 flex items-center justify-between">
                        <span className="font-semibold block text-[10px] text-slate-700 truncate max-w-[120px]" title={docObj.name}>
                          {key.replace('_', ' ').toUpperCase()}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => downloadFile(docObj, `${key}.pdf`)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-0.5"
                          title="Preview document PDF"
                          id={`scorer-dl-${key}`}
                        >
                          <Download className="h-3 w-3" />
                          <span className="font-mono text-[9px]">Verify</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vetting scorecard editor */}
              <form onSubmit={handlePublishReview} className="space-y-4">
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest block font-mono">
                      Component Weight Scores
                    </h4>
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 py-1 px-2.5 rounded border border-blue-100">
                      Total: {totalCalculatedScore} / 100
                    </span>
                  </div>

                  {/* Slider 1: Academic Vetting (0-30) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                        <span>Academic Strength (GPA Honors)</span>
                      </span>
                      <strong className="font-mono text-slate-800">{academicScore} <span className="text-slate-400">/30</span></strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={academicScore}
                      onChange={(e) => setAcademicScore(Number(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Slider 2: Admission Letter quality (0-20) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Admission Placement Offer Quality</span>
                      <strong className="font-mono text-slate-800">{admissionScore} <span className="text-slate-400">/20</span></strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={admissionScore}
                      onChange={(e) => setAdmissionScore(Number(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-405 text-slate-400 font-mono">
                      <span>Conditional Offer ≤ 10pts</span>
                      <span>Unconditional Offer ≤ 20pts</span>
                    </div>
                  </div>

                  {/* Slider 3: Statement Quality (0-20) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Statement of Purpose SOP Quality</span>
                      <strong className="font-mono text-slate-800">{statementScore} <span className="text-slate-400">/20</span></strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={statementScore}
                      onChange={(e) => setStatementScore(Number(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Slider 4: Leadership and Work (0-15) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Leadership Potential & Experience</span>
                      <strong className="font-mono text-slate-800">{leadershipScore} <span className="text-slate-400">/15</span></strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={leadershipScore}
                      onChange={(e) => setLeadershipScore(Number(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Slider 5: Document Check (0-15) */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>PDF Verification & Documentation Quality</span>
                      <strong className="font-mono text-slate-800">{documentScore} <span className="text-slate-400">/15</span></strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={documentScore}
                      onChange={(e) => setDocumentScore(Number(e.target.value))}
                      className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Score threshold decision hint area */}
                <div className="p-3 bg-blue-50 border border-blue-150 rounded-xl space-y-1.5 text-xs text-blue-800">
                  <div className="font-extrabold flex items-center gap-1">
                    <Sparkles className="h-4.5 w-4.5 text-yellow-500 shrink-0" />
                    <span>System-Calculated Vetting Suggestion:</span>
                  </div>
                  <p className="text-slate-650 leading-normal text-[11px]">
                    Candidate total matches <strong className="font-mono">{totalCalculatedScore} points</strong> logic limits. 
                    Recommended result is: <strong className="uppercase bg-white/65 px-1 py-0.5 rounded font-mono border border-blue-200">
                      {totalCalculatedScore >= 85 
                        ? 'Full Scholarship (Elite Tier)' 
                        : totalCalculatedScore >= 70 
                          ? 'Partial Scholarship (Standard Tier)' 
                          : 'Reject / Waitlist'}
                    </strong>.
                  </p>
                </div>

                {/* Overwrites fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block" htmlFor="reviewer-status">
                      System Action State
                    </label>
                    <select
                      id="reviewer-status"
                      value={decisionStatus}
                      onChange={(e) => setDecisionStatus(e.target.value as any)}
                      className="block w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                    >
                      <option value="pending">Pending Vetting</option>
                      <option value="under_review">Under active review</option>
                      <option value="accepted">Accepted / Approved</option>
                      <option value="rejected">Rejected / Dropped</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block" htmlFor="reviewer-tier">
                      Funding Allocation Tier
                    </label>
                    <select
                      id="reviewer-tier"
                      value={decisionTier}
                      onChange={(e) => setDecisionTier(e.target.value as any)}
                      className="block w-full py-1.5 px-2.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none"
                    >
                      <option value="none">No Funding allocation</option>
                      <option value="partial">Partial Funding (Standard 50%)</option>
                      <option value="full">Full Funding (Elite 100%)</option>
                    </select>
                  </div>
                </div>

                {/* Action submit button */}
                <button
                  type="submit"
                  disabled={savingReview}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs font-extrabold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-xs cursor-pointer"
                  id="btn-publish-review"
                >
                  {savingReview ? 'Publishing Board Decision...' : 'Publish Evaluation to Applicant'}
                </button>
              </form>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
