import { prisma } from "../../../config/prisma";
import { birthDatetimeUtc } from "../../birth-profile/birth-datetime";
import { resolveLocationStub } from "./stub-location";

export interface NormalizedBirth {
  birth_date: string;
  birth_place: string;
  birth_time: string | null;
  time_confidence: string;
  latitude: number;
  longitude: number;
  timezone: string;
  birth_utc: string;
  locked: boolean;
}

/**
 * Check if profile already has normalized location data (non-default).
 */
function hasNormalizedLocation(profile: {
  latitude: number;
  longitude: number;
  timezone: string;
}): boolean {
  const hasCoords = profile.latitude !== 0 || profile.longitude !== 0;
  const hasTz = Boolean(profile.timezone && profile.timezone.trim().length > 0);
  return hasCoords && hasTz;
}

/**
 * Get or compute normalized birth data for a user.
 * If profile has lat/long/timezone/birthUtc, return stored values.
 * Otherwise resolve place (stub), compute birthUtc, update profile, return.
 */
export async function getOrCreateNormalizedBirth(
  userId: string
): Promise<NormalizedBirth> {
  const profile = await prisma.birthProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("NOT_FOUND");
  }

  let latitude = profile.latitude;
  let longitude = profile.longitude;
  let timezone = profile.timezone;
  let birthUtc = profile.birthUtc;

  if (!hasNormalizedLocation(profile)) {
    const location = resolveLocationStub(profile.birthPlaceInput);
    const birthTime = profile.birthTime ?? "00:00";
    birthUtc = birthDatetimeUtc(profile.birthDate, birthTime, location.timezone);

    await prisma.birthProfile.update({
      where: { userId },
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        birthUtc,
      },
    });

    latitude = location.latitude;
    longitude = location.longitude;
    timezone = location.timezone;
  }

  return {
    birth_date: profile.birthDate.toISOString().split("T")[0],
    birth_place: profile.birthPlaceInput,
    birth_time: profile.birthTime,
    time_confidence: profile.timeConfidence,
    latitude,
    longitude,
    timezone,
    birth_utc: birthUtc.toISOString(),
    locked: profile.locked,
  };
}
