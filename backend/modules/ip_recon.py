import httpx
import socket
import os
import logging

logger = logging.getLogger(__name__)

async def recon_ip(query: str):
    query = query.strip()

    # Résoudre si c'est un domaine
    ip = query
    try:
        ip = socket.gethostbyname(query)
    except Exception as e:
        logger.warning("DNS resolution failed for %s: %s", query, e)

    result = {"ip": ip, "query": query}

    async with httpx.AsyncClient(timeout=10) as client:
        # ipapi.co — géoloc gratuite
        try:
            r = await client.get(f"https://ipapi.co/{ip}/json/")
            if r.status_code == 200:
                data = r.json()
                result.update({
                    "country": data.get("country_name", "N/A"),
                    "country_code": data.get("country_code", "N/A"),
                    "region": data.get("region", "N/A"),
                    "city": data.get("city", "N/A"),
                    "isp": data.get("org", "N/A"),
                    "asn": data.get("asn", "N/A"),
                    "org": data.get("org", "N/A"),
                    "timezone": data.get("timezone", "N/A"),
                    "lat": data.get("latitude"),
                    "lon": data.get("longitude"),
                })
        except Exception as e:
            logger.warning("ipapi.co lookup failed for %s: %s", ip, e)

        # ip-api.com — réputation VPN/Proxy/Tor
        try:
            r = await client.get(f"http://ip-api.com/json/{ip}?fields=status,message,proxy,hosting,mobile")
            if r.status_code == 200:
                data = r.json()
                result["reputation"] = {
                    "vpn": data.get("hosting", False),
                    "proxy": data.get("proxy", False),
                    "tor": False,
                    "malicious": False,
                    "risk_score": 30 if data.get("proxy") else 10,
                }
        except Exception as e:
            logger.warning("ip-api.com lookup failed for %s: %s", ip, e)
            result["reputation"] = {}

        # HackerTarget — ports ouverts
        try:
            r = await client.get(f"https://api.hackertarget.com/nmap/?q={ip}")
            if r.status_code == 200 and "open" in r.text:
                ports = []
                for line in r.text.splitlines():
                    if "/tcp" in line and "open" in line:
                        parts = line.split()
                        port_num = parts[0].split("/")[0]
                        service = parts[2] if len(parts) > 2 else "N/A"
                        ports.append({"port": port_num, "service": service, "state": "open"})
                result["ports"] = ports
        except Exception as e:
            logger.warning("HackerTarget lookup failed for %s: %s", ip, e)
            result["ports"] = []

        # Shodan — bannières, services, vulns (SHODAN_API_KEY)
        shodan_key = os.getenv("SHODAN_API_KEY")
        if shodan_key:
            try:
                r = await client.get(f"https://api.shodan.io/shodan/host/{ip}?key={shodan_key}")
                if r.status_code == 200:
                    data = r.json()
                    result["shodan"] = {
                        "org": data.get("org", "N/A"),
                        "os": data.get("os", "N/A"),
                        "hostnames": data.get("hostnames", []),
                        "ports": data.get("ports", []),
                        "vulns": list(data.get("vulns", [])),
                    }
            except Exception as e:
                logger.warning("Shodan lookup failed for %s: %s", ip, e)
        else:
            result["shodan_status"] = "no_key"

        # AbuseIPDB — score de réputation abus (ABUSEIPDB_API_KEY)
        abuseipdb_key = os.getenv("ABUSEIPDB_API_KEY")
        if abuseipdb_key:
            try:
                r = await client.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    params={"ipAddress": ip, "maxAgeInDays": 90},
                    headers={"Key": abuseipdb_key, "Accept": "application/json"},
                )
                if r.status_code == 200:
                    data = r.json().get("data", {})
                    result["abuseipdb"] = {
                        "abuse_score": data.get("abuseConfidenceScore", 0),
                        "total_reports": data.get("totalReports", 0),
                        "usage_type": data.get("usageType", "N/A"),
                        "is_tor": data.get("isTor", False),
                    }
            except Exception as e:
                logger.warning("AbuseIPDB lookup failed for %s: %s", ip, e)
        else:
            result["abuseipdb_status"] = "no_key"

        # VirusTotal — détections malveillantes (VIRUSTOTAL_API_KEY)
        virustotal_key = os.getenv("VIRUSTOTAL_API_KEY")
        if virustotal_key:
            try:
                r = await client.get(
                    f"https://www.virustotal.com/api/v3/ip_addresses/{ip}",
                    headers={"x-apikey": virustotal_key},
                )
                if r.status_code == 200:
                    stats = r.json().get("data", {}).get("attributes", {}).get("last_analysis_stats", {})
                    result["virustotal"] = {
                        "malicious": stats.get("malicious", 0),
                        "suspicious": stats.get("suspicious", 0),
                        "harmless": stats.get("harmless", 0),
                    }
            except Exception as e:
                logger.warning("VirusTotal lookup failed for %s: %s", ip, e)
        else:
            result["virustotal_status"] = "no_key"

    return result
