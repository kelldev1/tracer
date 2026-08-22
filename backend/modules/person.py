import asyncio
from modules.username import search_username
from modules.social import analyze_social
from modules.email_lookup import lookup_email
from modules.darkweb import search_darkweb
from utils.cache import get_cached, set_cache, log_history


async def search_person(query: str, filters: dict = None):
    filters = filters or {}
    username = filters.get("username") or filters.get("pseudo") or query
    email = filters.get("email")

    cached = get_cached(query, "person")
    if cached:
        return cached

    log_history(query, "person")

    jobs = {
        "usernames": search_username(username),
        "social": analyze_social(username),
        "darkweb": search_darkweb(username),
    }
    if email:
        jobs["email"] = lookup_email(email)

    keys = list(jobs.keys())
    values = await asyncio.gather(*jobs.values())
    data = dict(zip(keys, values))

    found_usernames = [r for r in data["usernames"]["results"] if r["found"]]
    found_social = [p for p in data["social"]["profiles"] if p["found"]]

    identity = {"names": set(), "locations": set(), "avatars": set(), "bios": set()}
    for p in found_social:
        d = p.get("data", {})
        if d.get("nom") and d["nom"] != "N/A":
            identity["names"].add(d["nom"])
        if d.get("localisation") and d["localisation"] != "N/A":
            identity["locations"].add(d["localisation"])
        if d.get("avatar"):
            identity["avatars"].add(d["avatar"])
        if d.get("bio") and d["bio"] != "N/A":
            identity["bios"].add(d["bio"])

    result = {
        "query": query,
        "username": username,
        "identity": {k: sorted(v) for k, v in identity.items()},
        "usernames_found": found_usernames,
        "usernames_checked": data["usernames"]["total"],
        "social_profiles": found_social,
        "darkweb": data["darkweb"],
        "email": data.get("email"),
    }
    set_cache(query, "person", result)
    return result
