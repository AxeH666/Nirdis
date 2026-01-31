/**
 * Stub location resolver for Phase 2.1 – Birth Data Normalization.
 * Returns mock latitude, longitude, and timezone. Replace with real resolver later.
 */

export interface StubLocationResult {
  latitude: number;
  longitude: number;
  timezone: string;
}

const STUB_LAT = 17.385;
const STUB_LON = 78.4867;
const STUB_TZ = "Asia/Kolkata";

/**
 * Resolve birth place string to coordinates and timezone (stub).
 * Use real geocoding in production when ready.
 */
export function resolveLocationStub(_birthPlaceInput: string): StubLocationResult {
  return {
    latitude: STUB_LAT,
    longitude: STUB_LON,
    timezone: STUB_TZ,
  };
}
