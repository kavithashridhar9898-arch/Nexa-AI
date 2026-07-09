import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Trash2, Settings, CheckCircle2, ShieldAlert, Sparkles, Terminal, Mail, MessageSquare, Webhook, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

interface Node {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  title: string;
  description: string;
  icon: any;
  status: 'idle' | 'running' | 'success' | 'failed';
  x: number;
  y: number;
  config: Record<string, string>;
}

interface Edge {
  id: string;
  from: string;
  to: string;
}

const DEFAULT_NODES: Node[] = [
  {
    id: 'node-1',
    type: 'trigger',
    title: 'Webhook Trigger',
    description: 'Listen on POST /hooks/v1',
    icon: Webhook,
    status: 'idle',
    x: 80,
    y: 180,
    config: { url: '/api/v1/webhooks/nexus-trigger', method: 'POST' }
  },
  {
    id: 'node-2',
    type: 'action',
    title: 'AI Smart Parser',
    description: 'GPT-4 Extract intent & sentiment',
    icon: Sparkles,
    status: 'idle',
    x: 320,
    y: 180,
    config: { prompt: 'Analyze intent: {{trigger.body.text}}' }
  },
  {
    id: 'node-3',
    type: 'condition',
    title: 'Sentiment Filter',
    description: 'If sentiment is "Urgent"',
    icon: ShieldAlert,
    status: 'idle',
    x: 560,
    y: 180,
    config: { condition: 'sentiment == "urgent"' }
  },
  {
    id: 'node-4',
    type: 'action',
    title: 'Slack Notification',
    description: 'Send warning to support channel',
    icon: MessageSquare,
    status: 'idle',
    x: 800,
    y: 80,
    config: { channel: '#support-critical', message: 'Alert: User needs urgent assistance.' }
  },
  {
    id: 'node-5',
    type: 'action',
    title: 'Auto Email Responder',
    description: 'Send SLA breach notification',
    icon: Mail,
    status: 'idle',
    x: 800,
    y: 280,
    config: { template: 'urgent_escalation', recipient: '{{trigger.body.email}}' }
  }
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'edge-1', from: 'node-1', to: 'node-2' },
  { id: 'edge-2', from: 'node-2', to: 'node-3' },
  { id: 'edge-3', from: 'node-3', to: 'node-4' },
  { id: 'edge-4', from: 'node-3', to: 'node-5' }
];

