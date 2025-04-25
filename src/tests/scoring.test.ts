import { scoreGuess, Result } from '../game/scoring';

describe('Scoring System', () => {
  describe('scoreGuess function', () => {
    // Test cases with different city pairs around the world
    const testCases = [
      {
        actual: { name: 'New York City', lat: 40.7128, lng: -74.0060 },
        guess: { name: 'New York City (exact match)', lat: 40.7128, lng: -74.0060 },
        expected: { distance_range: [0, 1], points: 5000 }
      },
      {
        actual: { name: 'Central Park', lat: 40.7812, lng: -73.9665 },
        guess: { name: 'Empire State Building', lat: 40.7484, lng: -73.9857 },
        expected: { distance_range: [3000, 5000], points_range: [3900, 4200] } 
      },
      {
        actual: { name: 'Paris', lat: 48.8566, lng: 2.3522 },
        guess: { name: 'London', lat: 51.5074, lng: -0.1278 },
        expected: { distance_range: [300000, 350000], points: 0 }
      },
      {
        actual: { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
        guess: { name: 'Kyoto', lat: 35.0116, lng: 135.7681 },
        expected: { distance_range: [350000, 400000], points: 0 }
      },
      {
        actual: { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
        guess: { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
        expected: { distance_range: [700000, 750000], points: 0 }
      },
      {
        actual: { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
        guess: { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
        expected: { distance_range: [350000, 400000], points: 0 }
      },
      {
        actual: { name: 'Cairo', lat: 30.0444, lng: 31.2357 },
        guess: { name: 'Alexandria', lat: 31.2001, lng: 29.9187 },
        expected: { distance_range: [170000, 190000], points: 0 }
      },
      {
        actual: { name: 'Times Square', lat: 40.7580, lng: -73.9855 },
        guess: { name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 },
        expected: { distance_range: [5000, 7000], points_range: [3200, 3800] }
      },
      {
        actual: { name: 'Statue of Liberty', lat: 40.6892, lng: -74.0445 },
        guess: { name: 'Staten Island Ferry', lat: 40.7021, lng: -74.0142 },
        expected: { distance_range: [2500, 3500], points_range: [4100, 4400] }
      },
      {
        actual: { name: 'Santa Monica Pier', lat: 34.0086, lng: -118.4975 },
        guess: { name: 'Venice Beach', lat: 33.9850, lng: -118.4695 },
        expected: { distance_range: [2500, 3500], points_range: [4100, 4400] }
      }
    ];

    // Run all test cases
    testCases.forEach(testCase => {
      test(`Distance from ${testCase.actual.name} to ${testCase.guess.name}`, () => {
        const result = scoreGuess(
          testCase.actual.lat, testCase.actual.lng,
          testCase.guess.lat, testCase.guess.lng
        );
        
        // Check distance range
        if (testCase.expected.distance_range) {
          const [min, max] = testCase.expected.distance_range;
          expect(result.distance_m).toBeGreaterThanOrEqual(min);
          expect(result.distance_m).toBeLessThanOrEqual(max);
        }
        
        // Check exact points or points range
        if (testCase.expected.points_range) {
          const [min, max] = testCase.expected.points_range;
          expect(result.points).toBeGreaterThanOrEqual(min);
          expect(result.points).toBeLessThanOrEqual(max);
        } else if (testCase.expected.points !== undefined) {
          expect(result.points).toBe(testCase.expected.points);
        }
      });
    });

    test('antipodal points should return maximum possible distance', () => {
      // Antipodal points (opposite sides of Earth)
      const actualLocation = { lat: 40.7128, lng: -74.0060 }; // NYC
      const guessLocation = { lat: -40.7128, lng: 105.9940 }; // Antipode of NYC
      
      const result = scoreGuess(
        actualLocation.lat, actualLocation.lng,
        guessLocation.lat, guessLocation.lng
      );
      
      // The distance should be close to Earth's half-circumference (~ 20,000 km)
      expect(result.distance_m).toBeGreaterThan(19000000);
      expect(result.distance_m).toBeLessThan(20100000);
      expect(result.points).toBe(0);
    });

    test('points should be rounded to the nearest integer', () => {
      // Create a case where points would be a fractional number before rounding
      // If we have a distance of 10000m, points should be exactly 2500
      // 5000 * (1 - 10000/20000) = 2500
      
      // Find points very close to actual to achieve approximately 10000m distance
      const actualLocation = { lat: 0, lng: 0 };
      // Adjust the longitude to get the desired distance
      // ~10000m is approximately 0.09 degrees at the equator
      const guessLocation = { lat: 0, lng: 0.09 };
      
      const result = scoreGuess(
        actualLocation.lat, actualLocation.lng,
        guessLocation.lat, guessLocation.lng
      );
      
      // Check that the points are an integer
      expect(Number.isInteger(result.points)).toBe(true);
      
      // The actual distance might not be exactly 10000m due to Earth's shape
      // Instead, let's make sure the function returns an integer value 
      // and the distance is in the expected ballpark
      expect(result.distance_m).toBeGreaterThan(9000);
      expect(result.distance_m).toBeLessThan(11000);
      
      // Similarly, points should be in the expected range
      expect(result.points).toBeGreaterThan(2400);
      expect(result.points).toBeLessThan(2600);
    });

    test('distance should be rounded to the nearest meter', () => {
      // Test with coordinates that would give a fractional distance
      const actualLocation = { lat: 40.7128, lng: -74.0060 };
      // Very small difference that would produce a fractional meter distance
      const guessLocation = { lat: 40.7128001, lng: -74.0060001 };
      
      const result = scoreGuess(
        actualLocation.lat, actualLocation.lng,
        guessLocation.lat, guessLocation.lng
      );
      
      // Check that the distance is an integer
      expect(Number.isInteger(result.distance_m)).toBe(true);
    });

    test('should throw error for invalid coordinates', () => {
      expect(() => {
        scoreGuess(91, 0, 0, 0);
      }).toThrow('Invalid coordinates');
      
      expect(() => {
        scoreGuess(0, 181, 0, 0);
      }).toThrow('Invalid coordinates');
      
      expect(() => {
        scoreGuess(0, 0, -91, 0);
      }).toThrow('Invalid coordinates');
      
      expect(() => {
        scoreGuess(0, 0, 0, -181);
      }).toThrow('Invalid coordinates');
    });
  });
});