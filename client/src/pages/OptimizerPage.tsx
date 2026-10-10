import React, { useEffect, useState } from 'react';
import { 
  Route, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Fuel, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export const OptimizerPage: React.FC = () => {
  const [plansData, setPlansData] = useState<any>(null);
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(2); // Default to Plan C (Best Cost)
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchOptimizerData();
  }, []);

  const fetchOptimizerData = async () => {
    setLoading(true);
    try {
      const [plansRes, volRes, vehRes, busRes] = await Promise.all([
        fetch('/api/optimizer/plans'),
        fetch('/api/volunteers'),
        fetch('/api/vehicles'),
        fetch('/api/bus-routes')
      ]);

      if (plansRes.ok) setPlansData(await plansRes.json());
      if (volRes.ok) setVolunteers(await volRes.json());
      if (vehRes.ok) setVehicles(await vehRes.json());
      if (busRes.ok) setBuses(await busRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = plansData?.plans?.[selectedPlanIdx];

  const handleApproveAssignment = async () => {
    if (!currentPlan) return;
    setDispatching(true);
    try {
      // Find an approved volunteer or NGO vehicle
      const approvedVol = volunteers.find(v => v.verificationStatus === 'approved' && v.isAvailable);
      const vehicle = vehicles[0];

      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: currentPlan.planType,
          deliveryMode: currentPlan.recommendedDeliveryMode,
          volunteerId: currentPlan.recommendedDeliveryMode === 'volunteer' ? approvedVol?._id : undefined,
          vehicleId: currentPlan.recommendedDeliveryMode === 'ngo_vehicle' ? vehicle?._id : undefined,
          busRouteId: currentPlan.recommendedDeliveryMode === 'partner_bus' ? buses[0]?._id : undefined,
          donationIds: currentPlan.eligibleDonationIds,
          totalMeals: currentPlan.totalMeals,
          totalDistanceKm: currentPlan.totalDistanceKm,
          estimatedTravelMinutes: currentPlan.estimatedTravelMinutes,
          estimatedCost: currentPlan.estimatedOperatingCost,
          costPerMeal: currentPlan.costPerMeal
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAssignmentSuccess(`Dispatch assignment created successfully! Pickup OTP: ${data.pickupOtp}`);
      } else {
        const err = await res.json();
        alert(`Dispatch error: ${err.error || 'Failed to dispatch'}`);
      }
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Central Intelligence Engine • Multi-Stop Pooling
          </div>
          <h2 className="text-xl font-bold text-slate-800">Route & Dispatch Optimizer</h2>
          <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
            Solving the micro-donation logistics challenge: Compares individual unfeasible donor round-trips against pooled collection loops. Evaluates Volunteer vs NGO Vehicle vs Public Bus delivery.
          </p>
        </div>

        {plansData?.baselineComparison && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs">
            <div>
              <div className="text-slate-400 font-medium">Solo Trips Distance</div>
              <div className="text-sm font-bold text-slate-700 line-through">
                {plansData.baselineComparison.individualTripsDistanceKm} km
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-emerald-700 font-semibold">Pooled Multi-Stop</div>
              <div className="text-base font-extrabold text-emerald-600">
                {plansData.baselineComparison.pooledDistanceKm} km
              </div>
            </div>
          </div>
        )}
      </div>

      {assignmentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold">{assignmentSuccess}</span>
          </div>
          <button 
            onClick={() => setAssignmentSuccess(null)}
            className="text-emerald-700 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Plan Selection Cards (3 Alternatives) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plansData?.plans?.map((plan: any, idx: number) => {
          const isSelected = selectedPlanIdx === idx;
          return (
            <div
              key={idx}
              onClick={() => setSelectedPlanIdx(idx)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                  {plan.planType === 'plan_a_fastest' ? 'Plan A — Fastest' : plan.planType === 'plan_b_max_meals' ? 'Plan B — Max Meals' : 'Plan C — Best Cost'}
                </span>
                {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <h4 className="font-bold text-sm text-slate-800 leading-snug">{plan.title}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.explanation}</p>

              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-slate-400">Meals</div>
                  <div className="font-bold text-slate-800">{plan.totalMeals}</div>
                </div>
                <div>
                  <div className="text-slate-400">Distance</div>
                  <div className="font-bold text-slate-800">{plan.totalDistanceKm} km</div>
                </div>
                <div>
                  <div className="text-slate-400">Cost/Meal</div>
                  <div className="font-bold text-emerald-700">₹{plan.costPerMeal}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Inspection and Route Sequence */}
      {currentPlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ordered Stops List */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Optimized Pickup Sequence ({currentPlan.stops.length} Stops)</h3>
                <p className="text-xs text-slate-500">Originating and concluding at Annam Karunya NGO HQ</p>
              </div>
              <button
                onClick={handleApproveAssignment}
                disabled={dispatching}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-4 h-4" />
                <span>{dispatching ? 'Assigning...' : 'Approve & Dispatch Plan'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {currentPlan.stops.map((stop: any, sIdx: number) => (
                <div key={sIdx} className="p-3.5 bg-slate-50/80 rounded-lg border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px]">
                      {stop.stopNumber}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{stop.outletName}</div>
                      <div className="text-slate-500">ETA: ~{stop.estimatedArrivalMinutes} mins from dispatch</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="font-bold text-emerald-700">{stop.mealCount} meals</div>
                      <div className="text-[11px] text-slate-400">Deadline: {stop.deadlineMinutesRemaining} mins left</div>
                    </div>
                    {stop.isDeadlineFeasible ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Feasible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[10px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Three Delivery Modes Comparison Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">3-Mode Delivery Comparison</h3>
              <p className="text-xs text-slate-500">Cost, capacity & operational feasibility analysis</p>
            </div>

            <div className="space-y-3">
              {plansData?.deliveryModeComparison?.map((mode: any, mIdx: number) => {
                const isRecommended = currentPlan.recommendedDeliveryMode === mode.mode;
                return (
                  <div 
                    key={mIdx} 
                    className={`p-3.5 rounded-lg border text-xs ${
                      isRecommended 
                        ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600' 
                        : 'border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-slate-800">{mode.displayName}</div>
                      {isRecommended && (
                        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-[11px] mb-2">{mode.recommendationReason}</p>
                    
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-200/60 pt-2 text-center text-[11px]">
                      <div>
                        <span className="text-slate-400">Est. Cost</span>
                        <div className="font-bold text-slate-800">₹{mode.estimatedCost}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Unit Cost</span>
                        <div className="font-bold text-emerald-700">₹{mode.costPerMeal}/meal</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Capacity</span>
                        <div className="font-bold text-slate-800">{mode.capacityMeals} meals</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
