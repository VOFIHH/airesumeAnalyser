import re
from typing import List, Dict, Any
from ..models.schemas import ParsedJobDescription
from .parser import COMMON_SKILLS_TAXONOMY

def parse_job_description(text: str) -> ParsedJobDescription:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    
    # Title extraction
    title = "Software Engineer"
    company = "Target Company"
    if lines:
        first_line = lines[0]
        if len(first_line.split()) <= 7 and not re.search(r'about us|job description|responsibilities', first_line, re.IGNORECASE):
            title = first_line

    title_match = re.search(r'(Full[\s\-]Stack Engineer|Backend Engineer|Frontend Engineer|Machine Learning Engineer|Data Engineer|DevOps Engineer|Software Development Engineer|Python Developer|AI Engineer)', text, re.IGNORECASE)
    if title_match:
        title = title_match.group(0).strip()

    # Experience years
    exp_years = 2.0
    exp_match = re.search(r'(\d+)(?:\+)?\s*(?:-\s*\d+)?\s*(?:years|yrs)\b', text, re.IGNORECASE)
    if exp_match:
        try:
            exp_years = float(exp_match.group(1))
        except ValueError:
            pass

    # Education required
    edu_required = "Bachelor's Degree in Computer Science, IT, or related technical field"
    if re.search(r"master['s]?|m\.tech|m\.s\.", text, re.IGNORECASE):
        edu_required = "Master's or Bachelor's in CS, IT, or quantitative discipline"

    # Split into sections: Required vs Preferred
    required_skills = []
    preferred_skills = []
    domain_skills = []

    text_lower = text.lower()

    # Identify all recognized skills
    found_skills = []
    for cat, skills in COMMON_SKILLS_TAXONOMY.items():
        for s in skills:
            pattern = rf'(?<![a-zA-Z0-9_]){re.escape(s)}(?![a-zA-Z0-9_])'
            if re.search(pattern, text_lower):
                found_skills.append((s.title() if len(s) > 4 else s.upper(), cat))

    # Segment based on "required / must have" vs "preferred / good to have / nice to have"
    pref_section_match = re.search(r'(preferred|nice to have|bonus|good to have|plus points?|desired qualifications?)([\s\S]+)', text_lower)
    preferred_subtext = pref_section_match.group(2) if pref_section_match else ""

    for skill_name, cat in found_skills:
        if preferred_subtext and skill_name.lower() in preferred_subtext:
            if skill_name not in preferred_skills:
                preferred_skills.append(skill_name)
        else:
            if skill_name not in required_skills:
                required_skills.append(skill_name)
        
        if cat in ["Architecture & Core Concepts", "AI, ML & Data Science"]:
            if skill_name not in domain_skills:
                domain_skills.append(skill_name)

    # Fallbacks if text was short
    if not required_skills:
        required_skills = ["Python", "FastAPI", "SQL", "Docker", "Git", "REST APIs"]
    if not preferred_skills:
        preferred_skills = ["Redis", "Kubernetes", "AWS", "CI/CD", "Kafka"]

    # Extract responsibilities
    responsibilities = []
    resp_section = False
    for line in lines:
        if re.search(r'^(responsibilities|what you will do|key duties|role overview)\b', line, re.IGNORECASE):
            resp_section = True
            continue
        elif resp_section and re.search(r'^(requirements|qualifications|skills|about you|benefits)\b', line, re.IGNORECASE):
            resp_section = False
            continue
        if resp_section and line.startswith(('•', '-', '*', '●', '1.', '2.', '3.')):
            cleaned = re.sub(r'^[•\-\*●\s\d\.]+', '', line).strip()
            if len(cleaned) > 10:
                responsibilities.append(cleaned)

    if not responsibilities:
        responsibilities = [
            f"Design, build and maintain resilient production services and APIs for {title}.",
            "Collaborate with cross-functional engineering teams to implement scalable software architecture.",
            "Write clean, modular, and well-tested code following best engineering practices.",
            "Identify performance bottlenecks and optimize database queries and async processing pipelines."
        ]

    return ParsedJobDescription(
        title=title,
        company=company,
        required_skills=sorted(list(set(required_skills))),
        preferred_skills=sorted(list(set(preferred_skills))),
        domain_skills=sorted(list(set(domain_skills))),
        experience_years_required=exp_years,
        education_required=edu_required,
        responsibilities=responsibilities[:6],
        raw_text=text
    )

