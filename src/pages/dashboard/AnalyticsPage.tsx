import React, { useState } from 'react';
import { 
  BarChart3, Activity, AlertCircle, Clock, Zap, Cpu, 
  ArrowUpRight, ArrowDownRight, Calendar 
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Hardcoded premium analytics values depending on timeframe
  const metrics = {
    '24h': { runs: '4,102', errors: '12', latency: '194ms', efficiency: '99.7%' },
    '7d': { runs: '28,950', errors: '84', latency: '210ms', efficiency: '99.5%' },
    '30d': { runs: '120,402', errors: '341', latency: '202ms', efficiency: '99.6%' }
  }[timeframe];

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-white">Telemetry & Analytics</h2>
          <p className="text-xs text-zinc-500 mt-1">Review node execution latencies, load ratios, and success rates.</p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1 shrink-0 self-start sm:self-auto">
          {(['24h', '7d', '30d'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                timeframe === t 
                  ? 'bg-violet-600 text-white shadow-glow' 
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {t === '24h' ? 'Last 24 Hours' : t === '7d' ? 'Last 7 Days' : 'Last Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Runs */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Runs</span>
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2">
            <span className="block font-display font-black text-2xl text-white">{metrics.runs}</span>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5 mt-1.5">
              <ArrowUpRight className="w-3 h-3" /> +12.4% vs prev period
            </span>
          </div>
        </div>

        {/* Latency */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Average Latency</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <span className="block font-display font-black text-2xl text-white">{metrics.latency}</span>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5 mt-1.5">
              <ArrowDownRight className="w-3 h-3" /> -14ms optimization
            </span>
          </div>
        </div>

        {/* Error count */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Execution Errors</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <span className="block font-display font-black text-2xl text-white">{metrics.errors}</span>
            <span className="text-[9px] text-red-500 font-mono flex items-center gap-0.5 mt-1.5">
              <ArrowUpRight className="w-3 h-3" /> +1.2% minor uptick
            </span>
          </div>
        </div>

        {/* Efficiency */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between h-[120px]">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[10px] font-semibold uppercase tracking-wider">Node Success Ratio</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="block font-display font-black text-2xl text-white">{metrics.efficiency}</span>
            <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-0.5 mt-1.5">
              Operational compliance
            </span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Run Volume Chart */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-6">
            <BarChart3 className="w-4.5 h-4.5 text-violet-400" /> Workflow Executions Volumes
          </h3>

          <div className="h-[200px] w-full flex items-end justify-between gap-2.5 pt-4">
            {[45, 60, 55, 70, 65, 80, 95, 90, 85, 110, 105, 120].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-violet-600/20 hover:bg-violet-600 rounded-t-md transition-all duration-500" 
                  style={{ height: `${val}px` }}
                />
                <span className="text-[8px] font-mono text-zinc-600">{idx + 1}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance & Resource Load */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-6">
          <h3 className="text-xs font-bold text-zinc-200 flex items-center gap-2 mb-6">
            <Cpu className="w-4.5 h-4.5 text-violet-400" /> Node Worker Pool telemetry
          </h3>

          <div className="space-y-4">
            
            {/* CPU utilization */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-zinc-400">Worker Node CPU Allocation</span>
                <span className="font-mono text-zinc-300">32%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-violet-600 rounded-full" style={{ width: '32%' }} />
              </div>
            </div>

            {/* Memory utilization */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-zinc-400">Database Memory Pool</span>
                <span className="font-mono text-zinc-300">58%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '58%' }} />
              </div>
            </div>

            {/* API rate limit remaining */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-zinc-400">SLA Webhook Rate Capacity</span>
                <span className="font-mono text-zinc-300">92%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
