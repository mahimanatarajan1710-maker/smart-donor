import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'donor' | 'ngo_admin' | 'volunteer' | 'transport_partner';

export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  outletId?: mongoose.Types.ObjectId;
  volunteerId?: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['donor', 'ngo_admin', 'volunteer', 'transport_partner'] 
  },
  phone: { type: String, required: true },
  outletId: { type: Schema.Types.ObjectId, ref: 'Outlet' },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'Volunteer' },
  partnerId: { type: Schema.Types.ObjectId, ref: 'TransportPartner' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);

export interface IOutlet extends Document {
  name: string;
  category: 'bakery' | 'restaurant' | 'hostel_mess';
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  contactPhone: string;
  operatingHours: string;
  verifiedStatus: 'verified' | 'pending';
  historicalSurplusAverage: number;
  createdAt: Date;
}

const OutletSchema = new Schema<IOutlet>({
  name: { type: String, required: true },
  category: { type: String, required: true, enum: ['bakery', 'restaurant', 'hostel_mess'] },
  location: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  contactPhone: { type: String, required: true },
  operatingHours: { type: String, default: '10:00 - 22:30' },
  verifiedStatus: { type: String, enum: ['verified', 'pending'], default: 'verified' },
  historicalSurplusAverage: { type: Number, default: 8 },
  createdAt: { type: Date, default: Date.now }
});

export const Outlet = mongoose.model<IOutlet>('Outlet', OutletSchema);

export type DonationStatus = 
  | 'predicted'
  | 'awaiting_confirmation'
  | 'confirmed_available'
  | 'assigned'
  | 'picked_up'
  | 'delivered'
  | 'cancelled'
  | 'expired_ineligible';

export interface IDonation extends Document {
  outletId: mongoose.Types.ObjectId;
  foodCategory: 'baked_goods' | 'cooked_meals' | 'mess_surplus' | 'packaged_produce';
  foodDescription: string;
  mealCount: number;
  preparationTime: Date;
  storageCondition: 'ambient' | 'refrigerated' | 'insulated_warm';
  allergenInfo: string[];
  collectionDeadline: Date;
  packagingStatus: 'food_grade_sealed' | 'standard_wrapped' | 'requires_containers';
  contactPhone: string;
  status: DonationStatus;
  isFoodSafetyApproved: boolean;
  safetyNotes?: string;
  isPredicted: boolean;
  predictionConfidence?: number;
  createdAt: Date;
  pickupOtp?: string;
  deliveryOtp?: string;
  clientOperationId?: string; // For offline sync idempotency
}

const DonationSchema = new Schema<IDonation>({
  outletId: { type: Schema.Types.ObjectId, ref: 'Outlet', required: true },
  foodCategory: { type: String, required: true },
  foodDescription: { type: String, required: true },
  mealCount: { type: Number, required: true },
  preparationTime: { type: Date, required: true },
  storageCondition: { type: String, required: true, enum: ['ambient', 'refrigerated', 'insulated_warm'] },
  allergenInfo: [{ type: String }],
  collectionDeadline: { type: Date, required: true },
  packagingStatus: { type: String, required: true },
  contactPhone: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: [
      'predicted', 
      'awaiting_confirmation', 
      'confirmed_available', 
      'assigned', 
      'picked_up', 
      'delivered', 
      'cancelled', 
      'expired_ineligible'
    ],
    default: 'confirmed_available' 
  },
  isFoodSafetyApproved: { type: Boolean, default: true },
  safetyNotes: { type: String },
  isPredicted: { type: Boolean, default: false },
  predictionConfidence: { type: Number },
  pickupOtp: { type: String },
  deliveryOtp: { type: String },
  clientOperationId: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);

export interface IVolunteer extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  serviceArea: string;
  vehicleType: 'two_wheeler' | 'car' | 'bicycle' | 'on_foot';
  carryingCapacityMeals: number;
  isAvailable: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  activeAssignmentId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  serviceArea: { type: String, default: 'Campus Vicinity (1.5km)' },
  vehicleType: { type: String, required: true, enum: ['two_wheeler', 'car', 'bicycle', 'on_foot'] },
  carryingCapacityMeals: { type: Number, required: true, default: 20 },
  isAvailable: { type: Boolean, default: true },
  verificationStatus: { 
    type: String, 
    required: true, 
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending' 
  },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    updatedAt: { type: Date }
  },
  activeAssignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment' },
  createdAt: { type: Date, default: Date.now }
});

export const Volunteer = mongoose.model<IVolunteer>('Volunteer', VolunteerSchema);

export interface INgoVehicle extends Document {
  vehicleIdCode: string;
  name: string;
  vehicleType: 'van' | 'mini_truck' | 'cargo_ev';
  carryingCapacityMeals: number;
  operatingCostPerKm: number; // e.g. 15 INR per km
  isAvailable: boolean;
  assignedDriverName: string;
  serviceArea: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  createdAt: Date;
}

