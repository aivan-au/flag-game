#!/usr/bin/env python3
"""
Fetch country data from REST Countries API and compile with GDP data.
Outputs enriched country data for countries.js
"""

import json
import urllib.request
import ssl

# Existing country codes from countries.js
EXISTING_CODES = [
    "af", "al", "dz", "ad", "ao", "ag", "ar", "am", "au", "at", "az",
    "bs", "bh", "bd", "bb", "by", "be", "bz", "bj", "bt", "bo", "ba", "bw", "br", "bn", "bg", "bf", "bi",
    "cv", "kh", "cm", "ca", "cf", "td", "cl", "cn", "co", "km", "cg", "cr", "ci", "hr", "cu", "cy", "cz",
    "cd", "dk", "dj", "dm", "do",
    "ec", "eg", "sv", "gq", "er", "ee", "sz", "et",
    "fj", "fi", "fr",
    "ga", "gm", "ge", "de", "gh", "gr", "gd", "gt", "gn", "gw", "gy",
    "ht", "hn", "hu",
    "is", "in", "id", "ir", "iq", "ie", "il", "it",
    "jm", "jp", "jo",
    "kz", "ke", "ki", "kw", "kg",
    "la", "lv", "lb", "ls", "lr", "ly", "li", "lt", "lu",
    "mg", "mw", "my", "mv", "ml", "mt", "mh", "mr", "mu", "mx", "fm", "md", "mc", "mn", "me", "ma", "mz", "mm",
    "na", "nr", "np", "nl", "nz", "ni", "ne", "ng", "kp", "mk", "no",
    "om",
    "pk", "pw", "pa", "pg", "py", "pe", "ph", "pl", "pt",
    "qa",
    "ro", "ru", "rw",
    "kn", "lc", "vc", "ws", "sm", "st", "sa", "sn", "rs", "sc", "sl", "sg", "sk", "si", "sb", "so", "za", "kr", "ss", "es", "lk", "sd", "sr", "se", "ch", "sy",
    "tj", "tz", "th", "tl", "tg", "to", "tt", "tn", "tr", "tm", "tv",
    "ug", "ua", "ae", "gb", "us", "uy", "uz",
    "vu", "ve", "vn",
    "ye",
    "zm", "zw"
]

# South American country codes for continent split
SOUTH_AMERICA_CODES = ["ar", "bo", "br", "cl", "co", "ec", "gy", "py", "pe", "sr", "uy", "ve", "gf"]

# GDP data (millions USD, 2024-2025 IMF estimates)
# Source: IMF World Economic Outlook, Worldometers
GDP_DATA = {
    "us": 30620000, "cn": 19400000, "de": 5010000, "jp": 4280000, "in": 4130000,
    "gb": 3960000, "fr": 3360000, "it": 2540000, "ru": 2540000, "ca": 2280000,
    "br": 2260000, "es": 1890000, "mx": 1860000, "kr": 1860000, "au": 1830000,
    "tr": 1340000, "id": 1470000, "nl": 1180000, "sa": 1100000, "pl": 842000,
    "ch": 906000, "be": 632000, "se": 599000, "ar": 621000, "at": 516000,
    "no": 526000, "ie": 545000, "il": 530000, "sg": 501000, "ng": 472000,
    "th": 548000, "ae": 499000, "za": 373000, "dk": 406000, "eg": 347000,
    "ph": 435000, "bd": 446000, "my": 447000, "pk": 374000, "vn": 449000,
    "cl": 317000, "fi": 305000, "cz": 330000, "ro": 351000, "pt": 287000,
    "nz": 252000, "ir": 388000, "iq": 267000, "pe": 268000, "gr": 239000,
    "kz": 261000, "ua": 178000, "hu": 212000, "co": 343000, "kw": 165000,
    "ma": 152000, "ec": 118000, "sk": 132000, "dz": 239000, "ke": 104000,
    "et": 156000, "do": 121000, "gt": 102000, "om": 115000, "lu": 89000,
    "bg": 103000, "hr": 82000, "by": 73000, "uy": 77000, "tz": 85000,
    "ao": 92000, "az": 78000, "gh": 76000, "rs": 75000, "lk": 74000,
    "lt": 80000, "ci": 79000, "cr": 71000, "pa": 83000, "si": 68000,
    "mm": 59000, "ve": 98000, "jo": 50000, "tn": 49000, "ly": 45000,
    "ba": 28000, "bo": 45000, "py": 44000, "cm": 47000, "lv": 47000,
    "ee": 43000, "np": 40000, "sd": 31000, "sv": 34000, "cy": 32000,
    "hn": 34000, "zm": 29000, "sn": 28000, "is": 31000, "tt": 28000,
    "cd": 66000, "kh": 32000, "mg": 16000, "pg": 32000, "bh": 44000,
    "lb": 18000, "ug": 50000, "ge": 28000, "zw": 28000, "mu": 15000,
    "rw": 14000, "ni": 17000, "al": 23000, "mk": 15000, "mn": 20000,
    "af": 14000, "jm": 19000, "mz": 21000, "bf": 20000, "ml": 19000,
    "bw": 20000, "ga": 21000, "na": 13000, "mt": 21000, "me": 7000,
    "gq": 12000, "bn": 15000, "tj": 12000, "kg": 12000, "ht": 20000,
    "mw": 13000, "la": 15000, "mr": 10000, "md": 16000, "ne": 17000,
    "tg": 9000, "gn": 21000, "bj": 19000, "cg": 14000, "sy": 9000,
    "sz": 5000, "td": 12000, "er": 2000, "cf": 3000, "lr": 4000,
    "sl": 4000, "bi": 3000, "so": 8000, "gw": 2000, "dj": 4000,
    "ls": 3000, "sc": 2000, "ag": 2000, "bb": 6000, "bs": 14000,
    "bz": 3000, "cv": 2000, "dm": 700, "fj": 5000, "gd": 1300,
    "gy": 15000, "ki": 300, "kn": 1200, "lc": 2500, "mh": 300,
    "mv": 6000, "mc": 9000, "nr": 200, "pw": 300, "sb": 2000,
    "sm": 2000, "st": 700, "to": 500, "tv": 60, "vc": 1100,
    "vu": 1100, "ws": 900, "ad": 4000, "bt": 3000, "kp": 18000,
    "tl": 3000, "tm": 82000, "uz": 90000, "ye": 21000, "fm": 400,
    "li": 7000, "qa": 220000, "ss": 5000
}

