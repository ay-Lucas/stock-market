/**
 * Converts a UTC timestamp in milliseconds to a date string formatted as YYYY-MM-DD.
 *
 * @param milliseconds - The UTC timestamp in milliseconds.
 * @returns The formatted date string in the format YYYY-MM-DD.
 *
 */
export function convertMillisecondsToDateString(milliseconds: number): string {
  const date = new Date(milliseconds);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
