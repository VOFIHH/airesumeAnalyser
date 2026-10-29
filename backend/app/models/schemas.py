from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class ContactInfo(BaseModel):
    name: Optional[str] = "Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None

class EducationItem(BaseModel):
    degree: str
    institution: str
    year: Optional[str] = None
    score: Optional[str] = None

class ExperienceItem(BaseModel):
    role: str
    company: str
    duration: Optional[str] = None
    highlights: List[str] = []

class ProjectItem(BaseModel):
    title: str
    technologies: List[str] = []
    description: str = ""
    evidence_bullets: List[str] = []

class ParsedResume(BaseModel):
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: Optional[str] = ""
    skills: List[str] = []
    categorized_skills: Dict[str, List[str]] = Field(default_factory=dict)
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    projects: List[ProjectItem] = []
    raw_text: str = ""

class ParsedJobDescription(BaseModel):
    title: str = "Target Role"
    company: Optional[str] = "Target Company"
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    domain_skills: List[str] = []
    experience_years_required: float = 0.0
    education_required: str = "Bachelor's Degree in Computer Science or related field"
    responsibilities: List[str] = []
    raw_text: str = ""

class SkillGapItem(BaseModel):
    skill: str
    tier: str  # VERIFIED, SURFACE, MISSING
    similarity_score: float = 0.0
    matched_resume_skill: Optional[str] = None
    evidence_source: Optional[str] = None  # e.g., "Project: AI Resume Analyzer" or "Not Found"
    rationale: str
    action_item: str

class MathematicalMetrics(BaseModel):
    precision: float = 0.0
    recall: float = 0.0
    f1_score: float = 0.0
    average_cosine_similarity: float = 0.0
    true_positives: int = 0
    false_positives: int = 0
    false_negatives: int = 0

class ScoreBreakdown(BaseModel):
    required_skills_score: float  # Weight: 35%
    required_skills_benchmark: float = 90.0
    project_relevance_score: float  # Weight: 25%
    project_relevance_benchmark: float = 85.0
    experience_fit_score: float  # Weight: 20%
    experience_fit_benchmark: float = 80.0
    education_score: float  # Weight: 10%
    education_benchmark: float = 100.0
    bonus_skills_score: float  # Weight: 10%
    bonus_skills_benchmark: float = 60.0
    overall_readiness_score: float

class SemanticComparisonItem(BaseModel):
    job_phrase: str
    resume_phrase: str
    cosine_similarity: float
    angle_degrees: float
    match_status: str

class InterviewQuestion(BaseModel):
    id: str
    type: str  # "project_deepdive", "behavioral_star", "system_design", "skill_probe"
    category: str
    target_project_or_skill: str
    evidence_tier: str  # VERIFIED or SURFACE
    question: str
    context: str
    evaluation_criteria: List[str]
    suggested_star_guidance: Optional[Dict[str, str]] = None

class RoadmapWeek(BaseModel):
    week_number: int
    title: str
    focus_skills: List[str]
    learning_objectives: List[str]
    practice_project: str
    deliverable: str
    curated_resources: List[str]

class AnalysisResponse(BaseModel):
    id: str
    candidate_name: str
    job_title: str
    parsed_resume: ParsedResume
    parsed_job: ParsedJobDescription
    tri_tier_gaps: List[SkillGapItem]
    verified_count: int
    surface_count: int
    missing_count: int
    mathematical_metrics: MathematicalMetrics
    score_breakdown: ScoreBreakdown
    semantic_comparisons: List[SemanticComparisonItem]
    interview_questions: List[InterviewQuestion]
    roadmap: List[RoadmapWeek]
    created_at: str

class AnalyzeRequest(BaseModel):
    resume_text: Optional[str] = None
    job_text: Optional[str] = None
    domain: Optional[str] = None

