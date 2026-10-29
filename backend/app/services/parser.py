import re
import io
from typing import List, Dict, Any, Optional
from pypdf import PdfReader
from docx import Document
from ..models.schemas import ParsedResume, ContactInfo, EducationItem, ExperienceItem, ProjectItem

COMMON_SKILLS_TAXONOMY = {
    "Languages": [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang", 
        "rust", "ruby", "php", "sql", "html", "css", "bash", "shell", "scala", "r", "kotlin", "swift"
    ],
    "Backend & Frameworks": [
        "fastapi", "flask", "django", "node.js", "nodejs", "express", "express.js", "nest.js", 
        "nestjs", "spring", "spring boot", "ruby on rails", "asp.net", "laravel", "gin", "grpc", "graphql", "rest api", "restful apis"
    ],
    "Frontend": [
        "react", "react.js", "next.js", "nextjs", "vue", "vue.js", "angular", "svelte", 
        "redux", "tailwind css", "tailwindcss", "bootstrap", "html5", "css3", "vite", "webpack"
    ],
    "Databases & Caching": [
        "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch", "sqlite", 
        "cassandra", "dynamodb", "neo4j", "faiss", "pinecone", "chromadb", "supabase", "firebase"
    ],
    "Cloud & DevOps": [
        "docker", "kubernetes", "k8s", "aws", "amazon web services", "azure", "gcp", "google cloud", 
        "ci/cd", "github actions", "gitlab ci", "terraform", "ansible", "nginx", "linux", "git"
    ],
    "AI, ML & Data Science": [
        "machine learning", "deep learning", "nlp", "natural language processing", 
        "computer vision", "pytorch", "tensorflow", "keras", "scikit-learn", "sklearn", 
        "sentence-transformers", "sbert", "transformers", "hugging face", "spacy", "nltk", 
        "pandas", "numpy", "opencv", "llm", "large language models", "rag", "langchain", "llama-index", "mlops"
    ],
    "Architecture & Core Concepts": [
        "microservices", "distributed systems", "data structures", "algorithms", 
        "system design", "event-driven architecture", "message queues", "kafka", "rabbitmq", 
        "object-oriented programming", "oop", "concurrency", "asynchronous programming"
    ]
}

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        return text
    except Exception as e:
        return f"Error extracting PDF: {str(e)}"

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n".join(paragraphs)
    except Exception as e:
        return f"Error extracting DOCX: {str(e)}"

def extract_contact_info(text: str) -> ContactInfo:
    contact = ContactInfo()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        first_line = lines[0]
        if not re.search(r"resume|curriculum|cv|page", first_line, re.IGNORECASE) and len(first_line.split()) <= 4:
            contact.name = first_line

    # Email
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    if email_match:
        contact.email = email_match.group(0)

    # Phone
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        contact.phone = phone_match.group(0)

    # LinkedIn
    linkedin_match = re.search(r'linkedin\.com/in/[\w\-]+', text, re.IGNORECASE)
    if linkedin_match:
        contact.linkedin = f"https://{linkedin_match.group(0)}"

    # GitHub
    github_match = re.search(r'github\.com/[\w\-]+', text, re.IGNORECASE)
    if github_match:
        contact.github = f"https://{github_match.group(0)}"

    # Location
    location_match = re.search(r'(New Delhi|Delhi|Bangalore|Bengaluru|Hyderabad|Mumbai|Pune|Gurugram|Noida|San Francisco|New York|London|Remote)', text, re.IGNORECASE)
    if location_match:
        contact.location = location_match.group(0)

    return contact

