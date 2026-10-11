# SmartBite AI — Predict. Pool. Rescue.

> **Intelligent Food Rescue, Predictive Surplus Management, Multi-Mode Delivery & Organic Waste Business Hub**

SmartBite AI is an end-to-end logistics platform engineered to solve the real reason food rescue and food waste valorization break down: **inefficient collection economics for micro-donations and organic scraps**.

---

## 🌟 Two-Path Food Recovery Architecture

1. **Path A: Edible Surplus Food Rescue (Core System)**
   * Identifies potentially edible food from 15 campus food establishments (9 bakeries, 4 restaurants, 2 hostel messes).
   * Applies safety criteria and safe thermal handling thresholds.
   * Consolidates small donations into multi-stop collection loops (saving up to 77% in vehicle fuel).
   * Dispatches via 3 tiers: Verified Volunteers, NGO Fleet, or Transit Buses with 2-step OTP verification.

2. **Path B: Organic Waste & Fertilizer Business Module (New Extension)**
   * Captures non-donatable organic material (fruit rinds, vegetable trimmings, damaged produce, bakery dough).
   * Connects organic suppliers (fruit shops, vegetable markets, hotels) to accredited fertilizer & composting processing partners.
   * Tracks collection weights, contamination rejections, supplier incentive payments, and finished compost production.
   * Computes commercial feasibility with an interactive profit calculator and generates route plans for depot-to-facility drop-offs.

---

## 🌿 Organic Waste & Fertilizer Module Sections

Accessible via the **Organic Waste & Fertilizer** sidebar navigation item (`/organic-waste`):

1. **Overview Dashboard:** Two-Path recovery breakdown, cluster metrics (waste recovered, compost sold, revenue), and quick actions.
2. **Supplier Management:** Registration, category filters, and collection history for hotels, restaurants, bakeries, fruit shops, and vegetable markets.
3. **Organic Waste Collection:** Weighing, contamination observations, accepted vs. rejected weights, transport cost tracking, and incentive payments.
4. **Fertilizer Partner Management:** Processing plant capacities, conversion yield percentages, accepted vs. rejected waste rules, and wholesale product prices.
5. **Compost Production & Sales:** Wholesale compost distribution invoices, buyers (farms, nurseries, landscaping), and payment status.
6. **Business Cost & Profit Calculator:** Interactive financial calculator with real-time computation of monthly waste volume, compost yield, total revenues, operating costs, break-even revenues, and net margins. Includes a **Reset Pilot Scenario** button (500 kg/day, ₹15,000 monthly surplus benchmark).
7. **Route Planning:** Multi-stop collection routing starting from depot, grouping compatible suppliers, and dropping off at processing plants with viable load validation.
8. **Reports & Transactions:** Audit analytics and one-click CSV export (`/api/organic/reports/export-csv`).

---

## 🚀 Running the Application

### 1. Start Backend API
```bash
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` (auto-seeds 15 food outlets + 6 organic suppliers, 2 fertilizer partners, and pilot scenarios).*

### 2. Start Frontend Dashboard
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

### 3. Run Automated Tests
```bash
cd server
npm test
```
*Runs all Vitest suites for the core optimizer and the organic profit calculator/routing engine.*
