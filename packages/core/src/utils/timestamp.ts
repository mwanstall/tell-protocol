export function nowISO(): string {
  return new Date().toISOString();
}

export function daysBetween(dateA: string | Date, dateB: string | Date): number {
  const a = typeof dateA === 'string' ? new Date(dateA) : dateA;
  const b = typeof dateB === 'string' ? new Date(dateB) : dateB;
  const diffMs = Math.abs(b.getTime() - a.getTime());
  return diffMs / (1000 * 60 * 60 * 24);
}

export function isStale(lastSignalAt: string | undefined, thresholdDays: number): boolean {
  if (!lastSignalAt) return true;
  return daysBetween(lastSignalAt, new Date()) > thresholdDays;
}
