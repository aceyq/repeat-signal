# Data Dictionary — Milestone 1 Findings

Generated from live API samples (20,000 rows per city, most-recent-first) pulled and explored in `notebooks/01_chicago_data_exploration.ipynb`, `02_nyc_data_exploration.ipynb`, and `03_sf_data_exploration.ipynb` on 2026-07-03. This documents what the data **actually** looks like, superseding any assumptions in earlier drafts of `docs/DATA_SOURCES.md`.

## Cross-city comparison

| | Chicago | NYC | San Francisco |
|---|---|---|---|
| Dataset | `ijzp-q8t2` (Crimes 2001–Present) | `5uac-w243` (Complaint YTD) / `qgea-i56i` (Historic) | `wg3w-h783` (Incident Reports 2018–Present) |
| Date field | `date` | `cmplnt_fr_dt` (+ `cmplnt_to_dt` for ranged incidents) | `incident_datetime` |
| Category field | `primary_type` (+ `description` sub-type) | `ofns_desc` (+ `pd_desc` sub-type), `law_cat_cd` for severity | `incident_category` (+ `incident_subcategory`) |
| Geography (native) | `community_area` — numeric code, 1–77, 0% missing in sample | `boro_nm` (5 boroughs, coarse) + `addr_pct_cd` (78 precincts, 0% missing) | `analysis_neighborhood` — **named**, 41 values, 3.4% missing |
| Geography (needs join for neighborhood name/shape) | Yes — numeric code needs boundary/name file | Yes — precinct isn't a neighborhood; needs lat/lon → NTA spatial join | No — already named |
| Lat/lon completeness | 99.7% | ~100% (not separately audited, appeared complete in sample) | 96.6% |
| Domestic/family-violence signal | `domestic` — native boolean, 19.7% True in sample | None directly; would have to infer from `ofns_desc` text (weaker) | `incident_category = "Offences Against The Family And Children"` only (309 rows, undercounts likely) |
| Individual-level demographic fields | None | **Yes** — `susp_race`, `susp_sex`, `susp_age_group`, `vic_race`, `vic_sex`, `vic_age_group` | None |
| Approx. reporting volume (from sample date span) | ~20,000 incidents / month | ~20,000 incidents / 2 weeks | ~20,000 incidents / 3 months |
| Known dirty-data issues | None found in this sample | `susp_age_group`/`vic_age_group` contain stray sentinel values (`"2026"`, `"-960"`, `"-968"`); `"(null)"` used as a literal string in several fields including `boro_nm` | None found in this sample |

## Implication for Milestone 2 (cross-city normalization)

- **Category normalization** is the biggest cross-city mapping task — three different label vocabularies (`primary_type`, `ofns_desc`, `incident_category`) need to collapse into one shared `category` taxonomy, with the original label preserved as `raw_category` for transparency (per `docs/ARCHITECTURE.md`).
- **Geography** needs two different join strategies: Chicago's `community_area` joins to a boundary file by code; NYC needs an actual lat/lon → polygon spatial join since it has no pre-assigned neighborhood field; SF needs no join at all for neighborhood name, only for the boundary geometry itself (for maps).
- **The "domestic-related" question can't be asked identically across all three cities.** Chicago has a real flag; SF has a narrow category that likely undercounts; NYC has neither and would require inferring from free-text offense descriptions, which is meaningfully weaker evidence. The site's narrative needs to state this limitation explicitly rather than silently comparing three cities as if they measured the same thing.
- **The NYC demographic fields carry a real usability ceiling**, not just an ethical one: ~33–38% of suspect/victim race values are unusable (`"UNKNOWN"` or literal `"(null)"`) even before we get to `docs/ETHICS.md`'s confounder-control requirements. Milestone 2 needs to quantify, on the *full* historical dataset (not just this 20k-row window), how large a usable, confounder-controllable subset actually remains before deciding how much weight that analysis can bear.
