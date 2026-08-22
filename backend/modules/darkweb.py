import httpx
import re
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

AHMIA_URL = "https://ahmia.fi/search/?q={}"
RESULT_RE = re.compile(r'<a href="(https?://[^"]*?ahmia\.fi/search/redirect[^"]*?)"[^>]*>(.*?)</a>', re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")


async def search_darkweb(query: str):
    encoded_query = quote(query, safe="")
    result = {
        "query": query,
        "engine": "Ahmia (.onion index)",
        "search_url": AHMIA_URL.format(encoded_query),
        "note": "Les résultats pointent vers des adresses .onion, accessibles uniquement via Tor Browser.",
        "results": [],
    }

    async with httpx.AsyncClient(timeout=10, headers={"User-Agent": "Mozilla/5.0"}) as client:
        try:
            r = await client.get(AHMIA_URL.format(encoded_query))
            if r.status_code == 200:
                matches = RESULT_RE.findall(r.text)
                for url, title in matches[:15]:
                    clean_title = TAG_RE.sub("", title).strip()
                    if clean_title:
                        result["results"].append({"title": clean_title, "redirect_url": url})
        except Exception as e:
            logger.warning("Ahmia search failed for %s: %s", query, e)

    return result