def fetch_rest_countries():
    """Fetch data from REST Countries API"""
    url = "https://restcountries.com/v3.1/all?fields=name,cca2,population,area,region,subregion"

    # Create SSL context that doesn't verify (for compatibility)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(url, context=ctx, timeout=30) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def get_continent(country_data, code):
    """Determine continent, splitting Americas into North/South"""
    region = country_data.get("region", "Unknown")
    subregion = country_data.get("subregion", "")

    if region == "Americas":
        if code.lower() in SOUTH_AMERICA_CODES:
            return "South America"
        else:
            return "North America"
    elif region == "Antarctic":
        return "Antarctica"
    else:
        return region  # Africa, Asia, Europe, Oceania

def main():
    print("Fetching country data from REST Countries API...")
    api_data = fetch_rest_countries()

    if not api_data:
        print("Failed to fetch data. Using fallback.")
        return

    # Create lookup by lowercase cca2 code
    api_lookup = {}
    for country in api_data:
        code = country.get("cca2", "").lower()
        if code:
            api_lookup[code] = country

    print(f"Fetched {len(api_lookup)} countries from API")

    # Build enriched country list
    enriched = []
    missing_codes = []

    for code in EXISTING_CODES:
        if code in api_lookup:
            c = api_lookup[code]
            name_data = c.get("name", {})
            # Get common name
            name = name_data.get("common", "") if isinstance(name_data, dict) else str(name_data)

            continent = get_continent(c, code)
            population = c.get("population", 0)
            area = c.get("area", 0)
            gdp = GDP_DATA.get(code, None)

            enriched.append({
                "code": code,
                "name": name,
                "continent": continent,
                "population": population,
                "area": int(area) if area else 0,
                "gdp": gdp
            })
        else:
            missing_codes.append(code)

    if missing_codes:
        print(f"Warning: Missing data for codes: {missing_codes}")

    # Output as JavaScript
    print("\n// Enriched country data for countries.js")
    print("const countries = [")

    for i, c in enumerate(enriched):
        gdp_str = str(c['gdp']) if c['gdp'] else "null"
        comma = "," if i < len(enriched) - 1 else ""
        print(f'    {{ code: "{c["code"]}", name: "{c["name"]}", continent: "{c["continent"]}", population: {c["population"]}, area: {c["area"]}, gdp: {gdp_str} }}{comma}')

    print("];")

    # Also save to JSON for reference
    with open("scripts/country_data.json", "w") as f:
        json.dump(enriched, f, indent=2)
    print("\nData also saved to scripts/country_data.json")

if __name__ == "__main__":
    main()
