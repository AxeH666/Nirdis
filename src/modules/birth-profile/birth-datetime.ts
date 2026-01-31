import { DateTime } from "luxon";

/**
 * Compute birth datetime in UTC from local date, time, and IANA timezone.
 * Used when saving BirthProfile after location resolution.
 *
 * @param birthDate - Local date (date-only, time ignored)
 * @param birthTime - Local time "HH:mm" (24-hour)
 * @param timezone - IANA timezone (e.g. "America/New_York")
 * @returns UTC Date for storage as birthUtc
 */
export function birthDatetimeUtc(
  birthDate: Date,
  birthTime: string,
  timezone: string
): Date {
  const y = birthDate.getFullYear();
  const m = birthDate.getMonth() + 1;
  const d = birthDate.getDate();
  const [hh, mm] = birthTime.split(":").map(Number);

  const local = DateTime.fromObject(
    { year: y, month: m, day: d, hour: hh ?? 0, minute: mm ?? 0, second: 0, millisecond: 0 },
    { zone: timezone }
  );

  if (!local.isValid) {
    throw new Error("Invalid birth date/time or timezone");
  }

  return local.toUTC().toJSDate();
}
