import re
import asyncio
from modules.username import search_username
from modules.email_lookup import lookup_email
from modules.ip_recon import recon_ip
from modules.domain import recon_domain
from modules.darkweb import search_darkweb
from modules.social import analyze_social
from utils.cache import get_cached, set_cache, log_history

def detect_type(query: str, filters: dict = None):
    filters = filters or {}
    # Priorité aux filters explicites
    if filters.get("email"):
        return "email"
    if filters.get("ip"):
        return "ip"
    if filters.get("domaine"):
        return "domain"
    if filters.get("pseudo") or filters.get("login"):
        return "username"

    # Fallback : détecter depuis la query string brute
    q = query.strip()
    if re.match(r"[^@]+@[^@]+\.[^@]+", q):
        return "email"
    if re.match(r"(\d{1,3}\.){3}\d{1,3}", q):
        return "ip"
    if re.match(r"[\w.-]+\.[a-z]{2,}", q) and "." in q:
        return "domain"
    return "username"

async def aggregate_all(query: str, filters: dict = None):
    filters = filters or {}
    qtype = detect_type(query, filters)

    cached = get_cached(query, qtype)
    if cached:
        return cached

    log_history(query, qtype)
    result = {"query": query, "type": qtype}

    if qtype == "email":
        email_val = filters.get("email") or query
        username = email_val.split("@")[0]
        email_data, username_data, darkweb_data, social_data = await asyncio.gather(
            lookup_email(email_val),
            search_username(username),
            search_darkweb(email_val),
            analyze_social(username),
        )
        result["email"] = email_data
        result["usernames"] = [r for r in username_data["results"] if r["found"]]
        result["darkweb"] = darkweb_data
        result["social_profiles"] = [p for p in social_data["profiles"] if p["found"]]

    elif qtype == "ip":
        ip_val = filters.get("ip") or query
        result["ip"] = await recon_ip(ip_val)

    elif qtype == "domain":
        domain_val = filters.get("domaine") or query
        domain_data, ip_data = await asyncio.gather(
            recon_domain(domain_val),
            recon_ip(domain_val)
        )
        result["domain"] = domain_data
        result["ip"] = ip_data

    else:
        pseudo = filters.get("pseudo") or filters.get("login") or query
        username_data, darkweb_data, social_data = await asyncio.gather(
            search_username(pseudo),
            search_darkweb(pseudo),
            analyze_social(pseudo),
        )
        result["usernames"] = [r for r in username_data["results"] if r["found"]]
        result["darkweb"] = darkweb_data
        result["social_profiles"] = [p for p in social_data["profiles"] if p["found"]]

    set_cache(query, qtype, result)
    return result
