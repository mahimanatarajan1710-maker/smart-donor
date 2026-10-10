import React from 'react';
import { Bell, RefreshCw, Sparkles, Building2 } from 'lucide-react';

interface TopNavbarProps {
  title: string;
  subtitle?: string;
  onResetDemo?: () => void;
  isResetting?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ 
  title, 
  subtitle, 
  onResetDemo,
  isResetting = false 
}) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h1 className="text-lg font-bold text-slate-800 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-normal">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onResetDemo && (
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Cluster</span>
          </button>
        )}

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Annam Karunya NGO</span>
          </div>

          <div className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>
    </header>
  );
};
