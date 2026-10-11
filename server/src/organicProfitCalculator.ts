export interface ProfitInputs {
  incomingWasteKgPerDay: number;
  operatingDaysPerMonth: number;
  saleableCompostYieldPercent: number; // e.g. 30 for 30%
  compostSellingPricePerKg: number;    // e.g. 5 INR
  supplierPaymentPerKg: number;        // e.g. 0.50 INR
  monthlyTransportCost: number;        // e.g. 20000 INR
  monthlyProcessingFee: number;        // e.g. 15000 INR
  monthlyLaborAdminCost: number;       // e.g. 10000 INR
  monthlyPackagingTestingCost?: number;
  monthlyRentUtilitiesCost?: number;
  monthlyDepreciationFinancingCost?: number;
  confirmedCollectionRevenue: number;  // e.g. 45000 INR
  otherRevenue?: number;
}

export interface ProfitCalculationResult {
  monthlyIncomingWasteKg: number;
  estimatedSaleableCompostKg: number;
  compostSalesRevenue: number;
  confirmedCollectionRevenue: number;
  otherRevenue: number;
  totalMonthlyRevenue: number;
  
  supplierPaymentsCost: number;
  transportCost: number;
  processingCost: number;
  laborAdminCost: number;
  packagingTestingCost: number;
  rentUtilitiesCost: number;
  totalOperatingCosts: number;
  
  depreciationFinancingCost: number;
  totalExpenses: number;
  
  operatingProfit: number;
  netProfit: number;
  netProfitMarginPercent: number;
  breakEvenRevenue: number;
  breakEvenWasteKg: number;
  
  costPerKgCollected: number;
  costPerKgSaleableCompost: number;
  isSufficientData: boolean;
}

/**
 * Validates and computes exact financial metrics according to Part 7 & Part 8 instructions.
 * If required core metrics are missing or negative, flags insufficient data.
 */
