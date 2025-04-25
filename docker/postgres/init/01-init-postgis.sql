-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;

-- Create schema for spatial data
CREATE SCHEMA IF NOT EXISTS spatial;

-- Create a function to calculate distance between two points in meters
CREATE OR REPLACE FUNCTION calculate_distance_meters(
    lat1 DOUBLE PRECISION,
    lng1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lng2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_DistanceSphere(
        ST_MakePoint(lng1, lat1),
        ST_MakePoint(lng2, lat2)
    );
END;
$$ LANGUAGE plpgsql;