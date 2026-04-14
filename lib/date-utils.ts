const START_DATE = new Date("2024-11-21T00:00:00");

/** Returns the number of whole days elapsed since November 21, 2024. */
export function calcDays(): number {
  const ms = Date.now() - START_DATE.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
