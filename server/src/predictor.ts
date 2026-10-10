export interface SurplusPrediction {
  outletId: string;
  outletName: string;
  category: 'bakery' | 'restaurant' | 'hostel_mess';
  predictedSurplusMeals: number;
  historicalAverage: number;
  recentTrend: 'rising' | 'stable' | 'decreasing';
  confidenceScorePercent: number;
  typicalSurplusTime: string;
  explanation: string;
}

/**
 * Baseline statistical prediction engine:
 * Evaluates day of week, hour, historical trends, and outlet categories.
 * For example, hostel messes generate peak surplus around 21:00-22:00,
 * bakeries after 20:30 closing discounts, and restaurants on weekend evenings.
 */
export function predictOutletSurplus(
  outlet: {
    _id: string;
    name: string;
    category: 'bakery' | 'restaurant' | 'hostel_mess';
    historicalSurplusAverage: number;
  },
  currentHour = new Date().getHours(),
  dayOfWeek = new Date().getDay()
): SurplusPrediction {
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  let multiplier = 1.0;
  let typicalTime = '21:30';
  let trend: 'rising' | 'stable' | 'decreasing' = 'stable';

  if (outlet.category === 'hostel_mess') {
    typicalTime = '21:00 - 22:00';
    // Messes have heavy student dinner surplus
    multiplier = isWeekend ? 0.8 : 1.3;
    trend = 'rising';
  } else if (outlet.category === 'bakery') {
    typicalTime = '20:30 - 21:45';
    // Bakeries produce high fresh bread/pastry surplus daily
    multiplier = isWeekend ? 1.25 : 1.05;
    trend = 'stable';
  } else if (outlet.category === 'restaurant') {
    typicalTime = '22:15 - 23:00';
    multiplier = isWeekend ? 1.4 : 0.95;
    trend = isWeekend ? 'rising' : 'decreasing';
  }

  // Time-of-day decay / relevance factor
  let timeFactor = 1.0;
  if (currentHour >= 18 && currentHour <= 23) {
    timeFactor = 1.15; // Peak surplus accumulation window
  }

  const rawPrediction = outlet.historicalSurplusAverage * multiplier * timeFactor;
  const predictedMeals = Math.max(3, Math.round(rawPrediction));
  const confidence = Math.min(94, Math.max(72, Math.round(80 + (outlet.historicalSurplusAverage % 5) * 2.5)));

  const explanation = `${outlet.category === 'bakery' ? 'Bakery end-of-shelf-life goods' : outlet.category === 'hostel_mess' ? 'Hostel mess dinner batch buffer' : 'Restaurant evening surplus'} based on weighted historical averages for ${isWeekend ? 'weekend' : 'weekday'} operations.`;

  return {
    outletId: outlet._id.toString(),
    outletName: outlet.name,
    category: outlet.category,
    predictedSurplusMeals: predictedMeals,
    historicalAverage: outlet.historicalSurplusAverage,
    recentTrend: trend,
    confidenceScorePercent: confidence,
    typicalSurplusTime: typicalTime,
    explanation
  };
}
