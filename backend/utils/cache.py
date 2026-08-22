import json
from datetime import datetime, timedelta
from utils.db import get_connection as _connect

CACHE_TTL_MINUTES = 30


def init_db():
    conn = _connect()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS search_cache (
            query TEXT NOT NULL,
            type TEXT NOT NULL,
            result TEXT NOT NULL,
            created_at TEXT NOT NULL,
            PRIMARY KEY (query, type)
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query TEXT NOT NULL,
            type TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def get_cached(query: str, qtype: str):
    conn = _connect()
    row = conn.execute(
        "SELECT result, created_at FROM search_cache WHERE query = ? AND type = ?",
        (query, qtype)
    ).fetchone()
    conn.close()
    if not row:
        return None
    created_at = datetime.fromisoformat(row["created_at"])
    if datetime.utcnow() - created_at > timedelta(minutes=CACHE_TTL_MINUTES):
        return None
    return json.loads(row["result"])


def set_cache(query: str, qtype: str, result: dict):
    conn = _connect()
    conn.execute(
        "INSERT OR REPLACE INTO search_cache (query, type, result, created_at) VALUES (?, ?, ?, ?)",
        (query, qtype, json.dumps(result), datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()


def log_history(query: str, qtype: str):
    conn = _connect()
    conn.execute(
        "INSERT INTO search_history (query, type, created_at) VALUES (?, ?, ?)",
        (query, qtype, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()


def get_history(limit: int = 50):
    conn = _connect()
    rows = conn.execute(
        "SELECT query, type, created_at FROM search_history ORDER BY id DESC LIMIT ?",
        (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_stats(recent_limit: int = 10):
    conn = _connect()
    cache_rows = conn.execute("SELECT COUNT(*) AS n FROM search_cache").fetchone()["n"]
    history_rows = conn.execute("SELECT COUNT(*) AS n FROM search_history").fetchone()["n"]
    recent = conn.execute(
        "SELECT query, type, created_at FROM search_history ORDER BY id DESC LIMIT ?",
        (recent_limit,)
    ).fetchall()
    conn.close()
    return {
        "db": "online",
        "tables": [
            {"name": "search_cache", "rows": cache_rows},
            {"name": "search_history", "rows": history_rows},
        ],
        "recent": [
            {"type": r["type"], "query": r["query"], "at": r["created_at"]}
            for r in recent
        ],
    }
