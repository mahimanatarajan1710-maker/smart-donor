import React, { useEffect, useState } from 'react';
import { 
  Truck, 
  Bus, 
  Bike, 
  ShieldCheck, 
  Info, 
  MapPin, 
  Clock 
} from 'lucide-react';

export const TransportNetworkPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [busRoutes, setBusRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'volunteers' | 'ngo_vehicles' | 'partner_buses'>('volunteers');

  useEffect(() => {
    fetchTransportData();
  }, []);

  const fetchTransportData = async () => {
    setLoading(true);
    try {
      const [volRes, vehRes, busRes] = await Promise.all([
        fetch('/api/volunteers'),
        fetch('/api/vehicles'),
        fetch('/api/bus-routes')
      ]);

      if (volRes.ok) setVolunteers(await volRes.json());
      if (vehRes.ok) setVehicles(await vehRes.json());
      if (busRes.ok) setBusRoutes(await busRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Truck className="w-3.5 h-3.5 text-emerald-600" />
            3-Tier Multi-Mode Fleet
          </div>
          <h2 className="text-xl font-bold text-slate-800">Transport & Transit Partner Network</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Managing community volunteers (bikes/cars), NGO heavy-duty cargo vehicles, and scheduled municipal partner transit buses.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'volunteers' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Volunteers ({volunteers.length})
          </button>
          <button
            onClick={() => setActiveTab('ngo_vehicles')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'ngo_vehicles' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            NGO Vans ({vehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('partner_buses')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'partner_buses' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Partner Buses ({busRoutes.length})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'volunteers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {volunteers.map((vol) => (
            <div key={vol._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{vol.name}</h4>
                  <div className="text-slate-500">{vol.phone}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  vol.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {vol.verificationStatus}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-2 text-slate-600">
                <div>Vehicle: <span className="font-semibold capitalize text-slate-800">{vol.vehicleType.replace('_', ' ')}</span></div>
                <div>Capacity: <span className="font-semibold text-emerald-700">{vol.carryingCapacityMeals} meals</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'ngo_vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((veh) => (
            <div key={veh._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {veh.vehicleIdCode}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">{veh.name}</h4>
                  <div className="text-slate-500">Driver: {veh.assignedDriverName}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  {veh.isAvailable ? 'Available' : 'En Route'}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2 text-slate-600 text-center">
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[10px] text-slate-400">Capacity</span>
                  <div className="font-bold text-slate-800">{veh.carryingCapacityMeals} meals</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[10px] text-slate-400">Operating Cost</span>
                  <div className="font-bold text-emerald-700">₹{veh.operatingCostPerKm}/km</div>
                </div>
                <div className="bg-slate-50 p-2 rounded">
                  <span className="text-[10px] text-slate-400">Service Radius</span>
                  <div className="font-bold text-slate-800">3.0 km</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'partner_buses' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <span className="font-bold">Authorized Public Transit Integration (Simulated Model): </span>
              Pre-authorized public bus lines carrying segregated food parcels between designated terminal stops. Token fee structure (₹40 flat).
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {busRoutes.map((route) => (
              <div key={route._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-slate-800">{route.operatorName}</div>
                    <div className="font-mono text-emerald-700 font-semibold">{route.routeCode}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    SIMULATED SCHEDULE
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h5 className="font-bold text-slate-700 mb-2">Designated Route Stops & Timetable</h5>
                  <div className="space-y-2">
                    {route.stops?.map((stop: any, sIdx: number) => (
                      <div key={sIdx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span className="font-medium text-slate-800">{stop.stopName}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-600">{stop.scheduledDepartureTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
