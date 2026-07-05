"""
Maps each city's raw incident category label to one shared taxonomy.

Every raw value below was pulled directly from each city's live API via a
`$group`-by-category query during Milestone 2 (see docs/DATA_DICTIONARY.md) --
nothing here is guessed from a handful of sample rows. If a new raw category
value shows up that isn't in these dictionaries, `map_category()` raises
rather than silently miscategorizing it, so pipeline runs surface schema
drift instead of hiding it.

A note on "domestic_family_related": this shared category exists because SF's
"Offences Against The Family And Children" and Chicago's rare literal
"DOMESTIC VIOLENCE" primary_type both map here. It is NOT the same signal as
Chicago's separate `domestic` boolean flag, which cuts across every category
and is far more complete -- see docs/DATA_DICTIONARY.md and docs/ETHICS.md.
Cross-city "domestic-related" comparisons must not conflate the two.
"""

OTHER_ADMINISTRATIVE = "other_administrative"

CHICAGO_CATEGORY_MAP = {
    "THEFT": "theft",
    "DECEPTIVE PRACTICE": "fraud_deception",
    "BATTERY": "assault_battery",
    "ASSAULT": "assault_battery",
    "CRIMINAL DAMAGE": "criminal_damage_vandalism",
    "NARCOTICS": "narcotics_drug",
    "OTHER NARCOTIC VIOLATION": "narcotics_drug",
    "OTHER OFFENSE": OTHER_ADMINISTRATIVE,
    "BURGLARY": "burglary",
    "MOTOR VEHICLE THEFT": "motor_vehicle_theft",
    "ROBBERY": "robbery",
    "CRIMINAL TRESPASS": "trespass",
    "WEAPONS VIOLATION": "weapons",
    "CONCEALED CARRY LICENSE VIOLATION": "weapons",
    "PROSTITUTION": "prostitution_commercial_sex",
    "OFFENSE INVOLVING CHILDREN": "domestic_family_related",
    "PUBLIC PEACE VIOLATION": "public_order_disorderly",
    "SEX OFFENSE": "sexual_offense",
    "CRIM SEXUAL ASSAULT": "sexual_offense",
    "CRIMINAL SEXUAL ASSAULT": "sexual_offense",
    "INTERFERENCE WITH PUBLIC OFFICER": OTHER_ADMINISTRATIVE,
    "LIQUOR LAW VIOLATION": "public_order_disorderly",
    "GAMBLING": "public_order_disorderly",
    "ARSON": "arson",
    "HOMICIDE": "homicide",
    "KIDNAPPING": "kidnapping",
    "STALKING": "stalking_harassment",
    "INTIMIDATION": "stalking_harassment",
    "OBSCENITY": "sexual_offense",
    "PUBLIC INDECENCY": "sexual_offense",
    "HUMAN TRAFFICKING": "human_trafficking",
    "NON-CRIMINAL": OTHER_ADMINISTRATIVE,
    "RITUALISM": OTHER_ADMINISTRATIVE,
    "DOMESTIC VIOLENCE": "domestic_family_related",
}

