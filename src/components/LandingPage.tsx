/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  Compass, 
  DollarSign, 
  FileCheck, 
  HelpCircle, 
  MapPin, 
  School, 
  ShieldAlert, 
  Star, 
  TrendingUp, 
  ChevronRight 
} from 'lucide-react';
import { APPROVED_UNIVERSITIES, ELIGIBLE_COURSES, SCHOLARSHIP_CRITERIA } from '../lib/constants';

interface LandingPageProps {
  onStartApplication: () => void;
  isLoggedIn: boolean;
}

export default function LandingPage({ onStartApplication, isLoggedIn }: LandingPageProps) {
  
  const steps = [
    {
      num: '01',
      title: 'Secure University Admission',
      desc: 'Applicants must secure a conditional or unconditional offer from one of our 11 approved institutions prior to applying.'
    },
    {
      num: '02',
      title: 'Submit Portal Application',
      desc: 'Register on this portal, complete your personal profile, and upload all 5 academic documents in secure PDF format.'
    },
    {
      num: '03',
      title: 'Review & Scoring Engine',
      desc: 'The committee evaluates and scores your application out of 100 points based on academic results, leadership potential, and statement of purpose.'
    },
    {
      num: '04',
      title: 'Direct Award Allocation',
      desc: 'Candidates scoring 85+ are eligible for Full Funding. Candidates scoring 70+ are allocated Partial Tuition Funding.'
    }
  ];

  const testimonials = [
    {
      name: 'Amara Nwachukwu',
      role: 'MSc Computer Science, Univ. of Exeter',
      imgLetter: 'A',
      rating: 5,
      quote: 'Receiving the Elite Tier Full Scholarship completely transformed my path. The $300 monthly stipend helped me focus entirely on my research. The Apex Foundation process was remarkably efficient and fair.'
    },
    {
      name: 'Tunde Bakare',
      role: 'Master of Engineering, Univ. of Alberta',
      imgLetter: 'T',
      rating: 5,
      quote: 'Their Partial Funding covered exactly 50% of my university tuition. It was the absolute support link my family needed to finance my graduate studies in Canada. I highly recommend Apex to eligible African graduates.'
    },
    {
      name: 'Kofi Mensah',
      role: 'MBA Graduate, York St John University',
      imgLetter: 'K',
      rating: 5,
      quote: 'The clarity of their scoring system is unmatched. You know exactly what they assess: grades, your personal statement, and admission quality. I got 78 points and am now finishing my business studies.'
    }
  ];

  const faqs = [
    {
      q: 'Must I have an admission offer before I apply?',
      a: 'Yes. An unconditional or conditional admission offer from one of the 11 listed approved universities is a strict eligibility criterion. Applications without a valid offer letter will be immediately rejected during document vetting.'
    },
    {
      q: 'Which countries can graduates apply from?',
      a: 'The program is designed specifically for high-achieving graduates from Nigeria, Ghana, Tunisia, Kenya, and Gambia.'
    },
    {
      q: 'What does the evaluation scoring measure?',
      a: 'The committee awards points up to a maximum of 100: Academic strength (30 points), Admission quality (20 points), Statement of Purpose (20 points), Leadership & Work experience (15 points), and Document/CV completeness (15 points).'
    },
    {
      q: 'Is there an application fee?',
      a: 'No. Apex Foundation does not charge any application or processing fee during the current application cycle.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800" id="landing-container">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100 py-16 sm:py-24" id="section-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            
            {/* Left Column Text */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-7 lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
                <Award className="h-4 w-4" />
                <span>Apex Scholarship Cycle — Now Open</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-sans font-extrabold text-slate-900 tracking-tight leading-tight">
                Empowering Eligible <span className="text-blue-600">African Graduates</span> for Global Impact.
              </h1>
              
              <p className="mt-4 text-base sm:text-xl text-slate-500 leading-relaxed max-w-2xl">
                The Apex Foundation provides partial (50%) and full (100%) graduate tuition funding for qualified students admitted into industry-leading UK, Canadian, and Australian universities.
              </p>

              <div className="mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                <button
                  onClick={onStartApplication}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-md group"
                  id="hero-apply-btn"
                >
                  <span>{isLoggedIn ? 'Access My Dashboard' : 'Start My Scholarship Application'}</span>
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#criteria"
                  className="w-full sm:w-auto mt-3 sm:mt-0 inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
                >
                  View Criteria
                </a>
              </div>
            </div>

            {/* Right Column Core Trust Facts */}
            <div className="mt-12 lg:mt-0 lg:col-span-5">
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden" id="hero-trust-box">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <School className="h-40 w-40" />
                </div>
                
                <h3 className="font-sans font-bold text-lg text-white mb-4">Undergraduate & Graduate Funding Core Metrics</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-100 text-sm">Approved Tuition Limit</h4>
                      <p className="text-slate-400 text-xs mt-0.5">We specifically fund programs under €13,000/year to optimize budget allocation and scholarship availability.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-100 text-sm">Elite Tier Full Funding</h4>
                      <p className="text-slate-400 text-xs mt-0.5">100% tuition coverage for top-tier GPA performers (First Class/Distinction) scoring ≥85 points during review.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-100 text-sm">Clear Objective Scoring</h4>
                      <p className="text-slate-400 text-xs mt-0.5">No bias. Systemized vetting across Academic merit, Admission offer tier, Personal Statement, and CV proof.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 mt-6 pt-4 flex justify-between items-center text-xs text-slate-400 font-mono">
                  <span>Target Nationalities</span>
                  <span className="text-blue-400">NG, GH, TN, KE, GM</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Disclaimers Bar */}
      <section className="bg-blue-950 text-white py-4 px-4 sm:px-6" id="section-disclaimers">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-amber-400">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-100">
              <strong>Official Foundation Disclaimers:</strong> Apex is independent, merit-based, and has no formal affiliate status with lists. Admission offer does not guarantee funding.
            </span>
          </div>
          <a href="#full-disclaimer" className="text-xs text-blue-300 underline hover:text-blue-200 font-mono">Read full legal disclaimer</a>
        </div>
      </section>

      {/* Criteria & Elegibility */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="criteria">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Scholarship Eligibility & Fields
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Eligibility is highly structured. Please review the criteria carefully before starting your application file.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Nationality Eligibility */}
          <div className="bg-white rounded-xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between">
            <div>
              <div className="bg-blue-50 text-blue-600 h-12 w-12 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900">National Eligibility</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Applicants must be citizens of selected West/East African partner states, with specialized focus on:
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">Nigeria 🇳🇬</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">Ghana 🇬🇭</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">Tunisia 🇹🇳</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">Kenya 🇰🇪</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">Gambia 🇬🇲</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100 font-mono">
              Proof of Passport / ID required.
            </div>
          </div>

          {/* Academic Eligibility */}
          <div className="bg-white rounded-xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between">
            <div>
              <div className="bg-blue-50 text-blue-600 h-12 w-12 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900">Eligible Academic Fields</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Scholarships are restricted to graduate applicants admitted into programs within following fields:
              </p>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {ELIGIBLE_COURSES.map((course) => (
                  <div key={course} className="flex items-center space-x-1.5 text-slate-700 text-xs font-medium">
                    <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
                    <span>{course}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100 font-mono">
              Final-year students may apply provisionally.
            </div>
          </div>

          {/* Admission Verification */}
          <div className="bg-white rounded-xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between">
            <div>
              <div className="bg-blue-50 text-blue-600 h-12 w-12 rounded-lg flex items-center justify-center mb-6">
                <FileCheck className="h-6 w-6" />
              </div>
              <h3 className="font-sans font-bold text-lg text-slate-900">Verified Admission Offer</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed text-left">
                Applicants must have verified admission letters (conditional or unconditional) from approved affordable partner universities.
              </p>
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md font-medium mt-3">
                Max tuition of host program must be ≤ €13,000/year format.
              </p>
            </div>
            <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100 font-mono">
              Verification is conducted by registrar.
            </div>
          </div>
        </div>
      </section>

      {/* Scholarship Tiers Grid */}
      <section className="bg-blue-900 text-white py-16" id="tiers">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Scholarship Tiers & Allocation Limits
            </h2>
            <p className="text-blue-200 text-base sm:text-lg">
              Allocated dynamically based on structural scorecard thresholds. All awards are discretionary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
            
            {/* Full Scholarship */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-blue-500 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-bl-lg">
                Tier 1 - Elite
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Award className="h-6 w-6 text-yellow-400" />
                  <span>{SCHOLARSHIP_CRITERIA.full.title}</span>
                </h3>
                
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-blue-400">{SCHOLARSHIP_CRITERIA.full.funding}</span>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Includes <strong>{SCHOLARSHIP_CRITERIA.full.stipend}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Requires evaluation score <strong>&gt;= 85 points</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Strictly awarded for exceptional First Class or Distinction results</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-slate-400 text-xs leading-relaxed">
                Subject to annual cycle budget allocation limits. Slot limits apply.
              </div>
            </div>

            {/* Partial Scholarship */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 bg-slate-700 text-white text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-bl-lg">
                Tier 2 - Standard
              </div>
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <CheckCircle className="h-6 w-6 text-blue-400" />
                  <span>{SCHOLARSHIP_CRITERIA.partial.title}</span>
                </h3>
                
                <div className="my-6">
                  <span className="text-3xl font-extrabold text-slate-300">{SCHOLARSHIP_CRITERIA.partial.funding}</span>
                </div>

                <ul className="space-y-3.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Stipend: <strong>{SCHOLARSHIP_CRITERIA.partial.stipend}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Requires evaluation score <strong>70 - 84 points</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span>Open to strong performers with approved university placement letters</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-slate-400 text-xs leading-relaxed">
                Discretionary based on the university tuition caps list.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Approved Universities */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white my-12 rounded-2xl border border-slate-100 shadow-sm" id="universities">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-blue-600 text-xs font-bold font-mono tracking-widest uppercase">Approved Universities</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">11 Eligible Universities & Institutions</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed">
            These international universities meet the programmatic tuition criteria cap (≤ €13,000/year equivalent value) set by the program governors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {APPROVED_UNIVERSITIES.map((uni, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors flex items-center space-x-3">
              <div className="bg-white h-10 w-10 flex items-center justify-center rounded-lg shadow-xs border border-slate-100 text-blue-600 font-bold shrink-0">
                {uni[0] === 'U' || uni[0] === 'u' ? 'Uni' : uni[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-semibold text-slate-800 block truncate" title={uni}>{uni}</span>
                <span className="text-[10px] text-slate-400 font-mono block">UK / CAN / AUS</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Lifecycle Step Process */}
      <section className="py-16 bg-slate-100 hover:bg-slate-50 transition-colors" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">The Application Lifecycle</h2>
            <p className="text-slate-500 text-sm mt-2">Clear and sequential application steps from registration to publication of results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs relative">
                <div className="text-3xl font-mono font-extrabold text-blue-100 absolute top-4 right-4 leading-none">
                  {step.num}
                </div>
                <h4 className="font-sans font-bold text-base text-slate-900 pr-10 mb-2 relative z-10">{step.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Placeholder Testimonials Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="testimonials">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900">True Stories. Life-Changing Support.</h2>
          <p className="text-slate-500 text-sm mt-2">Hear from previous scholars who started their journey where you are now.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 border border-slate-150 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-slate-600 text-sm italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center space-x-3.5">
                <div className="bg-blue-600 text-white font-bold h-10 w-10 rounded-full flex items-center justify-center shrink-0">
                  {t.imgLetter}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                  <p className="text-[11px] text-slate-400 block">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive FAQs */}
      <section className="py-16 bg-white border-t border-slate-150" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8 text-blue-600" />
              <span>Frequently Asked Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-100 bg-slate-50">
                <h4 className="text-sm font-bold text-slate-900 mb-1.5">{faq.q}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full legal disclaimers */}
      <section className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800" id="full-disclaimer">
        <div className="max-w-5xl mx-auto text-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-200">Official Programme Legal & Administration Disclaimers</h4>
          <p className="leading-relaxed">
            1. **Independent Programme Management Status**: Apex Foundation operates as an independent charitable scholarship project program. The Foundation holds no official partnership, technical affiliate link, or operational validation agreement with any of the 11 listed universities. Individual university admission, application criteria, and standard scholarship portals are managed entirely under their respective governing bodies.
          </p>
          <p className="leading-relaxed">
            2. **No Guarantee of Tuition Funding**: Gaining an unconditional or conditional offer of admission from any of the listed UK, Canada, or Australia universities does not serve as a trigger, binding agreement, or guarantee of scholarship allocation from the Apex Foundation. Scholarships represent a high-competition discretionary benefit matching strict academic thresholds and core program budget cycles.
          </p>
          <p className="leading-relaxed">
            3. **Decision Discretion**: All final funding scores, status updates, rejection notes, and tier assignments represent discretionary decisions reached by the Apex Board of Registrars. Decisions represent closed-meeting verdicts and are subject to immediate cycle closure upon reaching limit boundaries.
          </p>
          <p className="leading-relaxed">
            4. **Falsification Consequence**: Document verification checks are performed by Apex Registrar administrators. Any proof of transcript alteration, invalid certificate, deceptive admission letter, false identity, or citizenship falsification triggers immediate life-long blacklists across active funding systems and immediate referral to national registrars.
          </p>
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>© 2026 Apex Scholarship Foundation. All Rights Reserved.</span>
            <span>Registrar Central Office - West Africa Unit</span>
          </div>
        </div>
      </section>

    </div>
  );
}
