<<<<<<< HEAD
# SmartBite AI — Predict. Pool. Rescue.

> **Intelligent Food Rescue, Predictive Surplus Management & Multi-Mode Delivery Optimization**

SmartBite AI is an end-to-end logistics platform engineered to solve the real reason food rescue operations break down: **inefficient collection economics for micro-donations**.

Within a 1.5 km university zone with 15 outlets (9 bakeries, 4 restaurants, 2 hostel messes) generating 5–15 surplus meals each night, an NGO serving 80 people 3 km away routinely rejected small individual pickups due to vehicle fuel and round-trip time exceeding the donation value. SmartBite AI predicts surplus, aggregates small donations into multi-stop collection loops, selects the optimal transport mode, and guarantees verified handovers.

---

## 🌟 The Three Core Innovations

1. **Cost-Aware Multi-Stop Route Optimization**:
   - Compares individual donor-to-NGO round trips (unfeasible, high-cost) against consolidated multi-stop loops.
   - Calculates road winding circuity factor (1.32x urban multiplier), incremental collection costs, and cost per meal rescued.
   - Dynamically balances **Plan A (Fastest/Urgent First)**, **Plan B (Max Meals Rescued)**, and **Plan C (Lowest Cost per Meal)**.

2. **Predictive Food Availability Engine**:
   - Leverages a categorical, time-series baseline weighted by weekday operating curves, closing hours, and establishment types (hostel dinner buffers vs. bakery shelf-life expiry).
   - Strictly separates **Predicted Surplus** from **Donor-Confirmed Donations** across all inventory and dispatches.

3. **Intelligent 3-Mode Dispatching**:
   - Evaluates:
     - **Mode A: Verified Community Volunteers** (Two-wheelers/cars for nimble, low-cost micro-runs <35 meals).
     - **Mode B: NGO Heavy Fleet** (Dedicated vans & cargo EVs for bulk clusters up to 140 meals).
     - **Mode C: Partner Transit Buses** (Scheduled municipal routes with segregated parcel delivery).
   - Enforces backend administrative vetting for volunteer authorization.

---

## 🔒 Verification & Offline Resilience

- **Two-Step One-Time Passwords (OTP)**:
  - Secure pickup custody OTP provided by the food donor.
  - Final acceptance delivery OTP verified by the NGO receiving desk.
- **Offline PWA / IndexedDB Sync**:
  - Full IndexedDB storage for offline donor submissions with unique client operation IDs.
  - Automatic idempotent background synchronization with duplicate prevention upon reconnection.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start Backend API
```bash
cd server
npm install
npm run dev
```
*Backend runs on `http://localhost:5000` (auto-starts embedded in-memory MongoDB fallback with pre-seeded cluster data).*

### 2. Start Frontend Dashboard
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with active proxy to the backend API.*

### 3. Run Automated Tests
```bash
cd server
npm test
```
*Executes the complete Vitest test suite validating routing distances, baseline comparison, food safety constraints, and predictive accuracy.*

---

## 📍 Hackathon Demonstration Script (5 Minutes)

1. **Minute 1: The Problem**:
   - Open **Overview Page** (`/`). Observe the 15 outlets and the gap between 124 predicted surplus meals and the NGO's 80-meal nightly capacity.
2. **Minute 2: Route Optimizer**:
   - Navigate to **Pickup Optimizer** (`/optimizer`). Highlight how individual round trips require 8.4 km of travel, whereas SmartBite AI consolidates this to 4.5 km, reducing fuel costs by 77%.
3. **Minute 3: 3-Mode Dispatching**:
   - Compare the three modes in the dispatch panel. Explain why an NGO Van is recommended for the 73-meal batch due to volunteer capacity constraints.
   - Click **Approve & Dispatch Plan**.
4. **Minute 4: Live Telemetry & Handover Verification**:
   - Go to **Live Operations** (`/live`). View the active dispatch, ping the GPS location, and enter the **Pickup OTP** and **Delivery OTP** to demonstrate full chain-of-custody verification.
5. **Minute 5: Prediction & Offline Queue**:
   - Open **Donations** (`/donations`). Show how offline entries queue in browser IndexedDB and sync without duplicates.
   - Check the **Impact Analytics** (`/analytics`) showing CO2 prevention and verified costs saved.
=======
# smart-donor
Smartdonor AI predicts surplus food, optimizes collection routes, and connects donors, NGOs, and volunteers to reduce food waste and transportation costs
>>>>>>> 2ddac8617b38b4405a73c2358d5e495d1ed933eb
