# Case Study Sourcing — Milestone 8

Documents how the three case studies in `frontend/lib/case-studies.ts` were selected and
verified. See `docs/ETHICS.md` for the policy this follows; the short version is: only
already-published, publicly-sourced information, cited at its original source, never
anything derived from re-identifying anyone in this project's own open incident data.

## Selection process

All three were found via live web search during this milestone (not recalled from
training-data memory) and cross-checked against official/primary sources before any
copy was written. One candidate was proposed per city, prioritizing sources where the
facts are independently verifiable: government fatality-review reports and a major
investigative-journalism outlet, rather than local news aggregation or secondhand
retellings. The user reviewed and approved all three before the section was built.

## Chicago — ProPublica, "Domestic Violence Fatalities in Illinois Are Still Not Getting Reviewed" (2025)

- **URL:** https://www.propublica.org/article/deaths-are-rising-but-illinois-domestic-violence-review-boards-have-yet-to-offer-solutions
- **What it is:** an investigative piece about a systemic accountability gap — Illinois passed a law in 2021 requiring counties to review domestic violence deaths, but as of this reporting only 7 of 102 counties had done so, and Cook County (Chicago) was not one of them.
- **Names two real individuals**, both via facts already made public through court records and this reporting: Lacramioara Beldie (killed November 2024) and Tanisha Weeks (killed January 2025). Specific facts used on the site (the six-week gap between Constantin Beldie's court release and the killing, the missing evidence of prior abuse at that hearing, Weeks's December 2024 order of protection) are drawn directly from this article.
- **Why this one:** it's the only candidate that names individuals, and it does so as part of a story about *systemic review failure*, not a victim-focused narrative — which fits this project's framing of context over blame.

## New York City — NYC Domestic Violence Fatality Review Committee, 2024 Annual Report

- **URL:** https://www.nyc.gov/site/ocdv/press-resources/fatality-review-committee.page
- **What it is:** the City's own official committee (established by local law) that reviews family-related homicides annually.
- **Statistic used:** "more than 60% of those murdered by an intimate partner had no prior contact with a municipal institution" (police, courts, shelters, city/state agencies). Verified via a secondary source quoting the report directly (`urinyc.org`'s "Every Death Was Preventable" advocacy report) after the primary PDF could not be parsed for text extraction — the quote matched exactly, giving confidence in it. No individuals are named; this is an aggregate, city-published statistic.
- **A caution for future editors:** an earlier search pass surfaced a differently-worded "39%" figure attributed to NYPD-specific contact specifically (not "municipal institution" broadly) from a different report year. That number was **not** used on the site because it couldn't be independently re-verified against readable primary-source text before publishing — only the "60%+ had no contact" framing, confirmed by two independent fetches, made it into the copy. If revisiting this card, re-verify any more specific percentage directly against the primary PDF rather than a search-engine summary.

## San Francisco — SF Domestic Violence Death Review Team (DVDRT) Pilot Report (2023)

- **URL:** https://www.sf.gov/sites/default/files/2023-06/2023%20San%20Francisco%20Domestic%20Violence%20Death%20Review%20Team%20(DVDRT)%20Pilot%20Report.pdf
- **What it is:** a pilot report by a City-created review team (under California Penal Code 11163.3) examining a single 2014 homicide case to identify systemic/procedural failures (dispatch handling of repeat calls, physical-separation enforcement, body-worn camera use, information handoff between responding officers).
- **Quote used:** "multiple responses to the victim's address" — directly from the report.
- **No individuals are named** — the report itself is written anonymously, focused entirely on process, which is exactly the framing this project wants.
- **Second quote added later, used in the homepage's opening chapter (`components/dispatch/call-transcript.tsx`):** the report's chronology section includes a directly quoted excerpt from the caller's own 10:10pm call — her fourth of six calls that night (8:37pm, 9:14pm, 9:33pm — explicitly labeled "for a third time" in the report — 10:10pm, and two at 4:00am; a separate 9:19pm call was placed by a roommate, not counted here): "getting a little bit more, um, scared, because it's an escalating domestic violence situation." Read the full PDF (not just a search-engine summary) to confirm this — the report's Executive Summary/Analysis sections mostly paraphrase, but the Chronology of Events section transcribes several direct quotes from call records, officer depositions, and text messages between officers, all sourced to redacted civil-litigation deposition transcripts and a 2017 *San Francisco Chronicle* investigative piece (footnoted in the report) that the DVDRT also drew on.
- **The opening chapter's other two non-quote lines are also cited facts, not summary:** "she called 911 six times that night" (the count above) and "police visited three times" (the report states "three (3) visits to the scene by members of the San Francisco Police Department (SFPD)"). If either of these figures is revised in a future edit, re-verify against the PDF's chronology directly — it's easy to miscount call sequences from a search-engine summary, which is exactly the mistake to avoid here (an earlier draft of this note miscounted the 10:10pm call as her "third" rather than fourth).
- **A caution for future editors:** the DVDRT report's own footnote 7 links to that 2017 *San Francisco Chronicle* piece via a URL slug that names the victim. The DVDRT report itself chose to anonymize her as "Victim" throughout — this project follows that same choice deliberately (matching the anonymization pattern already used for the NYC card) rather than independently deciding to name her, even though the name is discoverable via the cited footnote. Do not add her name to this project's copy without a fresh, explicit decision to do so.
- **Location used in Chapter 5's card ("SOMA, San Francisco"):** the chronology states the address was "on Natoma Street in the SOMA neighborhood of San Francisco." Only the neighborhood is used, never the street — same privacy standard as this project's own incident data (block/neighborhood level, never an address).

## Chapter 5 additions (Milestone 9.10)

- **Chicago's timeline** (`CaseStudy.timeline` in `lib/case-studies.ts`) invents no new facts — every entry is already stated in this card's own `body` text, above: the 2021 law, the ~6-week gap before Lacramioara Beldie's killing, both killings, Tanisha Weeks's December 2024 order of protection, and the county-review-board finding. It's a restructuring of already-approved copy into dated, chronological form, not new research.
- **NYC's card has no timeline, on purpose.** Its source (the Fatality Review Committee's aggregate statistic) doesn't describe a single incident with dated events — it's a citywide percentage. Do not add a fabricated timeline to this card in a future edit; if a genuinely documented NYC incident with real dates is found later, that would be a new sourcing decision, not an extension of this one.
- **Record types** ("Investigative journalism" for Chicago, "Government report" for NYC and SF) describe what kind of source each already is, per the "What it is" notes above — not a new claim requiring separate verification.

## What we deliberately did not do

- Did not invent, embellish, or infer any fact beyond what these sources state.
- Did not attempt to connect any of these cases to specific rows in this project's own incident-level data — the case studies and the dataset are presented side by side, explicitly not as proof of each other (see `components/sections/continue-section.tsx`).
- Did not select cases to make a political point about any city, department, or demographic — all three were chosen because they were the best-documented, most independently-verifiable examples found per city, and two of the three (NYC, SF) are anonymized specifically to avoid the ethical weight of naming a real victim where it isn't necessary to make the point.
