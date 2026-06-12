/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  X, 
  School, 
  BookOpen, 
  MapPin, 
  FileCheck, 
  FileDown, 
  Sparkles, 
  CheckCircle2, 
  Eye,
  Calendar
} from 'lucide-react';
import { Application, DocumentFile } from '../types';
import { APPROVED_UNIVERSITIES, ELIGIBLE_COURSES } from '../lib/constants';

type DocKey = 'degree_certificate' | 'transcript' | 'admission_letter' | 'cv' | 'personal_statement';

interface ApplicantDashboardProps {
  token: string;
  application: Application | null;
  onRefresh: () => void;
}

export default function ApplicantDashboard({ token, application, onRefresh }: ApplicantDashboardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [university, setUniversity] = useState(APPROVED_UNIVERSITIES[0]);
  const [course, setCourse] = useState(ELIGIBLE_COURSES[0]);
  const [admissionStatus, setAdmissionStatus] = useState<'conditional' | 'unconditional'>('unconditional');
  const [gpa, setGpa] = useState('');

  // Structured Documents Store
  const [docs, setDocs] = useState<{
    degree_certificate: DocumentFile | null;
    transcript: DocumentFile | null;
    admission_letter: DocumentFile | null;
    cv: DocumentFile | null;
    personal_statement: DocumentFile | null;
  }>({
    degree_certificate: null,
    transcript: null,
    admission_letter: null,
    cv: null,
    personal_statement: null
  });

  // Upload Box Drag States
  const [dragOverDoc, setDragOverDoc] = useState<string | null>(null);

  // Custom function to convert file to Base64
  const handleFileConversion = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Strip data url prefix (e.g. "data:application/pdf;base64,") before saving
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject('Conversion error');
        }
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const processFile = async (file: File, docKey: DocKey) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('All scholarship documents MUST be in PDF format.');
      return;
    }
    // Limit to 5MB maximum
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('This file is too large. Maximum size is 5MB.');
      return;
    }

    try {
      const base64 = await handleFileConversion(file);
      setDocs(prev => ({
        ...prev,
        [docKey]: {
          name: file.name,
          type: file.type,
          base64: base64
        }
      }));
      setErrorMsg(null);
    } catch (e) {
      setErrorMsg('Error reading PDF file data.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, docKey: DocKey) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file, docKey);
    }
  };

  // Drag and Drop utility support
  const handleDragOver = (e: React.DragEvent, docKey: string) => {
    e.preventDefault();
    setDragOverDoc(docKey);
  };

  const handleDragLeave = () => {
    setDragOverDoc(null);
  };

  const handleDrop = async (e: React.DragEvent, docKey: DocKey) => {
    e.preventDefault();
    setDragOverDoc(null);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file, docKey);
    }
  };

  const removeDoc = (docKey: DocKey) => {
    setDocs(prev => ({ ...prev, [docKey]: null }));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Verify all 5 documents are successfully uploaded
    const missingDocs = Object.entries(docs).filter(([_, val]) => !val).map(([key]) => key);
    if (missingDocs.length > 0) {
      const nicelyFormed = missingDocs.map(d => d.replace('_', ' ').toUpperCase()).join(', ');
      setErrorMsg(`All 5 required documents are mandatory. Please upload: ${nicelyFormed}`);
      setSubmitting(false);
      return;
    }

    if (!gpa.trim()) {
      setErrorMsg('Please detail your undergraduate GPA or honors tier level.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/application/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          university_name: university,
          course: course,
          admission_status: admissionStatus,
          gpa_or_grade: gpa,
          documents: docs
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message);
        onRefresh();
      } else {
        setErrorMsg(data.message || 'Error occurred during scholarship portfolio submit.');
      }
    } catch (e) {
      setErrorMsg('Network error. Unable to connect to submission queue.');
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger file download to verify local uploads
  const downloadFile = (fileObj: DocumentFile, defaultName: string) => {
    const linkSource = `data:${fileObj.type};base64,${fileObj.base64}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileObj.name || defaultName;
    downloadLink.click();
  };

  // Component definition for custom drag and click pickers
  const DocumentUploadBox = ({ title, docKey, label }: { title: string; docKey: DocKey; label: string }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadedFile = docs[docKey];
    const isDraggedOver = dragOverDoc === docKey;

    return (
      <div 
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all flex flex-col justify-between h-44 ${
          uploadedFile 
            ? 'border-emerald-300 bg-emerald-50/40' 
            : isDraggedOver 
              ? 'border-blue-600 bg-blue-50' 
              : 'border-slate-200 hover:border-blue-400 bg-white'
        }`}
        onDragOver={(e) => handleDragOver(e, String(docKey))}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, docKey)}
        id={`upload-box-${String(docKey)}`}
      >
        <div className="space-y-1.5 flex-1 flex flex-col justify-center">
          <div className="flex justify-center">
            {uploadedFile ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-600 animate-bounce" />
            ) : (
              <Upload className={`h-8 w-8 ${isDraggedOver ? 'text-blue-600' : 'text-slate-400'}`} />
            )}
          </div>
          <div className="text-xs font-bold text-slate-800">{title}</div>
          <p className="text-[10px] text-slate-400 font-mono leading-normal px-2 truncate block">
            {uploadedFile ? uploadedFile.name : `Drag & Drop or Click to choose PDF`}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 mt-2">
          {uploadedFile ? (
            <>
              <button
                type="button"
                onClick={() => downloadFile(uploadedFile, `${String(docKey)}.pdf`)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 bg-white border border-emerald-200 rounded hover:bg-emerald-50 cursor-pointer"
                id={`btn-dl-${String(docKey)}`}
              >
                <FileDown className="h-3 w-3" />
                <span>Verify</span>
              </button>
              <button
                type="button"
                onClick={() => removeDoc(docKey)}
                className="inline-flex items-center px-1.5 py-1 text-[10px] font-semibold text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 cursor-pointer"
                id={`btn-rm-${String(docKey)}`}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 text-[10px] font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
              id={`btn-select-${String(docKey)}`}
            >
              Select File
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          accept="application/pdf"
          onChange={(e) => handleFileChange(e, docKey)}
          className="hidden"
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="applicant-dashboard-container">
      
      {/* CASE A: No Submitted Application found */}
      {!application ? (
        <div className="space-y-8" id="application-form-state">
          
          {/* Form Header */}
          <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-blue-600 text-xs font-bold font-mono tracking-widest uppercase">Apex Scholars Initiative</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Submit Your Scholarship Proposal
              </h1>
              <p className="text-slate-500 text-sm max-w-2xl">
                Please complete the university placement information and upload the required 5 core PDF files. Your completed portfolio will be scored dynamically by the Apex Registrar board.
              </p>
            </div>
            
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-250 text-xs text-amber-800 space-y-1 md:max-w-xs block">
              <strong className="font-bold block">🚨 Strict Primitives:</strong>
              <span>You must have a secured admission letter to apply. Only upload valid PDFs under 5MB size limit.</span>
            </div>
          </div>

          {/* Form Display Status */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2 animate-pulse" id="form-error-pane">
              <X className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2" id="form-success-pane">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Core Submission Form */}
          <form onSubmit={handleSubmitApplication} className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden" id="scholarship-form">
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Section 1: Academic & University Destination Information */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-6 flex items-center gap-1.5">
                  <School className="h-4.5 w-4.5 text-blue-600" />
                  <span>Section 1: Academic & University Placement Details</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Approved Universities List */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="uni-select">
                      Chosen Approved Destination Institution
                    </label>
                    <select
                      id="uni-select"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {APPROVED_UNIVERSITIES.map((name, idx) => (
                        <option key={idx} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      * This list strictly represents affordable institutions complying with the €13,000/year program budget limit.
                    </span>
                  </div>

                  {/* Select Course Fields */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="course-select">
                      Undergraduate / Graduate Academic Field
                    </label>
                    <select
                      id="course-select"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {ELIGIBLE_COURSES.map((name, idx) => (
                        <option key={idx} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      * Only programs within these authorized academic categories qualify for funding allocation.
                    </span>
                  </div>

                  {/* Placement Type letter */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="offer-status-select">
                      Admission Placement Offer Type
                    </label>
                    <select
                      id="offer-status-select"
                      value={admissionStatus}
                      onChange={(e) => setAdmissionStatus(e.target.value as any)}
                      className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="unconditional">Unconditional Offer (Fully Secured placement)</option>
                      <option value="conditional">Conditional Offer (Pending grades or IELTS)</option>
                    </select>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      * Admission status is weighed in our admission scorecard quality metrics (Max 20 pts).
                    </span>
                  </div>

                  {/* Undergraduate Achievement (GPA) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block" htmlFor="gpa-input">
                      Undergraduate Result / GPA Achievement level
                    </label>
                    <input
                      type="text"
                      required
                      id="gpa-input"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      className="block w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="e.g. First Class (4.82/5.00) or Second Class Upper (4.1/5.0)"
                    />
                    <span className="text-[10px] text-slate-400 font-mono block">
                      * Please detail your degree honors level explicitly for primary academic scoring vetting (Max 30 pts).
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Required Academic & Identity Files */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-6 flex items-center gap-1.5">
                  <FileCheck className="h-4.5 w-4.5 text-blue-600" />
                  <span>Section 2: Academic Document Upload Queue</span>
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-normal">
                  In compliance with safety board mandates, applicants must supply 5 distinct PDF validation documents. All uploads undergo verification vetting.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <DocumentUploadBox 
                    title="1. Degree Certificate" 
                    docKey="degree_certificate" 
                    label="Certificate.pdf" 
                  />
                  <DocumentUploadBox 
                    title="2. Academic Transcript" 
                    docKey="transcript" 
                    label="Transcript.pdf" 
                  />
                  <DocumentUploadBox 
                    title="3. University Offer Letter" 
                    docKey="admission_letter" 
                    label="OfferLetter.pdf" 
                  />
                  <DocumentUploadBox 
                    title="4. Curriculum Vitae (CV)" 
                    docKey="cv" 
                    label="CV.pdf" 
                  />
                  <DocumentUploadBox 
                    title="5. Personal SOP Statement" 
                    docKey="personal_statement" 
                    label="SOP.pdf" 
                  />
                </div>
              </div>

            </div>

            {/* Bottom Form Action Buttons */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono tracking-tight">
                All awards represent discretionary decisions based on cycles budget.
              </span>
              
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md cursor-pointer disabled:opacity-50"
                id="submit-proposal-btn"
              >
                {submitting ? (
                  <span>Saving Portfolio Files...</span>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4.5 w-4.5" />
                    <span>Submit Scholarship Portfolio</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      ) : (
        /* CASE B: Application Exists, Show Active Tracker Page */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="application-tracking-state">
          
          {/* Main Status and Timeline Tracker Card */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Visual Status Banner Card */}
            <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-4" id="tracking-status-badge">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-slate-400 text-xs font-mono block">APPLICATION NUMBER</span>
                  <strong className="text-slate-700 font-mono block">{application.id.toUpperCase()}</strong>
                </div>

                <div className="flex items-center space-x-2.5">
                  <span className="text-xs text-slate-400 font-mono">STATUS STATE:</span>
                  {application.status === 'pending' && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-250 animate-pulse">
                      Pending Vetting
                    </span>
                  )}
                  {application.status === 'under_review' && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-semibold rounded-full border border-blue-200">
                      Under active Review
                    </span>
                  )}
                  {application.status === 'accepted' && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-300">
                      Accepted: {application.scholarship_type.toUpperCase()} SCHOLARSHIP
                    </span>
                  )}
                  {application.status === 'rejected' && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full border border-red-300">
                      Rejected / Dropped
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                {application.status === 'pending' && (
                  <div className="space-y-1 text-slate-600 text-sm">
                    <p className="font-semibold text-slate-800">Your scholarship portfolio is successfully queued!</p>
                    <p className="leading-relaxed text-xs">The Apex Registrar board has registered your proposal. They will inspect and match the uploaded credentials against our eligible university caps list shortly.</p>
                  </div>
                )}
                
                {application.status === 'under_review' && (
                  <div className="space-y-1 text-slate-600 text-sm">
                    <p className="font-semibold text-slate-800">Your portfolio is currently under primary review!</p>
                    <p className="leading-relaxed text-xs">A board reviewer is assessing your structural GPA, statement of purpose motivation, and the tier of your university offer. Individual scores out of 100 points will be allocated soon.</p>
                  </div>
                )}

                {application.status === 'accepted' && (
                  <div className="space-y-2.5 text-slate-600 text-sm">
                    <p className="font-extrabold text-emerald-800 flex items-center gap-1.5 text-base">
                      <Sparkles className="h-5 w-5 text-yellow-500 shrink-0" />
                      <span>Congratulations! Funding Cleared.</span>
                    </p>
                    <p className="leading-relaxed text-xs">
                      The board of governors has voted to award you a <strong>{application.scholarship_type === 'full' ? '100% Full Tuition Scholarship' : '50% Partial Tuition Scholarship'}</strong> for program studies at <strong>{application.university_name}</strong>.
                    </p>
                    
                    {application.scholarship_type === 'full' ? (
                      <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-lg border border-emerald-200">
                        <strong className="block font-bold">Elite Tier Stipend Enabled:</strong>
                        <span>You are cleared for a <strong>$300/month stipend</strong> for the duration of standard academic cycles. This is subject to verifying original passport copies in person.</span>
                      </div>
                    ) : (
                      <div className="bg-blue-50 text-blue-800 text-xs p-3.5 rounded-lg border border-blue-200">
                        <strong className="block font-bold">Standard Tier Partial:</strong>
                        <span>Covers 50% of tuition directly paid to {application.university_name}. No secondary monthly stipend is included in partial tiers.</span>
                      </div>
                    )}
                  </div>
                )}

                {application.status === 'rejected' && (
                  <div className="space-y-1 text-slate-600 text-sm">
                    <p className="font-semibold text-slate-800">Application Cycle Decision Released.</p>
                    <p className="leading-relaxed text-xs text-slate-500">
                      We regret to inform you that your application fell below the scholarship allocation limits or tuition cap rules for the current cycle. Because scholarship funds represent capped limits, we are unfortunately unable to offer you sponsorship. We wish you success in your future university endeavors.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Interactive Academic Scorecard details from Admin */}
            {application.score > 0 && (
              <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 shadow-sm space-y-4" id="academic-scorecard">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
                  <h3 className="font-sans font-extrabold text-base text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    <span>Evaluation Scorecard Details</span>
                  </h3>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">FINAL SCORE</span>
                    <strong className="text-lg font-mono text-blue-600 block">{application.score} / 100</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Academic</span>
                    <strong className="text-sm font-mono text-slate-800 mt-1 block">{application.academic_score} <span className="text-slate-400">/30</span></strong>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Admission</span>
                    <strong className="text-sm font-mono text-slate-800 mt-1 block">{application.admission_score} <span className="text-slate-400">/20</span></strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Statement</span>
                    <strong className="text-sm font-mono text-slate-800 mt-1 block">{application.statement_score} <span className="text-slate-400">/20</span></strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Leadership</span>
                    <strong className="text-sm font-mono text-slate-800 mt-1 block">{application.leadership_score} <span className="text-slate-400">/15</span></strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Documents</span>
                    <strong className="text-sm font-mono text-slate-800 mt-1 block">{application.document_score} <span className="text-slate-400">/15</span></strong>
                  </div>
                </div>

                <div className="bg-slate-50 text-slate-400 text-[10px] py-2 px-3 rounded-lg font-mono flex items-center justify-between">
                  <span>Scorecard Policy:</span>
                  <span>Full: &gt;=85 points | Partial: 70 - 84 points | Rejected: &lt;70 points</span>
                </div>
              </div>
            )}

            {/* Official Sequential Timeline Tracker */}
            <div className="bg-white rounded-2xl border border-slate-150 p-6 sm:p-8 shadow-sm" id="tracking-timeline-box">
              <h3 className="font-sans font-bold text-sm text-slate-900 uppercase tracking-wider mb-6">Scholarship Portfolio Stages</h3>
              
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-[2px] before:bg-slate-100">
                
                {/* Step 1 */}
                <div className="flex items-start space-x-4 relative z-10">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-300 text-emerald-800 shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-850">01. Application Form Filed</h4>
                    <p className="text-xs text-slate-450 leading-relaxed max-w-lg">Your academic credentials statement, placement university choice and PDF files queue were successfully validated.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start space-x-4 relative z-10">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    application.status !== 'pending' 
                      ? 'bg-blue-100 border border-blue-300 text-blue-800' 
                      : 'bg-amber-100 border border-amber-300 text-amber-800 animate-pulse'
                  }`}>
                    {application.status !== 'pending' ? '✓' : '02'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-805">02. Registrar Portfolio Review Vetting</h4>
                    <p className="text-xs text-slate-450 leading-relaxed max-w-lg">The board validates matching parameters: eligibility limits (must be citizen of approved regions, course under sponsored categories, tuition cap checklist).</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start space-x-4 relative z-10">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    application.status === 'accepted' || application.status === 'rejected'
                      ? 'bg-emerald-100 border border-emerald-300 text-emerald-800' 
                      : 'bg-slate-100 border border-slate-200 text-slate-400'
                  }`}>
                    {application.status === 'accepted' || application.status === 'rejected' ? '✓' : '03'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-805">03. Final Board Committee Decision Release</h4>
                    <p className="text-xs text-slate-455 leading-relaxed max-w-lg">Final matching metrics score calculation out of 100 total pts. Official funding publication matching is released.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Sidebar Area with Application Details */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm space-y-4" id="tracking-details-sidebar">
              <h3 className="font-sans font-bold text-xs text-slate-500 uppercase tracking-wider block border-b border-slate-100 pb-2.5">
                My Filed Portfolio details
              </h3>

              <div className="space-y-3.5">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">University Target</span>
                  <span className="text-xs font-bold text-slate-800 block leading-tight">{application.university_name}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Academic Course</span>
                  <span className="text-xs font-bold text-slate-800 block leading-tight">{application.course}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Admission Offer Letter</span>
                  <span className="text-xs font-bold text-slate-800 block leading-tight capitalize">{application.admission_status} Offer</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Undergrad Grade Result</span>
                  <span className="text-xs font-mono font-bold text-blue-600 block leading-tight">{application.gpa_or_grade}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Lifecycle Date</span>
                  <span className="text-xs text-slate-500 font-mono block leading-tight">{new Date(application.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Verified Documents Checklist */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase mb-2">Submitted PDF checklist</span>
                <div className="space-y-2">
                  {Object.entries(application.documents).map(([key, val]) => {
                    const docObj = val as DocumentFile;
                    if (!docObj) return null;
                    return (
                      <div key={key} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-medium text-slate-700 truncate max-w-[150px]" title={docObj.name}>
                          {docObj.name}
                        </span>
                        <button
                          onClick={() => downloadFile(docObj, `${key}.pdf`)}
                          className="text-blue-600 hover:text-blue-800 font-bold"
                          title="Download document PDF"
                          id={`dl-tracking-${key}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Option to re-file application if they want to update details */}
              <div className="border-t border-slate-100 pt-4 mt-4">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to re-file? This will reset your current score reviews and return your application to "Pending" status.')) {
                      // Prepopulate docs and view
                      if (application.documents) {
                        setDocs({
                          degree_certificate: application.documents.degree_certificate || null,
                          transcript: application.documents.transcript || null,
                          admission_letter: application.documents.admission_letter || null,
                          cv: application.documents.cv || null,
                          personal_statement: application.documents.personal_statement || null
                        });
                      }
                      setUniversity(application.university_name);
                      setCourse(application.course);
                      setAdmissionStatus(application.admission_status);
                      setGpa(application.gpa_or_grade);
                      
                      // Delete DB state by resetting locally (we can click save to save again)
                      // Simply wipe local component reference so form renders!
                      onRefresh();
                      setSuccessMsg(null);
                      setErrorMsg(null);
                      // Trigger state change by passing null to component
                      // By changing the application check
                      onRefresh();
                    }
                  }}
                  className="w-full py-1.5 border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer text-center block"
                  id="btn-re-file"
                >
                  Re-submit / Reset application
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
