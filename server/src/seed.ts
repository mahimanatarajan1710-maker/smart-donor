import { Outlet, Donation, Volunteer, NgoVehicle, PartnerBusRoute, User, IOutlet } from './models.js';

// Coordinates centered around a college zone with 1.5km spread
// College center: ~ (12.9716, 77.5946)
export const SEED_OUTLETS = [
  // 9 Bakeries
  { name: 'WarmCrust Bakery & Patisserie', category: 'bakery', lat: 12.9735, lng: 77.5912, phone: '+91 98450 11001', avg: 11 },
  { name: 'OvenCraft Artisan Bakery', category: 'bakery', lat: 12.9750, lng: 77.5930, phone: '+91 98450 11002', avg: 8 },
  { name: 'Daily Loaf Corner', category: 'bakery', lat: 12.9721, lng: 77.5899, phone: '+91 98450 11003', avg: 14 },
  { name: 'SweetBake Confectionery', category: 'bakery', lat: 12.9698, lng: 77.5925, phone: '+91 98450 11004', avg: 7 },
  { name: 'Golden Crust Treats', category: 'bakery', lat: 12.9742, lng: 77.5961, phone: '+91 98450 11005', avg: 9 },
  { name: 'Campus Pastry Hut', category: 'bakery', lat: 12.9705, lng: 77.5972, phone: '+91 98450 11006', avg: 12 },
  { name: 'French Oven Delights', category: 'bakery', lat: 12.9682, lng: 77.5955, phone: '+91 98450 11007', avg: 6 },
  { name: 'Royal Bakehouse', category: 'bakery', lat: 12.9765, lng: 77.5910, phone: '+91 98450 11008', avg: 10 },
  { name: 'Cinnamon Spire Bakes', category: 'bakery', lat: 12.9711, lng: 77.5880, phone: '+91 98450 11009', avg: 8 },

  // 4 Small Restaurants
  { name: 'Spice Route Bistro', category: 'restaurant', lat: 12.9758, lng: 77.5980, phone: '+91 98450 22001', avg: 15 },
  { name: 'Green Garden Pure Veg', category: 'restaurant', lat: 12.9690, lng: 77.5905, phone: '+91 98450 22002', avg: 12 },
  { name: 'Malabar Coastal Kitchen', category: 'restaurant', lat: 12.9772, lng: 77.5945, phone: '+91 98450 22003', avg: 14 },
  { name: 'Anand Tiffin & Meals', category: 'restaurant', lat: 12.9675, lng: 77.5938, phone: '+91 98450 22004', avg: 10 },

  // 2 Hostel Messes
  { name: 'North Campus Hostel Central Mess', category: 'hostel_mess', lat: 12.9730, lng: 77.6010, phone: '+91 98450 33001', avg: 22 },
  { name: 'Kavery Girls Hostel Dining Hall', category: 'hostel_mess', lat: 12.9660, lng: 77.5915, phone: '+91 98450 33002', avg: 18 }
];

