import uuid
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from .models.schemas import (
    AnalysisResponse, AnalyzeRequest, ParsedResume, 
    ParsedJobDescription, MathematicalMetrics, ScoreBreakdown
)
from .core.database import init_db, save_analysis, get_analyses_history, get_analysis_by_id
from .services.parser import (
    extract_text_from_pdf, extract_text_from_docx, parse_resume_content
)
from .services.job_intelligence import parse_job_description
from .services.matcher import run_semantic_matching
from .services.gap_engine import evaluate_tri_tier_gaps
from .services.question_generator import generate_interview_questions
from .services.roadmap_compiler import compile_preparation_roadmap
from .services.sample_data import SAMPLE_DOMAINS

app = FastAPI(
    title="AI-Powered Resume Analysis & Interview Preparation System API",
    description="Microservice REST API for semantic resume analysis, tri-tier evidence verification, and project-grounded interview prep.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Resume Analyser API",
        "timestamp": datetime.now().isoformat(),
        "team": ["Vansh (00211503124)", "Anuj Nautiyal (05011503124)", "Faraz Khan (05411503124)"],
        "institution": "Bharati Vidyapeeth's College of Engineering, New Delhi"
    }

@app.get("/api/sample-data")
def get_sample_domains():
    return SAMPLE_DOMAINS

@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_resume_endpoint(
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    job_file: Optional[UploadFile] = File(None),
    job_text: Optional[str] = Form(None),
    domain_choice: Optional[str] = Form(None)
):
    # Determine Resume Text
    final_resume_text = ""
    if resume_file:
        content = await resume_file.read()
        filename = resume_file.filename.lower()
        if filename.endswith(".pdf"):
            final_resume_text = extract_text_from_pdf(content)
        elif filename.endswith(".docx"):
            final_resume_text = extract_text_from_docx(content)
        else:
            final_resume_text = content.decode("utf-8", errors="ignore")
    elif resume_text and resume_text.strip():
        final_resume_text = resume_text.strip()
    elif domain_choice and domain_choice in SAMPLE_DOMAINS:
        final_resume_text = SAMPLE_DOMAINS[domain_choice]["resume_text"]
    else:
        # Default fallback to backend demo
        final_resume_text = SAMPLE_DOMAINS["backend"]["resume_text"]

    # Determine Job Description Text
    final_job_text = ""
    if job_file:
        j_content = await job_file.read()
        j_filename = job_file.filename.lower()
        if j_filename.endswith(".pdf"):
            final_job_text = extract_text_from_pdf(j_content)
        elif j_filename.endswith(".docx"):
            final_job_text = extract_text_from_docx(j_content)
        else:
            final_job_text = j_content.decode("utf-8", errors="ignore")
    elif job_text and job_text.strip():
        final_job_text = job_text.strip()
    elif domain_choice and domain_choice in SAMPLE_DOMAINS:
        final_job_text = SAMPLE_DOMAINS[domain_choice]["job_text"]
    else:
        final_job_text = SAMPLE_DOMAINS["backend"]["job_text"]

    if not final_resume_text.strip() or not final_job_text.strip():
        raise HTTPException(status_code=400, detail="Both resume content and job description content must be provided.")

    # 1. Parse Resume
    parsed_resume = parse_resume_content(final_resume_text)

    # 2. Parse Job Description
    parsed_job = parse_job_description(final_job_text)

    # 3. Dense Vector Semantic Matching & Mathematical Metrics
    math_metrics, score_breakdown, semantic_comparisons = run_semantic_matching(parsed_resume, parsed_job)

    # 4. Anti-Hallucination Tri-Tier Evidentiary Gap Analysis
    tri_tier_gaps, verified_c, surface_c, missing_c = evaluate_tri_tier_gaps(parsed_resume, parsed_job)

    # 5. Project-Grounded Interview Question Generation
    interview_questions = generate_interview_questions(parsed_resume, parsed_job, tri_tier_gaps)

    # 6. Prioritized Time-Boxed Preparation Roadmap
    roadmap = compile_preparation_roadmap(tri_tier_gaps, parsed_job.title)

    analysis_id = str(uuid.uuid4())
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    response_payload = AnalysisResponse(
        id=analysis_id,
        candidate_name=parsed_resume.contact.name or "Candidate",
        job_title=parsed_job.title,
        parsed_resume=parsed_resume,
        parsed_job=parsed_job,
        tri_tier_gaps=tri_tier_gaps,
        verified_count=verified_c,
        surface_count=surface_c,
        missing_count=missing_c,
        mathematical_metrics=math_metrics,
        score_breakdown=score_breakdown,
        semantic_comparisons=semantic_comparisons,
        interview_questions=interview_questions,
        roadmap=roadmap,
        created_at=created_at
    )

    # Persist in SQLite
    try:
        save_analysis(response_payload.dict())
    except Exception as e:
        print(f"Database save warning: {e}")

    return response_payload

@app.get("/api/history")
def list_history():
    return get_analyses_history(limit=25)

@app.get("/api/history/{analysis_id}")
def get_history_detail(analysis_id: str):
    record = get_analysis_by_id(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
    return record

