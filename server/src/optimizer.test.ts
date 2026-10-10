import { describe, it, expect } from 'vitest';
import { 
  calculateStraightLineDistanceKm, 
  estimateRoadMetrics, 
  optimizePickupPlans, 
  NGO_HQ 
} from './optimizer.js';
import { predictOutletSurplus } from './predictor.js';

describe('SmartBite AI — Routing and Logistics Optimizer', () => {
  it('accurately computes straight line distance between two coordinates', () => {
    const origin = { latitude: 12.9716, longitude: 77.5946 };
    const nearby = { latitude: 12.9735, longitude: 77.5912 };
    const dist = calculateStraightLineDistanceKm(origin, nearby);
    expect(dist).toBeGreaterThan(0.2);
    expect(dist).toBeLessThan(1.0);
  });

  it('correctly compares baseline individual round trips vs multi-stop pooled journey', () => {
    const now = new Date();
    const candidateDonations = [
      {
        id: '1',
        outletName: 'WarmCrust Bakery',
        category: 'bakery',
        mealCount: 12,
        location: { latitude: 12.9735, longitude: 77.5912 },
        deadline: new Date(now.getTime() + 60 * 60 * 1000),
        storageCondition: 'ambient',
        isFoodSafetyApproved: true
      },
      {
        id: '2',
        outletName: 'OvenCraft Bakery',
        category: 'bakery',
        mealCount: 8,
        location: { latitude: 12.9750, longitude: 77.5930 },
        deadline: new Date(now.getTime() + 90 * 60 * 1000),
        storageCondition: 'ambient',
        isFoodSafetyApproved: true
      },
      {
        id: '3',
        outletName: 'Daily Loaf Corner',
        category: 'bakery',
        mealCount: 14,
        location: { latitude: 12.9721, longitude: 77.5899 },
        deadline: new Date(now.getTime() + 120 * 60 * 1000),
        storageCondition: 'ambient',
        isFoodSafetyApproved: true
      }
    ];

    const result = optimizePickupPlans(candidateDonations, now);

    // Multi-stop pooled distance must be substantially less than separate round trips
    expect(result.baselineComparison.pooledDistanceKm).toBeLessThan(
      result.baselineComparison.individualTripsDistanceKm
    );
    expect(result.plans.length).toBe(3); // Plan A, B, C generated
    expect(result.deliveryModeComparison.length).toBe(3); // Volunteer, NGO Vehicle, Bus
  });

  it('excludes food safety rejected or expired donations from routing', () => {
    const now = new Date();
    const rejectedDonation = {
      id: 'bad-1',
      outletName: 'Unsafe Outlet',
      category: 'restaurant',
      mealCount: 10,
      location: { latitude: 12.9735, longitude: 77.5912 },
      deadline: new Date(now.getTime() + 60 * 60 * 1000),
      storageCondition: 'ambient',
      isFoodSafetyApproved: false // Disapproved
    };

    const result = optimizePickupPlans([rejectedDonation], now);
    expect(result.plans.length).toBe(0);
  });
});

describe('SmartBite AI — Predictive Surplus Engine', () => {
  it('generates statistical baseline predictions and confidence metrics', () => {
    const outlet = {
      _id: 'outlet-123',
      name: 'North Campus Mess',
      category: 'hostel_mess' as const,
      historicalSurplusAverage: 20
    };

    const prediction = predictOutletSurplus(outlet, 21, 3); // 9pm Wednesday
    expect(prediction.predictedSurplusMeals).toBeGreaterThan(15);
    expect(prediction.confidenceScorePercent).toBeGreaterThanOrEqual(70);
    expect(prediction.recentTrend).toBe('rising');
  });
});
