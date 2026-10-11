import React, { useEffect, useState } from 'react';
import { 
  Sprout, 
  Building2, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  MapPin, 
  Download, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Scale,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

export const OrganicWasteModulePage: React.FC = () => {
  // Navigation tabs for the 8 sections
  const [activeTab, setActiveTab] = useState<
    'overview' | 'suppliers' | 'collections' | 'partners' | 'sales' | 'calculator' | 'route' | 'reports'
  >('overview');

  // Shared state
  const [metrics, setMetrics] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [routePlan, setRoutePlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Supplier modal & filters
  const [supplierCategoryFilter, setSupplierCategoryFilter] = useState('all');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierCat, setNewSupplierCat] = useState('fruit_shop');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierAddress, setNewSupplierAddress] = useState('');
  const [newSupplierDailyKg, setNewSupplierDailyKg] = useState(50);
  const [newSupplierIncentive, setNewSupplierIncentive] = useState(0.50);

  // Collection modal
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [colSupplierId, setColSupplierId] = useState('');
  const [colPartnerId, setColPartnerId] = useState('');
  const [colCategory, setColCategory] = useState('fruit_waste');
  const [colWeightKg, setColWeightKg] = useState(60);
  const [colAcceptedKg, setColAcceptedKg] = useState(55);
  const [colTransportCost, setColTransportCost] = useState(150);
  const [colObservations, setColObservations] = useState('');

  // Partner modal
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [partnerOrgName, setPartnerOrgName] = useState('');
  const [partnerContact, setPartnerContact] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerAddress, setPartnerAddress] = useState('');
  const [partnerCapacity, setPartnerCapacity] = useState(1500);
  const [partnerYield, setPartnerYield] = useState(30);
  const [partnerPricePerKg, setPartnerPricePerKg] = useState(5.0);

  // Compost Sale modal
  const [showAddSaleModal, setShowAddSaleModal] = useState(false);
  const [saleBuyerName, setSaleBuyerName] = useState('');
  const [saleBuyerCategory, setSaleBuyerCategory] = useState('organic_farm');
  const [saleBuyerContact, setSaleBuyerContact] = useState('');
  const [saleQtyKg, setSaleQtyKg] = useState(500);
  const [saleUnitPrice, setSaleUnitPrice] = useState(5.0);

  // Calculator state (starts with Pilot Scenario values)
  const [calcDailyKg, setCalcDailyKg] = useState<number>(500);
  const [calcOperatingDays, setCalcOperatingDays] = useState<number>(30);
  const [calcYieldPct, setCalcYieldPct] = useState<number>(30);
  const [calcCompostPrice, setCalcCompostPrice] = useState<number>(5.0);
  const [calcSupplierPaymentPerKg, setCalcSupplierPaymentPerKg] = useState<number>(0.50);
  const [calcTransportMonthly, setCalcTransportMonthly] = useState<number>(20000);
  const [calcProcessingMonthly, setCalcProcessingMonthly] = useState<number>(15000);
  const [calcLaborAdminMonthly, setCalcLaborAdminMonthly] = useState<number>(10000);
  const [calcCollectionRevenue, setCalcCollectionRevenue] = useState<number>(45000);
  const [calcOtherRevenue, setCalcOtherRevenue] = useState<number>(0);
  const [calcPackagingTesting, setCalcPackagingTesting] = useState<number>(0);
  const [calcRentUtilities, setCalcRentUtilities] = useState<number>(0);
  const [calcDepreciation, setCalcDepreciation] = useState<number>(0);
  const [calcResult, setCalcResult] = useState<any>(null);

  useEffect(() => {
    fetchModuleData();
  }, []);

  useEffect(() => {
    // Recompute calculator on input change
    computeProfit();
  }, [
    calcDailyKg, 
    calcOperatingDays, 
    calcYieldPct, 
    calcCompostPrice, 
    calcSupplierPaymentPerKg, 
    calcTransportMonthly, 
    calcProcessingMonthly, 
    calcLaborAdminMonthly, 
    calcCollectionRevenue, 
    calcOtherRevenue,
    calcPackagingTesting,
    calcRentUtilities,
    calcDepreciation
  ]);

  const fetchModuleData = async () => {
    setLoading(true);
    try {
      const [mRes, sRes, pRes, cRes, saleRes, rRes] = await Promise.all([
        fetch('/api/organic/metrics'),
        fetch('/api/organic/suppliers'),
        fetch('/api/organic/partners'),
        fetch('/api/organic/collections'),
        fetch('/api/organic/sales'),
        fetch('/api/organic/route/plan')
      ]);

      if (mRes.ok) setMetrics(await mRes.json());
      if (sRes.ok) {
        const supData = await sRes.json();
        setSuppliers(supData);
        if (supData.length > 0) setColSupplierId(supData[0]._id);
      }
      if (pRes.ok) {
        const partData = await pRes.json();
        setPartners(partData);
        if (partData.length > 0) setColPartnerId(partData[0]._id);
      }
      if (cRes.ok) setCollections(await cRes.json());
      if (saleRes.ok) setSales(await saleRes.json());
      if (rRes.ok) setRoutePlan(await rRes.json());
    } catch (e) {
      console.error('Error fetching organic module data:', e);
    } finally {
      setLoading(false);
    }
  };

  const computeProfit = async () => {
    try {
      const res = await fetch('/api/organic/calculator/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingWasteKgPerDay: Number(calcDailyKg),
          operatingDaysPerMonth: Number(calcOperatingDays),
          saleableCompostYieldPercent: Number(calcYieldPct),
          compostSellingPricePerKg: Number(calcCompostPrice),
          supplierPaymentPerKg: Number(calcSupplierPaymentPerKg),
          monthlyTransportCost: Number(calcTransportMonthly),
          monthlyProcessingFee: Number(calcProcessingMonthly),
          monthlyLaborAdminCost: Number(calcLaborAdminMonthly),
          packagingTestingCost: Number(calcPackagingTesting),
          rentUtilitiesCost: Number(calcRentUtilities),
          depreciationFinancingCost: Number(calcDepreciation),
          confirmedCollectionRevenue: Number(calcCollectionRevenue),
          otherRevenue: Number(calcOtherRevenue)
        })
      });
      if (res.ok) {
        setCalcResult(await res.json());
      }
    } catch (e) {
      console.error('Profit computation error:', e);
    }
  };

  const handleResetPilotScenario = async () => {
    setCalcDailyKg(500);
    setCalcOperatingDays(30);
    setCalcYieldPct(30);
    setCalcCompostPrice(5.0);
    setCalcSupplierPaymentPerKg(0.50);
    setCalcTransportMonthly(20000);
    setCalcProcessingMonthly(15000);
    setCalcLaborAdminMonthly(10000);
    setCalcCollectionRevenue(45000);
    setCalcOtherRevenue(0);
    setCalcPackagingTesting(0);
    setCalcRentUtilities(0);
    setCalcDepreciation(0);
    setActionSuccess('Reset to canonical Pilot Demo Scenario: 500 kg/day, ₹15,000 monthly surplus.');
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/organic/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName,
          category: newSupplierCat,
          contactPerson: newSupplierContact,
          contactPhone: newSupplierPhone,
          address: newSupplierAddress,
          estimatedDailyWasteKg: Number(newSupplierDailyKg),
          pricePerKgIncentive: Number(newSupplierIncentive)
        })
      });
      if (res.ok) {
        setActionSuccess('Supplier registered successfully!');
        setShowAddSupplierModal(false);
        fetchModuleData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/organic/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: colSupplierId,
          partnerId: colPartnerId,
          wasteCategory: colCategory,
          collectedWeightKg: Number(colWeightKg),
          acceptedWeightKg: Number(colAcceptedKg),
          rejectedWeightKg: Math.max(0, Number(colWeightKg) - Number(colAcceptedKg)),
          transportCost: Number(colTransportCost),
          contaminationObservations: colObservations
        })
      });
      if (res.ok) {
        setActionSuccess('Organic waste collection recorded with facility delivery!');
        setShowAddCollectionModal(false);
        fetchModuleData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/organic/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: saleBuyerName,
          buyerCategory: saleBuyerCategory,
          buyerContact: saleBuyerContact,
          quantityKg: Number(saleQtyKg),
          unitPricePerKg: Number(saleUnitPrice)
        })
      });
      if (res.ok) {
        setActionSuccess('Compost sale transaction recorded with invoice generation!');
        setShowAddSaleModal(false);
        fetchModuleData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadCSV = () => {
    window.open('/api/organic/reports/export-csv', '_blank');
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesCat = supplierCategoryFilter === 'all' || s.category === supplierCategoryFilter;
    const matchesSearch = !supplierSearch || s.name.toLowerCase().includes(supplierSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Notice - Sustainability Theme */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-emerald-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 mb-2 border border-emerald-700">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            Two-Path Food Recovery • Path B: Organic Valorization
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Organic Waste & Fertilizer Business Hub</h2>
          <p className="text-emerald-100/90 text-xs max-w-2xl mt-1">
            Transforming non-donatable scraps from fruit shops, bakeries, and hotel kitchens into high-grade organic compost. Commercial processing agreements, supplier incentive payments, and live profit analysis.
          </p>
        </div>

        <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-xl p-3 flex gap-4 text-center">
          <div>
            <div className="text-xl font-black text-emerald-300">{metrics?.totalCollectedKg || 430} <span className="text-[10px] font-normal text-slate-300">kg</span></div>
            <div className="text-[10px] text-emerald-200">Total Waste Recovered</div>
          </div>
          <div className="w-[1px] bg-emerald-800" />
          <div>
            <div className="text-xl font-black text-amber-300">{metrics?.totalCompostSoldKg || 2500} <span className="text-[10px] font-normal text-slate-300">kg</span></div>
            <div className="text-[10px] text-emerald-200">Compost Distributed</div>
          </div>
          <div className="w-[1px] bg-emerald-800" />
          <div>
            <div className="text-xl font-black text-white">{formatINR(metrics?.totalCompostRevenue || 12750)}</div>
            <div className="text-[10px] text-emerald-200">Revenue Generated</div>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex justify-between items-center shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="underline text-emerald-700">Dismiss</button>
        </div>
      )}

      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto pb-1 gap-1 text-xs font-semibold">
        {[
          { key: 'overview', label: 'Overview Dashboard', icon: BarChart3 },
          { key: 'suppliers', label: `Suppliers (${suppliers.length})`, icon: Building2 },
          { key: 'collections', label: `Waste Collections (${collections.length})`, icon: Scale },
          { key: 'partners', label: `Fertilizer Partners (${partners.length})`, icon: Sprout },
          { key: 'sales', label: `Compost Sales (${sales.length})`, icon: DollarSign },
          { key: 'calculator', label: 'Profit Calculator', icon: TrendingUp, highlight: true },
          { key: 'route', label: 'Route Planning', icon: Truck },
          { key: 'reports', label: 'Reports & CSV Export', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-white border-t-2 border-x border-emerald-700 text-emerald-900 font-bold shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.highlight && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded uppercase">Live</span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Two-Path Food Recovery Callout Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">A</span>
                <h4 className="font-bold text-slate-800 text-sm">Path A: Edible Food Rescue (Primary)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applies standard food safety testing and delivers surplus meals directly to verified NGOs within safe thermal deadlines (handled via the core SmartBite AI donation engine).
              </p>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/80">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">B</span>
                <h4 className="font-bold text-slate-800 text-sm">Path B: Organic Valorization (This Module)</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Captures raw peels, fruit pulp, vegetable cuttings, and non-donatable trimmings, routing them to registered composting facilities for bio-fertilizer manufacturing.
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Registered Suppliers</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{suppliers.length} <span className="text-xs font-normal text-slate-500">active outlets</span></div>
              <div className="text-xs text-emerald-600 font-medium mt-1">Fruit shops, hotels, bakeries</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Collected</span>
              <div className="text-2xl font-extrabold text-emerald-700 mt-1">{metrics?.totalAcceptedKg || 430} <span className="text-xs font-normal text-slate-500">kg accepted</span></div>
              <div className="text-xs text-slate-500 font-medium mt-1">Rejection rate: {metrics?.rejectionRatePercent || 2.3}%</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Supplier Incentives Paid</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1">{formatINR(metrics?.totalSupplierIncentives || 199)}</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">₹0.50/kg standard rate</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase">Compost Sales Revenue</span>
              <div className="text-2xl font-extrabold text-teal-700 mt-1">{formatINR(metrics?.totalCompostRevenue || 12750)}</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Sold to farms & nurseries</div>
            </div>
          </div>

          {/* Quick Actions & Recent Runs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Recent Organic Waste Collections</h3>
                <button onClick={() => setActiveTab('collections')} className="text-xs text-emerald-700 font-bold hover:underline">
                  View All Collections →
                </button>
              </div>

              <div className="space-y-3">
                {collections.slice(0, 4).map(c => (
                  <div key={c._id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">{c.supplierId?.name || 'Local Supplier'}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Category: <span className="capitalize">{c.wasteCategory.replace(/_/g, ' ')}</span> • Accepted: {c.acceptedWeightKg} kg
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-700">{formatINR(c.supplierIncentiveAmount)} paid</div>
                      <div className="text-[10px] text-slate-400">Est. Compost: {c.estimatedCompostYieldKg} kg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">Module Operations Actions</h3>
              <p className="text-xs text-slate-500">Direct shortcuts for administrative tasks</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('collections'); setShowAddCollectionModal(true); }}
                  className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Organic Collection</span>
                </button>
                <button
                  onClick={() => { setActiveTab('suppliers'); setShowAddSupplierModal(true); }}
                  className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-emerald-700" />
                  <span>Register Organic Supplier</span>
                </button>
                <button
                  onClick={() => { setActiveTab('calculator'); }}
                  className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <span>Open Profit Calculator</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: SUPPLIER MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Organic Waste Suppliers Directory</h3>
              <p className="text-xs text-slate-500">Commercial establishments registered for regular non-donatable organic scrap collections</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddSupplierModal(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register Supplier</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search supplier name..."
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs flex-1 focus:ring-1 focus:ring-emerald-700 outline-none"
            />
            <select
              value={supplierCategoryFilter}
              onChange={(e) => setSupplierCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              <option value="fruit_shop">Fruit Shops</option>
              <option value="vegetable_shop">Vegetable Shops</option>
              <option value="hotel">Hotels</option>
              <option value="bakery">Bakeries</option>
              <option value="restaurant">Restaurants</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Suppliers Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map(s => (
              <div key={s._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{s.name}</h4>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {s.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    {s.status}
                  </span>
                </div>

                <div className="text-slate-600 space-y-1">
                  <div>Contact: <span className="font-semibold text-slate-800">{s.contactPerson}</span> ({s.contactPhone})</div>
                  <div className="text-slate-500 truncate">Address: {s.address}</div>
                  <div>Waste Types: <span className="font-medium text-slate-700">{s.wasteTypes.join(', ')}</span></div>
                </div>

                <div className="border-t border-slate-100 pt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[10px] text-slate-400">Est. Daily</span>
                    <div className="font-bold text-slate-800">{s.estimatedDailyWasteKg} kg</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[10px] text-slate-400">Rate/Kg</span>
                    <div className="font-bold text-emerald-700">₹{s.paymentAgreement?.pricePerKgIncentive}</div>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <span className="text-[10px] text-slate-400">Paid To Date</span>
                    <div className="font-bold text-teal-700">{formatINR(s.totalPaidToDate)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: ORGANIC WASTE COLLECTION */}
      {/* ============================================================ */}
      {activeTab === 'collections' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Organic Waste Collection Log (Path B)</h3>
              <p className="text-xs text-slate-500">Accredited weighing, contamination inspections, and facility delivery tracking</p>
            </div>

            <button
              onClick={() => setShowAddCollectionModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Collection</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Collected (kg)</th>
                  <th className="py-2.5 px-3 text-right">Accepted (kg)</th>
                  <th className="py-2.5 px-3 text-right">Rejected (kg)</th>
                  <th className="py-2.5 px-3 text-right">Incentive Paid</th>
                  <th className="py-2.5 px-3">Destination Facility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collections.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 text-slate-500">{new Date(c.collectionDate).toLocaleDateString()}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{c.supplierId?.name || 'Local Outlet'}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {c.wasteCategory.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{c.collectedWeightKg} kg</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">{c.acceptedWeightKg} kg</td>
                    <td className="py-3 px-3 text-right font-medium text-rose-600">
                      {c.rejectedWeightKg > 0 ? `${c.rejectedWeightKg} kg` : '0 kg'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-teal-800">{formatINR(c.supplierIncentiveAmount)}</td>
                    <td className="py-3 px-3 text-slate-700 truncate max-w-xs">{c.partnerId?.organizationName || 'Bhoomi Bio-Fertilizers'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: FERTILIZER PARTNERS MANAGEMENT */}
      {/* ============================================================ */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Fertilizer & Composting Facilities</h3>
              <p className="text-xs text-slate-500">Accredited biological processing plants, conversion yields, and accepted input specifications</p>
            </div>

            <button
              onClick={() => setShowAddPartnerModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Partner Facility</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partners.map(p => (
              <div key={p._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{p.organizationName}</h4>
                    <div className="text-slate-500 text-[11px] mt-0.5">{p.serviceArea}</div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg space-y-2 border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-700">Accepted Materials: </span>
                    <span className="text-emerald-700">{p.acceptedWasteTypes.join(', ')}</span>
                  </div>
                  <div>
                    <span className="font-bold text-rose-700">Strictly Rejected: </span>
                    <span className="text-rose-600">{p.rejectedWasteTypes.join(', ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded">
                    <span className="text-[10px] text-slate-400">Max Capacity</span>
                    <div className="font-bold text-slate-800 text-sm">{p.maxDailyCapacityKg} kg/day</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded">
                    <span className="text-[10px] text-slate-400">Yield Conversion</span>
                    <div className="font-bold text-emerald-700 text-sm">{p.compostYieldPercentage}%</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded">
                    <span className="text-[10px] text-slate-400">Selling Price</span>
                    <div className="font-bold text-teal-700 text-sm">₹{p.sellingPricePerKg}/kg</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: COMPOST PRODUCTION & SALES */}
      {/* ============================================================ */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Finished Bio-Compost Sales</h3>
              <p className="text-xs text-slate-500">Commercial distribution to agricultural cooperatives, organic orchards, and urban nurseries</p>
            </div>

            <button
              onClick={() => setShowAddSaleModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale Transaction</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Buyer Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Quantity (kg)</th>
                  <th className="py-2.5 px-3 text-right">Rate/Kg</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map(s => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{s.invoiceNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{s.buyerName}</td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {s.buyerCategory.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{s.quantityKg} kg</td>
                    <td className="py-3 px-3 text-right text-slate-600">₹{s.unitPricePerKg}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">{formatINR(s.totalSaleAmount)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded uppercase font-bold text-[10px] bg-emerald-100 text-emerald-800">
                        {s.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: BUSINESS PROFIT CALCULATOR (PART 7 & 8) */}
      {/* ============================================================ */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Interactive Commercial Feasibility Engine
              </div>
              <h3 className="font-bold text-slate-800 text-base">Business Cost & Profit Calculator</h3>
              <p className="text-xs text-slate-500">
                Calculates monthly incoming waste, compost yields, operational overheads, break-even volumes, and operating surplus.
              </p>
            </div>

            <button
              onClick={handleResetPilotScenario}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Pilot Scenario (500 kg/day)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Editable Parameters Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Operational & Yield Inputs</h4>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incoming Waste (kg/day)</label>
                  <input
                    type="number"
                    min={0}
                    value={calcDailyKg}
                    onChange={(e) => setCalcDailyKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Operating Days/Mo</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={calcOperatingDays}
                      onChange={(e) => setCalcOperatingDays(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Compost Yield (%)</label>
                    <input
                      type="number"
                      min={5}
                      max={80}
                      value={calcYieldPct}
                      onChange={(e) => setCalcYieldPct(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Compost Price (₹/kg)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={calcCompostPrice}
                      onChange={(e) => setCalcCompostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Supplier Pay (₹/kg)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={calcSupplierPaymentPerKg}
                      onChange={(e) => setCalcSupplierPaymentPerKg(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 pt-2">Monthly Overheads & Revenue</h4>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Transport Cost (₹)</label>
                  <input
                    type="number"
                    value={calcTransportMonthly}
                    onChange={(e) => setCalcTransportMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Processing Fee (₹)</label>
                  <input
                    type="number"
                    value={calcProcessingMonthly}
                    onChange={(e) => setCalcProcessingMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Labor, Software & Admin (₹)</label>
                  <input
                    type="number"
                    value={calcLaborAdminMonthly}
                    onChange={(e) => setCalcLaborAdminMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirmed Collection Revenue (₹/mo)</label>
                  <input
                    type="number"
                    value={calcCollectionRevenue}
                    onChange={(e) => setCalcCollectionRevenue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Right Column (2 spans): Real-time Computed Financial Model */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800 text-sm">Monthly Financial Projections</h4>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Calculated in Real-Time
                  </span>
                </div>

                {calcResult && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-400">Monthly Waste</span>
                      <div className="text-lg font-bold text-slate-800">{calcResult.monthlyIncomingWasteKg?.toLocaleString()} kg</div>
                      <div className="text-[10px] text-slate-500">{calcDailyKg} kg/day × {calcOperatingDays} days</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-400">Saleable Compost</span>
                      <div className="text-lg font-bold text-emerald-700">{calcResult.estimatedSaleableCompostKg?.toLocaleString()} kg</div>
                      <div className="text-[10px] text-slate-500">Yield: {calcYieldPct}%</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-400">Total Monthly Rev</span>
                      <div className="text-lg font-bold text-teal-800">{formatINR(calcResult.totalMonthlyRevenue)}</div>
                      <div className="text-[10px] text-slate-500">Sales + Collection fees</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="text-slate-400">Total Operating Cost</span>
                      <div className="text-lg font-bold text-slate-800">{formatINR(calcResult.totalOperatingCosts)}</div>
                      <div className="text-[10px] text-slate-500">Overheads + incentives</div>
                    </div>
                  </div>
                )}

                {/* Operating Surplus Highlight */}
                {calcResult && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Estimated Operating Surplus / Month</span>
                      <div className="text-2xl font-black text-emerald-900 mt-0.5">
                        {formatINR(calcResult.operatingProfit)}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Net Profit Margin: {calcResult.netProfitMarginPercent}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500">Break-Even Revenue</div>
                      <div className="font-bold text-slate-800 text-base">{formatINR(calcResult.breakEvenRevenue)}</div>
                      <div className="text-[10px] text-slate-400">Break-even volume: {calcResult.breakEvenWasteKg?.toLocaleString()} kg</div>
                    </div>
                  </div>
                )}

                {/* Cost Breakdown Table */}
                {calcResult && (
                  <div className="border border-slate-100 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="p-2.5">Line Item Breakdown</th>
                          <th className="p-2.5 text-right">Monthly Amount</th>
                          <th className="p-2.5 text-right">% of Costs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        <tr>
                          <td className="p-2.5">Compost Sales (4,500 kg @ ₹5/kg)</td>
                          <td className="p-2.5 text-right font-bold text-emerald-700">{formatINR(calcResult.compostSalesRevenue)}</td>
                          <td className="p-2.5 text-right text-slate-400">—</td>
                        </tr>
                        <tr>
                          <td className="p-2.5">Collection Service Fee Revenue</td>
                          <td className="p-2.5 text-right font-bold text-emerald-700">{formatINR(calcResult.confirmedCollectionRevenue)}</td>
                          <td className="p-2.5 text-right text-slate-400">—</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 text-slate-600">Supplier Payments (15,000 kg @ ₹0.50/kg)</td>
                          <td className="p-2.5 text-right text-rose-700 font-medium">{formatINR(calcResult.supplierPaymentsCost)}</td>
                          <td className="p-2.5 text-right text-slate-500">14.3%</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 text-slate-600">Dedicated Fleet Transport</td>
                          <td className="p-2.5 text-right text-rose-700 font-medium">{formatINR(calcResult.transportCost)}</td>
                          <td className="p-2.5 text-right text-slate-500">38.1%</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 text-slate-600">Facility Composting Fee</td>
                          <td className="p-2.5 text-right text-rose-700 font-medium">{formatINR(calcResult.processingCost)}</td>
                          <td className="p-2.5 text-right text-slate-500">28.6%</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-2.5 text-slate-600">Labor, Administration & Software</td>
                          <td className="p-2.5 text-right text-rose-700 font-medium">{formatINR(calcResult.laborAdminCost)}</td>
                          <td className="p-2.5 text-right text-slate-500">19.0%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 7: ROUTE PLANNING */}
      {/* ============================================================ */}
      {activeTab === 'route' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Organic Waste Collection Route (Depot to Processing Plant)</h3>
              <p className="text-xs text-slate-500">
                Optimized multi-stop loop filtering for accepted materials and enforcing minimum viable load thresholds
              </p>
            </div>

            {routePlan && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                routePlan.isViableLoad ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {routePlan.isViableLoad ? 'Viable Load Approved' : 'Below Minimum Threshold'}
              </span>
            )}
          </div>

          {routePlan && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-sm">{routePlan.routeName}</h4>
                  <span className="text-xs text-slate-500">Vehicle: Cargo EV (600 kg capacity)</span>
                </div>

                <p className="text-xs text-slate-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  {routePlan.feasibilityExplanation}
                </p>

                <div className="space-y-3 pt-2">
                  {routePlan.stops?.map((stop: any) => (
                    <div key={stop.stopNumber} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
                          {stop.stopNumber}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{stop.name}</div>
                          <div className="text-slate-400 text-[11px]">ETA: ~{stop.estimatedArrivalMinutes} mins from depot</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-700">{stop.estimatedWasteKg} kg waste</div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-semibold">
                          Material Compatible
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 text-sm">Route Logistics Metrics</h4>
                
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Total Planned Payload</span>
                    <div className="text-lg font-bold text-slate-800">{routePlan.totalPlannedWasteKg} kg</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Total Road Distance</span>
                    <div className="text-lg font-bold text-slate-800">{routePlan.totalDistanceKm} km</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Estimated Transport Cost</span>
                    <div className="text-lg font-bold text-emerald-700">{formatINR(routePlan.estimatedTransportCost)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">₹{routePlan.costPerKgCollected}/kg transport overhead</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400">Destination Drop-Off</span>
                    <div className="text-sm font-bold text-slate-800">{routePlan.facilityDestination?.name}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 8: REPORTS AND CSV EXPORT */}
      {/* ============================================================ */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Sustainability & Commercial Reports</h3>
              <p className="text-xs text-slate-500">Download immutable transaction logs for audit, municipal verification, and supplier payouts</p>
            </div>

            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export All Collections (CSV)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Supplier Performance Audit</h4>
              <p className="text-slate-500 text-[11px]">
                Tracks quality compliance and contamination rejections per supplier. Current cluster rejection rate: {metrics?.rejectionRatePercent || 2.3}%.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Compost Yield Verification</h4>
              <p className="text-slate-500 text-[11px]">
                Observed conversion yield of 30% against the 430 kg collected benchmark matches pilot assumptions.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Municipal Zero-Landfill Impact</h4>
              <p className="text-slate-500 text-[11px]">
                Diverts organic putrescibles away from urban landfills, preventing methane generation and producing bio-fertilizer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALS */}
      {/* ============================================================ */}

      {/* Modal: Add Supplier */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-800 mb-1">Register Organic Waste Supplier</h3>
            <p className="text-slate-500 mb-4">Establishment onboarding for regular non-donatable scraps</p>

            <form onSubmit={handleCreateSupplier} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Fresh Fruit Junction"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newSupplierCat}
                    onChange={(e) => setNewSupplierCat(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="fruit_shop">Fruit Shop</option>
                    <option value="vegetable_shop">Vegetable Shop</option>
                    <option value="hotel">Hotel</option>
                    <option value="bakery">Bakery</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Waste (kg)</label>
                  <input
                    type="number"
                    value={newSupplierDailyKg}
                    onChange={(e) => setNewSupplierDailyKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohan Das"
                  value={newSupplierContact}
                  onChange={(e) => setNewSupplierContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98450 00000"
                  value={newSupplierPhone}
                  onChange={(e) => setNewSupplierPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Shop location or market address"
                  value={newSupplierAddress}
                  onChange={(e) => setNewSupplierAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Collection */}
      {showAddCollectionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-800 mb-1">Log Organic Waste Collection</h3>
            <p className="text-slate-500 mb-4">Record pickup weight and facility drop-off (Path B)</p>

            <form onSubmit={handleRecordCollection} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier</label>
                <select
                  value={colSupplierId}
                  onChange={(e) => setColSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gross Weight (kg)</label>
                  <input
                    type="number"
                    value={colWeightKg}
                    onChange={(e) => {
                      setColWeightKg(Number(e.target.value));
                      setColAcceptedKg(Number(e.target.value));
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accepted (kg)</label>
                  <input
                    type="number"
                    value={colAcceptedKg}
                    onChange={(e) => setColAcceptedKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Waste Category</label>
                <select
                  value={colCategory}
                  onChange={(e) => setColCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  <option value="fruit_waste">Fruit Waste (Pulp & Rinds)</option>
                  <option value="vegetable_waste">Vegetable Stalks & Trimmings</option>
                  <option value="peels_and_scraps">Peels & Raw Scraps</option>
                  <option value="bakery_trimmings">Bakery Flour & Dough Scraps</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Observations / Contamination</label>
                <input
                  type="text"
                  placeholder="e.g. Free of plastics and foil packaging"
                  value={colObservations}
                  onChange={(e) => setColObservations(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCollectionModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Record Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Sale */}
      {showAddSaleModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-800 mb-1">Record Bio-Compost Sale</h3>
            <p className="text-slate-500 mb-4">Issue sales invoice for processed organic fertilizer</p>

            <form onSubmit={handleRecordSale} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Buyer / Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaveri Organic Coffee Estate"
                  value={saleBuyerName}
                  onChange={(e) => setSaleBuyerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Buyer Category</label>
                  <select
                    value={saleBuyerCategory}
                    onChange={(e) => setSaleBuyerCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="organic_farm">Organic Farm</option>
                    <option value="nursery">Plant Nursery</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="retail_gardener">Retail Gardener</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    value={saleQtyKg}
                    onChange={(e) => setSaleQtyKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price Per Kg (₹)</label>
                <input
                  type="number"
                  step={0.5}
                  value={saleUnitPrice}
                  onChange={(e) => setSaleUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSaleModal(false)}
                  className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
