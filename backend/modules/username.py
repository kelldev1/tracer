import httpx
import asyncio
import json
import os
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

SITES_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "username_sites.json")
with open(SITES_PATH, encoding="utf-8") as f:
    SITES = json.load(f)

CONCURRENCY = 30


BLOCKED_CODES = {403, 429, 500, 502, 503}


def _is_found(site, response):
    if response.status_code in BLOCKED_CODES:
        return None

    error_type = site["errorType"]

    if error_type == "status_code":
        error_code = site.get("errorCode") or 404
        return response.status_code != error_code

    if error_type == "message":
        text = response.text
        return not any(msg in text for msg in (site.get("errorMsg") or []))

    if error_type == "response_url":
        return str(response.url).rstrip("/") != (site.get("errorUrl") or "").rstrip("/")

    return response.status_code == 200


async def check_site(client, sem, username, site):
    url = site["url"].format(quote(username, safe=""))
    async with sem:
        try:
            r = await client.get(url, timeout=8, follow_redirects=True)
            found = _is_found(site, r)
            return {"platform": site["platform"], "url": url, "found": found, "status": r.status_code}
        except Exception as e:
            logger.debug("%s check failed for %s: %s", site["platform"], username, e)
            return {"platform": site["platform"], "url": url, "found": False, "status": None}


async def search_username(username: str):
    headers = {"User-Agent": "Mozilla/5.0"}
    sem = asyncio.Semaphore(CONCURRENCY)
    async with httpx.AsyncClient(headers=headers) as client:
        tasks = [check_site(client, sem, username, site) for site in SITES]
        results = await asyncio.gather(*tasks)
    return {"username": username, "results": results, "total": len(SITES)}
