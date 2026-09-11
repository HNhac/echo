export const brand = {
  name: "ECHO",
  tagline: "Thời trang bé gái",
} as const;

export function brandPageTitle(pageLabel: string): string {
  return `${pageLabel} — ${brand.name}`;
}

export function brandLogoParts(): { first: string; rest: string } {
  const w = brand.name.trim().split(/\s+/);
  return { first: w[0] ?? brand.name, rest: w.slice(1).join(" ") };
}
