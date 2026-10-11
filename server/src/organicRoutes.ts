import express, { Request, Response } from 'express';
import { 
  OrganicSupplier, 
  FertilizerPartner, 
  OrganicCollection, 
  CompostSale, 
  CalculatorScenario 
} from './organicModels.js';
import { 
  calculateBusinessProfit, 
  PILOT_DEMO_SCENARIO, 
  ProfitInputs 
} from './organicProfitCalculator.js';
import { planOrganicWasteRoute } from './organicRouter.js';
import { NGO_HQ } from './optimizer.js';

const router = express.Router();

// ==========================================
// 1. OVERVIEW & ANALYTICS METRICS
// ==========================================
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const suppliersCount = await OrganicSupplier.countDocuments({ status: 'active' });
    const partnersCount = await FertilizerPartner.countDocuments({ status: 'active' });

    const collections = await OrganicCollection.find();
    const totalCollectedKg = collections.reduce((acc, c) => acc + (c.collectedWeightKg || 0), 0);
    const totalAcceptedKg = collections.reduce((acc, c) => acc + (c.acceptedWeightKg || 0), 0);
    const totalRejectedKg = collections.reduce((acc, c) => acc + (c.rejectedWeightKg || 0), 0);
    const totalSupplierIncentives = collections.reduce((acc, c) => acc + (c.supplierIncentiveAmount || 0), 0);
    const totalTransportSpent = collections.reduce((acc, c) => acc + (c.transportCost || 0), 0);

    const sales = await CompostSale.find();
    const totalCompostSoldKg = sales.reduce((acc, s) => acc + (s.quantityKg || 0), 0);
    const totalCompostRevenue = sales.reduce((acc, s) => acc + (s.totalSaleAmount || 0), 0);

    // Theoretical yield check
    const averageYieldPct = totalAcceptedKg > 0 
      ? Number(((totalCompostSoldKg / totalAcceptedKg) * 100).toFixed(1)) 
      : 30;

    res.json({
      activeSuppliers: suppliersCount,
      activePartners: partnersCount,
      totalCollectedKg,
      totalAcceptedKg,
      totalRejectedKg,
      rejectionRatePercent: totalCollectedKg > 0 ? Number(((totalRejectedKg / totalCollectedKg) * 100).toFixed(1)) : 0,
      totalSupplierIncentives,
      totalTransportSpent,
      totalCompostSoldKg,
      totalCompostRevenue,
      averageYieldPct
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. SUPPLIER MANAGEMENT
// ==========================================
router.get('/suppliers', async (req: Request, res: Response) => {
  try {
    const { category, search, status } = req.query;
    const filter: any = {};

    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.name = { $regex: String(search), $options: 'i' };
    }

    const suppliers = await OrganicSupplier.find(filter).sort({ name: 1 });
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await OrganicSupplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    const collections = await OrganicCollection.find({ supplierId: supplier._id })
      .populate('partnerId')
      .sort({ collectionDate: -1 });

    res.json({ supplier, collections });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      contactPerson,
      contactPhone,
      address,
      latitude,
      longitude,
      estimatedDailyWasteKg,
      wasteTypes,
      collectionFrequency,
      acceptedMaterials,
      pricePerKgIncentive,
      paymentTerms
    } = req.body;

    const supplier = await OrganicSupplier.create({
      name,
      category,
      contactPerson,
      contactPhone,
      address,
      location: {
        latitude: Number(latitude) || 12.9716,
        longitude: Number(longitude) || 77.5946
      },
      estimatedDailyWasteKg: Number(estimatedDailyWasteKg) || 30,
      wasteTypes: wasteTypes || ['vegetable_waste', 'fruit_waste'],
      collectionFrequency: collectionFrequency || 'daily',
      acceptedMaterials: acceptedMaterials || ['raw_peels', 'vegetable_scraps', 'damaged_produce'],
      paymentAgreement: {
        pricePerKgIncentive: Number(pricePerKgIncentive) || 0.50,
        paymentTerms: paymentTerms || 'monthly_credit'
      },
      status: 'active'
    });

    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 3. FERTILIZER PARTNERS MANAGEMENT
// ==========================================
router.get('/partners', async (req: Request, res: Response) => {
  try {
    const partners = await FertilizerPartner.find().sort({ organizationName: 1 });
    res.json(partners);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/partners', async (req: Request, res: Response) => {
  try {
    const {
      organizationName,
      contactPerson,
      contactPhone,
      address,
      latitude,
      longitude,
      serviceArea,
      acceptedWasteTypes,
      rejectedWasteTypes,
      maxDailyCapacityKg,
      minAcceptableBatchKg,
      processingFeePerKg,
      compostYieldPercentage,
      productsProduced,
      sellingPricePerKg,
      partnerArrangementType
    } = req.body;

    const partner = await FertilizerPartner.create({
      organizationName,
      contactPerson,
      contactPhone,
      address,
      location: {
        latitude: Number(latitude) || 12.9800,
        longitude: Number(longitude) || 77.6100
      },
      serviceArea: serviceArea || 'Greater City Agro-Belt',
      acceptedWasteTypes: acceptedWasteTypes || ['fruit_waste', 'vegetable_waste', 'peels_and_scraps', 'bakery_trimmings'],
      rejectedWasteTypes: rejectedWasteTypes || ['cooked_meat', 'dairy', 'excess_oil', 'plastic_packaging'],
      maxDailyCapacityKg: Number(maxDailyCapacityKg) || 2000,
      minAcceptableBatchKg: Number(minAcceptableBatchKg) || 100,
      processingFeePerKg: Number(processingFeePerKg) || 1.0,
      compostYieldPercentage: Number(compostYieldPercentage) || 30,
      productsProduced: productsProduced || ['Rich Organic Humus Compost', 'Liquid Bio-Fertilizer'],
      sellingPricePerKg: Number(sellingPricePerKg) || 5.0,
      partnerArrangementType: partnerArrangementType || 'third_party_processor'
    });

    res.status(201).json(partner);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 4. ORGANIC WASTE COLLECTION (PATH B)
// ==========================================
router.get('/collections', async (req: Request, res: Response) => {
  try {
    const collections = await OrganicCollection.find()
      .populate('supplierId')
      .populate('partnerId')
      .sort({ collectionDate: -1 });
    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/collections', async (req: Request, res: Response) => {
  try {
    const {
      supplierId,
      partnerId,
      wasteCategory,
      collectedWeightKg,
      acceptedWeightKg,
      rejectedWeightKg,
      rejectionReason,
      collectionTime,
      contaminationObservations,
      transportCost,
      notes
    } = req.body;

    const supplier = await OrganicSupplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    let partner = null;
    if (partnerId) {
      partner = await FertilizerPartner.findById(partnerId);
    }

    const collectedKg = Number(collectedWeightKg) || 0;
    const acceptedKg = Number(acceptedWeightKg) || collectedKg;
    const rejectedKg = Number(rejectedWeightKg) || Math.max(0, collectedKg - acceptedKg);

    // Calculate supplier incentive from agreement
    const incentiveRate = supplier.paymentAgreement?.pricePerKgIncentive || 0.50;
    const supplierIncentiveAmount = Number((acceptedKg * incentiveRate).toFixed(2));

    // Yield estimation from partner or default 30%
    const yieldPct = partner?.compostYieldPercentage || 30;
    const estimatedCompostYieldKg = Number((acceptedKg * (yieldPct / 100)).toFixed(2));

    const collection = await OrganicCollection.create({
      supplierId,
      partnerId: partnerId || undefined,
      wasteCategory: wasteCategory || 'vegetable_waste',
      collectedWeightKg: collectedKg,
      acceptedWeightKg: acceptedKg,
      rejectedWeightKg: rejectedKg,
      rejectionReason: rejectionReason || undefined,
      collectionTime: collectionTime || '14:30',
      contaminationObservations,
      pickupStatus: 'delivered_to_facility',
      transportCost: Number(transportCost) || 0,
      supplierIncentiveAmount,
      estimatedCompostYieldKg,
      isProcessed: true,
      notes
    });

    // Update supplier running totals
    await OrganicSupplier.findByIdAndUpdate(supplierId, {
      $inc: {
        totalKgCollectedToDate: acceptedKg,
        totalPaidToDate: supplierIncentiveAmount
      }
    });

    // Update partner running totals
    if (partnerId) {
      await FertilizerPartner.findByIdAndUpdate(partnerId, {
        $inc: {
          totalWasteReceivedKg: acceptedKg,
          totalCompostProducedKg: estimatedCompostYieldKg
        }
      });
    }

    res.status(201).json(collection);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 5. COMPOST PRODUCTION AND SALES
// ==========================================
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const sales = await CompostSale.find().populate('partnerId').sort({ saleDate: -1 });
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sales', async (req: Request, res: Response) => {
  try {
    const {
      buyerName,
      buyerCategory,
      buyerContact,
      quantityKg,
      unitPricePerKg,
      partnerId,
      deliveryMethod,
      notes
    } = req.body;

    const qty = Number(quantityKg);
    const unitPrice = Number(unitPricePerKg);
    const totalAmount = Number((qty * unitPrice).toFixed(2));
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const sale = await CompostSale.create({
      buyerName,
      buyerCategory: buyerCategory || 'organic_farm',
      buyerContact,
      quantityKg: qty,
      unitPricePerKg: unitPrice,
      totalSaleAmount: totalAmount,
      partnerId: partnerId || undefined,
      deliveryMethod: deliveryMethod || 'buyer_pickup',
      invoiceNumber,
      notes
    });

    res.status(201).json(sale);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 6. BUSINESS PROFIT CALCULATOR
// ==========================================
router.get('/calculator/scenario', async (req: Request, res: Response) => {
  try {
    let scenario = await CalculatorScenario.findOne({ isPilotDemo: true });
    if (!scenario) {
      scenario = await CalculatorScenario.create(PILOT_DEMO_SCENARIO);
    }
    const calculation = calculateBusinessProfit(scenario.toObject());
    res.json({ scenario, calculation });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/calculator/compute', (req: Request, res: Response) => {
  try {
    const inputs: ProfitInputs = req.body;
    const result = calculateBusinessProfit(inputs);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/calculator/reset-demo', async (req: Request, res: Response) => {
  try {
    await CalculatorScenario.deleteMany({ isPilotDemo: true });
    const scenario = await CalculatorScenario.create(PILOT_DEMO_SCENARIO);
    const calculation = calculateBusinessProfit(PILOT_DEMO_SCENARIO);
    res.json({
      message: 'Calculator reset to canonical illustrative pilot scenario (500 kg/day, ₹15,000 surplus).',
      scenario,
      calculation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. ORGANIC ROUTE OPTIMIZATION
// ==========================================
router.get('/route/plan', async (req: Request, res: Response) => {
  try {
    const suppliers = await OrganicSupplier.find({ status: 'active' });
    const partner = await FertilizerPartner.findOne({ status: 'active' });

    if (!partner || suppliers.length === 0) {
      return res.status(400).json({ error: 'Requires at least 1 active partner facility and active suppliers.' });
    }

    const candidateSuppliers = suppliers.map(s => ({
      supplierId: s._id.toString(),
      name: s.name,
      category: s.category,
      location: s.location,
      dailyWasteKg: s.estimatedDailyWasteKg,
      wasteTypes: s.wasteTypes,
      preferredWindow: '06:00 - 09:00'
    }));

    const facilityDestination = {
      partnerId: partner._id.toString(),
      name: partner.organizationName,
      location: partner.location,
      maxDailyCapacityKg: partner.maxDailyCapacityKg,
      acceptedWasteTypes: partner.acceptedWasteTypes
    };

    const routePlan = planOrganicWasteRoute(NGO_HQ.location, candidateSuppliers, facilityDestination);
    res.json(routePlan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. CSV EXPORT FOR TRANSACTIONS & AUDIT
// ==========================================
router.get('/reports/export-csv', async (req: Request, res: Response) => {
  try {
    const collections = await OrganicCollection.find().populate('supplierId').populate('partnerId');

    let csvContent = 'CollectionID,Supplier,Category,CollectedKg,AcceptedKg,RejectedKg,IncentivePaidINR,TransportCostINR,Date,Status\n';
    collections.forEach(c => {
      const sName = (c.supplierId as any)?.name || 'Unknown';
      const cDate = new Date(c.collectionDate).toISOString().split('T')[0];
      csvContent += `${c._id},"${sName}",${c.wasteCategory},${c.collectedWeightKg},${c.acceptedWeightKg},${c.rejectedWeightKg},${c.supplierIncentiveAmount},${c.transportCost},${c.collectionDate ? cDate : ''},${c.pickupStatus}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('organic_waste_collections_report.csv');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
