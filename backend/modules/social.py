import httpx
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

async def analyze_social(query: str):
    profiles = []
    q = quote(query, safe="")

    async with httpx.AsyncClient(timeout=10, follow_redirects=True, headers={"User-Agent": "Mozilla/5.0"}) as client:
        # GitHub
        try:
            r = await client.get(f"https://api.github.com/users/{q}")
            if r.status_code == 200:
                d = r.json()
                profiles.append({
                    "platform": "GitHub",
                    "found": True,
                    "data": {
                        "url": d.get("html_url"),
                        "nom": d.get("name") or "N/A",
                        "bio": d.get("bio") or "N/A",
                        "followers": d.get("followers", 0),
                        "repos_publics": d.get("public_repos", 0),
                        "localisation": d.get("location") or "N/A",
                        "email": d.get("email") or "N/A",
                        "créé_le": d.get("created_at", "N/A")[:10],
                        "avatar": d.get("avatar_url"),
                    }
                })
            else:
                profiles.append({"platform": "GitHub", "found": False, "data": {}})
        except Exception as e:
            logger.warning("GitHub lookup failed for %s: %s", query, e)
            profiles.append({"platform": "GitHub", "found": False, "data": {}})

        # Reddit
        try:
            r = await client.get(
                f"https://www.reddit.com/user/{q}/about.json",
                headers={"User-Agent": "TRACER-OSINT/1.0"}
            )
            if r.status_code == 200:
                d = r.json().get("data", {})
                profiles.append({
                    "platform": "Reddit",
                    "found": True,
                    "data": {
                        "url": f"https://reddit.com/u/{q}",
                        "karma_post": d.get("link_karma", 0),
                        "karma_commentaire": d.get("comment_karma", 0),
                        "créé_le": str(d.get("created_utc", "N/A")),
                        "vérifié_email": d.get("has_verified_email", False),
                    }
                })
            else:
                profiles.append({"platform": "Reddit", "found": False, "data": {}})
        except Exception as e:
            logger.warning("Reddit lookup failed for %s: %s", query, e)
            profiles.append({"platform": "Reddit", "found": False, "data": {}})

        # Autres plateformes — check existence
        for platform, url in [
            ("Twitter/X", f"https://twitter.com/{q}"),
            ("Instagram", f"https://instagram.com/{q}"),
            ("TikTok",    f"https://tiktok.com/@{q}"),
        ]:
            try:
                r = await client.get(url)
                profiles.append({
                    "platform": platform,
                    "found": r.status_code == 200,
                    "data": {"url": url} if r.status_code == 200 else {}
                })
            except Exception as e:
                logger.warning("%s lookup failed for %s: %s", platform, query, e)
                profiles.append({"platform": platform, "found": False, "data": {}})

    return {"query": query, "profiles": profiles}
