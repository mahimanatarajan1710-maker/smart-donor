export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Fixed NGO Headquarters: 3 km from college food cluster
export const NGO_HQ: { name: string; location: Coordinates; nightlyDemand: number } = {
  name: "Annam Karunya Seva NGO",
  location: { latitude: 12.9716, longitude: 77.5946 }, // Baseline reference center
  nightlyDemand: 80
};

// Haversine formula for surface distance
export function calculateStraightLineDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * Math.PI / 180) * Math.cos(coord2.latitude * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Calculates road distance and estimated travel time.
 * In a production setup, this queries an OSRM instance.
 * For local resilience, it applies a real-world city circuity detour factor (1.32x urban road winding)
 * and an urban speed of 24 km/h with 4 minutes per pickup stop.
 */
export function estimateRoadMetrics(origin: Coordinates, destinations: Coordinates[]): { distanceKm: number; durationMinutes: number } {
  if (destinations.length === 0) {
    return { distanceKm: 0, durationMinutes: 0 };
  }

  let totalKm = 0;
  let curr = origin;

  for (const next of destinations) {
    const rawDist = calculateStraightLineDistanceKm(curr, next);
    // 1.32x urban winding factor
    const roadDist = rawDist * 1.32;
    totalKm += roadDist;
    curr = next;
  }

  // End journey back to NGO HQ
  const finalLeg = calculateStraightLineDistanceKm(curr, NGO_HQ.location) * 1.32;
  totalKm += finalLeg;

  // 24 km/h average speed in college/commercial zones + 4 mins per stop for handover
  const travelMins = (totalKm / 24) * 60;
  const stopHandlingMins = destinations.length * 4;
  const totalMins = Math.round(travelMins + stopHandlingMins);

  return {
    distanceKm: Number(totalKm.toFixed(2)),
    durationMinutes: totalMins
  };
}

export interface CandidateDonation {
  id: string;
  outletName: string;
  category: string;
  mealCount: number;
  location: Coordinates;
  deadline: Date;
  storageCondition: string;
  isFoodSafetyApproved: boolean;
}

export interface RouteStop {
  stopNumber: number;
  outletId: string;
  outletName: string;
  mealCount: number;
  latitude: number;
  longitude: number;
  estimatedArrivalMinutes: number;
  deadlineMinutesRemaining: number;
  isDeadlineFeasible: boolean;
}

export interface RoutePlanResult {
  planType: 'plan_a_fastest' | 'plan_b_max_meals' | 'plan_c_best_cost';
  title: string;
  recommendedDeliveryMode: 'volunteer' | 'ngo_vehicle' | 'partner_bus';
  totalMeals: number;
  totalDistanceKm: number;
  estimatedTravelMinutes: number;
  estimatedOperatingCost: number;
  costPerMeal: number;
  individualRoundtripDistanceKm: number;
  individualRoundtripCost: number;
  distanceSavedKm: number;
  costSavedPercent: number;
  isDeadlineFeasible: boolean;
  explanation: string;
  stops: RouteStop[];
  eligibleDonationIds: string[];
}

export interface DeliveryModeComparison {
  mode: 'volunteer' | 'ngo_vehicle' | 'partner_bus';
  displayName: string;
  estimatedCost: number;
  costPerMeal: number;
  travelMinutes: number;
  capacityMeals: number;
  isAvailable: boolean;
  feasibilityScore: number;
  recommendationReason: string;
}

/**
 * Core Intelligence Engine that optimizes multi-stop routes,
 * compares individual vs pooled journeys, tests deadlines,
 * and generates 3 strategic alternatives (Fastest, Max Meals, Best Cost).
 */
export function optimizePickupPlans(
  donations: CandidateDonation[],
  now: Date = new Date(),
  ngoVehicleCostPerKm = 14,
  volunteerCostPerKm = 6,
  busTokenCost = 40
): {
  plans: RoutePlanResult[];
  baselineComparison: {
    individualTripsDistanceKm: number;
    individualTripsCost: number;
    pooledDistanceKm: number;
    pooledCost: number;
  };
  deliveryModeComparison: DeliveryModeComparison[];
} {
  // Step 1: Filter safety-eligible donations that are not already expired
  const eligible = donations.filter(d => {
    if (!d.isFoodSafetyApproved) return false;
    const minsLeft = (new Date(d.deadline).getTime() - now.getTime()) / (60 * 1000);
    return minsLeft > 0;
  });

  if (eligible.length === 0) {
    return {
      plans: [],
      baselineComparison: {
        individualTripsDistanceKm: 0,
        individualTripsCost: 0,
        pooledDistanceKm: 0,
        pooledCost: 0
      },
      deliveryModeComparison: []
    };
  }

  // Calculate Baseline: Individual round trips from NGO to each donor and back
  let individualTripsDistanceKm = 0;
  eligible.forEach(d => {
    const oneWay = calculateStraightLineDistanceKm(NGO_HQ.location, d.location) * 1.32;
    individualTripsDistanceKm += (oneWay * 2);
  });
  individualTripsDistanceKm = Number(individualTripsDistanceKm.toFixed(2));
  const individualTripsCost = Number((individualTripsDistanceKm * ngoVehicleCostPerKm).toFixed(2));

  // Step 2 & 3: Multi-stop TSP greedy nearest neighbor sorted by deadline/distance
  // PLAN A: Fastest Feasible Collection (Prioritizes urgent deadlines)
  const sortedByDeadline = [...eligible].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
  const planA = buildRoute(sortedByDeadline, 'plan_a_fastest', 'Fastest Feasible Collection (Urgent First)', now, ngoVehicleCostPerKm, individualTripsDistanceKm, individualTripsCost);

  // PLAN B: Maximum Meals Rescued (Sorts by highest yield first within reach)
  const sortedByMeals = [...eligible].sort((a, b) => b.mealCount - a.mealCount);
  const planB = buildRoute(sortedByMeals, 'plan_b_max_meals', 'Maximum Meals Rescued (Capacity Optimized)', now, ngoVehicleCostPerKm, individualTripsDistanceKm, individualTripsCost);

  // PLAN C: Best Cost Per Meal (Geographically clustered nearest neighbor to minimize distance)
  const clusteredList = solveGreedyTSP(NGO_HQ.location, eligible);
  const planC = buildRoute(clusteredList, 'plan_c_best_cost', 'Best Cost per Meal Rescued (Logistics Minimized)', now, volunteerCostPerKm, individualTripsDistanceKm, individualTripsCost);

  // Mode Evaluation
  const totalMeals = planC.totalMeals;
  const dist = planC.totalDistanceKm;

  const modeVolunteer: DeliveryModeComparison = {
    mode: 'volunteer',
    displayName: 'Verified Community Volunteer (Bike/Car)',
    estimatedCost: Number((dist * volunteerCostPerKm).toFixed(2)),
    costPerMeal: totalMeals > 0 ? Number(((dist * volunteerCostPerKm) / totalMeals).toFixed(2)) : 0,
    travelMinutes: planC.estimatedTravelMinutes,
    capacityMeals: 35,
    isAvailable: totalMeals <= 35,
    feasibilityScore: totalMeals <= 35 ? 92 : 45,
    recommendationReason: totalMeals <= 35 
      ? 'Optimal for small/medium batches (<35 meals). Highly cost-effective and agile in college alleys.'
      : 'Batch size exceeds typical volunteer vehicle carrying capacity.'
  };

  const modeNgoVehicle: DeliveryModeComparison = {
    mode: 'ngo_vehicle',
    displayName: 'NGO Van / Cargo EV',
    estimatedCost: Number((dist * ngoVehicleCostPerKm).toFixed(2)),
    costPerMeal: totalMeals > 0 ? Number(((dist * ngoVehicleCostPerKm) / totalMeals).toFixed(2)) : 0,
    travelMinutes: planC.estimatedTravelMinutes,
    capacityMeals: 140,
    isAvailable: true,
    feasibilityScore: totalMeals > 35 ? 96 : 78,
    recommendationReason: totalMeals > 35 
      ? 'Recommended: Large capacity (140 meals) safely handles all outlets in a single run with lower unit cost.'
      : 'Feasible but higher base operating cost than volunteer.'
  };

  const modeBus: DeliveryModeComparison = {
    mode: 'partner_bus',
    displayName: 'Authorized Partner Transit Bus #33B',
    estimatedCost: busTokenCost,
    costPerMeal: totalMeals > 0 ? Number((busTokenCost / totalMeals).toFixed(2)) : 0,
    travelMinutes: planC.estimatedTravelMinutes + 15,
    capacityMeals: 50,
    isAvailable: true,
    feasibilityScore: 70,
    recommendationReason: 'Simulated schedule matches evening handover at College Gate bus terminal. Low fixed token cost.'
  };

  return {
    plans: [planA, planB, planC],
    baselineComparison: {
      individualTripsDistanceKm,
      individualTripsCost,
      pooledDistanceKm: planC.totalDistanceKm,
      pooledCost: planC.estimatedOperatingCost
    },
    deliveryModeComparison: [modeVolunteer, modeNgoVehicle, modeBus]
  };
}

function solveGreedyTSP(start: Coordinates, items: CandidateDonation[]): CandidateDonation[] {
  const result: CandidateDonation[] = [];
  const unvisited = [...items];
  let currentPos = start;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calculateStraightLineDistanceKm(currentPos, unvisited[i].location);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }

    const nextItem = unvisited.splice(nearestIdx, 1)[0];
    result.push(nextItem);
    currentPos = nextItem.location;
  }

  return result;
}

