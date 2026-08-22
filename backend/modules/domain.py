import whois
import dns.resolver
import httpx
import ssl
import socket
import os
import logging
from urllib.parse import quote

logger = logging.getLogger(__name__)

async def recon_domain(domain: str):
    domain = domain.replace("https://", "").replace("http://", "").split("/")[0].strip()
    result = {}

    # WHOIS
    try:
        w = whois.whois(domain)
        result["whois"] = {
            "registrar": str(w.registrar or "N/A"),
            "creation_date": str(w.creation_date[0] if isinstance(w.creation_date, list) else w.creation_date or "N/A"),
            "expiration_date": str(w.expiration_date[0] if isinstance(w.expiration_date, list) else w.expiration_date or "N/A"),
            "updated_date": str(w.updated_date[0] if isinstance(w.updated_date, list) else w.updated_date or "N/A"),
            "name_servers": ", ".join(w.name_servers or []),
            "status": str(w.status[0] if isinstance(w.status, list) else w.status or "N/A"),
            "country": str(w.country or "N/A"),
            "emails": str(w.emails or "N/A"),
        }
    except Exception as e:
        result["whois"] = {"error": str(e)}

    # DNS
    dns_records = {}
    for rtype in ["A", "AAAA", "MX", "NS", "TXT", "CNAME"]:
        try:
            answers = dns.resolver.resolve(domain, rtype)
            dns_records[rtype] = [str(r) for r in answers]
        except Exception as e:
            logger.warning("DNS %s lookup failed for %s: %s", rtype, domain, e)
    result["dns"] = dns_records

    # SSL
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=domain) as s:
            s.settimeout(5)
            s.connect((domain, 443))
            cert = s.getpeercert()
            result["ssl"] = {
                "subject": dict(x[0] for x in cert.get("subject", [])),
                "issuer": dict(x[0] for x in cert.get("issuer", [])).get("organizationName", "N/A"),
                "not_before": cert.get("notBefore", "N/A"),
                "not_after": cert.get("notAfter", "N/A"),
                "valid": True,
            }
    except Exception as e:
        logger.warning("SSL check failed for %s: %s", domain, e)
        result["ssl"] = {"valid": False, "error": "SSL non disponible"}

    # crt.sh — sous-domaines via certificats
    async with httpx.AsyncClient(timeout=12) as client:
        try:
            r = await client.get(f"https://crt.sh/?q=%.{quote(domain, safe='')}&output=json")
            if r.status_code == 200:
                entries = r.json()
                subs = sorted(set(
                    e["name_value"].replace("*.", "")
                    for e in entries
                    if domain in e["name_value"]
                ))
                result["subdomains"] = subs[:50]
        except Exception as e:
            logger.warning("crt.sh lookup failed for %s: %s", domain, e)
            result["subdomains"] = []

        # Wayback Machine
        try:
            r = await client.get(f"https://archive.org/wayback/available?url={quote(domain, safe='')}")
            if r.status_code == 200:
                data = r.json()
                snap = data.get("archived_snapshots", {}).get("closest", {})
                result["wayback"] = {
                    "available": snap.get("available", False),
                    "last_capture": snap.get("timestamp", "N/A"),
                    "url": snap.get("url", "N/A"),
                }
        except Exception as e:
            logger.warning("Wayback lookup failed for %s: %s", domain, e)
            result["wayback"] = {}

        # SecurityTrails — sous-domaines additionnels (SECURITYTRAILS_API_KEY)
        securitytrails_key = os.getenv("SECURITYTRAILS_API_KEY")
        if securitytrails_key:
            try:
                r = await client.get(
                    f"https://api.securitytrails.com/v1/domain/{quote(domain, safe='')}/subdomains",
                    headers={"APIKEY": securitytrails_key},
                )
                if r.status_code == 200:
                    subs = {f"{s}.{domain}" for s in r.json().get("subdomains", [])}
                    result["subdomains"] = sorted(set(result.get("subdomains", [])) | subs)[:50]
            except Exception as e:
                logger.warning("SecurityTrails lookup failed for %s: %s", domain, e)
        else:
            result["securitytrails_status"] = "no_key"

        # VirusTotal — réputation du domaine (VIRUSTOTAL_API_KEY)
        virustotal_key = os.getenv("VIRUSTOTAL_API_KEY")
        if virustotal_key:
            try:
                r = await client.get(
                    f"https://www.virustotal.com/api/v3/domains/{quote(domain, safe='')}",
                    headers={"x-apikey": virustotal_key},
                )
                if r.status_code == 200:
                    attrs = r.json().get("data", {}).get("attributes", {})
                    stats = attrs.get("last_analysis_stats", {})
                    result["virustotal"] = {
                        "malicious": stats.get("malicious", 0),
                        "suspicious": stats.get("suspicious", 0),
                        "reputation": attrs.get("reputation", 0),
                        "categories": attrs.get("categories", {}),
                    }
            except Exception as e:
                logger.warning("VirusTotal lookup failed for %s: %s", domain, e)
        else:
            result["virustotal_status"] = "no_key"

    return result
