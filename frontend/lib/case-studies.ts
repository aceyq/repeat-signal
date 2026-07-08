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
  },
  {
    city: "sf",
    cityLabel: "San Francisco",
    headline: "Multiple responses to the same address",
    body: "San Francisco's Domestic Violence Death Review Team, created under California law to study fatal cases and improve emergency response, published a pilot report examining a 2014 homicide that was preceded by, in the report's own words, “multiple responses to the victim's address.” Rather than naming who was involved, the report focuses on what the system could have done differently: how dispatchers handle repeat calls to the same location, whether officers can enforce physical separation after a violent incident, and how information passes from one responding officer to the next.",
    sourceLabel: "San Francisco Domestic Violence Death Review Team (DVDRT) Pilot Report (2023)",
    sourceUrl:
      "https://www.sf.gov/sites/default/files/2023-06/2023%20San%20Francisco%20Domestic%20Violence%20Death%20Review%20Team%20(DVDRT)%20Pilot%20Report.pdf",
  },
];
