import React, { useEffect, useState } from 'react';
import { 
  Radio, 
  MapPin, 
  Key, 
  CheckCircle2, 
  Truck, 
  Navigation, 
  AlertCircle,
  PhoneCall,
  Clock
} from 'lucide-react';

export const LiveOperationsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // OTP Verification dialog states
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [verifyType, setVerifyType] = useState<'pickup' | 'delivery'>('pickup');
  const [otpInput, setOtpInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assignments');
      if (res.ok) setAssignments(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateGPS = async (id: string) => {
    // Generates a live GPS ping moving toward destination
    const lat = 12.9720 + (Math.random() - 0.5) * 0.005;
    const lng = 77.5930 + (Math.random() - 0.5) * 0.005;
    try {
      const res = await fetch(`/api/assignments/${id}/gps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          speed: 26,
          heading: 140
        })
      });
      if (res.ok) {
        setActionSuccess('Live GPS coordinate update recorded and broadcasted.');
        fetchAssignments();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setIsVerifying(true);

    const endpoint = verifyType === 'pickup' 
      ? `/api/assignments/${selectedAssignment._id}/verify-pickup`
      : `/api/assignments/${selectedAssignment._id}/verify-delivery`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enteredOtp: otpInput,
          collectedBy: 'Authorized Responder',
          receivedBy: 'Sister Mary (NGO Receiver)'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActionSuccess(data.message);
        setSelectedAssignment(null);
        setOtpInput('');
        fetchAssignments();
      } else {
        const err = await res.json();
        alert(`Verification failed: ${err.error || 'Invalid OTP'}`);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Live Operations & Handover Verification
          </div>
          <h2 className="text-xl font-bold text-slate-800">Active Rescue Dispatches</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Real-time GPS telemetry and strict two-step OTP security: One-Time Password at donor handover, followed by final acceptance OTP at NGO delivery.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex justify-between items-center">
          <span className="font-semibold">{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="underline">Dismiss</button>
        </div>
      )}

      {/* Active Assignments */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No Active Dispatches Running</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Go to the Pickup Optimizer page to compare pooled plans and approve an intelligent multi-stop collection mission.
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800 uppercase">
                    Dispatch #{assignment._id.substring(18)}
                  </span>
                  <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    Mode: {assignment.deliveryMode.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-blue-100 text-blue-800">
                    {assignment.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSimulateGPS(assignment._id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ping GPS Location</span>
                  </button>

                  {assignment.status === 'accepted' && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setVerifyType('pickup');
                        setOtpInput(assignment.pickupOtp); // Pre-fill for hackathon convenience
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow-sm transition-colors"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>Verify Pickup OTP ({assignment.pickupOtp})</span>
                    </button>
                  )}

                  {assignment.status === 'picked_up' && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setVerifyType('delivery');
                        setOtpInput(assignment.deliveryOtp); // Pre-fill for demo convenience
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm NGO Delivery OTP ({assignment.deliveryOtp})</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400">Total Consignment</span>
                  <div className="font-bold text-slate-800 text-sm">{assignment.totalMeals} meals</div>
                </div>
                <div>
                  <span className="text-slate-400">Estimated Distance</span>
                  <div className="font-bold text-slate-800 text-sm">{assignment.totalDistanceKm} km</div>
                </div>
                <div>
                  <span className="text-slate-400">Operational Cost</span>
                  <div className="font-bold text-emerald-700 text-sm">₹{assignment.estimatedCost} (₹{assignment.costPerMeal}/meal)</div>
                </div>
                <div>
                  <span className="text-slate-400">Live GPS Coordinates</span>
                  <div className="font-mono text-slate-700 font-bold">
                    {assignment.currentGps?.latitude?.toFixed(4)}, {assignment.currentGps?.longitude?.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* OTP Verification Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {verifyType === 'pickup' ? 'Donor Handover Verification' : 'Final NGO Delivery Acceptance'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {verifyType === 'pickup' 
                ? 'Enter the 4-digit OTP provided by the food donor to verify pickup custody.'
                : 'Enter the 4-digit Delivery OTP provided to the NGO reception desk to complete delivery.'}
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 4-Digit OTP</label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-mono font-bold py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm transition-colors"
                >
                  {isVerifying ? 'Verifying...' : 'Confirm Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
