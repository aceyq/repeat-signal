import type { City } from "./types";

/**
 * Every fact below was verified via web search against official/primary sources
 * during Milestone 8 (see docs/CASE_STUDIES.md for full sourcing notes), not
 * recalled from memory. Chicago names two real individuals via already-published
 * court records and major-outlet investigative journalism (ProPublica); NYC and SF
 * are anonymized official government statistics/reports naming no one. See
 * docs/ETHICS.md for the policy this content follows.
 */
export interface CaseStudy {
  city: City;
  cityLabel: string;
  headline: string;
  body: string;
  sourceLabel: string;
  sourceUrl: string;
  /** How the source itself should be described, e.g. to distinguish a news
   * investigation from a primary government report -- shown as a small
   * badge, itself a real, sourced fact about the record, not a rating. */
  recordType: string;
  /** Neighborhood-level location, only added where the primary source states
   * it at that granularity -- never more specific (no street/address), same
   * privacy standard the project already applies to its own incident data. */
  location?: string;
  /** Real, dated milestones directly from the cited source -- omitted
   * entirely (not filled with an inference) for cases where the source is an
   * aggregate statistic rather than a single documented incident (NYC). */
  timeline?: { date: string; label: string }[];
  /** Optional isotype-style visual for a specific, precise count mentioned in `body`
   * -- only added where the source gives an exact number (not a rounded estimate). */
  pictogram?: { total: number; highlighted: number; caption: string };
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    city: "chicago",
    cityLabel: "Chicago",
    headline: "The reviews that never happened",
    body: "In November 2024, Chicago police found Lacramioara Beldie killed in an apparent murder-suicide by her estranged husband, Constantin — six weeks after he was released on electronic monitoring following a court hearing where prosecutors reportedly did not submit evidence of his alleged prior abuse. Two months later, Tanisha Weeks, a 41-year-old mother who had been granted an order of protection in December 2024, was killed in another apparent murder-suicide. Illinois passed a law in 2021 requiring counties to review domestic violence deaths for preventable failures — but as of this reporting, only 7 of the state's 102 counties had established a review board. Cook County, home to Chicago and roughly 40% of the state's population, was not one of them.",
    sourceLabel: "ProPublica, “Domestic Violence Fatalities in Illinois Are Still Not Getting Reviewed” (2025)",
    sourceUrl:
      "https://www.propublica.org/article/deaths-are-rising-but-illinois-domestic-violence-review-boards-have-yet-to-offer-solutions",
    recordType: "Investigative journalism",
    timeline: [
      { date: "2021", label: "Illinois passes a law requiring counties to review domestic violence deaths." },
      {
        date: "~6 weeks before Nov. 2024",
        label: "Constantin Beldie released on electronic monitoring; the hearing reportedly did not include evidence of his alleged prior abuse.",
      },
      { date: "November 2024", label: "Lacramioara Beldie found killed in an apparent murder-suicide." },
      { date: "December 2024", label: "Tanisha Weeks granted an order of protection." },
      { date: "January 2025", label: "Tanisha Weeks killed in an apparent murder-suicide." },
      { date: "2025", label: "Reporting finds only 7 of 102 Illinois counties have established a review board — not including Cook County." },
    ],
    pictogram: {
      total: 102,
      highlighted: 7,
      caption: "7 of Illinois's 102 counties had established a domestic violence fatality review board",
    },
  },
  {
    city: "nyc",
    cityLabel: "New York City",
    headline: "Most had no contact. Some did.",
    body: "According to New York City's own Domestic Violence Fatality Review Committee, in its 2024 Annual Report, more than 60% of people killed by an intimate partner in the city had no prior contact with any municipal institution — police, courts, shelters, or city and state agencies — before their deaths. Read the other way, that leaves a real, substantial minority of cases — documented by the city's own review process — where contact with the system did happen, and it did not prevent what came next.",
    sourceLabel: "NYC Domestic Violence Fatality Review Committee, 2024 Annual Report",
    sourceUrl: "https://www.nyc.gov/site/ocdv/press-resources/fatality-review-committee.page",
    recordType: "Government report",
    // No timeline: this source is a citywide aggregate statistic, not a
    // single documented incident with dated events -- forcing a timeline
    // onto it would invent structure the source doesn't have.
  },
  {
    city: "sf",
    cityLabel: "San Francisco",
    headline: "Multiple responses to the same address",
    body: "San Francisco's Domestic Violence Death Review Team, created under California law to study fatal cases and improve emergency response, published a pilot report examining a 2014 homicide that was preceded by, in the report's own words, “multiple responses to the victim's address.” Rather than naming who was involved, the report focuses on what the system could have done differently: how dispatchers handle repeat calls to the same location, whether officers can enforce physical separation after a violent incident, and how information passes from one responding officer to the next.",
    sourceLabel: "San Francisco Domestic Violence Death Review Team (DVDRT) Pilot Report (2023)",
    sourceUrl:
      "https://www.sf.gov/sites/default/files/2023-06/2023%20San%20Francisco%20Domestic%20Violence%20Death%20Review%20Team%20(DVDRT)%20Pilot%20Report.pdf",
    recordType: "Government report",
    location: "SOMA, San Francisco",
    // The full minute-by-minute timeline for this case lives in Chapter 2
    // (components/sections/response-chapter.tsx) -- linked from the card
    // rather than duplicated here.
  },
];
