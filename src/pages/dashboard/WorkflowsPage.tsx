import React, { useEffect, useState } from 'react';
import { 
  GitBranch, Plus, Trash2, ArrowLeft, Play, Save, CheckCircle2, 
  X, AlertTriangle, ExternalLink, Calendar, Webhook 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { WorkflowBuilder } from '../../components/WorkflowBuilder';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger_type: 'WEBHOOK' | 'SCHEDULE' | 'MANUAL';
  is_active: boolean;
  nodes: any[];
  edges: any[];
  created_at: string;
}

export const WorkflowsPage: React.FC = () => {
  const { apiFetch } = useAuth();
  
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Creator State
  const [modalOpen, setModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDesc, setNewFlowDesc] = useState('');
  const [newFlowTrigger, setNewFlowTrigger] = useState<'WEBHOOK' | 'SCHEDULE' | 'MANUAL'>('WEBHOOK');

  // Canvas Editor State
  const [editingFlow, setEditingFlow] = useState<Workflow | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/workflows');
      setWorkflows(data.workflows || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch workflows.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlowName) return;

    try {
      const data = await apiFetch('/workflows', {
        method: 'POST',
        body: JSON.stringify({
          name: newFlowName,
          description: newFlowDesc,
          trigger_type: newFlowTrigger,
          nodes: [
            {
              id: 'node-1',
              type: 'trigger',
              title: newFlowTrigger === 'WEBHOOK' ? 'Webhook Listener' : 'Cron Schedule',
              description: newFlowTrigger === 'WEBHOOK' ? 'Listen on POST /hooks' : 'Runs every 10 mins',
              icon: newFlowTrigger === 'WEBHOOK' ? 'Webhook' : 'Calendar',
              status: 'idle',
              x: 100,
              y: 150,
              config: newFlowTrigger === 'WEBHOOK' ? { path: '/hooks' } : { interval: '*/10 * * * *' }
            }
          ],
          edges: []
        })
      });

      setModalOpen(false);
      setNewFlowName('');
      setNewFlowDesc('');
      
      // Select newly created workflow for editing immediately
      setEditingFlow(data.workflow);
      fetchWorkflows();
    } catch (err: any) {
      setError(err.message || 'Failed to create workflow.');
    }
  };

  const handleToggleActive = async (flow: Workflow, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiFetch(`/workflows/${flow.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !flow.is_active })
      });
      
      setWorkflows(prev => 
        prev.map(w => w.id === flow.id ? { ...w, is_active: !w.is_active } : w)
      );
    } catch (err: any) {
      setError(err.message || 'Failed to toggle active state.');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;

    try {
      await apiFetch(`/workflows/${id}`, { method: 'DELETE' });
      setWorkflows(prev => prev.filter(w => w.id !== id));
      if (editingFlow?.id === id) setEditingFlow(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete workflow.');
    }
  };

  const handleSaveEditor = async (updatedNodes: any[], updatedEdges: any[]) => {
    if (!editingFlow) return;

    try {
      await apiFetch(`/workflows/${editingFlow.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nodes: updatedNodes,
          edges: updatedEdges
        })
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
      // Update local listing reference
      setWorkflows(prev =>
        prev.map(w =>
          w.id === editingFlow.id ? { ...w, nodes: updatedNodes, edges: updatedEdges } : w
        )
      );
    } catch (err: any) {
      alert(err.message || 'Failed to save workflow.');
    }
  };

  // If in Visual Canvas Editor mode
  if (editingFlow) {
    return (
      <div className="space-y-6">
        
        {/* Editor Sub-header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingFlow(null); fetchWorkflows(); }}
              className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {editingFlow.name} 
                <span className="text-[10px] font-mono font-normal bg-violet-600/10 text-violet-400 border border-violet-500/10 px-2 py-0.5 rounded-full capitalize">
                  {editingFlow.trigger_type.toLowerCase()}
                </span>
              </h2>
              <p className="text-xs text-zinc-500">{editingFlow.description || 'No description provided.'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved to DB
              </span>
            )}
            {/* Save trigger inside Editor context */}
            <button
              onClick={() => {
                // Read configurations and submit (the builder does this, but for layout we implement quick demo trigger)
                // In actual deployment, we bind this with coordinates syncing
                handleSaveEditor(editingFlow.nodes, editingFlow.edges);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 text-white text-xs font-bold rounded-xl transition-all"
            >
              <Save className="w-3.5 h-3.5 text-violet-400" /> Save Coordinates
            </button>
          </div>
        </div>

        {/* Visual Builder Canvas */}
        <div className="glass-panel border border-zinc-900 rounded-2xl p-4 md:p-6 shadow-premium-hover">
          <WorkflowBuilder />
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-white">Workflows</h2>
          <p className="text-xs text-zinc-500 mt-1">Design triggers, execution nodes, and filter pipelines.</p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-glow hover:shadow-glow-strong transition-all"
        >
          <Plus className="w-4 h-4" /> New Workflow
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Workflows List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-[180px] bg-zinc-900/40 border border-zinc-800/40 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : workflows.length === 0 ? (
        <div className="glass-panel border border-zinc-900 rounded-3xl p-12 text-center max-w-md mx-auto">
          <GitBranch className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-md text-white">Create your first workflow</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Connect nodes, process webhooks, run scripts, and automate operations in a few clicks.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-glow"
          >
            Create Flow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((flow) => (
            <div
              key={flow.id}
              onClick={() => setEditingFlow(flow)}
              className="glass-panel border border-zinc-900 rounded-2xl p-6 hover:border-violet-500/20 cursor-pointer transition-all flex flex-col justify-between h-[180px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500">
                    ID: {flow.id.slice(0, 8)}...
                  </span>
                  <button
                    onClick={(e) => handleToggleActive(flow, e)}
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
                      flow.is_active
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {flow.is_active ? 'Active' : 'Paused'}
                  </button>
                </div>

                <h3 className="text-md font-bold text-white mt-4 group-hover:text-violet-400 transition-colors">
                  {flow.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1.5 truncate">
                  {flow.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-4">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                  {flow.trigger_type === 'WEBHOOK' && <Webhook className="w-3.5 h-3.5" />}
                  {flow.trigger_type === 'SCHEDULE' && <Calendar className="w-3.5 h-3.5" />}
                  {flow.trigger_type === 'MANUAL' && <Play className="w-3.5 h-3.5" />}
                  <span className="capitalize">{flow.trigger_type.toLowerCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(flow.id, e)}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workflow Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative shadow-premium">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-900 rounded-md text-zinc-400"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="font-display font-bold text-lg text-white mb-4">Create Workflow</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Workflow Name</label>
                <input
                  type="text"
                  required
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="Sync Customers to Slack"
                  className="w-full px-4 py-2.5 mt-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-200 placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Description</label>
                <textarea
                  value={newFlowDesc}
                  onChange={(e) => setNewFlowDesc(e.target.value)}
                  placeholder="Optional brief notes..."
                  className="w-full px-4 py-2 mt-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-200 placeholder:text-zinc-600 h-20"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Trigger Source</label>
                <select
                  value={newFlowTrigger}
                  onChange={(e) => setNewFlowTrigger(e.target.value as any)}
                  className="w-full px-4 py-2.5 mt-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-200"
                >
                  <option value="WEBHOOK">HTTP Webhook Trigger</option>
                  <option value="SCHEDULE">Cron Schedule Interval</option>
                  <option value="MANUAL">Manual Console Play</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-all shadow-glow hover:shadow-glow-strong"
              >
                Create Workflow
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
