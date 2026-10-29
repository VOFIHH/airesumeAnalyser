import uuid
from typing import List
from ..models.schemas import ParsedResume, ParsedJobDescription, SkillGapItem, InterviewQuestion

def generate_interview_questions(
    resume: ParsedResume, 
    job: ParsedJobDescription, 
    gaps: List[SkillGapItem]
) -> List[InterviewQuestion]:
    questions: List[InterviewQuestion] = []
    
    verified_skills = [g.skill for g in gaps if g.tier == "VERIFIED"]
    surface_skills = [g.skill for g in gaps if g.tier == "SURFACE"]
    
    # 1. Project-Grounded Architectural Questions (VERIFIED tier only)
    for i, proj in enumerate(resume.projects[:3]):
        tech_list = ", ".join(proj.technologies[:4]) or "the chosen stack"
        bullet_sample = proj.evidence_bullets[0] if proj.evidence_bullets else proj.description
        
        # Arch question
        questions.append(InterviewQuestion(
            id=str(uuid.uuid4())[:8],
            type="project_deepdive",
            category="System Architecture & Implementation",
            target_project_or_skill=proj.title,
            evidence_tier="VERIFIED",
            question=f"In your project '{proj.title}' utilizing {tech_list}, walk us through how you architected the system to handle data flow and concurrency. What specific technical trade-offs did you make when selecting these technologies?",
            context=f"Anchored in your resume project '{proj.title}' and statement: \"{bullet_sample[:120]}...\"",
            evaluation_criteria=[
                "Clarity in justifying architectural choices vs alternative solutions",
                "Knowledge of potential bottlenecks (I/O, database connections, API latency)",
                "Hands-on depth rather than theoretical recitation"
            ],
            suggested_star_guidance={
                "Situation": f"Context behind building {proj.title} and the scale/user needs.",
                "Task": "The specific performance, reliability or architectural goal you owned.",
                "Action": f"How you configured {tech_list}, structured modules, and addressed data consistency.",
                "Result": "Measurable throughput, response times, or operational outcome achieved."
            }
        ))

        # Failure / Bottleneck probe
        questions.append(InterviewQuestion(
            id=str(uuid.uuid4())[:8],
            type="behavioral_star",
            category="Debugging & Technical Obstacles (STAR)",
            target_project_or_skill=proj.title,
            evidence_tier="VERIFIED",
            question=f"Describe the most demanding production bug, memory leak, or integration issue you encountered while engineering '{proj.title}'. How did you isolate root cause and verify the fix?",
            context=f"Project verification anchor: Candidate has concrete code logs in {proj.title}.",
            evaluation_criteria=[
                "Methodical debugging approach (profiling, logs, telemetry)",
                "Root cause analysis depth",
                "Implementation of regression prevention"
            ],
            suggested_star_guidance={
                "Situation": f"Specific bug or unexpected breakdown during development of {proj.title}.",
                "Task": "Diagnosing why the service degraded or failed tests under load.",
                "Action": "Tools used (e.g. APM, logging, unit tests) and steps taken to remediate.",
                "Result": "Zero crash rate, improved latency, and added CI test coverage."
            }
        ))

    # 2. Domain / System Design Scenario linked to Job Title
    target_role = job.title or "Backend Engineer"
    primary_verified = verified_skills[:3] if verified_skills else ["FastAPI", "PostgreSQL", "Docker"]
    questions.append(InterviewQuestion(
        id=str(uuid.uuid4())[:8],
        type="system_design",
        category="Target Role System Design",
        target_project_or_skill=f"{target_role} Architecture",
        evidence_tier="VERIFIED",
        question=f"As a {target_role}, how would you design an end-to-end distributed system incorporating {', '.join(primary_verified)} to serve 50,000 active concurrent requests with sub-100ms P99 latency?",
        context=f"Evaluates candidate's verified stack mastery applied to real {target_role} expectations at {job.company}.",
        evaluation_criteria=[
            "Data modeling and horizontal partitioning / indexing strategy",
            "Caching tiers (Redis / local memory) and cache invalidation policies",
            "Resilience patterns: circuit breakers, rate limiting, and graceful degradation"
        ],
        suggested_star_guidance=None
    ))

    # 3. Surface Skills Probe Challenges (Challenge Questions for SURFACE skills)
    for s_skill in surface_skills[:2]:
        questions.append(InterviewQuestion(
            id=str(uuid.uuid4())[:8],
            type="skill_probe",
            category="Surface Skill Verification Challenge",
            target_project_or_skill=s_skill,
            evidence_tier="SURFACE",
            question=f"You listed '{s_skill}' on your resume, but lack an explicit project bullet point detailing its implementation. Can you walk us through a production problem you solved with {s_skill}, including internal mechanics and configuration pitfalls?",
            context=f"Anti-Hallucination Flag: '{s_skill}' is listed in skills taxonomy without project corroboration.",
            evaluation_criteria=[
                "Candidate's ability to articulate hands-on experience vs superficial familiarity",
                "Familiarity with core APIs, edge cases, and configuration nuances",
                "Ability to substantiate how this skill translates to the target role"
            ],
            suggested_star_guidance={
                "Situation": f"Where and when you applied {s_skill}.",
                "Task": f"Specific responsibility that demanded {s_skill}.",
                "Action": "Concrete commands, code structures, or algorithms configured.",
                "Result": "Delivery outcome and key lessons learned."
            }
        ))

    return questions

