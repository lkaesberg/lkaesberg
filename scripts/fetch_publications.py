#!/usr/bin/env python3
"""
Fetch publications from Google Scholar and update the publications.json file.
Uses the scholarly library to query Google Scholar.
"""

import json
import os
from datetime import datetime

try:
    from scholarly import scholarly
except ImportError:
    print("Installing scholarly...")
    import subprocess
    subprocess.check_call(["pip", "install", "scholarly"])
    from scholarly import scholarly

# Google Scholar author ID for Lars Benedikt Kaesberg
SCHOLAR_ID = "MGBdtVsAAAAJ"
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "publications.json")


def fetch_publications():
    """Fetch publications from Google Scholar."""
    try:
        # Get author by ID
        author = scholarly.search_author_id(SCHOLAR_ID)
        author = scholarly.fill(author, sections=["basics", "publications"])
        
        publications = []
        total_citations = 0
        
        for pub in author.get("publications", []):
            # Fill publication details
            try:
                filled_pub = scholarly.fill(pub)
            except Exception:
                filled_pub = pub
            
            bib = filled_pub.get("bib", {})
            
            pub_data = {
                "title": bib.get("title", "Untitled"),
                "authors": bib.get("author", ""),
                "venue": bib.get("venue", bib.get("journal", bib.get("conference", ""))),
                "year": int(bib.get("pub_year", 0)) if bib.get("pub_year") else None,
                "citations": filled_pub.get("num_citations", 0),
                "url": filled_pub.get("pub_url") or filled_pub.get("eprint_url"),
                "type": determine_publication_type(bib)
            }
            
            publications.append(pub_data)
            total_citations += pub_data["citations"]
        
        # Sort by year (descending) and citations
        publications.sort(key=lambda x: (-(x["year"] or 0), -(x["citations"] or 0)))
        
        # Calculate statistics
        h_index = calculate_h_index([p["citations"] for p in publications])
        i10_index = sum(1 for p in publications if p["citations"] >= 10)
        
        data = {
            "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
            "stats": {
                "papers": len(publications),
                "citations": total_citations,
                "hIndex": h_index,
                "i10Index": i10_index
            },
            "publications": publications
        }
        
        return data
        
    except Exception as e:
        print(f"Error fetching publications: {e}")
        # Return existing data if available
        if os.path.exists(OUTPUT_FILE):
            with open(OUTPUT_FILE, "r") as f:
                return json.load(f)
        raise


def determine_publication_type(bib):
    """Determine the type of publication."""
    venue = bib.get("venue", "").lower()
    title = bib.get("title", "").lower()
    
    if "thesis" in venue or "dissertation" in venue:
        return "thesis"
    elif "workshop" in venue or "sdp" in venue:
        return "workshop"
    elif "arxiv" in venue:
        return "preprint"
    elif "journal" in bib:
        return "journal"
    else:
        return "conference"


def calculate_h_index(citations):
    """Calculate h-index from a list of citation counts."""
    citations_sorted = sorted(citations, reverse=True)
    h = 0
    for i, c in enumerate(citations_sorted):
        if c >= i + 1:
            h = i + 1
        else:
            break
    return h


def main():
    print("Fetching publications from Google Scholar...")
    data = fetch_publications()
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # Write to file
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Updated {OUTPUT_FILE}")
    print(f"Found {data['stats']['papers']} publications with {data['stats']['citations']} total citations")
    print(f"h-index: {data['stats']['hIndex']}, i10-index: {data['stats']['i10Index']}")


if __name__ == "__main__":
    main()
