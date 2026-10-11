import { describe, it, expect } from 'vitest';
import { 
  calculateBusinessProfit, 
  PILOT_DEMO_SCENARIO 
} from './organicProfitCalculator.js';
import { planOrganicWasteRoute } from './organicRouter.js';

describe('Organic Waste & Fertilizer Business Module — Profit Calculator', () => {
  it('correctly calculates the exact Pilot Demo Scenario values from specification Part 8', () => {
    // Specification values:
    // Incoming waste: 500 kg/day × 30 days = 15,000 kg/month
    // Saleable compost yield: 30% of 15,000 = 4,500 kg/month
    // Compost sales: 4,500 kg × ₹5/kg = ₹22,500/month
    // Supplier incentive payments: 15,000 kg × ₹0.50/kg = ₹7,500/month
    // Confirmed collection revenue: ₹45,000/month
    // Total revenue: ₹22,500 + ₹45,000 = ₹67,500/month
    // Total operating costs: ₹7,500 (suppliers) + ₹20,000 (transport) + ₹15,000 (processing) + ₹10,000 (labor/admin) = ₹52,500/month
    // Illustrative operating surplus: ₹67,500 - ₹52,500 = ₹15,000/month

    const result = calculateBusinessProfit(PILOT_DEMO_SCENARIO);

    expect(result.monthlyIncomingWasteKg).toBe(15000);
    expect(result.estimatedSaleableCompostKg).toBe(4500);
    expect(result.compostSalesRevenue).toBe(22500);
    expect(result.confirmedCollectionRevenue).toBe(45000);
    expect(result.totalMonthlyRevenue).toBe(67500);

    expect(result.supplierPaymentsCost).toBe(7500);
    expect(result.transportCost).toBe(20000);
    expect(result.processingCost).toBe(15000);
    expect(result.laborAdminCost).toBe(10000);
    expect(result.totalOperatingCosts).toBe(52500);

    expect(result.operatingProfit).toBe(15000);
    expect(result.netProfit).toBe(15000);
    expect(result.netProfitMarginPercent).toBe(22.22); // 15000 / 67500 * 100
    expect(result.isSufficientData).toBe(true);
  });

  it('handles zero or missing required inputs cleanly with insufficient data flag', () => {
    const invalidInputs: any = {
      incomingWasteKgPerDay: -10,
      operatingDaysPerMonth: 0,
      saleableCompostYieldPercent: 30
    };

    const result = calculateBusinessProfit(invalidInputs);
    expect(result.isSufficientData).toBe(false);
    expect(result.totalMonthlyRevenue).toBe(0);
  });
});

describe('Organic Waste Collection Route Planning', () => {
  it('filters incompatible waste materials and respects minimum viable load threshold', () => {
    const origin = { latitude: 12.9716, longitude: 77.5946 };
    const facility = {
      partnerId: 'partner-1',
      name: 'Bhoomi Bio-Fertilizers',
      location: { latitude: 12.9810, longitude: 77.6120 },
      maxDailyCapacityKg: 2000,
      acceptedWasteTypes: ['fruit_waste', 'vegetable_waste']
    };

    const suppliers = [
      {
        supplierId: 's1',
        name: 'Fruit Mart',
        category: 'fruit_shop',
        location: { latitude: 12.9738, longitude: 77.5918 },
        dailyWasteKg: 60,
        wasteTypes: ['fruit_waste'],
        preferredWindow: '06:00 - 09:00'
      },
      {
        supplierId: 's2',
        name: 'Veg Bazaar',
        category: 'vegetable_shop',
        location: { latitude: 12.9762, longitude: 77.5935 },
        dailyWasteKg: 50,
        wasteTypes: ['vegetable_waste'],
        preferredWindow: '06:00 - 09:00'
      },
      {
        supplierId: 's3',
        name: 'Plastic Heavy Depot (Incompatible)',
        category: 'other',
        location: { latitude: 12.9780, longitude: 77.6020 },
        dailyWasteKg: 80,
        wasteTypes: ['chemically_treated'], // Rejected by facility
        preferredWindow: '06:00 - 09:00'
      }
    ];

    const plan = planOrganicWasteRoute(origin, suppliers, facility, 500, 80);

    // Incompatible supplier s3 must be excluded
    expect(plan.stops.length).toBe(2);
    expect(plan.totalPlannedWasteKg).toBe(110); // 60 + 50
    expect(plan.isViableLoad).toBe(true); // 110 >= 80 min threshold
    expect(plan.costPerKgCollected).toBeGreaterThan(0);
    expect(plan.stops[0].isCompatibleMaterial).toBe(true);
  });
});
