import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  SampleQueryItem,
  QueryHistoryItem,
  RawQueryResponse
} from '../types';
import {
  Terminal,
  Play,
  History,
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Download,
  Copy,
  Check,
  Code2,
  FileText,
  Search,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SqlQueryLabProps {
  initialSql?: string;
  onNavigateToExplorer?: () => void;
}

export const SqlQueryLab: React.FC<SqlQueryLabProps> = ({
  initialSql,
  onNavigateToExplorer
}) => {
  // Query Editor State
  const [sql, setSql] = useState<string>(
    initialSql ||
`-- FinGuard AI Financial Analytics: High-Value Outlier Transactions
SELECT 
    t.txn_reference,
    t.amount,
    t.currency,
    t.channel,
    t.timestamp,
    c.customer_code,
    c.first_name || ' ' || c.last_name AS customer_name,
    c.risk_tier,
    ra.risk_score,
    ra.risk_level
FROM transactions t
JOIN accounts a ON t.account_id = a.id
JOIN customers c ON a.customer_id = c.id
JOIN risk_assessments ra ON t.id = ra.transaction_id
WHERE t.amount >= 100000.00
ORDER BY t.amount DESC
LIMIT 50;`
  );

  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<RawQueryResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sample Queries & History State
  const [sampleQueries, setSampleQueries] = useState<SampleQueryItem[]>([]);
  const [historyItems, setHistoryItems] = useState<QueryHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'TEMPLATES' | 'HISTORY'>('TEMPLATES');
  const [copied, setCopied] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch Sample Queries & History
  const fetchSampleQueries = async () => {
    try {
      const res = await api.getSampleQueries();
      setSampleQueries(res.queries);
    } catch (err) {
      console.error('Failed to load sample queries:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.getQueryHistory();
      setHistoryItems(res.history);
    } catch (err) {
      console.error('Failed to load query history:', err);
    }
  };

  useEffect(() => {
    fetchSampleQueries();
    fetchHistory();
  }, []);

  useEffect(() => {
    if (initialSql) {
      setSql(initialSql);
    }
  }, [initialSql]);

  // Execute Query
  const handleExecute = async (sqlToRun = sql) => {
    if (!sqlToRun.trim() || isRunning) return;

    setIsRunning(true);
    setErrorMessage(null);
    setQueryResult(null);

    try {
      const result = await api.executeRawQuery(sqlToRun);
      setQueryResult(result);
      fetchHistory(); // refresh history ring buffer
    } catch (err: any) {
      console.error('SQL Execution failed:', err);
      setErrorMessage(err.message || 'Execution failed. Review SQL syntax and constraints.');
      fetchHistory();
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter / Cmd + Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleSelectTemplate = (queryItem: SampleQueryItem) => {
    setSql(queryItem.sql);
    setErrorMessage(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleExplain = () => {
    const trimmed = sql.trim();
    if (trimmed.toUpperCase().startsWith('EXPLAIN')) {
      handleExecute(trimmed);
    } else {
      const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)\n${trimmed}`;
      setSql(explainSql);
      handleExecute(explainSql);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!queryResult || !queryResult.rows || queryResult.rows.length === 0) return;
    const cols = queryResult.columns;
    const header = cols.join(',');
    const rows = queryResult.rows.map((row) =>
      cols
        .map((col) => {
          const val = row[col];
          if (val === null || val === undefined) return '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    );
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finguard_sql_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              ANALYTICAL SQL LAB
            </h1>
            <span className="text-2xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              READ-ONLY GUARDED
            </span>
            <span className="text-2xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
              ADMIN ACCESS ONLY
            </span>
            <span className="text-2xs font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
              SAFETY CAP: 500 ROWS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Execute analytical SELECT, JOIN, GROUP BY, and EXPLAIN queries against the institutional banking database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToExplorer && (
            <button
              onClick={onNavigateToExplorer}
              className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>SCHEMA EXPLORER</span>
            </button>
          )}

          <button
            onClick={() => handleExecute()}
            disabled={isRunning || !sql.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-2xs font-mono font-bold rounded bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isRunning ? 'EXECUTING...' : 'RUN QUERY (Ctrl+Enter)'}</span>
          </button>
        </div>
      </div>

      {/* SECURITY NOTICE BANNER */}
      <div className="bg-veyra-900/80 border border-veyra-800 rounded p-3 flex items-start gap-3 text-2xs font-mono">
        <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-slate-300 space-y-1">
          <div className="text-slate-200 font-semibold flex items-center gap-2">
            <span>SECURE ANALYTICAL QUERY ENGINE</span>
            <span className="text-3xs text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/40">
              ACTIVE
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Multi-tier backend validation strictly permits <code className="text-amber-300">SELECT</code>, <code className="text-amber-300">WITH</code> (CTEs), and <code className="text-amber-300">EXPLAIN</code> operations. Destructive DDL/DML statements (<code className="text-red-400">DROP</code>, <code className="text-red-400">DELETE</code>, <code className="text-red-400">UPDATE</code>, <code className="text-red-400">ALTER</code>, <code className="text-red-400">TRUNCATE</code>) and statement chaining are automatically rejected at the API gateway.
          </p>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAB WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: QUERY TEMPLATES & HISTORY (col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3 space-y-3">
            {/* TABS HEADER */}
            <div className="grid grid-cols-2 gap-1 font-mono text-2xs border-b border-veyra-800 pb-2">
              <button
                onClick={() => setActiveTab('TEMPLATES')}
                className={`py-1.5 px-2 rounded text-center transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'TEMPLATES'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>FRAUD TEMPLATES ({sampleQueries.length})</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('HISTORY');
                  fetchHistory();
                }}
                className={`py-1.5 px-2 rounded text-center transition-colors flex items-center justify-center gap-1.5 ${
                  activeTab === 'HISTORY'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>QUERY LOGS ({historyItems.length})</span>
              </button>
            </div>

            {/* TAB CONTENT 1: FRAUD ANALYSIS TEMPLATES */}
            {activeTab === 'TEMPLATES' && (
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {sampleQueries.map((q) => (
                  <div
                    key={q.id}
                    className="p-2.5 rounded bg-veyra-950/60 border border-veyra-800 hover:border-slate-700 transition-colors space-y-1.5 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 uppercase">
                        {q.category}
                      </span>
                      <button
                        onClick={() => handleSelectTemplate(q)}
                        className="text-3xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold group-hover:underline"
                      >
                        LOAD SQL ⟶
                      </button>
                    </div>

                    <h4 className="text-xs font-mono font-bold text-slate-200">
                      {q.title}
                    </h4>

                    <p className="text-3xs text-slate-400 line-clamp-2">
                      {q.description}
                    </p>

                    <pre className="text-3xs font-mono bg-veyra-900/80 p-1.5 rounded text-slate-400 overflow-x-hidden truncate border border-veyra-800/60">
                      {q.sql.split('\n')[0]} ...
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT 2: QUERY HISTORY */}
            {activeTab === 'HISTORY' && (
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {historyItems.length === 0 ? (
                  <div className="py-8 text-center text-xs font-mono text-slate-500">
                    No executed queries in this session.
                  </div>
                ) : (
                  historyItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSql(item.sql);
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      className="p-2.5 rounded bg-veyra-950/60 border border-veyra-800 hover:border-slate-700 cursor-pointer transition-colors space-y-1.5 text-left"
                    >
                      <div className="flex items-center justify-between font-mono text-3xs">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            item.status === 'SUCCESS'
                              ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                              : 'bg-red-950/50 text-red-400 border border-red-800/40'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {item.executionMs}ms • {item.rowCount} rows
                        </span>
                      </div>

                      <pre className="text-3xs font-mono bg-veyra-900 p-1.5 rounded text-slate-300 overflow-x-hidden truncate">
                        {item.sql.replace(/\s+/g, ' ').substring(0, 80)}...
                      </pre>

                      <div className="text-3xs font-mono text-slate-500">
                        {new Date(item.executedAt).toLocaleTimeString('en-IN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SQL EDITOR & RESULT DATA GRID (col-span-8) */}
        <div className="lg:col-span-8 space-y-3">
          {/* SQL CODE EDITOR CONTAINER */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded overflow-hidden">
            {/* EDITOR CONTROLS BAR */}
            <div className="bg-veyra-850 px-3 py-2 border-b border-veyra-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-amber-400" />
                <span className="text-2xs font-mono text-slate-300 font-bold uppercase">
                  POSTGRESQL EDITOR
                </span>
                <span className="text-3xs font-mono text-slate-500">
                  UTF-8 • AUTO-LIMIT 500
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-2xs">
                <button
                  onClick={handleExplain}
                  disabled={isRunning || !sql.trim()}
                  className="px-2 py-1 rounded bg-veyra-800 hover:bg-veyra-750 border border-veyra-700 text-amber-300 transition-colors flex items-center gap-1"
                  title="Execute EXPLAIN query plan analysis"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>EXPLAIN PLAN</span>
                </button>

                <button
                  onClick={handleCopySql}
                  className="px-2 py-1 rounded bg-veyra-800 hover:bg-veyra-750 border border-veyra-700 text-slate-300 transition-colors flex items-center gap-1"
                  title="Copy SQL to Clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>

                <button
                  onClick={() => setSql('')}
                  className="px-2 py-1 rounded bg-veyra-800 hover:bg-veyra-750 border border-veyra-700 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Clear Editor"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* TEXTAREA EDITOR */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={9}
                placeholder="Write your read-only SELECT query here..."
                className="w-full bg-veyra-950 p-3.5 font-mono text-xs text-slate-100 placeholder-slate-600 resize-y outline-none leading-relaxed border-none focus:ring-1 focus:ring-amber-500/50"
                spellCheck={false}
              />
            </div>

            {/* EDITOR FOOTER */}
            <div className="bg-veyra-850/80 px-3 py-1.5 border-t border-veyra-800 flex items-center justify-between text-3xs font-mono text-slate-500">
              <div className="flex items-center gap-3">
                <span>PRESS <strong className="text-slate-300">Ctrl + Enter</strong> TO EXECUTE</span>
                <span>•</span>
                <span>ACID GUARANTEED</span>
              </div>
              <div>
                {sql.length} CHARACTERS • {sql.split('\n').length} LINES
              </div>
            </div>
          </div>

          {/* QUERY EXECUTION METRICS STRIP */}
          {queryResult && (
            <div className="bg-veyra-900 border border-veyra-800/80 rounded px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-2xs font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  QUERY COMPLETED
                </span>
                <span className="text-slate-400">
                  EXECUTION TIME: <strong className="text-slate-100">{queryResult.executionMs} ms</strong>
                </span>
                <span className="text-slate-400">
                  ROWS RETURNED: <strong className="text-slate-100">{queryResult.rowCount}</strong>
                </span>
                <span className="text-slate-400">
                  COLUMNS: <strong className="text-slate-100">{queryResult.columns.length}</strong>
                </span>
              </div>

              {queryResult.rowCount > 0 && (
                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
                >
                  <Download className="w-3 h-3 text-amber-400" />
                  <span>EXPORT CSV</span>
                </button>
              )}
            </div>
          )}

          {/* ERROR DISPLAY */}
          {errorMessage && (
            <div className="bg-red-950/30 border border-red-800/60 rounded p-4 space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>QUERY EXECUTION ERROR</span>
              </div>
              <p className="text-red-200 leading-relaxed bg-red-950/60 p-2.5 rounded border border-red-900/60">
                {errorMessage}
              </p>
              <div className="text-3xs text-red-400/80">
                * Note: FinGuard Query Lab strictly prohibits INSERT, UPDATE, DELETE, ALTER, DROP, and multi-statement execution. Verify table names in the Schema Explorer.
              </div>
            </div>
          )}

          {/* RESULTS DATA GRID */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                QUERY RESULTS
              </h3>
              {queryResult && queryResult.rowCount > 0 && (
                <span className="text-3xs font-mono text-slate-400">
                  DISPLAYING {queryResult.rowCount} ROWS
                </span>
              )}
            </div>

            <div className="border border-veyra-800/80 rounded overflow-hidden">
              <div className="max-h-[440px] overflow-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-veyra-850 border-b border-veyra-800 z-10 font-mono text-2xs uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-slate-500">#</th>
                      {queryResult?.columns?.map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-veyra-800/60 font-mono text-2xs">
                    {isRunning ? (
                      <tr>
                        <td
                          colSpan={(queryResult?.columns?.length || 1) + 1}
                          className="py-12 text-center text-slate-500"
                        >
                          <Terminal className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                          Executing PostgreSQL query...
                        </td>
                      </tr>
                    ) : !queryResult || queryResult.rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={(queryResult?.columns?.length || 1) + 1}
                          className="py-10 text-center text-slate-500"
                        >
                          {queryResult ? 'Query executed successfully with 0 rows returned.' : 'Click "RUN QUERY" to execute SQL and view results.'}
                        </td>
                      </tr>
                    ) : (
                      queryResult.rows.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className="hover:bg-veyra-850/60 text-slate-300 transition-colors"
                        >
                          <td className="py-2 px-3 text-slate-600 font-mono text-3xs">
                            {rowIdx + 1}
                          </td>
                          {queryResult.columns.map((col) => {
                            const val = row[col];
                            let cellContent: React.ReactNode = String(val);

                            if (val === null || val === undefined) {
                              cellContent = <span className="text-slate-600 italic">NULL</span>;
                            } else if (typeof val === 'boolean') {
                              cellContent = (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-3xs font-bold ${
                                    val
                                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {val ? 'TRUE' : 'FALSE'}
                                </span>
                              );
                            } else if (typeof val === 'object') {
                              cellContent = (
                                <span className="text-3xs text-slate-400 block max-w-[240px] truncate" title={JSON.stringify(val)}>
                                  {JSON.stringify(val)}
                                </span>
                              );
                            } else if (col.includes('amount') || col.includes('volume') || col.includes('spend')) {
                              cellContent = (
                                <span className="text-slate-100 font-semibold">
                                  ₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              );
                            } else if (col.includes('risk_score')) {
                              const score = Number(val);
                              cellContent = (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-3xs font-bold ${
                                    score >= 80
                                      ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                                      : score >= 60
                                      ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                                      : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
                                  }`}
                                >
                                  {score}/100
                                </span>
                              );
                            }

                            return (
                              <td key={col} className="py-2 px-3 whitespace-nowrap">
                                {cellContent}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
