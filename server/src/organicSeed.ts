import { 
  OrganicSupplier, 
  FertilizerPartner, 
  OrganicCollection, 
  CompostSale, 
  CalculatorScenario 
} from './organicModels.js';
import { PILOT_DEMO_SCENARIO } from './organicProfitCalculator.js';

export async function seedOrganicInitialData() {
  console.log('[Organic Seed] Seeding Organic Waste & Fertilizer business records...');

  await OrganicSupplier.deleteMany({});
  await FertilizerPartner.deleteMany({});
  await OrganicCollection.deleteMany({});
  await CompostSale.deleteMany({});
  await CalculatorScenario.deleteMany({});

  // 1. Seed 6 Diverse Organic Waste Suppliers
  const suppliersData = [
    {
      name: 'GreenLeaf Fresh Fruit Mart',
      category: 'fruit_shop',
      contactPerson: 'Venkatesh Rao',
      contactPhone: '+91 98451 44001',
      address: 'Shop 14, Main Market Circle, South Campus Road',
      location: { latitude: 12.9738, longitude: 77.5918 },
      estimatedDailyWasteKg: 85,
      wasteTypes: ['fruit_waste', 'peels_and_scraps'],
      collectionFrequency: 'daily',
      acceptedMaterials: ['citrus_peels', 'melon_rinds', 'overripe_fruits'],
      paymentAgreement: { pricePerKgIncentive: 0.50, paymentTerms: 'monthly_bank_transfer' },
      totalKgCollectedToDate: 1240,
      totalPaidToDate: 620,
      status: 'active'
    },
    {
      name: 'Annapurna Daily Vegetable Bazaar',
      category: 'vegetable_shop',
      contactPerson: 'Shankar Gowda',
      contactPhone: '+91 98451 44002',
      address: 'Plot 8, Agro Mandi Extension',
      location: { latitude: 12.9762, longitude: 77.5935 },
      estimatedDailyWasteKg: 120,
      wasteTypes: ['vegetable_waste', 'peels_and_scraps'],
      collectionFrequency: 'daily',
      acceptedMaterials: ['leafy_greens', 'root_vegetables', 'stalks'],
      paymentAgreement: { pricePerKgIncentive: 0.50, paymentTerms: 'bi_weekly' },
      totalKgCollectedToDate: 1850,
      totalPaidToDate: 925,
      status: 'active'
    },
    {
      name: 'Grand Pavilion Heritage Hotel',
      category: 'hotel',
      contactPerson: 'Chef Daniel Roy',
      contactPhone: '+91 98451 44003',
      address: '22 Residency Boulevard, University Vicinity',
      location: { latitude: 12.9710, longitude: 77.5955 },
      estimatedDailyWasteKg: 160,
      wasteTypes: ['fruit_waste', 'vegetable_waste', 'peels_and_scraps', 'bakery_trimmings'],
      collectionFrequency: 'daily',
      acceptedMaterials: ['kitchen_prep_scraps', 'vegetable_peels', 'coffee_grounds'],
      paymentAgreement: { pricePerKgIncentive: 0.40, paymentTerms: 'monthly_invoice_offset' },
      totalKgCollectedToDate: 2400,
      totalPaidToDate: 960,
      status: 'active'
    },
    {
      name: 'WarmCrust Production Commissary',
      category: 'bakery',
      contactPerson: 'Rajesh Sharma',
      contactPhone: '+91 98450 11001',
      address: 'Industrial Belt Shed 4, South Ring',
      location: { latitude: 12.9735, longitude: 77.5912 },
      estimatedDailyWasteKg: 45,
      wasteTypes: ['bakery_trimmings'],
      collectionFrequency: 'alternate_days',
      acceptedMaterials: ['flour_dust', 'burnt_crusts', 'dough_scraps'],
      paymentAgreement: { pricePerKgIncentive: 0.60, paymentTerms: 'monthly_credit' },
      totalKgCollectedToDate: 580,
      totalPaidToDate: 348,
      status: 'active'
    },
    {
      name: 'Swathi Family Restaurant & Caterers',
      category: 'restaurant',
      contactPerson: 'Naveen Hegde',
      contactPhone: '+91 98451 44005',
      address: '108 Temple Gate Road',
      location: { latitude: 12.9685, longitude: 77.5910 },
      estimatedDailyWasteKg: 65,
      wasteTypes: ['vegetable_waste', 'peels_and_scraps'],
      collectionFrequency: 'daily',
      acceptedMaterials: ['onion_peels', 'potato_skins', 'raw_cuttings'],
      paymentAgreement: { pricePerKgIncentive: 0.50, paymentTerms: 'monthly_credit' },
      totalKgCollectedToDate: 920,
      totalPaidToDate: 460,
      status: 'active'
    },
    {
      name: 'FreshHarvest Wholesale Organics',
      category: 'other',
      contactPerson: 'Girish Reddy',
      contactPhone: '+91 98451 44006',
      address: 'Terminal Wholesale Depot Gate 3',
      location: { latitude: 12.9780, longitude: 77.6020 },
      estimatedDailyWasteKg: 90,
      wasteTypes: ['fruit_waste', 'vegetable_waste'],
      collectionFrequency: 'daily',
      acceptedMaterials: ['bulk_spoiled_citrus', 'damaged_squash'],
      paymentAgreement: { pricePerKgIncentive: 0.45, paymentTerms: 'weekly' },
      totalKgCollectedToDate: 1100,
      totalPaidToDate: 495,
      status: 'active'
    }
  ];

  const createdSuppliers = await OrganicSupplier.create(suppliersData);

  // 2. Seed 2 Fertilizer & Composting Partners
  const partnersData = [
    {
      organizationName: 'Bhoomi Bio-Fertilizers & Agro Processing LLP',
      contactPerson: 'Dr. Ramesh Narayan',
      contactPhone: '+91 98452 77001',
      address: 'Kengeri Agro Park, Phase 2, Outer Ring Link',
      location: { latitude: 12.9810, longitude: 77.6120 },
      serviceArea: 'South Bangalore & Urban Agricultural Corridor',
      acceptedWasteTypes: ['fruit_waste', 'vegetable_waste', 'peels_and_scraps', 'bakery_trimmings'],
      rejectedWasteTypes: ['cooked_meat', 'dairy', 'excess_oil', 'plastic_packaging', 'chemically_treated'],
      maxDailyCapacityKg: 2500,
      minAcceptableBatchKg: 100,
      processingFeePerKg: 1.0,
      compostYieldPercentage: 30, // 30% standard conversion
      productsProduced: ['Rich Organic Humus Compost', 'Liquid Bio-Fertilizer (Bhoomi Gold)'],
      sellingPricePerKg: 5.0, // ₹5/kg
      partnerArrangementType: 'third_party_processor',
      totalWasteReceivedKg: 8090,
      totalCompostProducedKg: 2427,
      status: 'active'
    },
    {
      organizationName: 'Prithvi Vermicompost & Green Soil Labs',
      contactPerson: 'Sunita Deshmukh',
      contactPhone: '+91 98452 77002',
      address: 'Survey 44, Harohalli Organic Cluster',
      location: { latitude: 12.9640, longitude: 77.5850 },
      serviceArea: 'Peri-Urban Farming Collective',
      acceptedWasteTypes: ['vegetable_waste', 'fruit_waste', 'peels_and_scraps'],
      rejectedWasteTypes: ['cooked_meat', 'citrus_excess', 'dairy', 'bones'],
      maxDailyCapacityKg: 1200,
      minAcceptableBatchKg: 80,
      processingFeePerKg: 0.8,
      compostYieldPercentage: 32,
      productsProduced: ['Premium Earthworm Castings Vermicompost'],
      sellingPricePerKg: 7.5,
      partnerArrangementType: 'joint_venture',
      totalWasteReceivedKg: 3500,
      totalCompostProducedKg: 1120,
      status: 'active'
    }
  ];

  const createdPartners = await FertilizerPartner.create(partnersData);

  // 3. Seed Realistic Collection Runs (Two-Path Food Recovery: Path B)
  const now = new Date();
  const pastDays = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  const collectionsData = [
    {
      supplierId: createdSuppliers[0]._id,
      partnerId: createdPartners[0]._id,
      wasteCategory: 'fruit_waste',
      collectedWeightKg: 90,
      acceptedWeightKg: 85,
      rejectedWeightKg: 5,
      rejectionReason: 'Plastic wrapper contamination in crate',
      collectionDate: pastDays(1),
      collectionTime: '08:30',
      contaminationObservations: 'Minor plastic wrappers separated on-site',
      pickupStatus: 'delivered_to_facility',
      transportCost: 180,
      supplierIncentiveAmount: 42.50, // 85 kg × 0.50
      estimatedCompostYieldKg: 25.50, // 30% of 85
      isProcessed: true
    },
    {
      supplierId: createdSuppliers[1]._id,
      partnerId: createdPartners[0]._id,
      wasteCategory: 'vegetable_waste',
      collectedWeightKg: 130,
      acceptedWeightKg: 125,
      rejectedWeightKg: 5,
      rejectionReason: 'Stones & soil clump excess',
      collectionDate: pastDays(1),
      collectionTime: '09:15',
      contaminationObservations: 'High quality green stalks',
      pickupStatus: 'delivered_to_facility',
      transportCost: 220,
      supplierIncentiveAmount: 62.50,
      estimatedCompostYieldKg: 37.50,
      isProcessed: true
    },
    {
      supplierId: createdSuppliers[2]._id,
      partnerId: createdPartners[0]._id,
      wasteCategory: 'peels_and_scraps',
      collectedWeightKg: 160,
      acceptedWeightKg: 160,
      rejectedWeightKg: 0,
      collectionDate: pastDays(2),
      collectionTime: '07:45',
      contaminationObservations: 'Pristine prep cuttings from hotel central buffet kitchen',
      pickupStatus: 'delivered_to_facility',
      transportCost: 250,
      supplierIncentiveAmount: 64.00, // 160 kg × 0.40
      estimatedCompostYieldKg: 48.00,
      isProcessed: true
    },
    {
      supplierId: createdSuppliers[3]._id,
      partnerId: createdPartners[0]._id,
      wasteCategory: 'bakery_trimmings',
      collectedWeightKg: 50,
      acceptedWeightKg: 50,
      rejectedWeightKg: 0,
      collectionDate: pastDays(3),
      collectionTime: '11:00',
      contaminationObservations: 'Dry dough and whole grain crust trimmings',
      pickupStatus: 'delivered_to_facility',
      transportCost: 140,
      supplierIncentiveAmount: 30.00, // 50 kg × 0.60
      estimatedCompostYieldKg: 15.00,
      isProcessed: true
    }
  ];

  await OrganicCollection.create(collectionsData);

  // 4. Seed Compost Sales Transactions
  const salesData = [
    {
      saleDate: pastDays(2),
      buyerName: 'Krishi Vikas Organic Orchard Society',
      buyerCategory: 'organic_farm',
      buyerContact: '+91 98453 11001',
      quantityKg: 800,
      unitPricePerKg: 5.0,
      totalSaleAmount: 4000,
      partnerId: createdPartners[0]._id,
      paymentStatus: 'paid',
      deliveryMethod: 'partner_dispatched',
      batchCode: 'BATCH-COMP-2026-A1',
      invoiceNumber: 'INV-004128'
    },
    {
      saleDate: pastDays(5),
      buyerName: 'Urban Green Thumb Landscapes',
      buyerCategory: 'landscaping',
      buyerContact: '+91 98453 11002',
      quantityKg: 500,
      unitPricePerKg: 5.5,
      totalSaleAmount: 2750,
      partnerId: createdPartners[0]._id,
      paymentStatus: 'paid',
      deliveryMethod: 'buyer_pickup',
      batchCode: 'BATCH-COMP-2026-A2',
      invoiceNumber: 'INV-004129'
    },
    {
      saleDate: pastDays(8),
      buyerName: 'Lalbagh Flower & Plant Nursery Hub',
      buyerCategory: 'nursery',
      buyerContact: '+91 98453 11003',
      quantityKg: 1200,
      unitPricePerKg: 5.0,
      totalSaleAmount: 6000,
      partnerId: createdPartners[0]._id,
      paymentStatus: 'paid',
      deliveryMethod: 'partner_dispatched',
      batchCode: 'BATCH-COMP-2026-B1',
      invoiceNumber: 'INV-004130'
    }
  ];

  await CompostSale.create(salesData);

  // 5. Seed Canonical Pilot Calculator Scenario
  await CalculatorScenario.create(PILOT_DEMO_SCENARIO);

  console.log('[Organic Seed] Seeding completed: 6 Suppliers, 2 Fertilizer Partners, Collections, Sales & Pilot Scenario.');
}
