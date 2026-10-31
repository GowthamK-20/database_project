import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskBadge } from '../components/common/RiskBadge';
import { Currency } from '../components/common/Currency';
import { ForceGraphCanvas, GraphNode } from '../components/graph/ForceGraphCanvas';
import {
  Share2,
  AlertTriangle,
  Smartphone,
  CreditCard,
  User,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const RelationshipExplorer: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUST-004'); // Deepak Verma (Mule Suspect)
  const [graphData, setGraphData] = useState<any>(null);
  const [muleClusters, setMuleClusters] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'table'>('canvas');

  const loadData = async (custId: string) => {
    setIsLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        api.getEntityGraph(custId),
        api.getMuleClusters(),
      ]);
      setGraphData(gRes);
      setMuleClusters(cRes.clusters);
      if (gRes.nodes.length > 0) {
        setSelectedNode(gRes.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load relationship graph:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedCustomerId);
  }, [selectedCustomerId]);

  const presetSubjects = [
    { id: 'CUST-004', name: 'Deepak Verma (Flagged Mule Network)', ring: true },
    { id: 'CUST-005', name: 'Suraj Yadav (Linked Mule Ring Account)', ring: true },
    { id: 'CUST-007', name: 'Sunita Rao (Dormant Account Drainage)', ring: false },
    { id: 'CUST-001', name: 'Ananya Deshmukh (Standard Retail)', ring: false },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
              ENTITY RELATIONSHIP GRAPH
            </h1>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              GRAPH INTELLIGENCE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify organized mule rings, synthetic identity clusters, and cross-account hardware sharing.
          </p>
        </div>

        {/* PRESET SUBJECT SELECTOR */}
        <div className="flex items-center gap-2">
          <span className="text-2xs font-mono text-slate-400">SUBJECT:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="bg-veyra-900 border border-veyra-750 rounded px-2.5 py-1 text-xs font-mono text-slate-200 outline-none"
          >
            {presetSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CLUSTER DETECTION WARNING BANNER */}
      {graphData?.clusterSummary?.sharedHardwareDetected && (
        <div className="bg-red-950/40 border border-red-800/80 rounded p-3 flex items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <div>
              <span className="font-mono font-bold text-red-300">
                CRITICAL MULE RING DETECTED:
              </span>{' '}
              <span className="text-slate-200">
                Subject shares identical hardware fingerprint with 2 other newly created accounts routing funds to central VPA (karan.mule99@okaxis).
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded font-mono text-2xs bg-red-900/60 text-red-200 border border-red-700 whitespace-nowrap">
            MULE CLUSTER #401
          </span>
        </div>
      )}

      {/* GRAPH CANVAS & INSPECTOR SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* GRAPH CANVAS / TOPOLOGY MAP (8 COLS) */}
        <div className="lg:col-span-8 bg-veyra-900 border border-veyra-800/80 rounded p-4 flex flex-col min-h-0 overflow-hidden relative">
          <div className="flex flex-wrap items-center justify-between border-b border-veyra-800 pb-2 mb-3 gap-2">
            <span className="text-2xs font-mono font-bold text-slate-300 uppercase">
              TOPOLOGY VISUALIZER · {graphData?.clusterSummary?.totalEntities || 0} NODES · {graphData?.clusterSummary?.totalConnections || 0} EDGES
            </span>

            {/* MINIMAL VIEW TOGGLES */}
            <div className="flex items-center gap-1.5 font-mono text-3xs">
              <button
                onClick={() => setViewMode('canvas')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === 'canvas'
                    ? 'bg-amber-500 text-black font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-veyra-950 text-slate-300 border border-veyra-750 hover:bg-veyra-850'
                }`}
              >
                PHYSICS CANVAS (60FPS)
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-amber-500 text-black font-extrabold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-veyra-950 text-slate-300 border border-veyra-750 hover:bg-veyra-850'
                }`}
              >
                ENTITY ROSTER
              </button>
            </div>
          </div>

          {/* VIEW MODE: INTERACTIVE PHYSICS CANVAS */}
          {viewMode === 'canvas' ? (
            <div className="flex-1 min-h-[380px] w-full">
              <ForceGraphCanvas
                nodes={graphData?.nodes || []}
                links={graphData?.links || []}
                selectedNodeId={selectedNode?.id}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>
          ) : (
            /* VIEW MODE: TABULAR ENTITY NODES & EDGES */
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="text-2xs font-mono text-slate-400 uppercase tracking-wider">
                RESOLVED ENTITY NODES (CLICK TO INSPECT):
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {graphData?.nodes?.map((node: any) => {
                  const isSelected = selectedNode?.id === node.id;
                  const isMuleSuspect = node.label.includes('MULE') || node.type === 'RECIPIENT_VPA';

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : isMuleSuspect
                          ? 'border-red-900/60 bg-red-950/20 hover:border-red-700'
                          : 'border-veyra-800 bg-veyra-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xs font-mono uppercase px-1.5 py-0.5 rounded bg-veyra-850 text-slate-300">
                          {node.type}
                        </span>
                        <RiskBadge level={node.riskLevel} size="sm" />
                      </div>

                      <div className="text-xs font-semibold text-slate-100 mt-2 truncate">
                        {node.label}
                      </div>

                      <div className="text-2xs font-mono text-slate-500 mt-1 truncate">
                        ID: {node.id}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RELATIONSHIP EDGES LIST */}
              <div className="pt-4 border-t border-veyra-800">
                <div className="text-2xs font-mono text-slate-400 uppercase tracking-wider mb-2">
                  DETECTED ENTITY RELATIONSHIPS:
                </div>

                <div className="space-y-1.5 font-mono text-2xs">
                  {graphData?.links?.map((link: any, i: number) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-veyra-950/60 border border-veyra-850 flex items-center justify-between text-slate-400"
                    >
                      <span className="text-slate-300">{link.source}</span>
                      <span className={`px-2 py-0.5 rounded text-3xs font-bold ${
                        link.relationship.includes('CLUSTER') ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-veyra-850 text-slate-400'
                      }`}>
                        — [{link.relationship}] →
                      </span>
                      <span className="text-slate-300">{link.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ENTITY INSPECTOR PANEL (4 COLS) */}
        <div className="lg:col-span-4 bg-veyra-900 border border-veyra-800/80 rounded p-4 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-200 uppercase border-b border-veyra-800 pb-2 mb-3">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>NODE INSPECTOR</span>
          </div>

          {selectedNode ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-2xs font-mono text-slate-500 uppercase">{selectedNode.type}</span>
                <div className="text-sm font-bold text-slate-100">{selectedNode.label}</div>
                <RiskBadge level={selectedNode.riskLevel} size="sm" />
              </div>

              <div className="bg-veyra-950 border border-veyra-800 rounded p-3 font-mono text-2xs space-y-2">
                <div className="text-slate-500 uppercase border-b border-veyra-850 pb-1">NODE METADATA</div>
                {selectedNode.details ? (
                  Object.entries(selectedNode.details).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400 uppercase">{k}:</span>
                      <span className="text-slate-200 font-medium">{String(v)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500">No extended metadata.</div>
                )}
              </div>

              {/* KNOWN MULE RING DISCOVERY REPORT */}
              <div className="bg-veyra-950 border border-veyra-800 rounded p-3 font-mono text-2xs space-y-2">
                <div className="text-amber-400 font-bold uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>SUSPECT MULE RING CANDIDATES</span>
                </div>
                {muleClusters.map((mc) => (
                  <div key={mc.device_id} className="text-slate-300 space-y-1 pt-1 border-t border-veyra-850">
                    <div>FINGERPRINT: <strong className="text-slate-100">{mc.device_fingerprint}</strong></div>
                    <div>LINKED ACCOUNTS: <strong className="text-red-400">{mc.distinct_customer_count} DISTINCT USERS</strong></div>
                    <div>TRANSACTIONS: <strong className="text-slate-100">{mc.associated_transaction_count}</strong></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 font-mono text-xs">
              Select an entity node from the canvas to inspect its cryptographic linkages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
