import { find } from "geo-tz";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "NirdisBirthProfile/1.0 (Phase 1.2 location resolution)";

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  timezone: string;
}

const UNABLE_TO_RESOLVE = "Unable to resolve birth place location";

/**
 * Resolves a birth place string to coordinates and IANA timezone.
 * Uses OpenStreetMap Nominatim for geocoding and geo-tz for timezone from coordinates.
 * Timezone is derived from coordinates (not guessed).
 *
 * @param birthPlaceInput - User-provided place string (e.g. "New York, NY", "London, UK")
 * @returns latitude, longitude, timezone (IANA, e.g. "America/New_York")
 * @throws Error with message "Unable to resolve birth place location" if resolution fails
 */
export async function resolveLocation(
  birthPlaceInput: string
): Promise<ResolvedLocation> {
  const trimmed = birthPlaceInput.trim();
  if (!trimmed) {
    throw new Error(UNABLE_TO_RESOLVE);
  }

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set("q", trimmed);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(UNABLE_TO_RESOLVE);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(UNABLE_TO_RESOLVE);
  }

  const first = data[0];
  const lat = parseFloat(first.lat);
  const lon = parseFloat(first.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(UNABLE_TO_RESOLVE);
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    throw new Error(UNABLE_TO_RESOLVE);
  }

  const zones = find(lat, lon);
  const timezone =
    Array.isArray(zones) && zones.length > 0
      ? zones[0]
      : typeof zones === "string"
        ? zones
        : "";

  if (!timezone || typeof timezone !== "string") {
    throw new Error(UNABLE_TO_RESOLVE);
  }

  return {
    latitude: lat,
    longitude: lon,
    timezone,
  };
}