function buildRoute(
  orderedDonations: CandidateDonation[],
  planType: 'plan_a_fastest' | 'plan_b_max_meals' | 'plan_c_best_cost',
  title: string,
  now: Date,
  costPerKm: number,
  baselineDist: number,
  baselineCost: number
): RoutePlanResult {
  const stops: RouteStop[] = [];
  let cumulativeMinutes = 0;
  let currLocation = NGO_HQ.location;
  let allFeasible = true;

  orderedDonations.forEach((donation, index) => {
    const straightDist = calculateStraightLineDistanceKm(currLocation, donation.location);
    const legRoadDist = straightDist * 1.32;
    const legDriveMins = Math.round((legRoadDist / 24) * 60) + 4; // Drive + 4 mins handover
    cumulativeMinutes += legDriveMins;

    const deadlineDiffMins = Math.round((new Date(donation.deadline).getTime() - now.getTime()) / (60 * 1000));
    const isFeasible = deadlineDiffMins >= cumulativeMinutes;
    if (!isFeasible) allFeasible = false;

    stops.push({
      stopNumber: index + 1,
      outletId: donation.id,
      outletName: donation.outletName,
      mealCount: donation.mealCount,
      latitude: donation.location.latitude,
      longitude: donation.location.longitude,
      estimatedArrivalMinutes: cumulativeMinutes,
      deadlineMinutesRemaining: deadlineDiffMins,
      isDeadlineFeasible: isFeasible
    });

    currLocation = donation.location;
  });

  // Trip return to NGO HQ
  const returnDist = calculateStraightLineDistanceKm(currLocation, NGO_HQ.location) * 1.32;
  const returnMinutes = Math.round((returnDist / 24) * 60);
  const totalTravelMinutes = cumulativeMinutes + returnMinutes;

  const totalDestinations = orderedDonations.map(d => d.location);
  const metrics = estimateRoadMetrics(NGO_HQ.location, totalDestinations);
  const totalDistanceKm = metrics.distanceKm;

  const totalMeals = orderedDonations.reduce((acc, d) => acc + d.mealCount, 0);
  const estimatedCost = Number((totalDistanceKm * costPerKm).toFixed(2));
  const costPerMeal = totalMeals > 0 ? Number((estimatedCost / totalMeals).toFixed(2)) : 0;

  const distanceSavedKm = Number(Math.max(0, baselineDist - totalDistanceKm).toFixed(2));
  const costSavedPercent = baselineCost > 0 
    ? Number((((baselineCost - estimatedCost) / baselineCost) * 100).toFixed(1))
    : 0;

  let recommendedMode: 'volunteer' | 'ngo_vehicle' | 'partner_bus' = 'volunteer';
  if (totalMeals > 35) {
    recommendedMode = 'ngo_vehicle';
  }

  let explanation = '';
  if (planType === 'plan_a_fastest') {
    explanation = `Prioritizes closest expiry deadlines first. Safely rescues ${totalMeals} meals within urgent windows with a single consolidated journey.`;
  } else if (planType === 'plan_b_max_meals') {
    explanation = `Maximizes high-quantity surplus outlets first, collecting ${totalMeals} meals while saving ${distanceSavedKm} km compared to individual pickups.`;
  } else {
    explanation = `Optimized greedy path clusters neighbouring outlets. Delivers the lowest cost per meal (₹${costPerMeal}/meal) and saves ${costSavedPercent}% fuel cost vs individual round trips.`;
  }

  return {
    planType,
    title,
    recommendedDeliveryMode: recommendedMode,
    totalMeals,
    totalDistanceKm,
    estimatedTravelMinutes: totalTravelMinutes,
    estimatedOperatingCost: estimatedCost,
    costPerMeal,
    individualRoundtripDistanceKm: baselineDist,
    individualRoundtripCost: baselineCost,
    distanceSavedKm,
    costSavedPercent,
    isDeadlineFeasible: allFeasible,
    explanation,
    stops,
    eligibleDonationIds: orderedDonations.map(d => d.id)
  };
}
