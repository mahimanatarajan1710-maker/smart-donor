import React, { useEffect, useState } from 'react';
import { 
  UtensilsCrossed, 
  Plus, 
  CheckCircle, 
  Clock, 
  MapPin, 
  WifiOff, 
  RefreshCw, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { saveOfflineDonation, getOfflineDonations, syncPendingOfflineDonations } from '../lib/offlineSync';

export const DonationsPage: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Form State
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [foodCategory, setFoodCategory] = useState('baked_goods');
  const [foodDescription, setFoodDescription] = useState('');
  const [mealCount, setMealCount] = useState(10);
  const [storageCondition, setStorageCondition] = useState('ambient');
  const [contactPhone, setContactPhone] = useState('+91 98450 11001');

  useEffect(() => {
    fetchData();
    refreshOfflineQueue();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donRes, outRes] = await Promise.all([
        fetch('/api/donations'),
        fetch('/api/outlets')
      ]);

      if (donRes.ok) setDonations(await donRes.json());
      if (outRes.ok) {
        const outData = await outRes.json();
        setOutlets(outData);
        if (outData.length > 0) setSelectedOutlet(outData[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const refreshOfflineQueue = async () => {
    const queue = await getOfflineDonations();
    setOfflineQueue(queue);
  };

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const deadline = new Date(now.getTime() + 120 * 60 * 1000); // 2 hours

    const payload = {
      outletId: selectedOutlet,
      foodCategory,
      foodDescription,
      mealCount: Number(mealCount),
      preparationTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      storageCondition,
      allergenInfo: ['Gluten', 'Dairy'],
      collectionDeadline: deadline.toISOString(),
      packagingStatus: 'food_grade_sealed',
      contactPhone,
      clientOperationId: `don_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };

    // Attempt online post, fallback cleanly to IndexedDB offline queue
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchData();
        return;
      }
    } catch (networkErr) {
      console.warn('Network offline or unreachable. Saving locally to IndexedDB.');
    }

    // Save offline
    await saveOfflineDonation(payload);
    await refreshOfflineQueue();
    setShowAddModal(false);
    alert('Network disconnected or offline. Donation saved safely in local IndexedDB queue!');
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    const result = await syncPendingOfflineDonations();
    await refreshOfflineQueue();
    await fetchData();
    setSyncing(false);
    alert(`Sync completed! ${result.syncedCount} queued donation(s) synced to server.`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed & Tracked Rescues
          </div>
          <h2 className="text-xl font-bold text-slate-800">Donations Inventory & Food Safety</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Live donor submissions verified with strict food safety time limits, allergen labels, and unique pickup OTP verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {offlineQueue.length > 0 && (
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>Sync {offlineQueue.length} Offline Items</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Donation</span>
          </button>
        </div>
      </div>

      {offlineQueue.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Offline Queue Active: </span>
            {offlineQueue.length} donation(s) stored locally in browser IndexedDB. Will automatically sync idempotently when connected.
          </div>
        </div>
      )}

      {/* Donations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 text-base mb-4">Live Donations ({donations.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Donor Outlet</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Servings</th>
                <th className="py-2.5 px-3">Safety Status</th>
                <th className="py-2.5 px-3">Pickup OTP</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donations.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {d.outletId?.name || 'Local Outlet'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {d.foodCategory.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{d.foodDescription}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700">{d.mealCount} meals</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                      d.isFoodSafetyApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {d.isFoodSafetyApproved ? 'Approved (Safe)' : 'Safety Flagged'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {d.pickupOtp || '----'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {d.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Donation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">Log Surplus Food Donation</h3>
            <p className="text-xs text-slate-500 mb-4">Enter food details. Works seamlessly online and offline.</p>

            <form onSubmit={handleCreateDonation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Donor Outlet</label>
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  {outlets.map((o) => (
                    <option key={o._id} value={o._id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Category</label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="baked_goods">Baked Goods / Bread</option>
                  <option value="cooked_meals">Cooked Meals (Warm)</option>
                  <option value="mess_surplus">Hostel Mess Dining Surplus</option>
                  <option value="packaged_produce">Packaged Produce</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15 packed veggie sandwiches & buns"
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Servings Count</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={mealCount}
                    onChange={(e) => setMealCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Condition</label>
                  <select
                    value={storageCondition}
                    onChange={(e) => setStorageCondition(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="ambient">Ambient (Room Temp)</option>
                    <option value="insulated_warm">Insulated Warm</option>
                    <option value="refrigerated">Refrigerated</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm transition-colors"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
