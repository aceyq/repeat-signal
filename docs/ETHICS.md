# Responsible Data Use & Limitations

This project handles a sensitive subject — police reports and emergency calls, often connected to real harm experienced by real people. This document exists so that every design and analysis decision can be checked against it.

## What this project is

An exploration of **aggregate, public patterns** in incident-level open data, paired with **already-public** case studies as narrative context. The goal is to help a reader understand what large-scale patterns in this kind of data can look like, and to be honest about where those patterns stop being informative.

## What this project is not

- **Not** an attempt to identify, locate, or draw conclusions about any specific individual, victim, or address. All source datasets used here already redact exact addresses (block-level or precinct-level only) — we will not attempt to reverse that redaction through triangulation, cross-referencing, or any other technique.
- **Not** a claim that any city, department, or demographic group is more or less responsible for the patterns observed. Reporting-rate differences can be driven by many factors (patrol allocation, community trust in police, population density, reporting-channel availability) that this data cannot, on its own, disentangle.
- **Not** a predictive or risk-scoring tool. Nothing in this project should be read as identifying who is "at risk" — that would be an irresponsible and unsupported use of aggregate historical data.
- **Not** a political statement for or against any policy position. Findings are reported as observed patterns with explicit uncertainty, not advocacy.

## Known limitations of the data (to be expanded as we work with it)

- **Reporting bias, not incidence:** these datasets record *reported* incidents, not all incidents that occurred. Underreporting varies by category (e.g., domestic violence is well-documented as underreported) and by neighborhood.
- **Redacted geography:** locations are block-level or precinct-level, not exact — appropriate for privacy, but it limits how fine-grained any "same location, repeat calls" analysis can be.
- **Category inconsistency across cities:** each city defines and labels incident categories differently; our cross-city normalization (see `docs/ARCHITECTURE.md`) is an approximation, and we will document exactly how categories are mapped so readers can judge that mapping themselves.
- **No demographic ground truth:** where we discuss "available demographic information," we mean neighborhood-level public census data joined in, never individual-level demographic data — none of the source datasets include or infer individual demographics, and we will not attempt to add any.

## How this shows up in the site itself

- Every chart or map that shows a pattern will have an adjacent, easy-to-find caveat about what it can't show.
- A dedicated "About this data" / limitations section will be a first-class part of the narrative, not a buried footnote.
- Case studies drawn from public reporting will be clearly cited to their original public source.

This document will grow as we get further into the data and encounter specific edge cases worth documenting.
