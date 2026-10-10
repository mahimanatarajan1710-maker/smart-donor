import React, { useEffect, useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Bike, 
  Car, 
  UserPlus 
} from 'lucide-react';

export const VolunteersPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New volunteer form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('two_wheeler');
  const [capacity, setCapacity] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/volunteers');
      if (res.ok) setVolunteers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/volunteers/${id}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setActionMessage(`Volunteer verification status updated to ${newStatus}.`);
        fetchVolunteers();
      }
    } catch (e: any) {
      alert(`Error updating status: ${e.message}`);
    }
  };

  const handleRegisterVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          vehicleType,
          carryingCapacityMeals: capacity,
          serviceArea: 'Campus Vicinity (1.5km)'
        })
      });

      if (res.ok) {
        setActionMessage('Volunteer registered! Awaiting NGO administrator review & verification.');
        setName('');
        setPhone('');
        fetchVolunteers();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Vetted Community Responders
          </div>
          <h2 className="text-xl font-bold text-slate-800">Volunteer Network & Verification</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Only NGO-approved volunteers with confirmed carrying capacities are assigned active food rescue missions to maintain hygiene and accountability.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex justify-between items-center">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="font-semibold underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volunteers List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-800 text-base mb-4">Registered Volunteers ({volunteers.length})</h3>

          <div className="space-y-3">
            {volunteers.map((vol) => (
              <div key={vol._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{vol.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      vol.verificationStatus === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : vol.verificationStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {vol.verificationStatus}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Phone: {vol.phone} • Area: {vol.serviceArea}
                  </div>
                  <div className="text-slate-600 mt-0.5 font-medium flex items-center gap-1">
                    {vol.vehicleType === 'car' ? <Car className="w-3.5 h-3.5" /> : <Bike className="w-3.5 h-3.5" />}
                    <span>{vol.vehicleType.replace('_', ' ')} (Capacity: {vol.carryingCapacityMeals} meals)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {vol.verificationStatus !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(vol._id, 'approved')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm transition-colors"
                    >
                      Approve
                    </button>
                  )}
                  {vol.verificationStatus !== 'suspended' && (
                    <button
                      onClick={() => handleUpdateStatus(vol._id, 'suspended')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold transition-colors"
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Volunteer Registration Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-base">Register New Volunteer</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Volunteers submit details and require NGO administrator approval before receiving live assignments.
          </p>

          <form onSubmit={handleRegisterVolunteer} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Contact</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Vehicle Mode</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="two_wheeler">Two-Wheeler (Motorcycle / Scooter)</option>
                <option value="car">Four-Wheeler / Hatchback</option>
                <option value="bicycle">Bicycle</option>
                <option value="on_foot">On Foot</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Carrying Capacity (Meals)</label>
              <input
                type="number"
                required
                min={5}
                max={100}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Register as Volunteer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
