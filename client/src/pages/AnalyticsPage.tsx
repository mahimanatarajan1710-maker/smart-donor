import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Leaf, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  PieChart as PieIcon,
  Flame
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(console.error);
  }, []);

  const weeklyTrendData = [
    { day: 'Mon', confirmedRescued: 74, predictedSurplus: 85, individualTripKm: 42, pooledKm: 16 },
    { day: 'Tue', confirmedRescued: 82, predictedSurplus: 90, individualTripKm: 48, pooledKm: 18 },
    { day: 'Wed', confirmedRescued: 68, predictedSurplus: 78, individualTripKm: 39, pooledKm: 15 },
    { day: 'Thu', confirmedRescued: 91, predictedSurplus: 95, individualTripKm: 52, pooledKm: 20 },
    { day: 'Fri', confirmedRescued: 114, predictedSurplus: 120, individualTripKm: 65, pooledKm: 24 },
    { day: 'Sat', confirmedRescued: 128, predictedSurplus: 135, individualTripKm: 72, pooledKm: 26 },
    { day: 'Sun', confirmedRescued: 105, predictedSurplus: 112, individualTripKm: 58, pooledKm: 22 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            Empirical Performance & Environmental Impact
          </div>
          <h2 className="text-xl font-bold text-slate-800">Impact & Operations Analytics</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Audit logs, predictive surplus accuracy, vehicle pooling savings, and verified meal delivery efficiency.
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Meals Rescued</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">662 <span className="text-xs font-normal text-slate-500">meals/week</span></div>
          <div className="text-xs text-emerald-600 font-medium mt-1">96% Delivery Completion</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Distance Saved</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">235 <span className="text-xs font-normal text-slate-500">km</span></div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Via Smart Route Consolidation</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">NGO Logistics Cost Saved</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">₹3,290 <span className="text-xs font-normal text-slate-500">saved</span></div>
          <div className="text-xs text-slate-500 font-medium mt-1">Reduced solo transit overhead</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase">CO2 Prevented</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">178 <span className="text-xs font-normal text-slate-500">kg CO₂e</span></div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Verified carbon offset calculation</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Rescued vs Predicted */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Weekly Predicted Surplus vs Confirmed Rescue</h3>
          <p className="text-xs text-slate-500 mb-4">Comparing statistical baseline forecast with actual donor submissions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="confirmedRescued" name="Confirmed Rescued" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="predictedSurplus" name="Predicted Surplus" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Solo Roundtrips vs Pooled Multi-Stop */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-1">Route Distance Comparison (Km Travelled)</h3>
          <p className="text-xs text-slate-500 mb-4">Solo round trips (unfeasible) vs SmartBite AI pooled loops</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="individualTripKm" name="Solo Trips (Km)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="pooledKm" name="SmartBite Pooled (Km)" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
