import React, { useState, useEffect } from 'react';
import { 
  FileText, Briefcase, Award, CheckCircle2, AlertTriangle, 
  XCircle, Zap, Compass, HelpCircle, Layers, BookOpen, 
  Upload, RefreshCw, Download, Printer, ArrowRight, ShieldCheck, 
  Terminal, Sparkles, ChevronDown, ChevronUp, Code, Database,
  TrendingUp, Activity, Check, ExternalLink, User, GraduationCap
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState('hub');
  const [loading, setLoading] = useState(false);
  const [sampleDomains, setSampleDomains] = useState({});
  const [selectedDomain, setSelectedDomain] = useState('backend');
  
  // Input state
  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [jobFile, setJobFile] = useState(null);

  // Analysis result state
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  // Filter states
  const [gapFilter, setGapFilter] = useState('ALL');
  const [questionFilter, setQuestionFilter] = useState('ALL');
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Load sample data on initial mount
  useEffect(() => {
    fetchSampleData();
    fetchHistory();
  }, []);

  const fetchSampleData = async () => {
    try {
      const res = await fetch('/api/sample-data');
      if (res.ok) {
        const data = await res.json();
        setSampleDomains(data);
        if (data.backend) {
          setResumeText(data.backend.resume_text);
          setJobText(data.backend.job_text);
        }
      }
    } catch (err) {
      console.warn("Could not fetch samples:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.warn("Could not fetch history:", err);
    }
  };

  const handleDomainSelect = (key) => {
    setSelectedDomain(key);
    if (sampleDomains[key]) {
      setResumeText(sampleDomains[key].resume_text);
      setJobText(sampleDomains[key].job_text);
      setResumeFile(null);
      setJobFile(null);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      if (resumeFile) {
        formData.append('resume_file', resumeFile);
      } else {
        formData.append('resume_text', resumeText);
      }

      if (jobFile) {
        formData.append('job_file', jobFile);
      } else {
        formData.append('job_text', jobText);
      }

      formData.append('domain_choice', selectedDomain);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Analysis pipeline execution failed');
      }

      const result = await res.json();
      setAnalysis(result);
      fetchHistory();
      
      // Celebrate if high score!
      if (result.score_breakdown.overall_readiness_score >= 75) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        setActiveTab('scorecard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredGaps = analysis?.tri_tier_gaps.filter(g => {
    if (gapFilter === 'ALL') return true;
    return g.tier === gapFilter;
  }) || [];

  const filteredQuestions = analysis?.interview_questions.filter(q => {
    if (questionFilter === 'ALL') return true;
    return q.type === questionFilter;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 font-sans">
      
      {/* Top Banner & Project Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AI-Powered Resume Analysis & Interview Prep
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-full">
                  B.Tech IT Major Project
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Bharati Vidyapeeth's College of Engineering, New Delhi | GGSIPU
              </p>
            </div>
          </div>

          {/* Guide & Team Pill */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300">
              <span className="text-indigo-400 font-medium">Project Team:</span>
              <span>Vansh</span> • <span>Anuj Nautiyal</span> • <span>Faraz Khan</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-emerald-400">
              <span>Guide:</span>
              <span className="font-semibold">Mr. Mohit Dayal</span>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto space-x-1 border-t border-slate-800/40 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('hub')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'hub'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Ingestion & Run Hub
          </button>

          <button
            onClick={() => setActiveTab('scorecard')}
            disabled={!analysis}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              !analysis ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500' :
              activeTab === 'scorecard'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Alignment Scorecard {analysis && `(${analysis.score_breakdown.overall_readiness_score}%)`}
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            disabled={!analysis}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              !analysis ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500' :
              activeTab === 'evidence'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Tri-Tier Evidence Matrix
          </button>

          <button
            onClick={() => setActiveTab('semantic')}
            disabled={!analysis}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              !analysis ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500' :
              activeTab === 'semantic'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            SBERT Cosine Alignment
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            disabled={!analysis}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              !analysis ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500' :
              activeTab === 'questions'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            STAR Interview Prep
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            disabled={!analysis}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              !analysis ? 'opacity-40 cursor-not-allowed border-transparent text-slate-500' :
              activeTab === 'roadmap'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            4-Week Study Roadmap
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            Synopsis & Methodology
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* TAB 1: INGESTION & RUN HUB */}
        {activeTab === 'hub' && (
          <div className="space-y-8">
            
            {/* Domain Preset Bar */}
            <div className="p-5 rounded-2xl glass-panel-elevated">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Load Scope Domain Presets (Slide 3 & 5)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a pre-configured domain profile or upload custom PDF/DOCX resumes and job postings.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleDomainSelect('backend')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDomain === 'backend'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Backend Systems
                  </button>
                  <button
                    onClick={() => handleDomainSelect('ml')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDomain === 'ml'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Data & ML Engineering
                  </button>
                  <button
                    onClick={() => handleDomainSelect('fullstack')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedDomain === 'fullstack'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Full-Stack Web
                  </button>
                </div>
              </div>

              {/* Two Column Ingestion Boxes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
                
                {/* Resume Ingestion Box */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Candidate Resume (PDF, DOCX, or Text)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {resumeFile ? `Selected: ${resumeFile.name}` : 'Using text editor content'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      Upload PDF / DOCX
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setResumeFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {resumeFile && (
                      <button 
                        onClick={() => setResumeFile(null)}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Clear File
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={12}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume text or upload PDF/DOCX above..."
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                  />
                </div>

                {/* Job Description Ingestion Box */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-emerald-400" />
                      Job Specification (Target Requirements)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {jobFile ? `Selected: ${jobFile.name}` : 'Using text editor content'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      Upload JD Document
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setJobFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    {jobFile && (
                      <button 
                        onClick={() => setJobFile(null)}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        Clear File
                      </button>
                    )}
                  </div>

                  <textarea
                    rows={12}
                    value={jobText}
                    onChange={(e) => setJobText(e.target.value)}
                    placeholder="Paste Job Description specifications here..."
                    className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 p-3.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                  />
                </div>

              </div>

              {/* Action Button */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  FastAPI Orchestrator + SBERT Vector Engine Ready
                </div>

                <button
                  onClick={runAnalysis}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Executing NLP & SBERT Pipeline...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Execute Full AI Analysis
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Previous Analyses History */}
            {history.length > 0 && (
              <div className="p-5 rounded-2xl glass-panel">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Recent Analyzed Profiles (SQLite Storage)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {history.slice(0, 6).map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => loadHistoryItem(item.id)}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all hover:bg-slate-800/40"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200 truncate">{item.candidate_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold">
                          {Math.round(item.readiness_score)}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{item.job_title}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <span className="text-emerald-400">✓ {item.verified_count} Verified</span>
                        <span className="text-amber-400">⚠ {item.surface_count} Surface</span>
                        <span className="text-rose-400">+ {item.missing_count} Missing</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: ALIGNMENT SCORECARD & MATHEMATICAL EVALUATION */}
        {activeTab === 'scorecard' && analysis && (
          <div className="space-y-8">
            
            {/* Top Score Banner */}
            <div className="p-6 rounded-2xl glass-panel-elevated gradient-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                    <User className="w-3.5 h-3.5" />
                    Candidate: <strong className="text-white">{analysis.candidate_name}</strong>
                    <span className="mx-1">•</span>
                    Target: <strong className="text-white">{analysis.job_title}</strong>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Overall Readiness Alignment: {analysis.score_breakdown.overall_readiness_score}%
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                    Weighted synthesis of dense vector similarity, project corroboration, experience depth, and educational alignment based on Slide 8 mathematical scoring model.
                  </p>
                </div>

                {/* Score Dial */}
                <div className="relative flex items-center justify-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900/80 shadow-2xl">
                    <div className="text-center">
                      <span className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                        {Math.round(analysis.score_breakdown.overall_readiness_score)}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 block">/ 100</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Component Weights Breakdown (Slide 8 Benchmarks) */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Component Weights & Target Benchmarks (Slide 8)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  
                  {/* Required Skills */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-medium">Required Skills</span>
                      <span className="text-slate-400">Weight 35%</span>
                    </div>
                    <div className="text-xl font-bold text-indigo-400">
                      {analysis.score_breakdown.required_skills_score}%
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, analysis.score_breakdown.required_skills_score)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Benchmark: ≥ {analysis.score_breakdown.required_skills_benchmark}%
                    </span>
                  </div>

                  {/* Project Relevance */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-medium">Project Relevance</span>
                      <span className="text-slate-400">Weight 25%</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-400">
                      {analysis.score_breakdown.project_relevance_score}%
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, analysis.score_breakdown.project_relevance_score)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Benchmark: ≥ {analysis.score_breakdown.project_relevance_benchmark}%
                    </span>
                  </div>

                  {/* Experience Fit */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-medium">Experience Fit</span>
                      <span className="text-slate-400">Weight 20%</span>
                    </div>
                    <div className="text-xl font-bold text-amber-400">
                      {analysis.score_breakdown.experience_fit_score}%
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, analysis.score_breakdown.experience_fit_score)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Benchmark: ≥ {analysis.score_breakdown.experience_fit_benchmark}%
                    </span>
                  </div>

                  {/* Education */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-medium">Education</span>
                      <span className="text-slate-400">Weight 10%</span>
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      {analysis.score_breakdown.education_score}%
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, analysis.score_breakdown.education_score)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Benchmark: {analysis.score_breakdown.education_benchmark}%
                    </span>
                  </div>

                  {/* Bonus Skills */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-300 font-medium">Bonus Skills</span>
                      <span className="text-slate-400">Weight 10%</span>
                    </div>
                    <div className="text-xl font-bold text-purple-400">
                      {analysis.score_breakdown.bonus_skills_score}%
                    </div>
                    <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, analysis.score_breakdown.bonus_skills_score)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Benchmark: ≥ {analysis.score_breakdown.bonus_skills_benchmark}%
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* Mathematical Evaluation Formulation (Slide 8 Table) */}
            <div className="p-6 rounded-2xl glass-panel">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Mathematical Evaluation Metrics & Formulas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Precision */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Precision (Extraction Accuracy)</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {analysis.mathematical_metrics.precision}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    TP / (TP + FP) = {analysis.mathematical_metrics.true_positives} / ({analysis.mathematical_metrics.true_positives} + {analysis.mathematical_metrics.false_positives})
                  </p>
                </div>

                {/* Recall */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Recall (Extraction Completeness)</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {analysis.mathematical_metrics.recall}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    TP / (TP + FN) = {analysis.mathematical_metrics.true_positives} / ({analysis.mathematical_metrics.true_positives} + {analysis.mathematical_metrics.false_negatives})
                  </p>
                </div>

                {/* F1-Score */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">F1-Score (Balanced Quality)</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {analysis.mathematical_metrics.f1_score}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    2 × (P × R) / (P + R)
                  </p>
                </div>

                {/* Cosine Similarity */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Dense Vector Cosine Similarity</div>
                  <div className="text-2xl font-bold text-indigo-400 mt-1">
                    {analysis.mathematical_metrics.average_cosine_similarity}
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    (A · B) / (||A|| ||B||)
                  </p>
                </div>

              </div>
            </div>

            {/* Structured Extracted Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-2xl glass-panel space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  Structured Resume Profile (Parsed NER)
                </h4>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Extracted Contact & Links:</span>
                    <p className="text-slate-300">
                      {analysis.parsed_resume.contact.email} • {analysis.parsed_resume.contact.location || "Delhi, India"}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Education Credentials:</span>
                    {analysis.parsed_resume.education.map((e, idx) => (
                      <p key={idx} className="text-slate-300 font-medium mt-0.5">
                        {e.degree} - {e.institution} ({e.year})
                      </p>
                    ))}
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Projects Corroborated ({analysis.parsed_resume.projects.length}):</span>
                    <div className="space-y-1.5 mt-1">
                      {analysis.parsed_resume.projects.map((p, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px]">
                          <strong className="text-slate-200">{p.title}</strong>
                          <span className="text-slate-400 block mt-0.5">{p.description.slice(0, 110)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Job Spec Parsed */}
              <div className="p-5 rounded-2xl glass-panel space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  Target Job Intelligence (Parsed Spec)
                </h4>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Role & Experience Threshold:</span>
                    <p className="text-slate-300 font-medium">
                      {analysis.parsed_job.title} ({analysis.parsed_job.experience_years_required} Years Req.)
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Required Core Skills ({analysis.parsed_job.required_skills.length}):</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {analysis.parsed_job.required_skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Preferred / Bonus Skills ({analysis.parsed_job.preferred_skills.length}):</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {analysis.parsed_job.preferred_skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: TRI-TIER EVIDENCE MATRIX (Anti-Hallucination Safeguard, Slide 9) */}
        {activeTab === 'evidence' && analysis && (
          <div className="space-y-6">
            
            {/* Header Description */}
            <div className="p-5 rounded-2xl glass-panel-elevated">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                    Anti-Hallucination: Tri-Tier Evidence Framework (Slide 9)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Only skills the candidate can substantiate with concrete projects or work logs are used to generate interview questions.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setGapFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${gapFilter === 'ALL' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    All ({analysis.tri_tier_gaps.length})
                  </button>
                  <button
                    onClick={() => setGapFilter('VERIFIED')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${gapFilter === 'VERIFIED' ? 'bg-emerald-600 text-white font-medium' : 'text-emerald-400 hover:text-emerald-300'}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified ({analysis.verified_count})
                  </button>
                  <button
                    onClick={() => setGapFilter('SURFACE')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${gapFilter === 'SURFACE' ? 'bg-amber-600 text-white font-medium' : 'text-amber-400 hover:text-amber-300'}`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Surface ({analysis.surface_count})
                  </button>
                  <button
                    onClick={() => setGapFilter('MISSING')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${gapFilter === 'MISSING' ? 'bg-rose-600 text-white font-medium' : 'text-rose-400 hover:text-rose-300'}`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Missing ({analysis.missing_count})
                  </button>
                </div>
              </div>
            </div>

            {/* Gaps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGaps.map((item, idx) => {
                const isVerified = item.tier === 'VERIFIED';
                const isSurface = item.tier === 'SURFACE';
                const isMissing = item.tier === 'MISSING';

                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isVerified ? 'bg-emerald-950/20 border-emerald-500/30' :
                      isSurface ? 'bg-amber-950/20 border-amber-500/30' :
                      'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isVerified && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isSurface && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                        {isMissing && <XCircle className="w-4 h-4 text-rose-400" />}
                        <h4 className="font-bold text-sm text-slate-100">{item.skill}</h4>
                      </div>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isVerified ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                        isSurface ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        {item.tier}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 mt-2">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Evidence Anchor:</span>
                        <p className="font-mono text-[11px] text-slate-200">
                          {item.evidence_source || 'None'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-500 block">Verification Rationale:</span>
                        <p className="text-slate-300 text-xs">
                          {item.rationale}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[11px] font-semibold text-indigo-400 block">System Safeguard Action:</span>
                        <p className="text-slate-300 text-xs">
                          {item.action_item}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 4: SBERT SEMANTIC COSINE ALIGNMENT (Slide 7) */}
        {activeTab === 'semantic' && analysis && (
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl glass-panel-elevated">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Dense Vector Embedding Similarity (Slide 7 Methodology)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                SBERT maps resume & job-requirement text into dense vectors. Cosine similarity measures the geometric angle between them — near-identical meaning gives <code className="text-indigo-300 bg-indigo-500/10 px-1 py-0.5 rounded">cos θ ≈ 1.0</code>, unrelated text gives <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">cos θ ≈ 0</code>.
              </p>

              {/* Showcase Banner from Slide 7 */}
              <div className="mt-5 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs sm:text-sm text-indigo-200">
                  <strong className="text-white block font-semibold mb-0.5">Slide 7 Proven Equivalence:</strong>
                  <span>"FastAPI Developer"</span> <span className="text-indigo-400 font-bold mx-2">vs</span> <span>"Python REST APIs"</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-400 block font-mono">cos θ = 0.98</span>
                    <span className="text-[10px] text-slate-400 font-mono">θ ≈ 11.5° (Near-identical meaning)</span>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Comparisons Table */}
            <div className="rounded-2xl glass-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Job Specification Requirement</th>
                      <th className="py-3 px-4">Aligned Resume Implementation</th>
                      <th className="py-3 px-4 text-center">Cosine Similarity (cos θ)</th>
                      <th className="py-3 px-4 text-center">Geometric Angle (θ°)</th>
                      <th className="py-3 px-4">Semantic Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {analysis.semantic_comparisons.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {item.job_phrase}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {item.resume_phrase}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            item.cosine_similarity >= 0.75 ? 'bg-emerald-500/20 text-emerald-400' :
                            item.cosine_similarity >= 0.45 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {item.cosine_similarity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400">
                          {item.angle_degrees}°
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className={`text-[11px] font-medium ${
                            item.cosine_similarity >= 0.75 ? 'text-emerald-400' :
                            item.cosine_similarity >= 0.45 ? 'text-amber-400' :
                            'text-rose-400'
                          }`}>
                            {item.match_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: STAR INTERVIEW PREPARATION (Slide 6 & 9) */}
        {activeTab === 'questions' && analysis && (
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl glass-panel-elevated">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    Targeted & Project-Grounded Interview Preparation
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Unlike generic "top 50" lists, these technical and behavioral questions are grounded directly in your verified project logs and architectural trade-offs.
                  </p>
                </div>

                {/* Filter Questions */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <button
                    onClick={() => setQuestionFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${questionFilter === 'ALL' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    All Questions ({analysis.interview_questions.length})
                  </button>
                  <button
                    onClick={() => setQuestionFilter('project_deepdive')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${questionFilter === 'project_deepdive' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    Project Architecture
                  </button>
                  <button
                    onClick={() => setQuestionFilter('behavioral_star')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${questionFilter === 'behavioral_star' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    STAR Behavioral
                  </button>
                  <button
                    onClick={() => setQuestionFilter('skill_probe')}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${questionFilter === 'skill_probe' ? 'bg-indigo-600 text-white font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    Surface Skill Challenge
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const isExpanded = expandedQuestion === q.id;

                return (
                  <div 
                    key={q.id}
                    className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            q.evidence_tier === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}>
                            {q.category}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            Anchor: {q.target_project_or_skill}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-100 pt-1">
                          {q.question}
                        </h3>
                      </div>

                      <button
                        onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex-shrink-0"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mt-2 font-sans italic">
                      {q.context}
                    </p>

                    {/* Collapsible Details (STAR Guidance & Rubric) */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 text-xs animate-in fade-in duration-200">
                        
                        {q.suggested_star_guidance && (
                          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                            <span className="text-indigo-400 font-bold block uppercase tracking-wider text-[10px]">
                              Suggested STAR Structure Answer Strategy:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                              <div><strong className="text-emerald-400">Situation (S):</strong> {q.suggested_star_guidance.Situation}</div>
                              <div><strong className="text-cyan-400">Task (T):</strong> {q.suggested_star_guidance.Task}</div>
                              <div><strong className="text-indigo-400">Action (A):</strong> {q.suggested_star_guidance.Action}</div>
                              <div><strong className="text-purple-400">Result (R):</strong> {q.suggested_star_guidance.Result}</div>
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="text-slate-400 font-semibold block mb-1">
                            Interviewer Evaluation Criteria:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {q.evaluation_criteria.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 6: 4-WEEK PREPARATION ROADMAP (Slide 6 & 9) */}
        {activeTab === 'roadmap' && analysis && (
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl glass-panel-elevated">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Prioritized Time-Boxed Preparation Roadmap (Slide 6)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                Converts your identified skill deficits (both Missing requirements and Surface claims) into a structured 4-week engineering study sprint with concrete deliverables.
              </p>
            </div>

            {/* Weeks Timeline */}
            <div className="space-y-6">
              {analysis.roadmap.map((week) => (
                <div 
                  key={week.week_number}
                  className="p-6 rounded-2xl glass-panel border border-slate-800 relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-extrabold flex items-center justify-center text-sm">
                        W{week.week_number}
                      </span>
                      <h3 className="text-base font-bold text-white">
                        {week.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {week.focus_skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs">
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">Learning Objectives:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {week.learning_objectives.map((obj, i) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-slate-400 font-semibold block mb-1">Recommended References:</span>
                        <div className="space-y-1">
                          {week.curated_resources.map((r, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-indigo-300">
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Concrete Deliverable Box */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          Hands-On Practice Project:
                        </span>
                        <p className="text-slate-200 font-medium text-xs mt-0.5">
                          {week.practice_project}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                          Milestone Deliverable:
                        </span>
                        <p className="text-slate-300 text-xs mt-0.5">
                          {week.deliverable}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 7: SYNOPSIS & METHODOLOGY REFERENCE (Deck Slides 4, 5, 7, 8, 9) */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            
            <div className="p-6 rounded-2xl glass-panel-elevated">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                Project Synopsis & Four-Layer System Architecture
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
                Implementation specification from the Department of Information Technology, Bharati Vidyapeeth's College of Engineering (GGSIPU).
              </p>
            </div>

            {/* Four Layer Architecture Cards (Slide 4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">1. Presentation Layer</span>
                <h4 className="font-bold text-white text-sm">React.js SPA + Tailwind CSS</h4>
                <p className="text-xs text-slate-400">
                  Document ingestion UI, interactive alignment scorecard, evidentiary gap matrix, and study roadmap.
                </p>
              </div>

              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">2. Backend Orchestration</span>
                <h4 className="font-bold text-white text-sm">FastAPI Microservices</h4>
                <p className="text-xs text-slate-400">
                  REST API gateway, parsing controller, alignment service, and roadmap compiler.
                </p>
              </div>

              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">3. AI / ML Inference</span>
                <h4 className="font-bold text-white text-sm">NLP + SBERT Embeddings</h4>
                <p className="text-xs text-slate-400">
                  spaCy/Regex custom NER, Sentence-Transformers (all-MiniLM-L6-v2), and Anti-Hallucination safeguards.
                </p>
              </div>

              <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">4. Persistence Layer</span>
                <h4 className="font-bold text-white text-sm">Relational + Vector Index</h4>
                <p className="text-xs text-slate-400">
                  SQLite persistent database storing parsed profiles, scores, and FAISS-compatible dense vector indexes.
                </p>
              </div>

            </div>

            {/* Project Team Card */}
            <div className="p-6 rounded-2xl glass-panel border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
                Academic Project Credentials
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Candidate:</span>
                  <strong className="text-white text-sm">Vansh</strong>
                  <span className="text-slate-500 block font-mono">00211503124</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Candidate:</span>
                  <strong className="text-white text-sm">Anuj Nautiyal</strong>
                  <span className="text-slate-500 block font-mono">05011503124</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block">Candidate:</span>
                  <strong className="text-white text-sm">Faraz Khan</strong>
                  <span className="text-slate-500 block font-mono">05411503124</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>Guided by: <strong className="text-emerald-400">Mr. Mohit Dayal</strong> (Assistant Professor, Dept. of Information Technology)</span>
                <span>Bharati Vidyapeeth's College of Engineering, New Delhi | GGSIP University</span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        AI-Powered Resume Analysis & Interview Preparation System • Built for B.Tech Information Technology Major Project
      </footer>

    </div>
  );
}