NYC_CATEGORY_MAP = {
    "PETIT LARCENY": "theft",
    "HARRASSMENT 2": "stalking_harassment",
    "ASSAULT 3 & RELATED OFFENSES": "assault_battery",
    "GRAND LARCENY": "theft",
    "CRIMINAL MISCHIEF & RELATED OF": "criminal_damage_vandalism",
    "VEHICLE AND TRAFFIC LAWS": "traffic",
    "FELONY ASSAULT": "assault_battery",
    "MISCELLANEOUS PENAL LAW": OTHER_ADMINISTRATIVE,
    "DANGEROUS DRUGS": "narcotics_drug",
    "OFF. AGNST PUB ORD SENSBLTY &": "public_order_disorderly",
    "OTHER OFFENSES RELATED TO THEFT": "theft",
    "ROBBERY": "robbery",
    "GRAND LARCENY OF MOTOR VEHICLE": "motor_vehicle_theft",
    "BURGLARY": "burglary",
    "OFFENSES AGAINST PUBLIC ADMINI": OTHER_ADMINISTRATIVE,
    "SEX CRIMES": "sexual_offense",
    "DANGEROUS WEAPONS": "weapons",
    "FORGERY": "fraud_deception",
    "ADMINISTRATIVE CODE": OTHER_ADMINISTRATIVE,
    "OTHER STATE LAWS": OTHER_ADMINISTRATIVE,
    "CRIMINAL TRESPASS": "trespass",
    "INTOXICATED & IMPAIRED DRIVING": "traffic",
    "FRAUDS": "fraud_deception",
    "THEFT-FRAUD": "fraud_deception",
    "RAPE": "sexual_offense",
    "POSSESSION OF STOLEN PROPERTY": "theft",
    "OFFENSES INVOLVING FRAUD": "fraud_deception",
    "OFFENSES AGAINST THE PERSON": "assault_battery",
    "UNAUTHORIZED USE OF A VEHICLE": "motor_vehicle_theft",
    "PETIT LARCENY OF MOTOR VEHICLE": "motor_vehicle_theft",
    "OTHER STATE LAWS (NON PENAL LAW)": OTHER_ADMINISTRATIVE,
    "PROSTITUTION & RELATED OFFENSES": "prostitution_commercial_sex",
    "GAMBLING": "public_order_disorderly",
    "BURGLAR'S TOOLS": "burglary",
    "CANNABIS RELATED OFFENSES": "narcotics_drug",
    "ARSON": "arson",
    "OFFENSES AGAINST PUBLIC SAFETY": OTHER_ADMINISTRATIVE,
    "MURDER & NON-NEGL. MANSLAUGHTER": "homicide",
    "KIDNAPPING & RELATED OFFENSES": "kidnapping",
    "ANTICIPATORY OFFENSES": OTHER_ADMINISTRATIVE,
    "CHILD ABANDONMENT/NON SUPPORT 1": "domestic_family_related",
    "ALCOHOLIC BEVERAGE CONTROL LAW": "public_order_disorderly",
    "DISORDERLY CONDUCT": "public_order_disorderly",
    "FRAUDULENT ACCOSTING": "fraud_deception",
    "OFFENSES RELATED TO CHILDREN": "domestic_family_related",
    "ESCAPE 3": OTHER_ADMINISTRATIVE,
    "INTOXICATED/IMPAIRED DRIVING": "traffic",
    "NEW YORK CITY HEALTH CODE": OTHER_ADMINISTRATIVE,
    "HOMICIDE-NEGLIGENT,UNCLASSIFIE": "homicide",
    "(null)": OTHER_ADMINISTRATIVE,
    "JOSTLING": "theft",
    "HOMICIDE-NEGLIGENT-VEHICLE": "homicide",
    "UNLAWFUL POSS. WEAP. ON SCHOOL": "weapons",
    "OTHER TRAFFIC INFRACTION": "traffic",
    # The values below only appear in NYC's "Historic" dataset (qgea-i56i), not the
    # current-YTD one -- discovered when the pipeline's unmapped-category guard
    # (scripts/category_mapping.py::map_category) raised on real historic data.
    "OTHER OFFENSES RELATED TO THEF": "theft",  # truncated variant of "...THEFT"
    "NYS LAWS-UNCLASSIFIED FELONY": OTHER_ADMINISTRATIVE,
    "OTHER STATE LAWS (NON PENAL LA": OTHER_ADMINISTRATIVE,  # truncated variant
    "THEFT OF SERVICES": "theft",
    "AGRICULTURE & MRKTS LAW-UNCLASSIFIED": OTHER_ADMINISTRATIVE,
    "CHILD ABANDONMENT/NON SUPPORT": "domestic_family_related",
    "ENDAN WELFARE INCOMP": "domestic_family_related",  # endangering welfare of an incompetent/dependent person
    "LOITERING/GAMBLING (CARDS, DIC": "public_order_disorderly",  # truncated "...DICE)"
    "NYS LAWS-UNCLASSIFIED VIOLATION": OTHER_ADMINISTRATIVE,
    "DISRUPTION OF A RELIGIOUS SERV": "public_order_disorderly",
    "FELONY SEX CRIMES": "sexual_offense",
    "LOITERING": "public_order_disorderly",
    "LOITERING FOR DRUG PURPOSES": "narcotics_drug",
    "ADMINISTRATIVE CODES": OTHER_ADMINISTRATIVE,
    "FORTUNE TELLING": "public_order_disorderly",
    "LOITERING/DEVIATE SEX": "prostitution_commercial_sex",
    "ABORTION": OTHER_ADMINISTRATIVE,
    "OFFENSES AGAINST MARRIAGE UNCL": OTHER_ADMINISTRATIVE,
    "UNDER THE INFLUENCE OF DRUGS": "narcotics_drug",
    "KIDNAPPING AND RELATED OFFENSES": "kidnapping",
}

