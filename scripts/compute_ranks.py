#!/usr/bin/env python3
"""
Compute world ranks for population, area, and GDP.
Rank 1 = highest value.

Reads from country_data.json and outputs updated data.
"""

import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
INPUT_FILE = SCRIPT_DIR / "country_data.json"
OUTPUT_FILE = SCRIPT_DIR / "country_data_ranked.json"


def compute_ranks(countries, field):
    """
    Compute ranks for a given field.
    Rank 1 = highest value. Countries with null/None values get no rank.
    """
    # Filter countries with valid values for this field
    valid = [(i, c[field]) for i, c in enumerate(countries) if c.get(field) is not None]

    # Sort by value descending (highest = rank 1)
    valid_sorted = sorted(valid, key=lambda x: x[1], reverse=True)

    # Assign ranks
    ranks = {}
    for rank, (idx, value) in enumerate(valid_sorted, start=1):
        ranks[idx] = rank

    return ranks


def main():
    # Read input data
    with open(INPUT_FILE, "r") as f:
        countries = json.load(f)

    print(f"Loaded {len(countries)} countries from {INPUT_FILE}")

    # Compute ranks for each field
    population_ranks = compute_ranks(countries, "population")
    area_ranks = compute_ranks(countries, "area")
    gdp_ranks = compute_ranks(countries, "gdp")

    # Add ranks to each country
    for i, country in enumerate(countries):
        country["population_rank"] = population_ranks.get(i)
        country["area_rank"] = area_ranks.get(i)
        country["gdp_rank"] = gdp_ranks.get(i)

        # Compute overall rank as the best (lowest) of all ranks
        ranks = [r for r in [country["population_rank"], country["area_rank"], country["gdp_rank"]] if r is not None]
        country["rank"] = min(ranks) if ranks else None

    # Save ranked data to new JSON file
    with open(OUTPUT_FILE, "w") as f:
        json.dump(countries, f, indent=2)

    print(f"Saved ranked data to {OUTPUT_FILE}")

    # Print some examples
    print("\n--- Top 10 by GDP ---")
    by_gdp = sorted(countries, key=lambda c: c.get("gdp") or 0, reverse=True)[:10]
    for c in by_gdp:
        print(f"  {c['gdp_rank']:>3}. {c['name']:<30} GDP: ${c['gdp']:,}M")

    print("\n--- Top 10 by Population ---")
    by_pop = sorted(countries, key=lambda c: c.get("population") or 0, reverse=True)[:10]
    for c in by_pop:
        print(f"  {c['population_rank']:>3}. {c['name']:<30} Pop: {c['population']:,}")

    print("\n--- Top 10 by Area ---")
    by_area = sorted(countries, key=lambda c: c.get("area") or 0, reverse=True)[:10]
    for c in by_area:
        print(f"  {c['area_rank']:>3}. {c['name']:<30} Area: {c['area']:,} km²")

    # Also output JavaScript format for easy copy-paste
    js_output = SCRIPT_DIR / "countries_ranked.js"
    with open(js_output, "w") as f:
        f.write("const countries = [\n")
        for i, c in enumerate(countries):
            gdp_rank = c['gdp_rank'] if c['gdp_rank'] else 'null'
            rank = c['rank'] if c['rank'] else 'null'
            line = (
                f'    {{ code: "{c["code"]}", name: "{c["name"]}", '
                f'continent: "{c["continent"]}", '
                f'population: {c["population"]}, area: {c["area"]}, gdp: {c["gdp"]}, '
                f'population_rank: {c["population_rank"]}, area_rank: {c["area_rank"]}, gdp_rank: {gdp_rank}, rank: {rank} }}'
            )
            if i < len(countries) - 1:
                line += ","
            f.write(line + "\n")
        f.write("];\n")

    print(f"\nJavaScript output saved to {js_output}")

    # Show countries with best overall rank
    print("\n--- Countries with rank = 1 (top in at least one category) ---")
    rank_one = [c for c in countries if c.get('rank') == 1]
    for c in rank_one:
        categories = []
        if c['population_rank'] == 1:
            categories.append('population')
        if c['area_rank'] == 1:
            categories.append('area')
        if c['gdp_rank'] == 1:
            categories.append('GDP')
        print(f"  {c['name']}: #{1} in {', '.join(categories)}")


if __name__ == "__main__":
    main()
