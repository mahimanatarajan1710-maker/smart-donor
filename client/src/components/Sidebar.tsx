import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  UtensilsCrossed, 
  Route, 
  Users, 
  Truck, 
  Radio, 
  BarChart3, 
  Settings, 
  Leaf,
  WifiOff,
  Sprout
} from 'lucide-react';

interface SidebarProps {
  isOffline?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOffline = false }) => {
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Live Operations', path: '/live', icon: Activity },
    { name: 'Donations', path: '/donations', icon: UtensilsCrossed },
    { name: 'Pickup Optimizer', path: '/optimizer', icon: Route, highlight: true },
    { name: 'Organic Waste & Fertilizer', path: '/organic-waste', icon: Sprout, highlight: true },
    { name: 'Volunteers', path: '/volunteers', icon: Users },
    { name: 'Transport Network', path: '/transport', icon: Truck },
    { name: 'Live Tracking', path: '/tracking', icon: Radio },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-base leading-tight tracking-tight">SmartBite AI</div>
            <div className="text-[11px] font-medium text-emerald-700">Predict. Pool. Rescue.</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  } ${item.highlight ? 'relative' : ''}`
                }
              >
                <Icon className="w-4 h-4 text-slate-500 group-hover:text-emerald-600" />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Offline Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {isOffline ? (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <div className="font-semibold">Offline Mode</div>
              <div className="text-[11px] text-amber-600">Sync queued locally</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="font-semibold">Network Connected</div>
              <div className="text-[11px] text-emerald-600">Campus cluster live</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
