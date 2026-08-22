import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta
from utils.db import get_connection

SESSION_TTL_DAYS = 7
PBKDF2_ITERATIONS = 200_000


def init_auth_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            email TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    _seed_admins()


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return salt.hex() + ":" + dk.hex()


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, hash_hex = stored.split(":")
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
    except (ValueError, AttributeError):
        return False
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return hmac.compare_digest(dk, expected)


def _seed_admins():
    seed = os.getenv("ADMIN_SEED", "")
    if not seed:
        return
    conn = get_connection()
    for entry in seed.split(","):
        parts = entry.strip().split(":")
        if len(parts) != 3:
            continue
        email, password, name = (p.strip() for p in parts)
        email = email.lower()
        conn.execute(
            "INSERT OR IGNORE INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)",
            (email, name, hash_password(password), datetime.utcnow().isoformat())
        )
    conn.commit()
    conn.close()


def get_user(email: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(name: str, email: str, password: str, role: str = "client"):
    conn = get_connection()
    conn.execute(
        "INSERT INTO users (email, name, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
        (email.lower(), name, hash_password(password), role, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()


def update_user(email: str, patch: dict):
    user = get_user(email)
    if not user:
        return
    new_email = patch.get("email", user["email"]).lower()
    new_name = patch.get("name", user["name"])
    new_hash = hash_password(patch["password"]) if patch.get("password") else user["password_hash"]
    conn = get_connection()
    conn.execute(
        "UPDATE users SET email = ?, name = ?, password_hash = ? WHERE email = ?",
        (new_email, new_name, new_hash, user["email"])
    )
    if new_email != user["email"]:
        conn.execute("UPDATE sessions SET email = ? WHERE email = ?", (new_email, user["email"]))
    conn.commit()
    conn.close()


def delete_user(email: str):
    conn = get_connection()
    conn.execute("DELETE FROM users WHERE email = ? AND role != 'admin'", (email.lower(),))
    conn.execute("DELETE FROM sessions WHERE email = ?", (email.lower(),))
    conn.commit()
    conn.close()


def list_client_accounts():
    conn = get_connection()
    rows = conn.execute(
        "SELECT name, email, created_at FROM users WHERE role = 'client' ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_session(email: str, role: str) -> str:
    token = secrets.token_hex(32)
    now = datetime.utcnow()
    conn = get_connection()
    conn.execute(
        "INSERT INTO sessions (token, email, role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
        (token, email.lower(), role, now.isoformat(), (now + timedelta(days=SESSION_TTL_DAYS)).isoformat())
    )
    conn.commit()
    conn.close()
    return token


def get_session(token: str):
    if not token:
        return None
    conn = get_connection()
    row = conn.execute("SELECT * FROM sessions WHERE token = ?", (token,)).fetchone()
    if row and datetime.fromisoformat(row["expires_at"]) < datetime.utcnow():
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        row = None
    conn.close()
    return dict(row) if row else None


def delete_session(token: str):
    conn = get_connection()
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()
