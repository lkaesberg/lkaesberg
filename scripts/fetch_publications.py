#!/usr/bin/env python3
"""
Fetch publications from Semantic Scholar and update data/publications.json.

Semantic Scholar is the source of truth for the paper list and citation
counts. Entries already present in publications.json (matched by title) keep
their curated venue/url/type/authors values — only citations and year are
refreshed. Entries not in Semantic Scholar (e.g. the master's thesis) are
preserved as-is. New papers are appended with raw Semantic Scholar values.

Exits non-zero on fetch failure so the workflow surfaces the problem instead
of silently keeping stale data.
"""

import json
import os
import re
import sys
import time
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

SEMANTIC_SCHOLAR_AUTHOR_ID = "2309481944"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "publications.json")
API_URL = (
    f"https://api.semanticscholar.org/graph/v1/author/{SEMANTIC_SCHOLAR_AUTHOR_ID}/papers"
    "?fields=title,authors,year,venue,citationCount,externalIds,publicationVenue,publicationTypes,openAccessPdf,url"
    "&limit=1000"
)


def fetch_json(url, retries=3, backoff=5):
    last_err = None
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": "lkaesberg-website/1.0"})
            with urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (HTTPError, URLError) as e:
            last_err = e
            if attempt < retries - 1:
                time.sleep(backoff * (attempt + 1))
    raise last_err


def fetch_from_semantic_scholar():
    payload = fetch_json(API_URL)
    papers = payload.get("data") or []
    if not papers:
        raise RuntimeError("Semantic Scholar returned no papers")

    publications = []
    for paper in papers:
        authors = ", ".join(a.get("name", "") for a in (paper.get("authors") or []) if a.get("name"))
        venue = paper.get("venue") or ""
        if not venue:
            pub_venue = paper.get("publicationVenue") or {}
            venue = pub_venue.get("name", "") or ""

        open_access = paper.get("openAccessPdf") or {}
        url = open_access.get("url") or paper.get("url") or None
        if url == "":
            url = paper.get("url") or None

        publications.append({
            "title": paper.get("title", "Untitled"),
            "authors": authors,
            "venue": venue,
            "year": paper.get("year"),
            "citations": paper.get("citationCount") or 0,
            "url": url,
            "type": determine_publication_type(venue, paper.get("publicationTypes") or []),
        })

    return publications


def determine_publication_type(venue, publication_types):
    venue_l = (venue or "").lower()
    types_l = [t.lower() for t in (publication_types or [])]

    if "thesis" in venue_l or "dissertation" in venue_l:
        return "thesis"
    if "workshop" in venue_l or venue_l == "sdp":
        return "workshop"
    if "arxiv" in venue_l or not venue_l:
        return "preprint"
    if "journalarticle" in types_l and "conference" not in types_l:
        return "journal"
    return "conference"


def normalize_title(title):
    return re.sub(r"[^\w\s]", "", (title or "").lower()).strip()


def calculate_h_index(citations):
    h = 0
    for i, c in enumerate(sorted(citations, reverse=True)):
        if c >= i + 1:
            h = i + 1
        else:
            break
    return h


def merge(existing_pubs, fresh_pubs):
    fresh_by_title = {normalize_title(p["title"]): p for p in fresh_pubs}
    seen = set()
    merged = []

    for ex in existing_pubs:
        key = normalize_title(ex.get("title", ""))
        seen.add(key)
        fresh = fresh_by_title.get(key)
        if fresh is None:
            merged.append(ex)
            continue
        updated = dict(ex)
        updated["citations"] = fresh["citations"]
        if not updated.get("year") and fresh.get("year"):
            updated["year"] = fresh["year"]
        merged.append(updated)

    for fr in fresh_pubs:
        if normalize_title(fr["title"]) not in seen:
            merged.append(fr)

    merged.sort(key=lambda x: (-(x.get("year") or 0), -(x.get("citations") or 0)))
    return merged


def load_existing():
    if not os.path.exists(OUTPUT_FILE):
        return {"publications": []}
    with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    print("Fetching publications from Semantic Scholar...")
    try:
        fresh = fetch_from_semantic_scholar()
    except Exception as e:
        print(f"ERROR: failed to fetch from Semantic Scholar: {e}", file=sys.stderr)
        sys.exit(1)

    existing = load_existing()
    publications = merge(existing.get("publications", []), fresh)

    citation_counts = [p.get("citations") or 0 for p in publications]
    data = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "stats": {
            "papers": len(publications),
            "citations": sum(citation_counts),
            "hIndex": calculate_h_index(citation_counts),
            "i10Index": sum(1 for c in citation_counts if c >= 10),
        },
        "publications": publications,
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Updated {OUTPUT_FILE}")
    print(f"Found {data['stats']['papers']} publications with {data['stats']['citations']} total citations")
    print(f"h-index: {data['stats']['hIndex']}, i10-index: {data['stats']['i10Index']}")


if __name__ == "__main__":
    main()
