import { calculateStraightLineDistanceKm, Coordinates } from './optimizer.js';

export interface OrganicStopCandidate {
  supplierId: string;
  name: string;
  category: string;
  location: Coordinates;
  dailyWasteKg: number;
  wasteTypes: string[];
  preferredWindow: string; // e.g. "06:00 - 09:00"
}

export interface FacilityDestination {
  partnerId: string;
  name: string;
  location: Coordinates;
  maxDailyCapacityKg: number;
  acceptedWasteTypes: string[];
}

export interface OrganicRouteStop {
  stopNumber: number;
  supplierId: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  estimatedWasteKg: number;
  estimatedArrivalMinutes: number;
  isCompatibleMaterial: boolean;
}

export interface OrganicRoutePlan {
  routeName: string;
  facilityDestination: {
    partnerId: string;
    name: string;
    latitude: number;
    longitude: number;
  };
  totalPlannedWasteKg: number;
  totalDistanceKm: number;
  estimatedTravelMinutes: number;
  estimatedTransportCost: number;
  costPerKgCollected: number;
  isViableLoad: boolean; // checks min viable load threshold (e.g. >= 80 kg)
  feasibilityExplanation: string;
  stops: OrganicRouteStop[];
}

/**
 * Plans an optimized organic waste collection loop starting from depot/NGO center,
 * visiting compatible suppliers, and dropping off at the composting facility.
 * Enforces vehicle capacity (e.g. 500 kg for cargo EV / mini truck) and min viable load.
 */
export function planOrganicWasteRoute(
  origin: Coordinates,
  suppliers: OrganicStopCandidate[],
  facility: FacilityDestination,
  vehicleCapacityKg = 600,
  minViableLoadKg = 80,
  costPerKm = 15
): OrganicRoutePlan {
  // Step 1: Filter suppliers with materials accepted by the designated processing facility
  const compatibleSuppliers = suppliers.filter(s => {
    // Check intersection of wasteTypes and facility.acceptedWasteTypes
    const hasAcceptedType = s.wasteTypes.some(wt => facility.acceptedWasteTypes.includes(wt));
    return hasAcceptedType && s.dailyWasteKg > 0;
  });

  // Step 2: Greedy nearest-neighbor clustering
  let currentPos = origin;
  let remaining = [...compatibleSuppliers];
  const orderedStops: OrganicRouteStop[] = [];
  let cumulativeMinutes = 0;
  let accumulatedKg = 0;
  let totalDistanceKm = 0;

  let stopNum = 1;
  while (remaining.length > 0) {
    let nearestIdx = -1;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateStraightLineDistanceKm(currentPos, remaining[i].location) * 1.32;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    if (nearestIdx === -1) break;

    const candidate = remaining.splice(nearestIdx, 1)[0];
    
    // Check if adding this exceeds vehicle payload
    if (accumulatedKg + candidate.dailyWasteKg > vehicleCapacityKg && accumulatedKg > 0) {
      // Vehicle full, can't add more on this loop
      continue;
    }

    accumulatedKg += candidate.dailyWasteKg;
    totalDistanceKm += nearestDist;

    // Drive time at 24 km/h + 6 mins per organic loading stop
    const driveMins = Math.round((nearestDist / 24) * 60) + 6;
    cumulativeMinutes += driveMins;

    orderedStops.push({
      stopNumber: stopNum++,
      supplierId: candidate.supplierId,
      name: candidate.name,
      category: candidate.category,
      latitude: candidate.location.latitude,
      longitude: candidate.location.longitude,
      estimatedWasteKg: candidate.dailyWasteKg,
      estimatedArrivalMinutes: cumulativeMinutes,
      isCompatibleMaterial: true
    });

    currentPos = candidate.location;
  }

  // Final leg: From last supplier to the fertilizer/composting facility
  const facilityLegKm = calculateStraightLineDistanceKm(currentPos, facility.location) * 1.32;
  totalDistanceKm += facilityLegKm;
  const facilityDriveMins = Math.round((facilityLegKm / 24) * 60) + 15; // 15 mins drop-off/weighing
  cumulativeMinutes += facilityDriveMins;

  totalDistanceKm = Number(totalDistanceKm.toFixed(2));
  const estimatedTransportCost = Math.round(totalDistanceKm * costPerKm);
  const costPerKgCollected = accumulatedKg > 0 
    ? Number((estimatedTransportCost / accumulatedKg).toFixed(2)) 
    : 0;

  const isViableLoad = accumulatedKg >= minViableLoadKg;

  let feasibilityExplanation = '';
  if (!isViableLoad) {
    feasibilityExplanation = `Below minimum viable threshold (${minViableLoadKg} kg). Total payload is only ${accumulatedKg} kg. Dispatching would result in high unit transport cost (₹${costPerKgCollected}/kg). Requires authorized override.`;
  } else {
    feasibilityExplanation = `Economically feasible route: ${accumulatedKg} kg collected across ${orderedStops.length} suppliers with direct drop-off at ${facility.name}. Unit transport cost is ₹${costPerKgCollected}/kg.`;
  }

  return {
    routeName: `Morning Agro-Organic Run -> ${facility.name}`,
    facilityDestination: {
      partnerId: facility.partnerId,
      name: facility.name,
      latitude: facility.location.latitude,
      longitude: facility.location.longitude
    },
    totalPlannedWasteKg: accumulatedKg,
    totalDistanceKm,
    estimatedTravelMinutes: cumulativeMinutes,
    estimatedTransportCost,
    costPerKgCollected,
    isViableLoad,
    feasibilityExplanation,
    stops: orderedStops
  };
}
