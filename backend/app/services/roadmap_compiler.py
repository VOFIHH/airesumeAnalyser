from typing import List
from ..models.schemas import SkillGapItem, RoadmapWeek

RESOURCE_KNOWLEDGE_BASE = {
    "Docker": ["Docker Mastery & Multi-Stage Production Builds", "Dockerizing Python & FastAPI Applications with Healthchecks"],
    "Kubernetes": ["K8s Architecture, Pods, Deployments & Ingress Controllers", "Kubernetes Up and Running (Hands-on MiniKube Lab)"],
    "Kafka": ["Apache Kafka Fundamentals: Topics, Partitions & Consumer Groups", "Event-Driven Microservices with Kafka in Python/Go"],
    "Redis": ["Redis In-Memory Data Structures, Caching Strategies & Rate Limiting", "Distributed Locks and Pub/Sub with Redis"],
    "AWS": ["AWS Cloud Practitioner & Solution Architect Core Services (EC2, S3, RDS, ECS)", "Infrastructure as Code with Terraform on AWS"],
    "FastAPI": ["FastAPI Official Tutorials: Async Def, Dependency Injection, Pydantic V2", "Building Resilient High-Performance Microservices with FastAPI"],
    "PostgreSQL": ["Use The Index, Luke! Database Indexing & Query Tuning", "Designing Normalized Relational Schemas & Connection Pooling in Postgres"],
    "PyTorch": ["Deep Learning with PyTorch: Zero to Mastery", "Building Custom Neural Network Modules and Loss Functions"],
    "Sentence-Transformers": ["Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks", "Semantic Search & Vector Similarity with SBERT & FAISS"],
    "FAISS": ["FAISS: High-Performance Vector Indexing & Nearest Neighbor Search", "Dense Retrieval Pipelines with HuggingFace and FAISS"],
    "CI/CD": ["GitHub Actions Deep Dive: Automated Testing, Linting & Container Deployment", "GitOps and Continuous Delivery Pipelines"],
    "System Design": ["Designing Data-Intensive Applications by Martin Kleppmann", "System Design Primer & High-Scalability Case Studies"],
    "React": ["React.js Official Documentation & Modern Hooks Paradigm", "Building Scalable Component Architectures with TypeScript"],
    "TypeScript": ["TypeScript in 50 Lessons & Strict Type Checking Best Practices", "Typing Asynchronous REST and GraphQL APIs"]
}

def compile_preparation_roadmap(gaps: List[SkillGapItem], job_title: str) -> List[RoadmapWeek]:
    missing_skills = [g.skill for g in gaps if g.tier == "MISSING"]
    surface_skills = [g.skill for g in gaps if g.tier == "SURFACE"]

    # Combine prioritized targets: Missing first, then surface skills needing concrete project proof
    prioritized_targets = missing_skills + surface_skills
    if not prioritized_targets:
        prioritized_targets = ["System Design Patterns", "Advanced Caching with Redis", "Distributed Tracing", "Load Testing"]

    # Chunk into 4 structured sprint weeks
    num_weeks = 4
    roadmap: List[RoadmapWeek] = []

    # Distribute targets
    targets_per_week = [[] for _ in range(num_weeks)]
    for idx, skill in enumerate(prioritized_targets):
        targets_per_week[idx % num_weeks].append(skill)

    # Week 1: Core Fundamentals & Primary Deficits
    w1_skills = targets_per_week[0] or [prioritized_targets[0]]
    w1_resources = []
    for s in w1_skills:
        w1_resources.extend(RESOURCE_KNOWLEDGE_BASE.get(s, [f"Official documentation and production tutorials for {s}"]))

    roadmap.append(RoadmapWeek(
        week_number=1,
        title="Sprint 1: Core Theoretical Foundations & High-Yield Gap Closure",
        focus_skills=w1_skills,
        learning_objectives=[
            f"Master core syntax, lifecycle, and design paradigms of {', '.join(w1_skills)}.",
            "Understand common concurrency and memory management pitfalls.",
            "Complete 10 focused LeetCode/System problem sets demonstrating these principles."
        ],
        practice_project=f"Build an isolated CLI/micro-service demonstrating foundational {', '.join(w1_skills)} mechanics.",
        deliverable="GitHub repository with unit tests achieving >80% code coverage.",
        curated_resources=w1_resources[:3]
    ))

    # Week 2: Architectural Deep Dive & Integration
    w2_skills = targets_per_week[1] or ["Architecture & Caching"]
    w2_resources = []
    for s in w2_skills:
        w2_resources.extend(RESOURCE_KNOWLEDGE_BASE.get(s, [f"Hands-on architectural patterns for {s}"]))

    roadmap.append(RoadmapWeek(
        week_number=2,
        title="Sprint 2: Production Integration & Resilient Architecture",
        focus_skills=w2_skills,
        learning_objectives=[
            f"Integrate {', '.join(w2_skills)} with persistent datastores and async background queues.",
            "Implement health checks, structured logging, and graceful degradation.",
            "Measure and benchmark latency improvements under concurrent load."
        ],
        practice_project=f"Construct an end-to-end service coupling {', '.join(w1_skills[:2])} with {', '.join(w2_skills)}.",
        deliverable="Benchmarked REST/gRPC API with Locust/k6 performance analysis report.",
        curated_resources=w2_resources[:3] or ["Designing Data-Intensive Applications (Storage & Retrieval)"]
    ))

    # Week 3: Surface Skill Proof & Portfolio Project
    w3_skills = targets_per_week[2] or (surface_skills if surface_skills else ["Containerization & CI/CD"])
    w3_resources = []
    for s in w3_skills:
        w3_resources.extend(RESOURCE_KNOWLEDGE_BASE.get(s, [f"Production deployment guides for {s}"]))

    roadmap.append(RoadmapWeek(
        week_number=3,
        title="Sprint 3: Evidence Corroboration & Portfolio Reinforcement",
        focus_skills=w3_skills,
        learning_objectives=[
            f"Transform surface familiarity of {', '.join(w3_skills)} into verified project artifacts.",
            "Containerize the full stack using multi-stage Dockerfiles.",
            "Set up automated CI/CD GitHub Actions pipeline testing all endpoints."
        ],
        practice_project=f"Deploy a production-grade portfolio project addressing target {job_title} duties.",
        deliverable="Live deployed URL with comprehensive README, architectural diagrams, and video walkthrough.",
        curated_resources=w3_resources[:3] or ["Docker & GitHub Actions CI/CD Complete Guide"]
    ))

    # Week 4: System Design, Mock Interviews & STAR Alignment
    w4_skills = targets_per_week[3] or ["System Design & Mock Defense"]
    roadmap.append(RoadmapWeek(
        week_number=4,
        title="Sprint 4: Role-Specific Mock Defense & Behavioral STAR Mastery",
        focus_skills=w4_skills + [job_title],
        learning_objectives=[
            f"Synthesize all {len(prioritized_targets)} addressed skills into high-level system design presentations.",
            "Rehearse STAR responses for all verified projects using the generated interview questions.",
            "Conduct timed mock interviews under technical whiteboard constraints."
        ],
        practice_project=f"Full architecture design document and mock interview defense for {job_title}.",
        deliverable="Recorded 30-minute mock interview defense articulating all project trade-offs.",
        curated_resources=[
            "Grokking Modern System Design for Software Engineers",
            "The STAR Method: Structuring Behavioral Answers for Top Tech Companies",
            "High Scalability: Real-world Architectural Post-Mortems"
        ]
    ))

    return roadmap

