/**
 * Scoring module for the Cosmo game
 * 
 * Calculates the distance between two geographic coordinates using the 
 * Haversine formula and scores guesses based on the distance.
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
 * Maximum distance in meters for which points can be awarded
 * @private
 */
const MAX_SCORE_DISTANCE_M = 20000; // 20 km

/**
 * Maximum possible points for a perfect guess
 * @private
 */
const MAX_POINTS = 5000;

/**
 * Convert degrees to radians
 * @private
 * @param degrees - Angle in degrees
 * @returns The angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the great-circle distance between two points using the Haversine formula
 * @private
 * @param lat1 - Latitude of first point in degrees
 * @param lng1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lng2 - Longitude of second point in degrees
 * @returns Distance in meters
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Convert all coordinates to radians
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lng2 - lng1);

  // Haversine formula
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Distance in meters (Earth radius * central angle)
  return EARTH_RADIUS_M * c;
}

/**
 * Convert a distance to a score on a linear scale
 * 0 meters = 5000 points
 * 20000+ meters = 0 points
 * @private
 * @param distance_m - Distance in meters
 * @returns Points awarded
 */
function distanceToPoints(distance_m: number): number {
  // If distance is greater than or equal to MAX_SCORE_DISTANCE_M, return 0 points
  if (distance_m >= MAX_SCORE_DISTANCE_M) {
    return 0;
  }
  
  // Linear scaling from MAX_POINTS at 0 meters to 0 points at MAX_SCORE_DISTANCE_M
  const points = MAX_POINTS * (1 - distance_m / MAX_SCORE_DISTANCE_M);
  
  // Round to nearest integer
  return Math.round(points);
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

  // Calculate distance using Haversine formula
  const distance = haversineDistance(actualLat, actualLng, guessLat, guessLng);
  
  // Round distance to the nearest meter
  const distance_m = Math.round(distance);
  
  // Calculate points based on distance
  const points = distanceToPoints(distance_m);
  
  return { distance_m, points };
}