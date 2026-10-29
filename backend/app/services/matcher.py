import math
import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from ..models.schemas import (
    ParsedResume, ParsedJobDescription, MathematicalMetrics, 
    ScoreBreakdown, SemanticComparisonItem
)

# Semantic equivalence map to enrich dense vector alignment
SEMANTIC_SYNONYMS = {
    "python rest apis": "fastapi developer",
    "fastapi": "python rest apis",
    "restful apis": "fastapi backend",
    "relational database": "postgresql",
    "postgres": "postgresql",
    "k8s": "kubernetes",
    "docker": "containerization",
    "aws": "cloud infrastructure",
    "gcp": "cloud infrastructure",
    "azure": "cloud infrastructure",
    "sbert": "sentence embeddings",
    "sentence-transformers": "dense vector embeddings",
    "faiss": "vector similarity search",
    "scikit-learn": "machine learning algorithms",
    "nlp": "natural language processing",
    "llm": "generative ai",
    "react": "frontend spa development",
    "react.js": "react",
    "next.js": "react server components",
    "ci/cd": "automated deployment pipelines"
}

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Load lightweight, lightning-fast embedding model
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        except Exception as e:
            print(f"Notice: SBERT model initialization fallback ({e}). Using n-gram semantic vectorizer.")
            _model = False
    return _model

def compute_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    dot = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    val = float(dot / (norm1 * norm2))
    return max(0.0, min(1.0, val))

def compute_semantic_similarity(phrase1: str, phrase2: str) -> float:
    p1 = phrase1.strip().lower()
    p2 = phrase2.strip().lower()

    if p1 == p2:
        return 1.0

    # Known equivalence boost
    if SEMANTIC_SYNONYMS.get(p1) == p2 or SEMANTIC_SYNONYMS.get(p2) == p1:
        return 0.98

    # Check substring containment
    if p1 in p2 or p2 in p1:
        shorter = min(len(p1), len(p2))
        longer = max(len(p1), len(p2))
        return 0.85 + 0.14 * (shorter / longer)

    # Use SBERT if loaded
    model = get_embedding_model()
    if model:
        try:
            embeddings = model.encode([phrase1, phrase2], convert_to_numpy=True)
            return compute_cosine_similarity(embeddings[0], embeddings[1])
        except Exception:
            pass

    # High-fidelity character & subword jaccard/cosine fallback
    set1 = set([p1[i:i+3] for i in range(len(p1)-2)]) | set(p1.split())
    set2 = set([p2[i:i+3] for i in range(len(p2)-2)]) | set(p2.split())
    if not set1 or not set2:
        return 0.0
    intersection = len(set1 & set2)
    union = len(set1 | set2)
    jaccard = intersection / union if union > 0 else 0.0
    return min(1.0, jaccard * 1.5)

def calculate_angle_degrees(cosine_sim: float) -> float:
    clipped = max(-1.0, min(1.0, cosine_sim))
    rad = math.acos(clipped)
    return round(math.degrees(rad), 1)

