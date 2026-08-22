import phonenumbers
from phonenumbers import geocoder, carrier, timezone
import httpx
import os
import logging

logger = logging.getLogger(__name__)

async def lookup_phone(number: str):
    result = {"number": number, "valid": False}

    try:
        parsed = phonenumbers.parse(number, None)
        valid = phonenumbers.is_valid_number(parsed)
        result["valid"] = valid
        result["e164"] = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        result["country"] = geocoder.description_for_number(parsed, "fr") or "N/A"
        result["carrier"] = carrier.name_for_number(parsed, "fr") or "N/A"
        result["timezones"] = list(timezone.time_zones_for_number(parsed))
        result["line_type"] = str(phonenumbers.number_type(parsed)).replace("PhoneNumberType.", "")
    except Exception as e:
        result["error"] = str(e)
        return result

    # NumVerify / apilayer — nécessite une clé (NUMVERIFY_API_KEY dans .env)
    numverify_key = os.getenv("NUMVERIFY_API_KEY")
    if numverify_key:
        async with httpx.AsyncClient(timeout=8) as client:
            try:
                r = await client.get(
                    f"https://api.apilayer.com/number_verification/validate?number={result['e164']}",
                    headers={"apikey": numverify_key}
                )
                if r.status_code == 200:
                    data = r.json()
                    result["numverify"] = {
                        "valid": data.get("valid", False),
                        "location": data.get("location", "N/A"),
                        "carrier": data.get("carrier", "N/A") or result.get("carrier"),
                        "line_type": data.get("line_type", "N/A"),
                        "country_name": data.get("country_name", "N/A"),
                    }
            except Exception as e:
                logger.warning("NumVerify lookup failed for %s: %s", number, e)
    else:
        result["numverify_status"] = "no_key"

    return result