export function calculateBusinessProfit(inputs: ProfitInputs): ProfitCalculationResult {
  if (
    inputs.incomingWasteKgPerDay === undefined ||
    inputs.operatingDaysPerMonth === undefined ||
    inputs.saleableCompostYieldPercent === undefined ||
    inputs.incomingWasteKgPerDay < 0 ||
    inputs.operatingDaysPerMonth <= 0
  ) {
    return {
      monthlyIncomingWasteKg: 0,
      estimatedSaleableCompostKg: 0,
      compostSalesRevenue: 0,
      confirmedCollectionRevenue: 0,
      otherRevenue: 0,
      totalMonthlyRevenue: 0,
      supplierPaymentsCost: 0,
      transportCost: 0,
      processingCost: 0,
      laborAdminCost: 0,
      packagingTestingCost: 0,
      rentUtilitiesCost: 0,
      totalOperatingCosts: 0,
      depreciationFinancingCost: 0,
      totalExpenses: 0,
      operatingProfit: 0,
      netProfit: 0,
      netProfitMarginPercent: 0,
      breakEvenRevenue: 0,
      breakEvenWasteKg: 0,
      costPerKgCollected: 0,
      costPerKgSaleableCompost: 0,
      isSufficientData: false
    };
  }

  const days = Math.max(1, inputs.operatingDaysPerMonth);
  const dailyKg = Math.max(0, inputs.incomingWasteKgPerDay);
  const yieldFraction = (inputs.saleableCompostYieldPercent || 0) / 100;
  const compostPrice = inputs.compostSellingPricePerKg || 0;
  const supplierRate = inputs.supplierPaymentPerKg || 0;

  // Monthly incoming waste: Daily accepted waste × operating days
  const monthlyIncomingWasteKg = Math.round(dailyKg * days);

  // Estimated saleable compost: Monthly incoming waste × assumed yield percentage
  const estimatedSaleableCompostKg = Math.round(monthlyIncomingWasteKg * yieldFraction);

  // Compost revenue: Saleable compost quantity × selling price per kg
  const compostSalesRevenue = Math.round(estimatedSaleableCompostKg * compostPrice);
  const confirmedCollectionRevenue = inputs.confirmedCollectionRevenue || 0;
  const otherRevenue = inputs.otherRevenue || 0;

  // Total revenue: Compost sales + confirmed collection/service revenue + other actual revenue
  const totalMonthlyRevenue = compostSalesRevenue + confirmedCollectionRevenue + otherRevenue;

  // Cost breakdowns
  const supplierPaymentsCost = Math.round(monthlyIncomingWasteKg * supplierRate);
  const transportCost = inputs.monthlyTransportCost || 0;
  const processingCost = inputs.monthlyProcessingFee || 0;
  const laborAdminCost = inputs.monthlyLaborAdminCost || 0;
  const packagingTestingCost = inputs.monthlyPackagingTestingCost || 0;
  const rentUtilitiesCost = inputs.monthlyRentUtilitiesCost || 0;
  const depreciationFinancingCost = inputs.monthlyDepreciationFinancingCost || 0;

  // Total operating costs: Supplier payments + transport + processing + labor + packaging + testing + utilities + admin
  const totalOperatingCosts = 
    supplierPaymentsCost + 
    transportCost + 
    processingCost + 
    laborAdminCost + 
    packagingTestingCost + 
    rentUtilitiesCost;

  // Operating profit: Total revenue − operating costs
  const operatingProfit = totalMonthlyRevenue - totalOperatingCosts;

  // Net profit: Total revenue − all applicable expenses (including depreciation & financing)
  const totalExpenses = totalOperatingCosts + depreciationFinancingCost;
  const netProfit = totalMonthlyRevenue - totalExpenses;

  // Net profit margin: Net profit ÷ total revenue × 100, when revenue is positive
  const netProfitMarginPercent = totalMonthlyRevenue > 0 
    ? Number(((netProfit / totalMonthlyRevenue) * 100).toFixed(2))
    : 0;

  // Break-even revenue: Total relevant costs
  const breakEvenRevenue = totalExpenses;

  // Cost per kg metrics
  const costPerKgCollected = monthlyIncomingWasteKg > 0 
    ? Number((totalExpenses / monthlyIncomingWasteKg).toFixed(2))
    : 0;

  const costPerKgSaleableCompost = estimatedSaleableCompostKg > 0
    ? Number((totalExpenses / estimatedSaleableCompostKg).toFixed(2))
    : 0;

  // Unit economics revenue per kg of raw waste
  // revenue per kg = (yieldFraction * compostPrice) + (confirmedCollectionRevenue / monthlyIncomingWasteKg)
  const revPerKg = monthlyIncomingWasteKg > 0 ? totalMonthlyRevenue / monthlyIncomingWasteKg : 0;
  const breakEvenWasteKg = revPerKg > 0 ? Math.round(breakEvenRevenue / revPerKg) : 0;

  return {
    monthlyIncomingWasteKg,
    estimatedSaleableCompostKg,
    compostSalesRevenue,
    confirmedCollectionRevenue,
    otherRevenue,
    totalMonthlyRevenue,
    supplierPaymentsCost,
    transportCost,
    processingCost,
    laborAdminCost,
    packagingTestingCost,
    rentUtilitiesCost,
    totalOperatingCosts,
    depreciationFinancingCost,
    totalExpenses,
    operatingProfit,
    netProfit,
    netProfitMarginPercent,
    breakEvenRevenue,
    breakEvenWasteKg,
    costPerKgCollected,
    costPerKgSaleableCompost,
    isSufficientData: true
  };
}

// Canonical Example Pilot Scenario from specification
export const PILOT_DEMO_SCENARIO: ProfitInputs = {
  incomingWasteKgPerDay: 500,
  operatingDaysPerMonth: 30,
  saleableCompostYieldPercent: 30,
  compostSellingPricePerKg: 5.0,
  supplierPaymentPerKg: 0.50,
  monthlyTransportCost: 20000,
  monthlyProcessingFee: 15000,
  monthlyLaborAdminCost: 10000,
  monthlyPackagingTestingCost: 0,
  monthlyRentUtilitiesCost: 0,
  monthlyDepreciationFinancingCost: 0,
  confirmedCollectionRevenue: 45000,
  otherRevenue: 0
};
