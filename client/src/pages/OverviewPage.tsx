import React, { useEffect, useState } from 'react';
import { 
  Utensils, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertTriangle,
  Leaf,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, predRes, donRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/predictions'),
        fetch('/api/donations')
      ]);

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      if (predRes.ok) {
        const predData = await predRes.json();
        setPredictions(predData.predictions || []);
      }
      if (donRes.ok) setDonations(await donRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b'];

  const modeData = analytics?.deliveryModeBreakdown?.map((item: any) => ({
    name: item.mode,
    value: item.sharePercent
  })) || [
    { name: 'Volunteer Run', value: 55 },
    { name: 'NGO Van Fleet', value: 35 },
    { name: 'Transit Partner Bus', value: 10 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-200 mb-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            Active University Cluster • 1.5 km Radius
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Food Rescue Intelligence Dashboard</h2>
          <p className="text-emerald-100/90 text-sm max-w-2xl mt-1">
            Predicting surplus across 15 campus food establishments, pooling micro-donations into unified routes, and orchestrating volunteer, van, and public transit deliveries.
          </p>
        </div>
        <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-xl p-4 flex gap-6 text-center">
          <div>
            <div className="text-2xl font-black text-emerald-400">80</div>
            <div className="text-[11px] text-emerald-200">NGO Night Demand</div>
          </div>
          <div className="w-[1px] bg-emerald-800" />
          <div>
            <div className="text-2xl font-black text-amber-400">58</div>
            <div className="text-[11px] text-emerald-200">Confirmed Available</div>
          </div>
          <div className="w-[1px] bg-emerald-800" />
          <div>
            <div className="text-2xl font-black text-white">124</div>
            <div className="text-[11px] text-emerald-200">Predicted Surplus</div>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Confirmed Available</span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">58 <span className="text-xs font-normal text-slate-500">meals</span></div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>6 outlets ready for pickup</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Utensils className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Predicted Surplus</span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">124 <span className="text-xs font-normal text-slate-500">meals</span></div>
            <div className="flex items-center gap-1 text-xs text-amber-600 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Hostels peak at 21:30</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pooling Fuel Saved</span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">24.8 <span className="text-xs font-normal text-slate-500">km</span></div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
              <Leaf className="w-3.5 h-3.5" />
              <span>₹347 saved vs solo trips</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Fleet & Team</span>
            <div className="text-3xl font-extrabold text-slate-800 mt-1">5 <span className="text-xs font-normal text-slate-500">ready</span></div>
            <div className="flex items-center gap-1 text-xs text-slate-600 mt-2 font-medium">
              <Truck className="w-3.5 h-3.5" />
              <span>2 vans, 2 volunteers, 1 bus</span>
            </div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Predictive Table vs Mode Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predictive Surplus Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Predictive Surplus Forecast vs Confirmed</h3>
              <p className="text-xs text-slate-500">Categorical statistical baseline weighted by weekday operating curves</p>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-100">
              15 Outlets Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Outlet Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Predicted Surplus</th>
                  <th className="py-2.5 px-3">Peak Window</th>
                  <th className="py-2.5 px-3">Trend</th>
                  <th className="py-2.5 px-3 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictions.slice(0, 6).map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-800">{p.outletName}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {p.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">{p.predictedSurplusMeals} meals</td>
                    <td className="py-3 px-3 text-slate-500">{p.typicalSurplusTime}</td>
                    <td className="py-3 px-3">
                      <span className={`capitalize font-medium ${p.recentTrend === 'rising' ? 'text-amber-600' : 'text-slate-600'}`}>
                        {p.recentTrend}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700">{p.confidenceScorePercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Multi-Mode Dispatch Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Multi-Mode Delivery Share</h3>
            <p className="text-xs text-slate-500">Distribution among the 3 delivery methods</p>
            <div className="h-56 mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-4">
            {modeData.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function SparklesIcon(props: any) {
  return <Sparkles {...props} />;
}
