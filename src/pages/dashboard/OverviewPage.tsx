import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GitBranch, Key, Activity, ArrowRight, Sparkles, Server, CheckCircle2, 
  Terminal, ShieldCheck, Cpu 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OverviewPage: React.FC = () => {
  const { user, apiFetch } = useAuth();
  
  const [stats, setStats] = useState({
    workflowsCount: 0,
    apiKeysCount: 0,
    health: 'Checking...'
  });
  
  const [recentLogs, setRecentLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverviewStats = async () => {
      try {
        const workflowsRes = await apiFetch('/workflows');
        const apiKeysRes = await apiFetch('/api-keys');
        const healthRes = await apiFetch('/health');

        setStats({
          workflowsCount: workflowsRes.workflows?.length || 0,
          apiKeysCount: apiKeysRes.keys?.length || 0,
          health: healthRes.status === 'healthy' ? 'Operational' : 'Issues'
        });

        // Seed some mock webhook logs for visuals
        setRecentLogs([
          `Webhook post-request received on port 3306`,
          `Executed Claude 3.5 Sonnet processing node on user-1`,
          `Dispatched Slack payload to channel #support`,
          `Updated SQLite in-memory key prefix nx_live_`
        ]);

      } catch (err) {
        console.error('Failed to load overview analytics:', err);
        // Fallback standard values
        setStats(prev => ({ ...prev, health: 'Degraded' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewStats();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="glass-panel border border-zinc-900 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Workspace Overview
            </span>
            <h2 className="font-display font-bold text-xl md:text-2xl text-white">
              Hello, {user?.name}!
            </h2>
            <p className="text-xs text-zinc-500 mt-1 max-w-lg">
              Manage your visual node integrations, inspect telemetry records, and monitor API traffic keys.
            </p>
          </div>
          <Link
            to="/dashboard/workflows"
            className="flex items-center gap-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-glow hover:shadow-glow-strong transition-all shrink-0"
          >
            Create Flow <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Workflows */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Active Workflows</h4>
            <span className="block font-display font-black text-3xl text-white mt-2">
              {isLoading ? '...' : stats.workflowsCount}
            </span>
            <Link to="/dashboard/workflows" className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:underline mt-4">
              Manage flows <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center">
            <GitBranch className="w-5 h-5" />
          </div>
        </div>

        {/* API Keys */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">API Credentials</h4>
            <span className="block font-display font-black text-3xl text-white mt-2">
              {isLoading ? '...' : stats.apiKeysCount}
            </span>
            <Link to="/dashboard/api-keys" className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:underline mt-4">
              Manage keys <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
        </div>

        {/* Server Status */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Telemetry Link</h4>
            <span className={`block font-display font-bold text-md mt-4 ${
              stats.health === 'Operational' ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {stats.health}
            </span>
            <span className="block text-[9px] text-zinc-600 mt-2 font-mono">SQLite-cluster sync</span>
          </div>
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Run Telemetry Mock Chart */}
        <div className="lg:col-span-2 glass-panel border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-violet-400" /> API Latency & Runs Timeline (24h)
            </h3>
            
            {/* Visual SVG Chart Representation */}
            <div className="h-[180px] w-full mt-4 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal guidelines */}
                <line x1="0" y1="50" x2="400" y2="50" stroke="#1f1f23" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#1f1f23" strokeWidth="1" strokeDasharray="5,5" />
                
                {/* Path curves */}
                <path 
                  d="M0,130 C40,90 80,120 120,60 C160,80 200,30 240,70 C280,110 320,50 360,40 C380,30 400,20 400,20" 
                  fill="none" 
                  stroke="#7c3aed" 
                  strokeWidth="2.5" 
                />
                <path 
                  d="M0,130 C40,90 80,120 120,60 C160,80 200,30 240,70 C280,110 320,50 360,40 C380,30 400,20 400,20 L400,150 L0,150 Z" 
                  fill="url(#chartGrad)" 
                />
              </svg>
            </div>
            
            <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-2 px-1">
              <span>08:00 AM</span>
              <span>12:00 PM</span>
              <span>04:00 PM</span>
              <span>08:00 PM</span>
            </div>
          </div>
        </div>

        {/* Live Activity Telemetry Logs */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-5 flex flex-col">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-violet-400" /> Node Telemetry Logs
          </h3>
          
          <div className="flex-grow space-y-3 overflow-y-auto pr-1">
            {recentLogs.map((log, index) => (
              <div key={index} className="flex gap-2.5 items-start">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-300 font-mono break-words leading-relaxed">{log}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/dashboard/analytics"
            className="w-full text-center py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-300 hover:text-white rounded-xl mt-4 block transition-colors"
          >
            Open Analytics Telemetry
          </Link>
        </div>

      </div>

    </div>
  );
};
