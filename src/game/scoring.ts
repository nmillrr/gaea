/**
 * Scoring module for the Gaea game.
 *
 * Calculates the great-circle distance between two coordinates (Haversine) and
 * converts it to points using the nonlinear decay curve defined in PRD §10:
 *
 *   0–50 m       → 5,000          (perfect)
 *   51–250 m     → 4,500–4,999    (excellent)
 *   251 m–1 km   → 3,500–4,499    (very good)
 *   1–5 km       → 2,000–3,499    (good)
 *   5–25 km      → 750–1,999      (fair)
 *   25–100 km    → 150–749        (trying)
 *   100 km+      → 0–149          (terrible, but still participates)
 *
 * The curve rewards precision steeply while keeping casual guesses non-zero, so
 * low scorers stay engaged. It is implemented as piecewise-linear interpolation
 * between the band edges below.
 */

/**
 * Result interface for a distance-to-points calculation
 */
export interface Result {
  /** Distance in meters between the actual location and the guess */
  distance_m: number;

  /** Score points awarded (0-5000) */
  points: number;
}

/**
 * Earth's mean radius in meters
 * @private
 */
const EARTH_RADIUS_M = 6371000;

/**
 * Maximum possible points for a perfect guess
 * @private
 */
const MAX_POINTS = 5000;

/**
 * Breakpoints of the scoring curve as [distance_meters, points] pairs, ordered
 * by increasing distance. Points are linearly interpolated between adjacent
 * breakpoints; beyond the final breakpoint the score is 0.
 * @private
 */
const CURVE: ReadonlyArray<readonly [number, number]> = [
  [0, 5000],
  [50, 5000],
  [250, 4500],
  [1000, 3500],
  [5000, 2000],
  [25000, 750],
  [100000, 150],
  [1000000, 0],
];

/**
 * Convert degrees to radians
 * @private
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the great-circle distance between two points using the Haversine formula
 * @private
 * @returns Distance in meters
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lng2 - lng1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_M * c;
}

/**
 * Map a distance to points along the PRD §10 curve via piecewise-linear
 * interpolation between {@link CURVE} breakpoints.
 * @private
 * @param distance_m - Distance in meters
 * @returns Points awarded (0–5000)
 */
function distanceToPoints(distance_m: number): number {
  if (distance_m <= 0) return MAX_POINTS;

  for (let i = 0; i < CURVE.length - 1; i++) {
    const [d0, p0] = CURVE[i];
    const [d1, p1] = CURVE[i + 1];
    if (distance_m <= d1) {
      // Linear interpolation within the [d0, d1] segment.
      const t = (distance_m - d0) / (d1 - d0);
      return Math.round(p0 + t * (p1 - p0));
    }
  }

  // Beyond the final breakpoint distance, no points are awarded.
  return 0;
}

/**
 * Score a guess based on the distance from the actual location
 * @param actualLat - Latitude of the actual location in degrees
 * @param actualLng - Longitude of the actual location in degrees
 * @param guessLat - Latitude of the guessed location in degrees
 * @param guessLng - Longitude of the guessed location in degrees
 * @returns Object containing the distance in meters and points awarded
 */
export function scoreGuess(
  actualLat: number,
  actualLng: number,
  guessLat: number,
  guessLng: number
): Result {
  // Validate input coordinates
  if (actualLat < -90 || actualLat > 90 || guessLat < -90 || guessLat > 90 ||
      actualLng < -180 || actualLng > 180 || guessLng < -180 || guessLng > 180) {
    throw new Error('Invalid coordinates. Latitude must be between -90 and 90, and longitude between -180 and 180.');
  }

  const distance = haversineDistance(actualLat, actualLng, guessLat, guessLng);
  const distance_m = Math.round(distance);
  const points = distanceToPoints(distance_m);

  return { distance_m, points };
}
