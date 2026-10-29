import re
from typing import List, Tuple
from ..models.schemas import ParsedResume, ParsedJobDescription, SkillGapItem
from .matcher import compute_semantic_similarity

def evaluate_tri_tier_gaps(
    resume: ParsedResume, 
    job: ParsedJobDescription
) -> Tuple[List[SkillGapItem], int, int, int]:
    """
    Implements the Anti-Hallucination Safeguard: Tri-Tier Evidence Framework:
    - VERIFIED: Backed by concrete projects or employment logs (Included in interview questions)
    - SURFACE: Listed in the skills section without supporting context (Flagged — needs project evidence)
    - MISSING: Required by the job description but absent (Added to preparation study plan)
    """
    gaps: List[SkillGapItem] = []
    
    # Pre-index project and work experience text
    project_corpus = []
    for proj in resume.projects:
        bullets = " ".join(proj.evidence_bullets)
        techs = " ".join(proj.technologies)
        project_corpus.append((proj.title, f"{proj.title} {techs} {proj.description} {bullets}".lower()))

    experience_corpus = []
    for exp in resume.experience:
        highlights = " ".join(exp.highlights)
        experience_corpus.append((f"{exp.role} at {exp.company}", f"{exp.role} {exp.company} {highlights}".lower()))

    # Combine required and preferred skills
    all_target_skills = []
    for s in job.required_skills:
        all_target_skills.append((s, True))  # required
    for s in job.preferred_skills:
        if s not in job.required_skills:
            all_target_skills.append((s, False))  # preferred

    verified_count = 0
    surface_count = 0
    missing_count = 0

    for skill, is_required in all_target_skills:
        # Check matching in skills list
        best_skill_sim = 0.0
        matched_resume_skill = None
        for r_skill in resume.skills:
            sim = compute_semantic_similarity(skill, r_skill)
            if sim > best_skill_sim:
                best_skill_sim = sim
                matched_resume_skill = r_skill

        # Search for concrete project evidence
        found_project_title = None
        for title, p_text in project_corpus:
            escaped = re.escape(skill.lower())
            if re.search(rf'\b{escaped}\b', p_text) or compute_semantic_similarity(skill, title) >= 0.7:
                found_project_title = f"Project: {title}"
                break

        # Search for work experience evidence
        found_exp_title = None
        if not found_project_title:
            for exp_title, exp_text in experience_corpus:
                escaped = re.escape(skill.lower())
                if re.search(rf'\b{escaped}\b', exp_text):
                    found_exp_title = f"Work Experience: {exp_title}"
                    break

        evidence_anchor = found_project_title or found_exp_title

        # Determine Tier
        if evidence_anchor:
            tier = "VERIFIED"
            verified_count += 1
            rationale = f"Corroborated by concrete implementation logs in {evidence_anchor}."
            action_item = "Included in targeted technical and architectural interview questions."
        elif best_skill_sim >= 0.65:
            tier = "SURFACE"
            surface_count += 1
            rationale = f"Mentioned in skills taxonomy ({matched_resume_skill}) but lacks concrete project or work history evidence."
            action_item = "Flagged — add a portfolio project or quantifiable metric demonstrating production usage."
        else:
            tier = "MISSING"
            missing_count += 1
            rationale = "Required by target job specification but entirely absent from resume and project evidence."
            action_item = "Prioritized into your tailored time-boxed preparation roadmap."

        gaps.append(SkillGapItem(
            skill=skill,
            tier=tier,
            similarity_score=round(max(best_skill_sim, 0.95 if evidence_anchor else 0.0), 3),
            matched_resume_skill=matched_resume_skill or (skill if evidence_anchor else None),
            evidence_source=evidence_anchor if evidence_anchor else ("Skills section only" if tier == "SURFACE" else "None"),
            rationale=rationale,
            action_item=action_item
        ))

    return gaps, verified_count, surface_count, missing_count

