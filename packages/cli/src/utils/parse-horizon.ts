/**
 * Parse a human-friendly duration string (e.g. "6m", "2y", "30d") into
 * a time horizon with start (now) and target ISO-8601 dates.
 *
 * Supported units: d (days), w (weeks), m (months), y (years)
 * Returns undefined if the input is empty or doesn't match.
 */
export function parseHorizon(horizon: string | undefined): { start: string; target: string } | undefined {
  if (!horizon) return undefined;

  const match = horizon.match(/^(\d+)(d|w|m|y)$/);
  if (!match) return undefined;

  const [, num, unit] = match;
  const now = new Date();
  const target = new Date(now);
  const n = parseInt(num);

  if (unit === 'd') target.setDate(target.getDate() + n);
  else if (unit === 'w') target.setDate(target.getDate() + n * 7);
  else if (unit === 'm') target.setMonth(target.getMonth() + n);
  else if (unit === 'y') target.setFullYear(target.getFullYear() + n);

  return { start: now.toISOString(), target: target.toISOString() };
}
