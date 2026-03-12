/**
 * Convert a string to a URL/filesystem-friendly slug.
 *
 * "Mobile App" → "mobile-app"
 * "My  Cool--Portfolio!" → "my-cool-portfolio"
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '');    // trim leading/trailing hyphens
}
