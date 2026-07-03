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
- **Demographic fields exist in some source data — correction from an earlier draft of this document:** NYPD's complaint data includes per-complaint `susp_race`, `susp_sex`, `susp_age_group`, `vic_race`, `vic_sex`, `vic_age_group` fields (categorical, self/officer-reported at time of report — not verified, not linked to any identity). Chicago and San Francisco's datasets do **not** include comparable individual-level demographic fields. An earlier version of this document stated that no source dataset included individual-level demographics; that was incorrect and is corrected here. See the open decision on how (or whether) this project uses those NYC fields, tracked alongside this document.

## Policy: demographic fields (NYC `susp_*`/`vic_*` race, sex, age group)

Decided 2026-07-03. This is the most sensitive methodological area in the project, so the rule is explicit:

- Demographic data is **context for exploration, never evidence of discrimination or intent**. We do not publish claims like "X group is treated worse" — causal/intent framing is off the table regardless of what a raw comparison shows.
- Comparisons are only ever shown as **rates with population denominators** (public census data), never raw counts, and only after **controlling for obvious confounders** where the data allows it — incident type, precinct/neighborhood, time of day, severity. If a comparison can't be reasonably controlled for confounders with the data we have, we don't show it as a finding.
- Every demographic comparison ships with **explicit, plain-language uncertainty**, in the site's own voice, not hedged in a footnote. House style:
  - ❌ "Women's reports are taken less seriously."
  - ✅ "In this dataset, reports filed by women had a median response time X minutes longer than reports filed by men. Many factors could contribute to this — incident type, neighborhood, staffing levels, reporting practices, or variables this data doesn't capture. This project explores patterns; it does not establish causation."
- Demographic breakdowns are **optional, reader-driven exploration filters**, not the narrative spine of the site. The default story the site tells is about geography/time/incident-type patterns; a reader can choose to add a demographic lens, but the site's own narrative voice never leads with one.
- If the available data can't support a statistically meaningful demographic comparison (sample size, missing confounders, etc.), **the site says so explicitly** rather than implying a conclusion anyway.
- **This analysis follows the evidence, not the other way around.** If, once we're in Milestone 2 exploration, the demographic angle turns out weak, confounded beyond repair, or unsupported by the data we actually have, we drop or shrink it rather than force it into the narrative — and pivot toward whatever story the data actually supports well. The original five research questions in the README are a starting hypothesis, not a contract.

## How this shows up in the site itself

- Every chart or map that shows a pattern will have an adjacent, easy-to-find caveat about what it can't show.
- A dedicated "About this data" / limitations section will be a first-class part of the narrative, not a buried footnote.
- Case studies drawn from public reporting will be clearly cited to their original public source.

This document will grow as we get further into the data and encounter specific edge cases worth documenting.
