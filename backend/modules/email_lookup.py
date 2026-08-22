import httpx
import re
import os
import hashlib
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

async def lookup_email(email: str):
    result = {"email": email, "valid": False, "domain": None, "breaches": [], "reputation": None}

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return result

    result["valid"] = True
    result["domain"] = email.split("@")[1]
    email_q = quote(email, safe="@")

    async with httpx.AsyncClient(timeout=10) as client:
        # HaveIBeenPwned — nécessite une clé payante (HIBP_API_KEY dans .env)
        hibp_key = os.getenv("HIBP_API_KEY")
        if hibp_key:
            try:
                r = await client.get(
                    f"https://haveibeenpwned.com/api/v3/breachedaccount/{email_q}",
                    headers={"hibp-api-key": hibp_key, "User-Agent": "TRACER-OSINT"}
                )
                if r.status_code == 200:
                    breaches = r.json()
                    result["breaches"] = [{"name": b["Name"], "date": b.get("BreachDate", "N/A")} for b in breaches]
                elif r.status_code == 404:
                    result["breaches"] = []
            except Exception as e:
                logger.warning("HIBP lookup failed for %s: %s", email, e)
        else:
            result["hibp_status"] = "no_key"

        # XposedOrNot — alternative gratuite et sans clé à HIBP
        try:
            r = await client.get(
                f"https://api.xposedornot.com/v1/check-email/{email_q}",
                headers={"User-Agent": "TRACER-OSINT"}
            )
            if r.status_code == 200:
                data = r.json()
                breach_names = data.get("breaches", [[]])[0] if data.get("breaches") else []
                if breach_names and not result["breaches"]:
                    result["breaches"] = [{"name": name, "date": "N/A"} for name in breach_names]
                result["xposedornot"] = {"breach_count": len(breach_names), "breaches": breach_names}
        except Exception as e:
            logger.warning("XposedOrNot lookup failed for %s: %s", email, e)

        # Gravatar — existence d'un compte lié à l'email (aucune clé requise)
        try:
            email_hash = hashlib.md5(email.strip().lower().encode()).hexdigest()
            r = await client.get(f"https://www.gravatar.com/avatar/{email_hash}?d=404")
            result["gravatar"] = {
                "found": r.status_code == 200,
                "url": f"https://www.gravatar.com/{email_hash}" if r.status_code == 200 else None,
            }
        except Exception as e:
            logger.warning("Gravatar lookup failed for %s: %s", email, e)
            result["gravatar"] = {"found": False, "url": None}

        # EmailRep.io
        try:
            r = await client.get(
                f"https://emailrep.io/{email_q}",
                headers={"User-Agent": "TRACER-OSINT"}
            )
            if r.status_code == 200:
                data = r.json()
                result["reputation"] = data.get("reputation", "N/A")
                result["suspicious"] = data.get("suspicious", False)
                result["references"] = data.get("references", 0)
                result["profiles"] = data.get("details", {}).get("profiles", [])
        except Exception as e:
            logger.warning("EmailRep lookup failed for %s: %s", email, e)

    return result
