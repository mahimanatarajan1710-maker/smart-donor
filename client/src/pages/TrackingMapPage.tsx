import React, { useEffect, useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  CheckCircle, 
  Truck, 
  Navigation, 
  AlertTriangle 
} from 'lucide-react';

export const TrackingMapPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/assignments').then(r => r.json()).then(setAssignments).catch(console.error);
    fetch('/api/outlets').then(r => r.json()).then(setOutlets).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Geographic Coverage
          </div>
          <h2 className="text-xl font-bold text-slate-800">Campus Cluster Live Map</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Live telemetry of active donors (15 outlets) and NGO headquarters (Annam Karunya Seva).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization Container */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="relative w-full h-96 bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {/* Visual stylised radar cluster map */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* NGO Headquarters Center Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-500/30 animate-pulse">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-white bg-slate-900/90 px-2.5 py-1 rounded-md mt-1 border border-slate-700 shadow-sm">
                NGO HQ (Annam Karunya)
              </span>
            </div>

            {/* Outlets Scatter Pins */}
            {outlets.map((outlet, idx) => {
              // Calculate relative scatter offsets around center
              const angle = (idx / outlets.length) * 2 * Math.PI;
              const radius = 100 + (idx % 3) * 35;
              const leftPercent = 50 + (Math.cos(angle) * radius * 0.25);
              const topPercent = 50 + (Math.sin(angle) * radius * 0.22);

              return (
                <div 
                  key={outlet._id}
                  style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                >
                  <div className={`w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125 ${
                    outlet.category === 'hostel_mess' ? 'bg-amber-500' : outlet.category === 'restaurant' ? 'bg-blue-500' : 'bg-emerald-400'
                  }`} />
                  <span className="hidden group-hover:block absolute bottom-5 text-[10px] font-bold text-white bg-slate-900/95 px-2 py-0.5 rounded whitespace-nowrap z-20 shadow-md">
                    {outlet.name} ({outlet.category.replace('_', ' ')})
                  </span>
                </div>
              );
            })}

            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white p-2.5 rounded-lg text-[10px] border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> NGO Central Kitchen</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Bakeries (9 outlets)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Restaurants (4 outlets)</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Hostel Messes (2 outlets)</div>
            </div>
          </div>
        </div>

        {/* Location Telemetry Sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">Cluster Location Registry</h3>
          <p className="text-xs text-slate-500">Fixed coordinates & GPS audit entries</p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {outlets.map((o) => (
              <div key={o._id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                <div className="font-semibold text-slate-800 truncate">{o.name}</div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Lat: {o.location.latitude.toFixed(4)}, Lng: {o.location.longitude.toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
