import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { OverviewPage } from './pages/OverviewPage';
import { OptimizerPage } from './pages/OptimizerPage';
import { DonationsPage } from './pages/DonationsPage';
import { VolunteersPage } from './pages/VolunteersPage';
import { TransportNetworkPage } from './pages/TransportNetworkPage';
import { LiveOperationsPage } from './pages/LiveOperationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TrackingMapPage } from './pages/TrackingMapPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrganicWasteModulePage } from './pages/OrganicWasteModulePage';

export function App() {
  const [isResetting, setIsResetting] = useState(false);

  const handleGlobalReset = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
      if (res.ok) {
        window.location.reload();
      }
    } catch (e: any) {
      alert(`Reset error: ${e.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#f8faf9]">
        {/* Left Nav */}
        <Sidebar />

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavbar 
            title="SmartBite AI — Operations Center" 
            subtitle="Intelligent Food Rescue, Predictive Surplus & Multi-Mode Optimization"
            onResetDemo={handleGlobalReset}
            isResetting={isResetting}
          />

          <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/optimizer" element={<OptimizerPage />} />
              <Route path="/organic-waste" element={<OrganicWasteModulePage />} />
              <Route path="/donations" element={<DonationsPage />} />
              <Route path="/volunteers" element={<VolunteersPage />} />
              <Route path="/transport" element={<TransportNetworkPage />} />
              <Route path="/live" element={<LiveOperationsPage />} />
              <Route path="/tracking" element={<TrackingMapPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