export async function seedInitialData() {
  console.log('[Seed] Seeding database with realistic hackathon scenario...');

  // Clear existing collections
  await Outlet.deleteMany({});
  await Donation.deleteMany({});
  await Volunteer.deleteMany({});
  await NgoVehicle.deleteMany({});
  await PartnerBusRoute.deleteMany({});
  await User.deleteMany({});

  // Seed Outlets
  const createdOutlets: IOutlet[] = [];
  for (const item of SEED_OUTLETS) {
    const o = await Outlet.create({
      name: item.name,
      category: item.category,
      location: {
        address: `${item.name}, University South Gate Circle`,
        latitude: item.lat,
        longitude: item.lng
      },
      contactPhone: item.phone,
      operatingHours: item.category === 'hostel_mess' ? '07:30 - 22:00' : '10:00 - 22:30',
      verifiedStatus: 'verified',
      historicalSurplusAverage: item.avg
    });
    createdOutlets.push(o);
  }

  // Seed Users
  await User.create([
    {
      name: 'Sister Mary (Director)',
      email: 'ngo@smartbite.org',
      role: 'ngo_admin',
      phone: '+91 98450 99001'
    },
    {
      name: 'Chef Rajesh',
      email: 'rajesh@warmcrust.com',
      role: 'donor',
      phone: '+91 98450 11001',
      outletId: createdOutlets[0]._id
    },
    {
      name: 'Karthik Rao (Engineering Student)',
      email: 'karthik@student.edu',
      role: 'volunteer',
      phone: '+91 98450 77001'
    },
    {
      name: 'Metro Transit Dispatch',
      email: 'transit@citybus.gov.in',
      role: 'transport_partner',
      phone: '+91 98450 88001'
    }
  ]);

  // Seed Donations for Scenario A (6 outlets with small donations totaling 58 meals)
  const now = new Date();
  const deadlineUrgent = new Date(now.getTime() + 55 * 60 * 1000); // 55 mins left
  const deadlineNormal = new Date(now.getTime() + 120 * 60 * 1000); // 2 hours left

  const donationsToCreate = [
    {
      outlet: createdOutlets[0], // WarmCrust Bakery
      foodCategory: 'baked_goods',
      foodDescription: '12 portions fresh whole-wheat loaves & buns',
      mealCount: 12,
      deadline: deadlineUrgent,
      status: 'confirmed_available',
      otp: '7412'
    },
    {
      outlet: createdOutlets[1], // OvenCraft
      foodCategory: 'baked_goods',
      foodDescription: '8 sourdough loaves & cheese croissants',
      mealCount: 8,
      deadline: deadlineNormal,
      status: 'confirmed_available',
      otp: '8219'
    },
    {
      outlet: createdOutlets[2], // Daily Loaf Corner
      foodCategory: 'baked_goods',
      foodDescription: '14 packed milk bread & snack rolls',
      mealCount: 14,
      deadline: deadlineNormal,
      status: 'confirmed_available',
      otp: '5531'
    },
    {
      outlet: createdOutlets[9], // Spice Route Bistro
      foodCategory: 'cooked_meals',
      foodDescription: '10 steamed vegetable biryani lunch boxes (insulated)',
      mealCount: 10,
      deadline: deadlineNormal,
      status: 'confirmed_available',
      otp: '4190'
    },
    {
      outlet: createdOutlets[10], // Green Garden Veg
      foodCategory: 'cooked_meals',
      foodDescription: '7 portions dal makhani with fresh chapatis',
      mealCount: 7,
      deadline: deadlineNormal,
      status: 'confirmed_available',
      otp: '3318'
    },
    {
      outlet: createdOutlets[13], // North Campus Hostel Mess
      foodCategory: 'mess_surplus',
      foodDescription: '22 meals steamed rice & sambar sealed canisters',
      mealCount: 22,
      deadline: deadlineNormal,
      status: 'confirmed_available',
      otp: '6204'
    }
  ];

  for (const d of donationsToCreate) {
    await Donation.create({
      outletId: d.outlet._id,
      foodCategory: d.foodCategory,
      foodDescription: d.foodDescription,
      mealCount: d.mealCount,
      preparationTime: new Date(now.getTime() - 90 * 60 * 1000),
      storageCondition: d.foodCategory === 'baked_goods' ? 'ambient' : 'insulated_warm',
      allergenInfo: ['Gluten'],
      collectionDeadline: d.deadline,
      packagingStatus: 'food_grade_sealed',
      contactPhone: d.outlet.contactPhone,
      status: d.status,
      isFoodSafetyApproved: true,
      isPredicted: false,
      pickupOtp: d.otp,
      deliveryOtp: '9081'
    });
  }

  // Seed Volunteers
  await Volunteer.create([
    {
      name: 'Karthik Rao',
      phone: '+91 98450 77001',
      serviceArea: 'University Belt (1.5km)',
      vehicleType: 'two_wheeler',
      carryingCapacityMeals: 25,
      isAvailable: true,
      verificationStatus: 'approved',
      currentLocation: {
        latitude: 12.9725,
        longitude: 77.5920,
        updatedAt: new Date()
      }
    },
    {
      name: 'Pooja Sundaram',
      phone: '+91 98450 77002',
      serviceArea: 'South Hostels Ring',
      vehicleType: 'car',
      carryingCapacityMeals: 40,
      isAvailable: true,
      verificationStatus: 'approved',
      currentLocation: {
        latitude: 12.9690,
        longitude: 77.5940,
        updatedAt: new Date()
      }
    },
    {
      name: 'Vikram Joshi',
      phone: '+91 98450 77003',
      serviceArea: 'Campus Road',
      vehicleType: 'bicycle',
      carryingCapacityMeals: 15,
      isAvailable: false,
      verificationStatus: 'approved'
    },
    {
      name: 'Arun Kumar',
      phone: '+91 98450 77004',
      serviceArea: 'North Gate',
      vehicleType: 'two_wheeler',
      carryingCapacityMeals: 20,
      isAvailable: true,
      verificationStatus: 'pending' // Pending verification demo
    },
    {
      name: 'Sneha Patel',
      phone: '+91 98450 77005',
      serviceArea: 'College Circle',
      vehicleType: 'two_wheeler',
      carryingCapacityMeals: 20,
      isAvailable: false,
      verificationStatus: 'suspended'
    }
  ]);

  // Seed NGO Vehicles
  await NgoVehicle.create([
    {
      vehicleIdCode: 'NGO-VAN-01',
      name: 'Annam Rescue Van Alpha (Force Traveller)',
      vehicleType: 'van',
      carryingCapacityMeals: 140,
      operatingCostPerKm: 14,
      isAvailable: true,
      assignedDriverName: 'Murugan Selvam',
      serviceArea: '3km Radius Central Food Belt',
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        updatedAt: new Date()
      }
    },
    {
      vehicleIdCode: 'NGO-EV-02',
      name: 'Green Cargo EV (Mahindra Treo)',
      vehicleType: 'cargo_ev',
      carryingCapacityMeals: 80,
      operatingCostPerKm: 8,
      isAvailable: true,
      assignedDriverName: 'Suresh Babu',
      serviceArea: 'Inner Campus Core',
      currentLocation: {
        latitude: 12.9716,
        longitude: 77.5946,
        updatedAt: new Date()
      }
    }
  ]);

  // Seed Partner Bus Routes (Labelled clearly as Simulated Hackathon Model)
  await PartnerBusRoute.create([
    {
      operatorName: 'Bangalore Metropolitan Transport Corporation (BMTC)',
      routeCode: 'BUS-33B (Campus - South NGO Junction)',
      isSimulatedDemo: true,
      foodCarryingCapacityMeals: 50,
      operatingCostContributionPerKm: 4,
      operatingHours: '06:00 - 23:00',
      isActive: true,
      stops: [
        { stopName: 'North Campus Gate', latitude: 12.9760, longitude: 77.5940, scheduledDepartureTime: '21:15' },
        { stopName: 'Bakery Circle Terminal', latitude: 12.9730, longitude: 77.5910, scheduledDepartureTime: '21:25' },
        { stopName: 'Seva Kendra Bus Stop (Adjacent to NGO HQ)', latitude: 12.9714, longitude: 77.5948, scheduledDepartureTime: '21:40' }
      ]
    }
  ]);

  console.log('[Seed] Seeding completed successfully. 15 Outlets, 6 Live Donations, 5 Volunteers, 2 NGO Vehicles, 1 Transit Bus.');
}
