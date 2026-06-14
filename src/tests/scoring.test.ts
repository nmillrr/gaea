import { scoreGuess } from '../game/scoring';

/**
 * Returns the PRD §10 points band [min, max] that a given distance should fall
 * into. Used to assert the scoring curve without pinning exact point values.
 */
function expectedBand(distance_m: number): [number, number] {
  if (distance_m <= 50) return [5000, 5000];
  if (distance_m <= 250) return [4500, 4999];
  if (distance_m <= 1000) return [3500, 4499];
  if (distance_m <= 5000) return [2000, 3499];
  if (distance_m <= 25000) return [750, 1999];
  if (distance_m <= 100000) return [150, 749];
  return [0, 149];
}

describe('Scoring System', () => {
  describe('distance + band mapping', () => {
    const testCases = [
      {
        actual: { name: 'New York City', lat: 40.7128, lng: -74.006 },
        guess: { name: 'New York City (exact)', lat: 40.7128, lng: -74.006 },
        distance_range: [0, 1],
      },
      {
        actual: { name: 'Central Park', lat: 40.7812, lng: -73.9665 },
        guess: { name: 'Empire State Building', lat: 40.7484, lng: -73.9857 },
        distance_range: [3000, 5000], // ~1–5 km band
      },
      {
        actual: { name: 'Times Square', lat: 40.758, lng: -73.9855 },
        guess: { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
        distance_range: [5000, 7000], // ~5–25 km band
      },
      {
        actual: { name: 'Paris', lat: 48.8566, lng: 2.3522 },
        guess: { name: 'London', lat: 51.5074, lng: -0.1278 },
        distance_range: [300000, 350000], // 100 km+ band
      },
      {
        actual: { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
        guess: { name: 'Alexandria', lat: 31.2001, lng: 29.9187 },
        distance_range: [170000, 190000], // 100 km+ band
      },
      {
        actual: { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 },
        guess: { name: 'Staten Island Ferry', lat: 40.7021, lng: -74.0142 },
        distance_range: [2500, 3500], // ~1–5 km band
      },
    ];

    testCases.forEach((tc) => {
      test(`${tc.actual.name} → ${tc.guess.name}`, () => {
        const result = scoreGuess(tc.actual.lat, tc.actual.lng, tc.guess.lat, tc.guess.lng);

        const [dMin, dMax] = tc.distance_range;
        expect(result.distance_m).toBeGreaterThanOrEqual(dMin);
        expect(result.distance_m).toBeLessThanOrEqual(dMax);

        const [pMin, pMax] = expectedBand(result.distance_m);
        expect(result.points).toBeGreaterThanOrEqual(pMin);
        expect(result.points).toBeLessThanOrEqual(pMax);
      });
    });
  });

  describe('curve properties', () => {
    test('a perfect guess scores the maximum 5000', () => {
      const result = scoreGuess(40.7128, -74.006, 40.7128, -74.006);
      expect(result.distance_m).toBe(0);
      expect(result.points).toBe(5000);
    });

    test('every band edge lands within its band', () => {
      const edges: [number, [number, number]][] = [
        [50, [5000, 5000]],
        [250, [4500, 4999]],
        [1000, [3500, 4499]],
        [5000, [2000, 3499]],
        [25000, [750, 1999]],
        [100000, [150, 749]],
      ];
      // Drive distance by moving longitude east from the equator, where
      // 1 degree ≈ 111.32 km, so we can hit target distances precisely.
      for (const [meters, [min, max]] of edges) {
        const deg = meters / 111320;
        const result = scoreGuess(0, 0, 0, deg);
        expect(result.points).toBeGreaterThanOrEqual(min);
        expect(result.points).toBeLessThanOrEqual(max);
      }
    });

    test('points decrease monotonically with distance', () => {
      const distances = [0.0005, 0.002, 0.01, 0.05, 0.2, 1, 3]; // degrees east
      let last = Infinity;
      for (const deg of distances) {
        const { points } = scoreGuess(0, 0, 0, deg);
        expect(points).toBeLessThanOrEqual(last);
        last = points;
      }
    });

    test('antipodal points score 0', () => {
      const result = scoreGuess(40.7128, -74.006, -40.7128, 105.994);
      expect(result.distance_m).toBeGreaterThan(19000000);
      expect(result.distance_m).toBeLessThan(20100000);
      expect(result.points).toBe(0);
    });

    test('points and distance are integers', () => {
      const result = scoreGuess(40.7128, -74.006, 40.7128001, -74.0060001);
      expect(Number.isInteger(result.points)).toBe(true);
      expect(Number.isInteger(result.distance_m)).toBe(true);
    });

    test('throws for invalid coordinates', () => {
      expect(() => scoreGuess(91, 0, 0, 0)).toThrow('Invalid coordinates');
      expect(() => scoreGuess(0, 181, 0, 0)).toThrow('Invalid coordinates');
      expect(() => scoreGuess(0, 0, -91, 0)).toThrow('Invalid coordinates');
      expect(() => scoreGuess(0, 0, 0, -181)).toThrow('Invalid coordinates');
    });
  });
});
