/** "criminal_damage_vandalism" -> "Criminal damage / vandalism" -- readable enough for
 * chart labels without hand-maintaining a lookup table for all 21 shared categories
 * (see scripts/category_mapping.py). */
export function formatCategoryLabel(category: string): string {
  const words = category.split("_");
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + (words.length > 1 ? " " + words.slice(1).join(" ") : "");
}
