from fastapi import HTTPException
from utils.authdb import (
    get_user, create_user, update_user, delete_user,
    list_client_accounts, create_session, get_session, delete_session,
    verify_password,
)


def register(name: str, email: str, password: str):
    if not name or not email or not password:
        raise HTTPException(400, "Tous les champs sont requis.")
    if len(password) < 8:
        raise HTTPException(400, "Le mot de passe doit contenir au moins 8 caractères.")
    if get_user(email):
        raise HTTPException(400, "Un compte avec cet email existe déjà.")

    create_user(name.strip(), email.strip(), password, role="client")
    user = get_user(email)
    token = create_session(user["email"], user["role"])
    return _public_user(user, token)


def login(email: str, password: str):
    user = get_user(email)
    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(401, "Email ou mot de passe incorrect.")
    token = create_session(user["email"], user["role"])
    return _public_user(user, token)


def logout(token: str):
    delete_session(token)


def require_session(token: str):
    session = get_session(token)
    if not session:
        raise HTTPException(401, "Session invalide ou expirée.")
    return session


def require_admin(token: str):
    session = require_session(token)
    if session["role"] != "admin":
        raise HTTPException(403, "Accès réservé aux administrateurs.")
    return session


def update_profile(token: str, patch: dict):
    session = require_session(token)
    if patch.get("email") and get_user(patch["email"]) and patch["email"].lower() != session["email"]:
        raise HTTPException(400, "Un compte avec cet email existe déjà.")
    update_user(session["email"], patch)
    user = get_user(patch.get("email", session["email"]))
    return _public_user(user, token)


def accounts(token: str):
    require_admin(token)
    return list_client_accounts()


def remove_account(token: str, target_email: str):
    require_admin(token)
    delete_user(target_email)


def _public_user(user: dict, token: str):
    return {
        "token": token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "createdAt": user["created_at"],
        },
    }
