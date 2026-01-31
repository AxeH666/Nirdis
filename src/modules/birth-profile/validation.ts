import { z } from "zod";

/**
 * Time confidence for birth time.
 * - exact: user knows the exact time
 * - approx: user has an approximate time
 * - unknown: time is not known
 */
export const timeConfidenceEnum = z.enum(["exact", "approx", "unknown"]);
export type TimeConfidence = z.infer<typeof timeConfidenceEnum>;

/** HH:mm format (24-hour) */
const birthTimeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

/**
 * Birth profile creation payload.
 * - birth_place is resolved server-side to latitude, longitude, timezone.
 * - birth_utc is computed server-side from birth_date + birth_time + timezone.
 * - birth_time is required when time_confidence is exact or approx.
 * - birth_time is optional when time_confidence is unknown.
 */
const validDate = (d: Date) => !isNaN(d.getTime());

export const createBirthProfileSchema = z
  .object({
    birth_date: z.coerce
      .date()
      .refine(validDate, "birth_date is required and must be a valid date (YYYY-MM-DD)"),
    birth_place: z.string().min(1, "birth_place is required"),
    time_confidence: timeConfidenceEnum,
    birth_time: z.string().optional(),
  })
  .refine(
    (data) => data.birth_date <= new Date(),
    { message: "birth_date cannot be in the future", path: ["birth_date"] }
  )
  .refine(
    (data) => {
      if (data.time_confidence === "unknown") return true;
      return (
        typeof data.birth_time === "string" &&
        data.birth_time.length > 0 &&
        birthTimeRegex.test(data.birth_time)
      );
    },
    {
      message:
        "birth_time is required and must be HH:mm when time_confidence is exact or approx",
      path: ["birth_time"],
    }
  );

export type CreateBirthProfileInput = z.infer<typeof createBirthProfileSchema>;
