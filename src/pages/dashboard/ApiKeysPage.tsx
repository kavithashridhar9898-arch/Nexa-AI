import React, { useEffect, useState } from 'react';
import { 
  Key, Plus, Trash2, ShieldAlert, Check, Copy, X, 
  Lock, Calendar, HelpCircle, Eye 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string;
  created_at: string;
  last_used_at: string | null;
}

export const ApiKeysPage: React.FC = () => {
  const { apiFetch } = useAuth();
  
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Key Creation State
  const [modalOpen, setModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyScopes, setNewKeyScopes] = useState('read,write');
  
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api-keys');
      setKeys(data.keys || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch API keys.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    setError(null);

    try {
      const data = await apiFetch('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: newKeyName, scopes: newKeyScopes })
      });

      setRevealedKey(data.apiKey);
      setNewKeyName('');
      fetchKeys();
    } catch (err: any) {
      setError(err.message || 'Failed to generate API key.');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!window.confirm('Are you sure you want to revoke this API key? External applications using this key will immediately fail.')) return;
    setError(null);

    try {
      await apiFetch(`/api-keys/${id}`, { method: 'DELETE' });
      setKeys(prev => prev.filter(k => k.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to revoke key.');
    }
  };

  const handleCopy = () => {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl md:text-2xl text-white">API Keys</h2>
          <p className="text-xs text-zinc-500 mt-1">Authenticate custom external client scripts and automation nodes.</p>
        </div>
        
        <button
          onClick={() => { setRevealedKey(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs rounded-xl shadow-glow hover:shadow-glow-strong transition-all"
        >
          <Plus className="w-4 h-4" /> Create API Key
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2.5 text-xs">
          <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Secret Key Revealed Callout (Only once) */}
      {revealedKey && (
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Lock className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Secret Key Generated Successfully</h4>
          </div>
          <p className="text-[11px] text-zinc-400 max-w-xl">
            Please copy this key immediately and store it in a secure location. For security, 
            <strong> you will not be able to view it again.</strong>
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              readOnly
              value={revealedKey}
              className="flex-grow max-w-md px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-emerald-400 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-violet-400" /> Copy Key
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Keys Table Listing */}
      {isLoading ? (
        <div className="h-[200px] bg-zinc-900/40 border border-zinc-800/40 rounded-2xl animate-pulse" />
      ) : keys.length === 0 ? (
        <div className="glass-panel border border-zinc-900 rounded-3xl p-12 text-center max-w-md mx-auto">
          <Key className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="font-display font-bold text-md text-white">Generate your first API Key</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Integrate curl requests, bash nodes, webhooks, or custom software triggers directly into Nexus.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-6 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-glow"
          >
            Create Key
          </button>
        </div>
      ) : (
        <div className="glass-panel border border-zinc-900 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Key Name</th>
                  <th className="px-6 py-4">Prefix</th>
                  <th className="px-6 py-4">Scopes</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4">Last Used</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                {keys.map((k) => (
                  <tr key={k.id} className="hover:bg-zinc-900/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">{k.name}</td>
                    <td className="px-6 py-4 font-mono text-zinc-500">{k.key_prefix}••••••••</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 capitalize">
                        {k.scopes}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-500">
                      {new Date(k.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-500">
                      {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="p-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* API Documentation Quick reference */}
      <div className="glass-panel border border-zinc-900 rounded-2xl p-5 flex flex-col md:flex-row gap-5 items-start justify-between">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-violet-400" /> API Authentication Guide
          </h4>
          <p className="text-[11px] text-zinc-500 max-w-xl">
            Pass the API key in the request Authorization headers. Example curl structure shown below:
          </p>
        </div>
        <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-[10px] font-mono text-zinc-400 overflow-x-auto max-w-full leading-5">
          curl -H "Authorization: Bearer nx_live_..." http://localhost:5000/api/workflows
        </pre>
      </div>

      {/* Create Key Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative shadow-premium">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-zinc-900 rounded-md text-zinc-400"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <h3 className="font-display font-bold text-lg text-white mb-4">Create API Key</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Key Label Name</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. CLI Deploy Hook"
                  className="w-full px-4 py-2.5 mt-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-200 placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Scopes Permissions</label>
                <select
                  value={newKeyScopes}
                  onChange={(e) => setNewKeyScopes(e.target.value)}
                  className="w-full px-4 py-2.5 mt-1 bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-xl text-sm focus:outline-none text-zinc-200"
                >
                  <option value="read,write">Full Access (Read / Write)</option>
                  <option value="read">Read Only</option>
                </select>
              </div>

              <button
                type="submit"
                onClick={() => setModalOpen(false)}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-xl transition-all shadow-glow hover:shadow-glow-strong"
              >
                Generate API Key
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
