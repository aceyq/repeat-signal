# Data Sources

All data used in this project is **public, open, government-published data**. No private, leaked, or scraped-from-individuals data is used anywhere in this project. Every dataset listed below is published by the city itself specifically for public access and research.

> **Note:** Dataset identifiers below are recorded from public knowledge of these open data portals and will be verified against the live API during the Milestone 1 (data acquisition) work — portal IDs and schemas do occasionally change, and confirming them against the live endpoint is the first task of that milestone, not an assumption we build on blindly.

## Chicago

- **Portal:** Chicago Data Portal (data.cityofchicago.org), powered by Socrata.
- **Primary dataset:** "Crimes - 2001 to Present" — incident-level reported crime data including date, primary type/description, block-level location (street address redacted to block level for privacy), community area, and ward.
- **Supporting data:** Community area boundaries (GeoJSON/Shapefile) for mapping, also published on the same portal.
- **Why it's useful here:** Very large volume, long time range (2001–present), and consistently documented field definitions — best dataset for the "how do trends change over time" question.

## New York City

- **Portal:** NYC Open Data (data.cityofnewyork.us).
- **Primary datasets:** "NYPD Complaint Data Historic" (closed cases, multi-decade) and "NYPD Complaint Data Current (Year To Date)" — incident-level complaint data with offense classification, borough, precinct, and approximate location.
- **Supporting data:** NYPD precinct boundaries (GeoJSON), also published on the portal.
- **Why it's useful here:** NYC has by far the richest supply of *already-public, already-reported* journalism and case studies to pair as narrative anchors — important for the human-story sections without needing to identify anyone ourselves.

## San Francisco

- **Portal:** DataSF (data.sfgov.org).
- **Primary dataset:** "Police Department Incident Reports: 2018 to Present" — incident-level reports with category, resolution, neighborhood (SF publishes an official analysis-neighborhood boundary layer), and approximate location.
- **Why it's useful here:** Smallest and cleanest of the three — useful as a sanity check for the normalization pipeline before scaling up to Chicago/NYC volume, and a good place to catch schema-mapping bugs early and cheap.

## What this data can and cannot tell us

This is expanded fully in [ETHICS.md](ETHICS.md), but the short version: this data is **incident-level and location-approximate** (deliberately, for privacy — addresses are block-level or precinct-level, not exact). It cannot tell us who called, who was involved, or confirm any individual's story. It can tell us aggregate patterns: how often certain categories of incidents recur in the same area, how reporting volume shifts over time, and how that compares across categories and cities.

## Case study sourcing

Any specific human case referenced in the narrative sections of the site will come from **already-published, public-record sources** — news reporting, court records, or official government reports (e.g., DOJ reviews) — never from re-identifying anyone in the open incident data. Sourcing/citations for every case study used will be listed alongside that section of the site once built.