export const WorkflowBuilder: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES);
  const [edges, setEdges] = useState<Edge[]>(DEFAULT_EDGES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Drag State
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    setDragNodeId(nodeId);
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragNodeId || !containerRef.current) return;
    const bounds = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    setNodes(prev =>
      prev.map(n =>
        n.id === dragNodeId
          ? {
              ...n,
              x: Math.max(10, Math.min(bounds.width - 240, mouseX - dragOffset.x)),
              y: Math.max(10, Math.min(bounds.height - 120, mouseY - dragOffset.y))
            }
          : n
      )
    );
  };

  const handleMouseUp = () => {
    setDragNodeId(null);
  };

  // Run Flow Simulation
  const runWorkflowSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    addLog('🚀 Initializing Workflow Runner...');

    // Reset status
    setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));

    const steps = [
      { nodeId: 'node-1', log: 'Webhook received. Body: { text: "System crashed", email: "support@nexa.com" }', delay: 1000 },
      { nodeId: 'node-2', log: 'AI processing input... Tagged sentiment: "Urgent", issue_type: "Crash"', delay: 2000 },
      { nodeId: 'node-3', log: 'Filtering condition check: (urgent == urgent) -> TRUE', delay: 3500 },
      { nodeId: 'node-4', log: 'Delivering Slack notification to channel #support-critical. Status 200 OK', delay: 4800 },
      { nodeId: 'node-5', log: 'Sending Escalation Email responder to support@nexa.com. Delivered.', delay: 6000 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setNodes(prev =>
          prev.map(n => (n.id === step.nodeId ? { ...n, status: 'running' } : n))
        );
        addLog(step.log);
        
        // Draw signal animation along connected lines
        const edge = edges.find(e => e.to === step.nodeId);
        if (edge) {
          const pathEl = document.getElementById(`path-${edge.id}`);
          if (pathEl) {
            gsap.fromTo(pathEl, 
              { strokeDashoffset: 100, stroke: '#c084fc', strokeWidth: 3 },
              { strokeDashoffset: 0, stroke: '#8b5cf6', strokeWidth: 2, duration: 0.8 }
            );
          }
        }

        setTimeout(() => {
          setNodes(prev =>
            prev.map(n => (n.id === step.nodeId ? { ...n, status: 'success' } : n))
          );
          if (idx === steps.length - 1) {
            addLog('✅ Workflow executed successfully (6.8s total)');
            setIsRunning(false);
          }
        }, 800);

      }, step.delay);
    });
  };

  // Connect helper: generates SVG Bezier path between nodes
  const getPathCoords = (fromId: string, toId: string) => {
    const fromNode = nodes.find(n => n.id === fromId);
    const toNode = nodes.find(n => n.id === toId);
    
    if (!fromNode || !toNode) return '';

    // Port offsets
    const fromX = fromNode.x + 220; // right middle edge
    const fromY = fromNode.y + 40;
    const toX = toNode.x; // left middle edge
    const toY = toNode.y + 40;

    const controlPoint1 = fromX + 80;
    const controlPoint2 = toX - 80;

    return `M ${fromX} ${fromY} C ${controlPoint1} ${fromY}, ${controlPoint2} ${toY}, ${toX} ${toY}`;
  };

  const deleteNode = (nodeId: string) => {
    if (readOnly) return;
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    addLog(`Deleted node: ${nodeId}`);
  };

  const addNode = (type: 'action' | 'condition') => {
    if (readOnly) return;
    const id = `node-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      title: type === 'action' ? 'Custom Action' : 'Custom Branch',
      description: type === 'action' ? 'Trigger automated task' : 'Compare workflow variables',
      icon: type === 'action' ? Sparkles : ShieldAlert,
      status: 'idle',
      x: 300,
      y: 200,
      config: type === 'action' ? { endpoint: 'https://api.thirdparty.com' } : { rule: 'value == true' }
    };

    setNodes(prev => [...prev, newNode]);
    addLog(`Added ${type} node to workspace.`);
  };

  return (
    <div className="w-full flex flex-col xl:flex-row gap-6 h-[650px] relative">
      
      {/* Visual Canvas Area */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 h-full bg-zinc-950/70 border border-zinc-800 rounded-xl relative overflow-hidden grid-bg cursor-grab active:cursor-grabbing"
      >
        {/* Controls Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!readOnly && (
            <>
              <button 
                onClick={() => addNode('action')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Action Node
              </button>
              <button 
                onClick={() => addNode('condition')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Condition
              </button>
            </>
          )}
          <button 
            onClick={runWorkflowSimulation}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-900/50 text-white text-xs font-bold rounded-lg shadow-glow hover:shadow-glow-strong transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run Test Flow
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10 text-[10px] text-zinc-500 font-mono select-none">
          Grid: Snap-to 50px | Nodes: {nodes.length}
        </div>

        {/* SVG Connectors Container */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3f3f46" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#7c3aed" />
            </marker>
          </defs>
          {edges.map(edge => {
            const isEdgeActive = nodes.find(n => n.id === edge.to)?.status === 'success';
            return (
              <path
                key={edge.id}
                id={`path-${edge.id}`}
                d={getPathCoords(edge.from, edge.to)}
                fill="none"
                stroke={isEdgeActive ? '#7c3aed' : '#27272a'}
                strokeWidth={isEdgeActive ? '2.5' : '1.5'}
                markerEnd={`url(#${isEdgeActive ? 'arrow-active' : 'arrow'})`}
                strokeDasharray={isEdgeActive ? 'none' : '4 4'}
                className="transition-colors duration-300"
              />
            );
          })}
        </svg>

        {/* Render Visual Nodes */}
        {nodes.map(node => {
          const Icon = node.icon;
          const isSelected = node.id === selectedNodeId;
          
          let statusBorder = 'border-zinc-800';
          if (node.status === 'running') statusBorder = 'border-amber-500 ring-2 ring-amber-500/20';
          if (node.status === 'success') statusBorder = 'border-violet-500 ring-2 ring-violet-500/20';
          if (isSelected) statusBorder = 'border-violet-500 bg-zinc-900';

          return (
            <div
              key={node.id}
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              className={`absolute w-[220px] glass-panel border ${statusBorder} rounded-xl p-4 cursor-grab active:cursor-grabbing select-none transition-all`}
            >
              {/* Left/Right Anchor connection ports */}
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-800 border border-zinc-700 rounded-full" />
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-zinc-800 border border-zinc-700 rounded-full" />

              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  node.type === 'trigger' ? 'bg-violet-500/10 text-violet-400' :
                  node.type === 'condition' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-100 truncate">{node.title}</h4>
                  <p className="text-[10px] text-zinc-400 truncate">{node.description}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 capitalize">
                  {node.type}
                </span>

                {node.status === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-violet-500" />
                )}
                {node.status === 'running' && (
                  <div className="w-3.5 h-3.5 border-2 border-t-transparent border-amber-500 rounded-full animate-spin" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Side Panel: Console Logs & Parameters Config */}
      <div className="w-full xl:w-[360px] flex flex-col gap-4 h-full">
        {/* Connection Console Logs */}
        <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-3">
            <Terminal className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-zinc-200">Execution Console</h3>
          </div>
          <div className="flex-1 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-1.5 pr-2">
            {logs.length === 0 ? (
              <p className="text-zinc-600 italic">No runs executed yet. Trigger a test run to inspect logs.</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="leading-5 whitespace-pre-wrap break-all border-l border-emerald-800/40 pl-2">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Node Details Configuration */}
        <div className="h-[240px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-3">
            <Settings className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-zinc-200">Node Properties</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {selectedNode ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-zinc-100">{selectedNode.title}</h4>
                  {!readOnly && selectedNode.id !== 'node-1' && (
                    <button 
                      onClick={() => deleteNode(selectedNode.id)}
                      className="text-zinc-500 hover:text-red-400 p-1 hover:bg-zinc-900 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {Object.entries(selectedNode.config).map(([key, val]) => (
                    <div key={key}>
                      <label className="text-[10px] text-zinc-400 uppercase font-mono">{key.replace('_', ' ')}</label>
                      <input
                        type="text"
                        value={val}
                        readOnly={readOnly}
                        onChange={(e) => {
                          if (readOnly) return;
                          const newVal = e.target.value;
                          setNodes(prev =>
                            prev.map(n =>
                              n.id === selectedNode.id
                                ? { ...n, config: { ...n.config, [key]: newVal } }
                                : n
                            )
                          );
                        }}
                        className="w-full mt-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 italic text-xs">
                Select a node on the canvas to configure variables.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