const NgoVehicleSchema = new Schema<INgoVehicle>({
  vehicleIdCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  vehicleType: { type: String, required: true, enum: ['van', 'mini_truck', 'cargo_ev'] },
  carryingCapacityMeals: { type: Number, required: true, default: 120 },
  operatingCostPerKm: { type: Number, required: true, default: 15 },
  isAvailable: { type: Boolean, default: true },
  assignedDriverName: { type: String, required: true },
  serviceArea: { type: String, default: 'City South & University Belt' },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    updatedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

export const NgoVehicle = mongoose.model<INgoVehicle>('NgoVehicle', NgoVehicleSchema);

export interface IPartnerBusRoute extends Document {
  operatorName: string;
  routeCode: string;
  isSimulatedDemo: boolean;
  foodCarryingCapacityMeals: number;
  operatingCostContributionPerKm: number; // e.g. 4 INR per km token fee
  operatingHours: string;
  isActive: boolean;
  stops: Array<{
    stopName: string;
    latitude: number;
    longitude: number;
    scheduledDepartureTime: string; // e.g. "21:15"
  }>;
  createdAt: Date;
}

const PartnerBusRouteSchema = new Schema<IPartnerBusRoute>({
  operatorName: { type: String, required: true },
  routeCode: { type: String, required: true },
  isSimulatedDemo: { type: Boolean, default: true },
  foodCarryingCapacityMeals: { type: Number, default: 45 },
  operatingCostContributionPerKm: { type: Number, default: 4 },
  operatingHours: { type: String, default: '06:00 - 23:00' },
  isActive: { type: Boolean, default: true },
  stops: [{
    stopName: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    scheduledDepartureTime: { type: String, required: true }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const PartnerBusRoute = mongoose.model<IPartnerBusRoute>('PartnerBusRoute', PartnerBusRouteSchema);

export type AssignmentStatus = 
  | 'proposed'
  | 'accepted'
  | 'approaching_pickup'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export interface IAssignment extends Document {
  planType: 'plan_a_fastest' | 'plan_b_max_meals' | 'plan_c_best_cost';
  deliveryMode: 'volunteer' | 'ngo_vehicle' | 'partner_bus';
  assignedVolunteerId?: mongoose.Types.ObjectId;
  assignedNgoVehicleId?: mongoose.Types.ObjectId;
  assignedBusRouteId?: mongoose.Types.ObjectId;
  donationIds: mongoose.Types.ObjectId[];
  totalMeals: number;
  totalDistanceKm: number;
  estimatedTravelMinutes: number;
  estimatedCost: number;
  costPerMeal: number;
  status: AssignmentStatus;
  statusReason?: string;
  currentGps?: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    lastUpdated: Date;
  };
  pickupOtp: string;
  pickupVerifiedAt?: Date;
  pickupVerifiedBy?: string;
  deliveryOtp: string;
  deliveryVerifiedAt?: Date;
  deliveryVerifiedBy?: string;
  deliveryProofPhotoUrl?: string;
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  planType: { 
    type: String, 
    required: true, 
    enum: ['plan_a_fastest', 'plan_b_max_meals', 'plan_c_best_cost'] 
  },
  deliveryMode: { 
    type: String, 
    required: true, 
    enum: ['volunteer', 'ngo_vehicle', 'partner_bus'] 
  },
  assignedVolunteerId: { type: Schema.Types.ObjectId, ref: 'Volunteer' },
  assignedNgoVehicleId: { type: Schema.Types.ObjectId, ref: 'NgoVehicle' },
  assignedBusRouteId: { type: Schema.Types.ObjectId, ref: 'PartnerBusRoute' },
  donationIds: [{ type: Schema.Types.ObjectId, ref: 'Donation' }],
  totalMeals: { type: Number, required: true },
  totalDistanceKm: { type: Number, required: true },
  estimatedTravelMinutes: { type: Number, required: true },
  estimatedCost: { type: Number, required: true },
  costPerMeal: { type: Number, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: [
      'proposed', 
      'accepted', 
      'approaching_pickup', 
      'picked_up', 
      'in_transit', 
      'delivered', 
      'cancelled', 
      'failed'
    ],
    default: 'proposed'
  },
  statusReason: { type: String },
  currentGps: {
    latitude: { type: Number },
    longitude: { type: Number },
    speed: { type: Number },
    heading: { type: Number },
    lastUpdated: { type: Date }
  },
  pickupOtp: { type: String, required: true },
  pickupVerifiedAt: { type: Date },
  pickupVerifiedBy: { type: String },
  deliveryOtp: { type: String, required: true },
  deliveryVerifiedAt: { type: Date },
  deliveryVerifiedBy: { type: String },
  deliveryProofPhotoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export interface IAuditLog extends Document {
  action: string;
  actor: string;
  entity: string;
  entityId: string;
  details: any;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  actor: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
