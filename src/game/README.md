# Game Scoring System

The scoring system calculates points based on how close a user's guess is to the actual location of a photo.

## How It Works

1. **Distance Calculation**: The system uses the Haversine formula to calculate the great-circle distance between two geographic coordinates on the Earth's surface. This formula accounts for the Earth's curvature, providing accurate distance measurements.

2. **Point Allocation**: Points are awarded on a linear scale:
   - 0 meters (exact match): 5000 points
   - 20,000+ meters: 0 points
   - Between 0 and 20,000 meters: Points decrease linearly

## Formula

The scoring formula consists of two main steps:

### 1. Haversine Formula

To calculate the distance between two points (φ₁, λ₁) and (φ₂, λ₂), where φ is latitude and λ is longitude (in radians):

```
a = sin²(Δφ/2) + cos(φ₁) × cos(φ₂) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c
```

Where:
- Δφ is the difference in latitude
- Δλ is the difference in longitude
- R is the Earth's radius (6,371,000 meters)

### 2. Points Calculation

```
points = MAX_POINTS × (1 - distance / MAX_DISTANCE)
```

Where:
- MAX_POINTS = 5000
- MAX_DISTANCE = 20,000 meters
- Points are rounded to the nearest integer

## Example

If a user guesses a location that is 5,000 meters away from the actual photo location:

1. Distance: 5,000 meters
2. Points: 5000 × (1 - 5000/20000) = 5000 × 0.75 = 3750 points

## Edge Cases

- **Exact match**: 0 meters = 5000 points
- **Maximum possible distance** (antipodal points): ~20,000 kilometers = 0 points
- **Beyond scoring threshold**: Any distance ≥ 20,000 meters = 0 points