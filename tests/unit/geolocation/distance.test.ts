import { describe, expect, it } from 'vitest';
import { haversineDistance } from '../../../src/services/geolocation/distance.js';

const TOLERANCE_KM = 1;

describe('haversineDistance', () => {
  it('calculates the distance between London and Paris (~341 km)', () => {
    const dist = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(dist).toBeCloseTo(341, -1);
    expect(Math.abs(dist - 341)).toBeLessThan(TOLERANCE_KM * 5);
  });

  it('calculates the distance between New York and Los Angeles (~3940 km)', () => {
    const dist = haversineDistance(40.7128, -74.006, 34.0522, -118.2437);
    expect(dist).toBeGreaterThan(3900);
    expect(dist).toBeLessThan(4000);
  });

  it('calculates the distance between Sydney and Tokyo (~7823 km)', () => {
    const dist = haversineDistance(-33.8688, 151.2093, 35.6762, 139.6503);
    expect(dist).toBeGreaterThan(7700);
    expect(dist).toBeLessThan(7950);
  });

  it('calculates the distance between Berlin and Moscow (~1608 km)', () => {
    const dist = haversineDistance(52.52, 13.405, 55.7558, 37.6173);
    expect(dist).toBeGreaterThan(1580);
    expect(dist).toBeLessThan(1640);
  });

  it('returns 0 (or near 0) for the same point', () => {
    expect(haversineDistance(51.5074, -0.1278, 51.5074, -0.1278)).toBeCloseTo(0, 5);
    expect(haversineDistance(0, 0, 0, 0)).toBeCloseTo(0, 5);
    expect(haversineDistance(-90, 0, -90, 0)).toBeCloseTo(0, 5);
  });

  it('is symmetric: distance(A, B) === distance(B, A)', () => {
    const ab = haversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    const ba = haversineDistance(48.8566, 2.3522, 51.5074, -0.1278);
    expect(ab).toBeCloseTo(ba, 10);
  });

  it('always returns a non-negative distance', () => {
    expect(haversineDistance(0, 0, 0, 0)).toBeGreaterThanOrEqual(0);
    expect(haversineDistance(90, 180, -90, -180)).toBeGreaterThanOrEqual(0);
    expect(haversineDistance(-45, -90, 45, 90)).toBeGreaterThanOrEqual(0);
  });

  it('calculates the maximum possible distance for antipodal points (~20015 km)', () => {
    const dist = haversineDistance(0, 0, 0, 180);
    expect(dist).toBeCloseTo(Math.PI * 6371, 0);
  });

  it('calculates the distance from the North Pole to the equator (~10008 km)', () => {
    const dist = haversineDistance(90, 0, 0, 0);
    expect(dist).toBeCloseTo((Math.PI / 2) * 6371, 0);
  });

  it('calculates the distance between the poles (~20015 km)', () => {
    const dist = haversineDistance(90, 0, -90, 0);
    expect(dist).toBeCloseTo(Math.PI * 6371, 0);
  });
});
