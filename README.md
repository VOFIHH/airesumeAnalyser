# AI-Powered Resume Analysis & Interview Preparation System

> **B.Tech Major Project — Department of Information Technology**  
> **Bharati Vidyapeeth's College of Engineering, New Delhi | GGSIP University, Delhi**  
> **Guided by:** Mr. Mohit Dayal (Assistant Professor, Dept. of Information Technology)  
> **Project Team:**
> - Vansh (Enrollment No: 00211503124)
> - Anuj Nautiyal (Enrollment No: 05011503124)
> - Faraz Khan (Enrollment No: 05411503124)

---

## 📌 Executive Summary & Aim
Automated Applicant Tracking Systems (ATS) and generic interview preparation platforms leave a critical bottleneck between candidate screening and real technical readiness. Legacy keyword scanners penalize alternate phrasings, fail to substantiate whether skills are backed by actual projects, and supply generic "top 50 questions" disconnected from a candidate's actual architectural choices.

This platform unites **structured NLP extraction**, **dense vector semantic embeddings (SBERT)**, an **Anti-Hallucination Tri-Tier Evidence Framework**, and **project-grounded question & roadmap generation** into a single, explainable platform.

**Scope:** Full-Stack, Backend Systems, and Data/Machine Learning Engineering resumes (PDF, DOCX, Text).

---

## 🏗️ Four-Layer System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   1. Presentation Layer                     │
│    React.js SPA • Tailwind CSS • Vite • Interactive UI      │
│  Ingestion Hub • Alignment Scorecard • Evidence Matrix      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                2. Backend Orchestration                     │
│    Python FastAPI Microservices • REST API Gateway          │
│  Parsing Controller • Alignment Service • Roadmap Compiler  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                 3. AI / ML Inference Engine                 │
│  • Sentence-Transformers (SBERT all-MiniLM-L6-v2)           │
│  • Dense Cosine Similarity & Geometric Angle (θ°) Engine    │
│  • Anti-Hallucination Tri-Tier Evidence Corroboration       │
│  • Project-Grounded STAR Interview Question Generator       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                4. Persistence & Storage                     │
│  • SQLite Relational Database (Profiles, Scores, History)   │
│  • Dense Vector Index (Embeddings)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Six Core Functional Modules

1. **Resume Parser (`services/parser.py`):** Extracts contact details, education, categorized technical skills, employment logs, and structured projects with quantifiable bullets from PDF and DOCX files.
2. **Job Intelligence (`services/job_intelligence.py`):** Automatically extracts role title, experience thresholds, mandatory core qualifications, and bonus/preferred competencies.
3. **Semantic Matcher (`services/matcher.py`):** SBERT dense vector embeddings calculate cosine similarity between resume phrasing and job requirements, resolving semantic synonyms without keyword rigidity (e.g. *"FastAPI Developer"* vs *"Python REST APIs"* $\to \cos \theta = 0.98, \theta \approx 11.5^\circ$).
4. **Evidentiary Gap Engine (`services/gap_engine.py`):** The Anti-Hallucination safeguard classifies required skills into three concrete tiers:
   - **`VERIFIED` (✓):** Backed by concrete project code or employment logs $\to$ Included in technical interview questions.
   - **`SURFACE` (⚠):** Mentioned in skills section without project corroboration $\to$ Flagged as needing project proof; generates challenge probes.
   - **`MISSING` (+):** Required by JD but absent $\to$ Prioritized into time-boxed study roadmap.
5. **Interview Question Generator (`services/question_generator.py`):** Generates targeted architecture deep-dives and behavioral STAR scenarios (Situation, Task, Action, Result) grounded in real candidate projects.
6. **Preparation Roadmap (`services/roadmap_compiler.py`):** Converts skill deficits into a prioritized, 4-week actionable study schedule with practice deliverables and curated resources.

---

## 📐 Mathematical Evaluation & Scoring Model

### Extraction & Classification Metrics
$$\text{Precision} = \frac{TP}{TP + FP}$$
$$\text{Recall} = \frac{TP}{TP + FN}$$
$$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

### Dense Vector Cosine Similarity
$$\cos \theta = \frac{A \cdot B}{\|A\| \|B\|}, \quad \theta = \arccos(\cos \theta) \times \frac{180}{\pi}$$

### Readiness Score Component Weights & Benchmarks

| Component | Weight | Target Benchmark | Role in Score |
| :--- | :---: | :---: | :--- |
| **Required Skills** | **35%** | $\ge 90\%$ | Core mandatory qualification alignment |
| **Project Relevance** | **25%** | $\ge 85\%$ | Degree of skills actively verified in projects |
| **Experience Fit** | **20%** | $\ge 80\%$ | Alignment with required seniority & roles |
| **Education** | **10%** | $100\%$ | Degree and accreditation verification |
| **Bonus / Preferred Skills**| **10%** | $\ge 60\%$ | Secondary differentiator qualifications |

$$\text{Overall Readiness Score} = 0.35 \cdot S_{\text{req}} + 0.25 \cdot S_{\text{proj}} + 0.20 \cdot S_{\text{exp}} + 0.10 \cdot S_{\text{edu}} + 0.10 \cdot S_{\text{bonus}}$$

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.14 on macOS Apple Silicon)
- Node.js 18+ and npm

### 1. One-Click Launch (Backend + Frontend)
From the repository root:
```bash
./start.sh
```
This runs both servers concurrently:
- **Web UI:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Backend:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Manual Launch

#### Backend:
```bash
cd backend
source ../venv/bin/activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Repository Directory Structure

```
aiResumeAnalyser/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── database.py          # SQLite persistence & history tracking
│   │   ├── models/
│   │   │   └── schemas.py           # Pydantic data schemas
│   │   ├── services/
│   │   │   ├── parser.py            # PDF / DOCX parsing & custom NER
│   │   │   ├── job_intelligence.py  # Job description segmentation
│   │   │   ├── matcher.py           # SBERT dense cosine similarity & math model
│   │   │   ├── gap_engine.py        # Anti-hallucination tri-tier verification
│   │   │   ├── question_generator.py# STAR interview question generator
│   │   │   ├── roadmap_compiler.py  # 4-week time-boxed study roadmap compiler
│   │   │   └── sample_data.py       # Pre-configured scope domains (Backend, ML, Full-Stack)
│   │   └── main.py                  # FastAPI REST API application & endpoints
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main presentation layer dashboard
│   │   ├── main.jsx                 # React root entry
│   │   └── index.css                # Tailwind CSS v4 styling & glassmorphism
│   ├── index.html                   # HTML template with typography
│   ├── package.json                 # Node dependencies (React, Lucide, Confetti)
│   └── vite.config.js               # Vite build configuration with API proxy
├── run_backend.sh                   # Backend startup script
├── run_frontend.sh                  # Frontend startup script
├── start.sh                         # Unified concurrent startup script
└── README.md                        # Project documentation
```

---

## 👥 Authors
- **Vansh** (00211503124)
- **Anuj Nautiyal** (05011503124)
- **Faraz Khan** (05411503124)

Department of Information Technology  
Bharati Vidyapeeth's College of Engineering, New Delhi  
Guru Gobind Singh Indraprastha University, Delhi
