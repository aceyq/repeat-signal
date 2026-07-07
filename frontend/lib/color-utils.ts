export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

export function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Resolves a CSS custom property (e.g. "--accent-chicago") to its current computed
 * value -- used wherever a library (MapLibre paint expressions, D3-drawn SVG) needs a
 * real color string rather than a live `var(...)` reference. */
export function resolveCssColor(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
