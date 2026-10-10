import React, { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Database, 
  ShieldAlert, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setResetMessage(data.message);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
          <Settings className="w-3.5 h-3.5 text-emerald-600" />
          System & Demo Configuration
        </div>
        <h2 className="text-xl font-bold text-slate-800">System Controls</h2>
        <p className="text-xs text-slate-500 max-w-xl">
          Demo scenario controls, environment status, and audit parameters for the SmartBite AI hackathon prototype.
        </p>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex justify-between items-center">
          <span className="font-semibold">{resetMessage}</span>
          <button onClick={() => setResetMessage(null)} className="underline">Dismiss</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-bold text-slate-800 text-sm mb-1">One-Click Demonstration Reset</h3>
          <p className="text-xs text-slate-500 mb-4">
            Resets all collections to the canonical hackathon benchmark: 15 outlets (9 bakeries, 4 restaurants, 2 messes), Annam Karunya NGO (80 meals nightly), 5 volunteers, 2 NGO vehicles, and 1 transit bus route.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting Cluster...' : 'Reset Canonical Demo Cluster'}</span>
          </button>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-800 text-sm mb-2">Platform Architecture & Routing Constants</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400">NGO HQ Base</span>
              <div className="font-bold text-slate-800 mt-0.5">Annam Karunya Seva</div>
              <div className="text-slate-500 text-[11px]">Night Demand: 80 meals</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400">Routing Circuity Detour</span>
              <div className="font-bold text-slate-800 mt-0.5">1.32x Urban Winding</div>
              <div className="text-slate-500 text-[11px]">Speed: 24 km/h + 4m stop</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-400">Database Engine</span>
              <div className="font-bold text-slate-800 mt-0.5">Mongoose + In-Memory Fallback</div>
              <div className="text-slate-500 text-[11px]">Auto-recovering</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