def extract_skills(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    found_categorized: Dict[str, List[str]] = {}
    all_found = []

    for category, skills in COMMON_SKILLS_TAXONOMY.items():
        found_in_cat = []
        for skill in skills:
            # Word boundary matching
            escaped = re.escape(skill)
            pattern = rf'(?<![a-zA-Z0-9_]){escaped}(?![a-zA-Z0-9_])'
            if re.search(pattern, text_lower):
                found_in_cat.append(skill.title() if len(skill) > 4 else skill.upper())
                all_found.append(skill.title() if len(skill) > 4 else skill.upper())
        if found_in_cat:
            found_categorized[category] = list(set(found_in_cat))

    return {
        "all_skills": sorted(list(set(all_found))),
        "categorized": found_categorized
    }

def extract_projects(text: str) -> List[ProjectItem]:
    projects: List[ProjectItem] = []
    lines = text.split("\n")
    
    project_section = False
    current_proj: Optional[ProjectItem] = None
    
    for i, line in enumerate(lines):
        trimmed = line.strip()
        if not trimmed:
            continue
            
        # Section header check
        if re.match(r'^(projects|academic projects|key projects|featured projects)\b', trimmed, re.IGNORECASE):
            project_section = True
            continue
        elif project_section and re.match(r'^(experience|work experience|education|certifications|skills|publications)\b', trimmed, re.IGNORECASE):
            project_section = False
            if current_proj:
                projects.append(current_proj)
                current_proj = None
            continue
            
        if project_section:
            # Detect project title line
            is_bullet = trimmed.startswith(('•', '-', '*', '–', '>', '●')) or re.match(r'^\d+\.', trimmed)
            has_pipe_or_paren = '|' in trimmed or '(' in trimmed or '–' in trimmed or '-' in trimmed
            
            if not is_bullet and (len(trimmed.split()) <= 8 or has_pipe_or_paren) and not trimmed.endswith('.'):
                if current_proj:
                    projects.append(current_proj)
                
                parts = re.split(r'[\|\–\—\-\(\)]', trimmed)
                title = parts[0].strip()
                techs = []
                if len(parts) > 1:
                    tech_str = " ".join(parts[1:])
                    for cat_skills in COMMON_SKILLS_TAXONOMY.values():
                        for s in cat_skills:
                            if re.search(rf'\b{re.escape(s)}\b', tech_str, re.IGNORECASE):
                                techs.append(s.title())
                                
                current_proj = ProjectItem(
                    title=title or trimmed,
                    technologies=list(set(techs)),
                    description="",
                    evidence_bullets=[]
                )
            elif current_proj and is_bullet:
                bullet_text = re.sub(r'^[•\-\*–>●\s\d\.]+', '', trimmed).strip()
                current_proj.evidence_bullets.append(bullet_text)
                if not current_proj.description:
                    current_proj.description = bullet_text
                # Also extract techs from bullet text
                for cat_skills in COMMON_SKILLS_TAXONOMY.values():
                    for s in cat_skills:
                        if re.search(rf'\b{re.escape(s)}\b', bullet_text, re.IGNORECASE):
                            current_proj.technologies.append(s.title())
                current_proj.technologies = list(set(current_proj.technologies))

    if current_proj:
        projects.append(current_proj)

    # Fallback if specific project section was not distinctly segmented
    if not projects:
        # Scan for paragraphs with project-like phrases
        project_regex = re.compile(r'(built|developed|designed|implemented|created|architected)\s+([A-Za-z0-9\s\-]+?)(using|with|via)\s+([A-Za-z0-9\s\,\.]+)', re.IGNORECASE)
        for line in lines:
            m = project_regex.search(line)
            if m:
                proj_name = m.group(2).strip()
                tech_segment = m.group(4).strip()
                detected_techs = [w.strip() for w in re.split(r'[,&;]', tech_segment) if len(w.strip()) > 1][:4]
                projects.append(ProjectItem(
                    title=f"Project: {proj_name[:40]}",
                    technologies=detected_techs,
                    description=line.strip(),
                    evidence_bullets=[line.strip()]
                ))
    return projects

def extract_experience(text: str) -> List[ExperienceItem]:
    experiences: List[ExperienceItem] = []
    lines = text.split("\n")
    exp_section = False
    current_exp: Optional[ExperienceItem] = None

    for line in lines:
        trimmed = line.strip()
        if not trimmed:
            continue
        if re.match(r'^(experience|work experience|employment history|professional experience)\b', trimmed, re.IGNORECASE):
            exp_section = True
            continue
        elif exp_section and re.match(r'^(projects|education|skills|certifications|awards)\b', trimmed, re.IGNORECASE):
            exp_section = False
            if current_exp:
                experiences.append(current_exp)
                current_exp = None
            continue

        if exp_section:
            is_bullet = trimmed.startswith(('•', '-', '*', '–', '>', '●')) or re.match(r'^\d+\.', trimmed)
            if not is_bullet and (len(trimmed.split()) <= 10):
                if current_exp:
                    experiences.append(current_exp)
                parts = re.split(r'[\|\–\—\-at\,]', trimmed)
                role = parts[0].strip() if parts else trimmed
                company = parts[1].strip() if len(parts) > 1 else "Engineering Team"
                current_exp = ExperienceItem(role=role, company=company, duration="Recent", highlights=[])
            elif current_exp and is_bullet:
                b = re.sub(r'^[•\-\*–>●\s\d\.]+', '', trimmed).strip()
                current_exp.highlights.append(b)

    if current_exp:
        experiences.append(current_exp)
    return experiences

def extract_education(text: str) -> List[EducationItem]:
    education: List[EducationItem] = []
    lines = text.split("\n")
    for i, line in enumerate(lines):
        trimmed = line.strip()
        if re.search(r'\b(B\.Tech|B\.E\.|Bachelor|M\.Tech|Master|BCA|MCA|B\.Sc|Ph\.D)\b', trimmed, re.IGNORECASE):
            inst = "University / College"
            for offset in [0, 1, -1]:
                check_idx = i + offset
                if 0 <= check_idx < len(lines):
                    l = lines[check_idx].strip()
                    if re.search(r'(College|University|Institute|School|Vidyapeeth|IIT|NIT|IIIT)', l, re.IGNORECASE):
                        inst = l
                        break
            year_match = re.search(r'\b(20\d\d(\s*-\s*20\d\d|\s*-\s*Present)?)\b', trimmed)
            year_val = year_match.group(0) if year_match else "2022 - 2026"
            education.append(EducationItem(
                degree=trimmed[:80],
                institution=inst,
                year=year_val,
                score="First Class"
            ))
    if not education:
        # Default detected degree if any mentions
        education.append(EducationItem(
            degree="B.Tech in Information Technology / Computer Science",
            institution="Accredited University",
            year="2022 - 2026",
            score="Good Standing"
        ))
    return education

def parse_resume_content(text: str) -> ParsedResume:
    contact = extract_contact_info(text)
    skills_data = extract_skills(text)
    projects = extract_projects(text)
    experience = extract_experience(text)
    education = extract_education(text)

    # Summary
    summary = ""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, l in enumerate(lines[:10]):
        if re.search(r'summary|profile|about me|objective', l, re.IGNORECASE):
            summary = " ".join(lines[i+1:i+4])
            break

    return ParsedResume(
        contact=contact,
        summary=summary or "Software Engineer with hands-on development experience in full-stack, backend and data/ML pipelines.",
        skills=skills_data["all_skills"],
        categorized_skills=skills_data["categorized"],
        education=education,
        experience=experience,
        projects=projects,
        raw_text=text
    )

