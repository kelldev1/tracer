import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi import FastAPI, Query as QParam, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from modules.username import search_username
from modules.email_lookup import lookup_email
from modules.phone import lookup_phone
from modules.domain import recon_domain
from modules.ip_recon import recon_ip
from modules.social import analyze_social
from modules.darkweb import search_darkweb
from modules.aggregator import aggregate_all
from modules.person import search_person
from modules import auth as auth_module
from utils.cache import init_db, get_history, get_stats
from utils.authdb import init_auth_db

init_db()
init_auth_db()

app = FastAPI(title="TRACER API", version="1.0.0")

_extra_origin = os.getenv("FRONTEND_URL")
_allowed_origins = ["http://localhost:5173"] + ([_extra_origin] if _extra_origin else [])

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


def _bearer_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        return ""
    return authorization.removeprefix("Bearer ").strip()


def require_auth(authorization: str = Header(default=None)):
    """Dependency gating routes behind a valid session — required so a public
    deployment doesn't let anyone burn through paid API quotas anonymously."""
    return auth_module.require_session(_bearer_token(authorization))


class Query(BaseModel):
    query: str


class AggregateQuery(BaseModel):
    query: str
    filters: dict = {}


class RegisterBody(BaseModel):
    name: str
    email: str
    password: str


class LoginBody(BaseModel):
    email: str
    password: str


class ProfilePatch(BaseModel):
    name: str | None = None
    email: str | None = None
    password: str | None = None


@app.get("/")
def root():
    return {"status": "online", "name": "TRACER"}


@app.post("/aggregate")
async def aggregate(q: AggregateQuery, session=Depends(require_auth)):
    return await aggregate_all(q.query, q.filters)


@app.post("/username")
async def username(q: Query, session=Depends(require_auth)):
    return await search_username(q.query)


@app.post("/email")
async def email(q: Query, session=Depends(require_auth)):
    return await lookup_email(q.query)


@app.post("/phone")
async def phone(q: Query, session=Depends(require_auth)):
    return await lookup_phone(q.query)


@app.post("/social")
async def social(q: Query, session=Depends(require_auth)):
    return await analyze_social(q.query)


@app.post("/domain")
async def domain(q: Query, session=Depends(require_auth)):
    return await recon_domain(q.query)


@app.post("/ip")
async def ip(q: Query, session=Depends(require_auth)):
    return await recon_ip(q.query)


@app.post("/darkweb")
async def darkweb(q: Query, session=Depends(require_auth)):
    return await search_darkweb(q.query)


@app.post("/person")
async def person(q: AggregateQuery, session=Depends(require_auth)):
    return await search_person(q.query, q.filters)


@app.get("/history")
def history(limit: int = QParam(50), session=Depends(require_auth)):
    return {"history": get_history(limit)}


@app.get("/stats")
def stats(session=Depends(require_auth)):
    return get_stats()


@app.post("/auth/register")
def auth_register(body: RegisterBody):
    return auth_module.register(body.name, body.email, body.password)


@app.post("/auth/login")
def auth_login(body: LoginBody):
    return auth_module.login(body.email, body.password)


@app.post("/auth/logout")
def auth_logout(authorization: str = Header(default=None)):
    auth_module.logout(_bearer_token(authorization))
    return {"success": True}


@app.get("/auth/me")
def auth_me(authorization: str = Header(default=None)):
    session = auth_module.require_session(_bearer_token(authorization))
    return {"email": session["email"], "role": session["role"]}


@app.patch("/auth/profile")
def auth_update_profile(patch: ProfilePatch, authorization: str = Header(default=None)):
    body = {k: v for k, v in patch.model_dump().items() if v is not None}
    return auth_module.update_profile(_bearer_token(authorization), body)


@app.get("/auth/accounts")
def auth_accounts(authorization: str = Header(default=None)):
    return {"accounts": auth_module.accounts(_bearer_token(authorization))}


@app.delete("/auth/accounts/{email}")
def auth_delete_account(email: str, authorization: str = Header(default=None)):
    auth_module.remove_account(_bearer_token(authorization), email)
    return {"success": True}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
