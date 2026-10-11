import mongoose, { Schema, Document } from 'mongoose';

// --- Organic Waste Supplier ---
export type SupplierCategory = 'hotel' | 'restaurant' | 'bakery' | 'fruit_shop' | 'vegetable_shop' | 'other';
export type CollectionFrequency = 'daily' | 'twice_daily' | 'alternate_days' | 'weekly';

export interface IOrganicSupplier extends Document {
  name: string;
  category: SupplierCategory;
  contactPerson: string;
  contactPhone: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  estimatedDailyWasteKg: number;
  wasteTypes: string[]; // e.g. ['fruit_waste', 'vegetable_waste', 'peels', 'bakery_trimmings']
  collectionFrequency: CollectionFrequency;
  acceptedMaterials: string[];
  paymentAgreement: {
    pricePerKgIncentive: number; // e.g. ₹0.50 per kg
    paymentTerms: string; // e.g. 'monthly_credit'
  };
  totalKgCollectedToDate: number;
  totalPaidToDate: number;
  status: 'active' | 'paused' | 'onboarding';
  notes?: string;
  createdAt: Date;
}

const OrganicSupplierSchema = new Schema<IOrganicSupplier>({
  name: { type: String, required: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['hotel', 'restaurant', 'bakery', 'fruit_shop', 'vegetable_shop', 'other'] 
  },
  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  estimatedDailyWasteKg: { type: Number, required: true, default: 25 },
  wasteTypes: [{ type: String }],
  collectionFrequency: { 
    type: String, 
    enum: ['daily', 'twice_daily', 'alternate_days', 'weekly'],
    default: 'daily'
  },
  acceptedMaterials: [{ type: String }],
  paymentAgreement: {
    pricePerKgIncentive: { type: Number, default: 0.50 },
    paymentTerms: { type: String, default: 'monthly_credit' }
  },
  totalKgCollectedToDate: { type: Number, default: 0 },
  totalPaidToDate: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'paused', 'onboarding'], default: 'active' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const OrganicSupplier = mongoose.model<IOrganicSupplier>('OrganicSupplier', OrganicSupplierSchema);

// --- Fertilizer & Composting Partner ---
export interface IFertilizerPartner extends Document {
  organizationName: string;
  contactPerson: string;
  contactPhone: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  serviceArea: string;
  acceptedWasteTypes: string[]; // e.g. ['fruit_waste', 'vegetable_waste', 'raw_peels', 'bakery_waste']
  rejectedWasteTypes: string[]; // e.g. ['cooked_meat', 'dairy', 'excess_oil', 'plastic_packaging']
  maxDailyCapacityKg: number; // e.g. 2000 kg/day
  minAcceptableBatchKg: number; // e.g. 100 kg
  processingFeePerKg: number; // e.g. ₹1.00 per kg processing charge or 0 if partner buys
  compostYieldPercentage: number; // e.g. 30% conversion rate
  productsProduced: string[]; // e.g. ['Rich Organic Humus Compost', 'Liquid Bio-Fertilizer']
  sellingPricePerKg: number; // e.g. ₹5.00 per kg
  partnerArrangementType: 'third_party_processor' | 'joint_venture' | 'compost_buyer';
  totalWasteReceivedKg: number;
  totalCompostProducedKg: number;
  status: 'active' | 'maintenance' | 'inactive';
  createdAt: Date;
}

const FertilizerPartnerSchema = new Schema<IFertilizerPartner>({
  organizationName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  contactPhone: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  serviceArea: { type: String, default: 'Greater City Agro-Belt' },
  acceptedWasteTypes: [{ type: String }],
  rejectedWasteTypes: [{ type: String }],
  maxDailyCapacityKg: { type: Number, required: true, default: 2000 },
  minAcceptableBatchKg: { type: Number, required: true, default: 100 },
  processingFeePerKg: { type: Number, default: 1.0 },
  compostYieldPercentage: { type: Number, default: 30 },
  productsProduced: [{ type: String }],
  sellingPricePerKg: { type: Number, default: 5.0 },
  partnerArrangementType: {
    type: String,
    enum: ['third_party_processor', 'joint_venture', 'compost_buyer'],
    default: 'third_party_processor'
  },
  totalWasteReceivedKg: { type: Number, default: 0 },
  totalCompostProducedKg: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

export const FertilizerPartner = mongoose.model<IFertilizerPartner>('FertilizerPartner', FertilizerPartnerSchema);

// --- Organic Waste Collection Record (Two-Path Food Recovery: Path B) ---
export type PickupStatus = 'scheduled' | 'collected' | 'delivered_to_facility' | 'rejected' | 'processed';

export interface IOrganicCollection extends Document {
  supplierId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  wasteCategory: 'fruit_waste' | 'vegetable_waste' | 'peels_and_scraps' | 'bakery_trimmings' | 'mixed_organic';
  collectedWeightKg: number;
  acceptedWeightKg: number;
  rejectedWeightKg: number;
  rejectionReason?: string;
  collectionDate: Date;
  collectionTime: string;
  contaminationObservations?: string;
  pickupStatus: PickupStatus;
  transportCost: number; // e.g. ₹150 for this trip
  supplierIncentiveAmount: number; // weight × rate, e.g. 50 kg × ₹0.50 = ₹25
  estimatedCompostYieldKg: number; // acceptedWeightKg × yield%
  isProcessed: boolean;
  notes?: string;
  createdAt: Date;
}

const OrganicCollectionSchema = new Schema<IOrganicCollection>({
  supplierId: { type: Schema.Types.ObjectId, ref: 'OrganicSupplier', required: true },
  partnerId: { type: Schema.Types.ObjectId, ref: 'FertilizerPartner' },
  wasteCategory: { 
    type: String, 
    required: true,
    enum: ['fruit_waste', 'vegetable_waste', 'peels_and_scraps', 'bakery_trimmings', 'mixed_organic']
  },
  collectedWeightKg: { type: Number, required: true },
  acceptedWeightKg: { type: Number, required: true },
  rejectedWeightKg: { type: Number, default: 0 },
  rejectionReason: { type: String },
  collectionDate: { type: Date, default: Date.now },
  collectionTime: { type: String, default: '14:30' },
  contaminationObservations: { type: String },
  pickupStatus: { 
    type: String, 
    enum: ['scheduled', 'collected', 'delivered_to_facility', 'rejected', 'processed'],
    default: 'collected'
  },
  transportCost: { type: Number, default: 0 },
  supplierIncentiveAmount: { type: Number, default: 0 },
  estimatedCompostYieldKg: { type: Number, default: 0 },
  isProcessed: { type: Boolean, default: false },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const OrganicCollection = mongoose.model<IOrganicCollection>('OrganicCollection', OrganicCollectionSchema);

// --- Compost Production Batch & Sale Transaction ---
export interface ICompostSale extends Document {
  saleDate: Date;
  buyerName: string;
  buyerCategory: 'organic_farm' | 'nursery' | 'landscaping' | 'retail_gardener' | 'agricultural_coop';
  buyerContact: string;
  quantityKg: number;
  unitPricePerKg: number;
  totalSaleAmount: number;
  partnerId?: mongoose.Types.ObjectId;
  paymentStatus: 'paid' | 'pending' | 'invoiced';
  deliveryMethod: 'buyer_pickup' | 'partner_dispatched';
  batchCode: string;
  invoiceNumber: string;
  notes?: string;
  createdAt: Date;
}

const CompostSaleSchema = new Schema<ICompostSale>({
  saleDate: { type: Date, default: Date.now },
  buyerName: { type: String, required: true },
  buyerCategory: { 
    type: String, 
    enum: ['organic_farm', 'nursery', 'landscaping', 'retail_gardener', 'agricultural_coop'],
    default: 'organic_farm'
  },
  buyerContact: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  unitPricePerKg: { type: Number, required: true },
  totalSaleAmount: { type: Number, required: true },
  partnerId: { type: Schema.Types.ObjectId, ref: 'FertilizerPartner' },
  paymentStatus: { type: String, enum: ['paid', 'pending', 'invoiced'], default: 'paid' },
  deliveryMethod: { type: String, enum: ['buyer_pickup', 'partner_dispatched'], default: 'buyer_pickup' },
  batchCode: { type: String, default: 'BATCH-COMP-2026' },
  invoiceNumber: { type: String, required: true, unique: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const CompostSale = mongoose.model<ICompostSale>('CompostSale', CompostSaleSchema);

// --- Profit Calculator Scenario Configuration ---
export interface ICalculatorScenario extends Document {
  scenarioName: string;
  isPilotDemo: boolean;
  incomingWasteKgPerDay: number;
  operatingDaysPerMonth: number;
  saleableCompostYieldPercent: number;
  compostSellingPricePerKg: number;
  supplierPaymentPerKg: number;
  monthlyTransportCost: number;
  monthlyProcessingFee: number;
  monthlyLaborAdminCost: number;
  monthlyPackagingTestingCost: number;
  monthlyRentUtilitiesCost: number;
  monthlyDepreciationFinancingCost: number;
  confirmedCollectionRevenue: number;
  otherRevenue: number;
  updatedAt: Date;
}

const CalculatorScenarioSchema = new Schema<ICalculatorScenario>({
  scenarioName: { type: String, required: true, default: 'Default Pilot Scenario' },
  isPilotDemo: { type: Boolean, default: true },
  incomingWasteKgPerDay: { type: Number, default: 500 },
  operatingDaysPerMonth: { type: Number, default: 30 },
  saleableCompostYieldPercent: { type: Number, default: 30 },
  compostSellingPricePerKg: { type: Number, default: 5.0 },
  supplierPaymentPerKg: { type: Number, default: 0.50 },
  monthlyTransportCost: { type: Number, default: 20000 },
  monthlyProcessingFee: { type: Number, default: 15000 },
  monthlyLaborAdminCost: { type: Number, default: 10000 },
  monthlyPackagingTestingCost: { type: Number, default: 0 },
  monthlyRentUtilitiesCost: { type: Number, default: 0 },
  monthlyDepreciationFinancingCost: { type: Number, default: 0 },
  confirmedCollectionRevenue: { type: Number, default: 45000 },
  otherRevenue: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

export const CalculatorScenario = mongoose.model<ICalculatorScenario>('CalculatorScenario', CalculatorScenarioSchema);