SF_CATEGORY_MAP = {
    "Larceny Theft": "theft",
    "Other Miscellaneous": OTHER_ADMINISTRATIVE,
    "Malicious Mischief": "criminal_damage_vandalism",
    "Assault": "assault_battery",
    "Burglary": "burglary",
    "Motor Vehicle Theft": "motor_vehicle_theft",
    "Motor Vehicle Theft?": "motor_vehicle_theft",
    "Recovered Vehicle": "motor_vehicle_theft",
    "Non-Criminal": OTHER_ADMINISTRATIVE,
    "Warrant": OTHER_ADMINISTRATIVE,
    "Fraud": "fraud_deception",
    "Drug Offense": "narcotics_drug",
    "Drug Violation": "narcotics_drug",
    "Lost Property": OTHER_ADMINISTRATIVE,
    "Missing Person": "kidnapping",
    "Robbery": "robbery",
    "Suspicious Occ": OTHER_ADMINISTRATIVE,
    "Suspicious": OTHER_ADMINISTRATIVE,
    "Disorderly Conduct": "public_order_disorderly",
    "Offences Against The Family And Children": "domestic_family_related",
    "Miscellaneous Investigation": OTHER_ADMINISTRATIVE,
    "Traffic Violation Arrest": "traffic",
    "Traffic Collision": "traffic",
    "Other": OTHER_ADMINISTRATIVE,
    "Other Offenses": OTHER_ADMINISTRATIVE,
    "Weapons Offense": "weapons",
    "Weapons Offence": "weapons",
    "Weapons Carrying Etc": "weapons",
    "Stolen Property": "theft",
    "Case Closure": OTHER_ADMINISTRATIVE,
    "Forgery And Counterfeiting": "fraud_deception",
    "Courtesy Report": OTHER_ADMINISTRATIVE,
    "Arson": "arson",
    "Vandalism": "criminal_damage_vandalism",
    "Fire Report": OTHER_ADMINISTRATIVE,
    "Embezzlement": "fraud_deception",
    "Sex Offense": "sexual_offense",
    "Prostitution": "prostitution_commercial_sex",
    "Civil Sidewalks": "public_order_disorderly",
    "Vehicle Impounded": OTHER_ADMINISTRATIVE,
    "Suicide": OTHER_ADMINISTRATIVE,
    "Vehicle Misplaced": OTHER_ADMINISTRATIVE,
    "Rape": "sexual_offense",
    "Homicide": "homicide",
    "Liquor Laws": "public_order_disorderly",
    "Human Trafficking (A), Commercial Sex Acts": "human_trafficking",
    "Human Trafficking, Commercial Sex Acts": "human_trafficking",
    "Human Trafficking (B), Involuntary Servitude": "human_trafficking",
    "Gambling": "public_order_disorderly",
}

CITY_CATEGORY_MAPS = {
    "chicago": CHICAGO_CATEGORY_MAP,
    "nyc": NYC_CATEGORY_MAP,
    "sf": SF_CATEGORY_MAP,
}


def map_category(city: str, raw_category) -> str:
    """Map a city's raw category label to the shared taxonomy.

    Raises KeyError on an unmapped value rather than silently defaulting, so
    new/renamed categories in the source data surface as a visible pipeline
    failure instead of quietly landing in the wrong bucket.
    """
    if raw_category is None or (isinstance(raw_category, float)):
        return OTHER_ADMINISTRATIVE  # NaN from missing category
    city_map = CITY_CATEGORY_MAPS[city]
    try:
        return city_map[raw_category]
    except KeyError as exc:
        raise KeyError(
            f"Unmapped {city} category: {raw_category!r}. "
            f"Add it to CITY_CATEGORY_MAPS in scripts/category_mapping.py."
        ) from exc
