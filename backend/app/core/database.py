import sqlite3
import json
import os
from typing import List, Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "resume_analyser.db")

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                candidate_name TEXT,
                job_title TEXT,
                readiness_score REAL,
                verified_count INTEGER,
                surface_count INTEGER,
                missing_count INTEGER,
                data_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

def save_analysis(analysis_dict: Dict[str, Any]):
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO analyses (
                id, candidate_name, job_title, readiness_score,
                verified_count, surface_count, missing_count, data_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis_dict["id"],
            analysis_dict["candidate_name"],
            analysis_dict["job_title"],
            analysis_dict["score_breakdown"]["overall_readiness_score"],
            analysis_dict["verified_count"],
            analysis_dict["surface_count"],
            analysis_dict["missing_count"],
            json.dumps(analysis_dict),
            analysis_dict["created_at"]
        ))
        conn.commit()

def get_analyses_history(limit: int = 20) -> List[Dict[str, Any]]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, candidate_name, job_title, readiness_score,
                   verified_count, surface_count, missing_count, created_at
            FROM analyses
            ORDER BY created_at DESC
            LIMIT ?
        """, (limit,))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_analysis_by_id(analysis_id: str) -> Optional[Dict[str, Any]]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM analyses WHERE id = ?", (analysis_id,))
        row = cursor.fetchone()
        if row and row[0]:
            return json.loads(row[0])
        return None