def run_semantic_matching(
    resume: ParsedResume, 
    job: ParsedJobDescription
) -> Tuple[MathematicalMetrics, ScoreBreakdown, List[SemanticComparisonItem]]:

    job_required = job.required_skills
    job_preferred = job.preferred_skills
    resume_skills = resume.skills

    semantic_comparisons: List[SemanticComparisonItem] = []
    
    # 1. Evaluate Required Skills
    true_positives = 0
    false_negatives = 0
    all_req_sims = []

    for req in job_required:
        best_sim = 0.0
        best_match = ""
        for r_skill in resume_skills:
            sim = compute_semantic_similarity(req, r_skill)
            if sim > best_sim:
                best_sim = sim
                best_match = r_skill

        # Check if project evidence also mentions it
        project_text = " ".join([p.description + " " + " ".join(p.evidence_bullets) for p in resume.projects]).lower()
        if req.lower() in project_text:
            best_sim = max(best_sim, 0.95)
            if not best_match:
                best_match = req

        all_req_sims.append(best_sim)

        angle = calculate_angle_degrees(best_sim)
        status = "Strong Match" if best_sim >= 0.75 else ("Partial Alignment" if best_sim >= 0.45 else "Missing Deficit")
        
        semantic_comparisons.append(SemanticComparisonItem(
            job_phrase=req,
            resume_phrase=best_match if best_match else "None identified",
            cosine_similarity=round(best_sim, 3),
            angle_degrees=angle,
            match_status=status
        ))

        if best_sim >= 0.65:
            true_positives += 1
        else:
            false_negatives += 1

    # False positives: resume skills not required or preferred by job
    false_positives = 0
    for r_skill in resume_skills:
        req_match = any(compute_semantic_similarity(r_skill, req) >= 0.65 for req in job_required)
        pref_match = any(compute_semantic_similarity(r_skill, pref) >= 0.65 for pref in job_preferred)
        if not req_match and not pref_match:
            false_positives += 1

    # Mathematical Metrics calculation
    precision = (true_positives / (true_positives + false_positives)) if (true_positives + false_positives) > 0 else 0.0
    recall = (true_positives / (true_positives + false_negatives)) if (true_positives + false_negatives) > 0 else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) > 0 else 0.0
    avg_cosine = float(np.mean(all_req_sims)) if all_req_sims else 0.0

    math_metrics = MathematicalMetrics(
        precision=round(precision, 3),
        recall=round(recall, 3),
        f1_score=round(f1, 3),
        average_cosine_similarity=round(avg_cosine, 3),
        true_positives=true_positives,
        false_positives=false_positives,
        false_negatives=false_negatives
    )

    # 2. Score Breakdown based on deck weights (Slide 8):
    # Required Skills (Weight 35%, Benchmark >= 90%)
    req_score = round(min(100.0, (true_positives / max(1, len(job_required))) * 100.0), 1)

    # Project Relevance (Weight 25%, Benchmark >= 85%)
    # Measured by how many required and domain skills are actively deployed in resume projects
    all_project_tech = set()
    for p in resume.projects:
        for t in p.technologies:
            all_project_tech.add(t.lower())
    
    project_matches = sum(1 for req in job_required if any(compute_semantic_similarity(req, t) >= 0.7 for t in all_project_tech))
    proj_score = round(min(100.0, (project_matches / max(1, len(job_required))) * 100.0 + (10.0 if len(resume.projects) >= 2 else 0.0)), 1)
    proj_score = min(100.0, max(20.0, proj_score))

    # Experience Fit (Weight 20%, Benchmark >= 80%)
    # Base estimated experience
    exp_count = len(resume.experience)
    exp_score = 90.0 if exp_count >= 2 else (75.0 if exp_count == 1 else 65.0)

    # Education (Weight 10%, Benchmark = 100%)
    edu_score = 100.0 if resume.education else 70.0

    # Bonus / Preferred Skills (Weight 10%, Benchmark >= 60%)
    pref_matches = 0
    for pref in job_preferred:
        if any(compute_semantic_similarity(pref, r_skill) >= 0.65 for r_skill in resume_skills):
            pref_matches += 1
    pref_score = round(min(100.0, (pref_matches / max(1, len(job_preferred))) * 100.0), 1)

    # Overall Weighted Readiness Score:
    # 0.35 * req + 0.25 * proj + 0.20 * exp + 0.10 * edu + 0.10 * bonus
    overall_readiness = (
        0.35 * req_score +
        0.25 * proj_score +
        0.20 * exp_score +
        0.10 * edu_score +
        0.10 * pref_score
    )

    score_breakdown = ScoreBreakdown(
        required_skills_score=req_score,
        project_relevance_score=proj_score,
        experience_fit_score=exp_score,
        education_score=edu_score,
        bonus_skills_score=pref_score,
        overall_readiness_score=round(overall_readiness, 1)
    )

    return math_metrics, score_breakdown, semantic_comparisons

