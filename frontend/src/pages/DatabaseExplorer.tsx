import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  DatabaseTableMeta,
  DatabaseCatalogResponse,
  TableDetailResponse,
  TableColumnMeta
} from '../types';
import {
  Database,
  Table,
  Layers,
  Search,
  RefreshCw,
  Key,
  Link as LinkIcon,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Code2,
  ShieldCheck,
  AlertCircle,
  Hash,
  FileCode,
  SlidersHorizontal
} from 'lucide-react';

interface DatabaseExplorerProps {
  onNavigateToSqlLab?: (initialSql?: string) => void;
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({ onNavigateToSqlLab }) => {
  // Catalog State
  const [catalog, setCatalog] = useState<DatabaseCatalogResponse | null>(null);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);
  const [catalogFilter, setCatalogFilter] = useState<string>('');
  const [activeTabType, setActiveTabType] = useState<'ALL' | 'TABLES' | 'VIEWS'>('ALL');
  
  // Selected Table State
  const [selectedTableName, setSelectedTableName] = useState<string>('customers');
  const [activeViewMode, setActiveViewMode] = useState<'DATA' | 'SCHEMA' | 'RELATIONS'>('DATA');
  
  // Table Data & Pagination State
  const [tableData, setTableData] = useState<TableDetailResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Load Catalog
  const fetchCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const data = await api.getDatabaseTables();
      setCatalog(data);
      if (data.tables.length > 0 && !selectedTableName) {
        setSelectedTableName(data.tables[0].name);
      }
    } catch (err: any) {
      console.error('Failed to load database catalog:', err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Load Table Data when table, page, pageSize, search, or sort changes
  const fetchTableData = async (tblName: string, p = page, size = pageSize, search = searchQuery, sort = sortBy, order = sortOrder) => {
    if (!tblName) return;
    setIsLoadingData(true);
    setDataError(null);
    try {
      const data = await api.getTableDetails(tblName, {
        page: p,
        pageSize: size,
        search,
        sortBy: sort,
        sortOrder: order
      });
      setTableData(data);
    } catch (err: any) {
      console.error(`Failed to fetch table details for ${tblName}:`, err);
      setDataError(err.message || `Failed to load data for ${tblName}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (selectedTableName) {
      fetchTableData(selectedTableName, page, pageSize, searchQuery, sortBy, sortOrder);
    }
  }, [selectedTableName, page, pageSize, sortBy, sortOrder]);

  const handleTableSelect = (tblName: string) => {
    setSelectedTableName(tblName);
    setPage(1);
    setSearchQuery('');
    setSortBy('');
    setSortOrder('ASC');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTableData(selectedTableName, 1, pageSize, searchQuery, sortBy, sortOrder);
  };

  const handleSort = (columnName: string) => {
    if (sortBy === columnName) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnName);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handleOpenInSqlLab = () => {
    const sql = `SELECT * FROM ${selectedTableName} LIMIT 50;`;
    if (onNavigateToSqlLab) {
      onNavigateToSqlLab(sql);
    }
  };

  // Filter tables/views list
  const allItems: DatabaseTableMeta[] = [
    ...(catalog?.tables || []),
    ...(catalog?.views || [])
  ];

  const filteredItems = allItems.filter(item => {
    const matchesFilter = item.name.toLowerCase().includes(catalogFilter.toLowerCase());
    if (activeTabType === 'TABLES') return matchesFilter && item.type === 'BASE TABLE';
    if (activeTabType === 'VIEWS') return matchesFilter && item.type === 'VIEW';
    return matchesFilter;
  });

  const selectedTableMeta = allItems.find(i => i.name === selectedTableName);

  const totalDatabaseRows = (catalog?.tables || []).reduce((acc, t) => acc + (t.rowCount || 0), 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-veyra-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              DATABASE EXPLORER // SCHEMA & STORAGE ENGINE
            </h1>
            <span className="text-2xs font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
              {catalog?.databaseDialect || 'POSTGRESQL'}
            </span>
            <span className="text-2xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
              MODE: {catalog?.mode || 'CONNECTED'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time schema browser, relational dictionary, index statistics, and paginated data viewer backed by live PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToSqlLab && (
            <button
              onClick={() => onNavigateToSqlLab()}
              className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-blue-300 transition-colors"
            >
              <Code2 className="w-3 h-3" />
              <span>OPEN SQL LAB</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchCatalog();
              if (selectedTableName) {
                fetchTableData(selectedTableName, page, pageSize, searchQuery, sortBy, sortOrder);
              }
            }}
            disabled={isLoadingCatalog}
            className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-mono rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoadingCatalog ? 'animate-spin' : ''}`} />
            <span>SYNC SCHEMA</span>
          </button>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3">
          <div className="text-2xs font-mono text-slate-400 uppercase">BASE TABLES</div>
          <div className="text-lg font-bold font-mono text-slate-100 mt-1 flex items-baseline gap-2">
            <span>{catalog?.totalTables ?? '—'}</span>
            <span className="text-2xs text-slate-500 font-normal">Physical Relations</span>
          </div>
        </div>

        <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3">
          <div className="text-2xs font-mono text-slate-400 uppercase">ANALYTICAL VIEWS</div>
          <div className="text-lg font-bold font-mono text-blue-400 mt-1 flex items-baseline gap-2">
            <span>{catalog?.totalViews ?? '—'}</span>
            <span className="text-2xs text-slate-500 font-normal">Virtual Projections</span>
          </div>
        </div>

        <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3">
          <div className="text-2xs font-mono text-slate-400 uppercase">TOTAL SYSTEM RECORDS</div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1 flex items-baseline gap-2">
            <span>{totalDatabaseRows.toLocaleString()}</span>
            <span className="text-2xs text-slate-500 font-normal">Indexed Rows</span>
          </div>
        </div>

        <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3">
          <div className="text-2xs font-mono text-slate-400 uppercase">STORAGE INTEGRITY</div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1 flex items-baseline gap-2">
            <span className="flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ACID ENFORCED
            </span>
            <span className="text-2xs text-slate-500 font-normal">FK Cascades</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: TABLE CATALOG (col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
                SCHEMA CATALOG
              </span>
              <span className="text-3xs font-mono bg-veyra-800 text-slate-300 px-1.5 py-0.5 rounded">
                {filteredItems.length} ITEMS
              </span>
            </div>

            {/* SEARCH TABLE FILTER */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter tables & views..."
                value={catalogFilter}
                onChange={(e) => setCatalogFilter(e.target.value)}
                className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-blue-500 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
              />
            </div>

            {/* FILTER BUTTONS */}
            <div className="grid grid-cols-3 gap-1 pt-1 font-mono text-2xs">
              <button
                onClick={() => setActiveTabType('ALL')}
                className={`py-1 rounded text-center transition-colors ${
                  activeTabType === 'ALL'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'bg-veyra-950 text-slate-400 hover:text-slate-200 border border-veyra-800'
                }`}
              >
                ALL ({allItems.length})
              </button>
              <button
                onClick={() => setActiveTabType('TABLES')}
                className={`py-1 rounded text-center transition-colors ${
                  activeTabType === 'TABLES'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'bg-veyra-950 text-slate-400 hover:text-slate-200 border border-veyra-800'
                }`}
              >
                TABLES ({catalog?.tables.length || 0})
              </button>
              <button
                onClick={() => setActiveTabType('VIEWS')}
                className={`py-1 rounded text-center transition-colors ${
                  activeTabType === 'VIEWS'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'bg-veyra-950 text-slate-400 hover:text-slate-200 border border-veyra-800'
                }`}
              >
                VIEWS ({catalog?.views.length || 0})
              </button>
            </div>

            {/* TABLE ITEMS LIST */}
            <div className="space-y-1 max-h-[560px] overflow-y-auto pr-1">
              {isLoadingCatalog ? (
                <div className="py-8 text-center text-xs font-mono text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-slate-400" />
                  Loading PostgreSQL catalog...
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 font-mono">
                  No tables match filter.
                </div>
              ) : (
                filteredItems.map((tbl) => {
                  const isSelected = selectedTableName === tbl.name;
                  const isView = tbl.type === 'VIEW';

                  return (
                    <button
                      key={tbl.name}
                      onClick={() => handleTableSelect(tbl.name)}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between border ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-200 border-blue-500/50 shadow-sm'
                          : 'bg-veyra-950/60 hover:bg-veyra-850/80 text-slate-300 border-veyra-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {isView ? (
                          <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Table className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        )}
                        <span className="font-mono text-xs font-medium truncate">
                          {tbl.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {tbl.primaryKeys && tbl.primaryKeys.length > 0 && (
                          <span title={`PK: ${tbl.primaryKeys.join(', ')}`}>
                            <Key className="w-2.5 h-2.5 text-amber-400" />
                          </span>
                        )}
                        <span className="text-3xs font-mono bg-veyra-800/90 text-slate-400 px-1.5 py-0.5 rounded border border-veyra-750">
                          {tbl.rowCount.toLocaleString()}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TABLE DETAIL, SCHEMA & DATA GRID (col-span-8) */}
        <div className="lg:col-span-8 space-y-3">
          {/* TABLE HEADER CARD */}
          <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-veyra-850 border border-veyra-750 text-blue-400">
                  {selectedTableMeta?.type === 'VIEW' ? (
                    <Layers className="w-5 h-5" />
                  ) : (
                    <Table className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-100">
                      public.{selectedTableName}
                    </span>
                    <span className="text-3xs font-mono px-1.5 py-0.5 rounded bg-veyra-800 text-slate-300 uppercase">
                      {selectedTableMeta?.type || 'BASE TABLE'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-2xs font-mono text-slate-400 mt-1">
                    <span>
                      TOTAL ROWS:{' '}
                      <strong className="text-slate-200">
                        {tableData?.pagination?.totalRows ?? selectedTableMeta?.rowCount ?? 0}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      COLUMNS:{' '}
                      <strong className="text-slate-200">
                        {tableData?.columns?.length ?? selectedTableMeta?.columnCount ?? 0}
                      </strong>
                    </span>
                    {tableData?.primaryKeys && tableData.primaryKeys.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-amber-400">
                          <Key className="w-3 h-3" />
                          PK: {tableData.primaryKeys.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION: OPEN IN SQL LAB */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenInSqlLab}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-2xs font-mono bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>QUERY TABLE IN SQL LAB</span>
                </button>
              </div>
            </div>

            {/* VIEW MODE TABS */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-veyra-800 font-mono text-2xs">
              <button
                onClick={() => setActiveViewMode('DATA')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  activeViewMode === 'DATA'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>PAGINATED DATA GRID</span>
              </button>

              <button
                onClick={() => setActiveViewMode('SCHEMA')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  activeViewMode === 'SCHEMA'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>SCHEMA DICTIONARY ({tableData?.columns?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveViewMode('RELATIONS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  activeViewMode === 'RELATIONS'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>FOREIGN KEYS ({tableData?.foreignKeys?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: PAGINATED DATA GRID */}
          {activeViewMode === 'DATA' && (
            <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3 space-y-3">
              {/* SEARCH & CONTROLS BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search across text fields..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-veyra-950 border border-veyra-750/70 focus:border-blue-500 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none font-mono"
                  />
                </form>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-2 text-2xs font-mono text-slate-400">
                    <span>ROWS PER PAGE:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="bg-veyra-950 border border-veyra-750 rounded px-2 py-1 text-xs text-slate-200 font-mono outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <button
                    onClick={() => fetchTableData(selectedTableName, page, pageSize, searchQuery, sortBy, sortOrder)}
                    className="p-1.5 rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 text-slate-300"
                    title="Refresh Table Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* DATA GRID TABLE */}
              {dataError ? (
                <div className="p-4 rounded bg-red-950/20 border border-red-800/40 text-red-300 font-mono text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{dataError}</span>
                </div>
              ) : (
                <div className="border border-veyra-800/80 rounded overflow-hidden">
                  <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-veyra-850 border-b border-veyra-800 z-10 font-mono text-2xs uppercase text-slate-400">
                        <tr>
                          {tableData?.columns?.map((col) => {
                            const isSorted = sortBy === col.column_name;
                            return (
                              <th
                                key={col.column_name}
                                onClick={() => handleSort(col.column_name)}
                                className="py-2.5 px-3 cursor-pointer hover:bg-veyra-800/60 transition-colors select-none whitespace-nowrap"
                              >
                                <div className="flex items-center gap-1.5">
                                  {col.isPrimaryKey && (
                                    <span title="Primary Key">
                                      <Key className="w-2.5 h-2.5 text-amber-400" />
                                    </span>
                                  )}
                                  {col.foreignKey && (
                                    <span title={`FK -> ${col.foreignKey.foreign_table}.${col.foreignKey.foreign_column}`}>
                                      <LinkIcon className="w-2.5 h-2.5 text-blue-400" />
                                    </span>
                                  )}
                                  <span className={col.isPrimaryKey ? 'text-amber-200 font-bold' : ''}>
                                    {col.column_name}
                                  </span>
                                  <ArrowUpDown className={`w-2.5 h-2.5 ${isSorted ? 'text-blue-400' : 'text-slate-600'}`} />
                                </div>
                                <div className="text-3xs text-slate-500 font-normal lowercase tracking-normal">
                                  {col.data_type}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-veyra-800/60 font-mono text-2xs">
                        {isLoadingData ? (
                          <tr>
                            <td
                              colSpan={tableData?.columns?.length || 1}
                              className="py-12 text-center text-slate-500"
                            >
                              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-400" />
                              Querying table data...
                            </td>
                          </tr>
                        ) : !tableData?.rows || tableData.rows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={tableData?.columns?.length || 1}
                              className="py-8 text-center text-slate-500"
                            >
                              No records found for the current query filter.
                            </td>
                          </tr>
                        ) : (
                          tableData.rows.map((row, rowIdx) => (
                            <tr
                              key={rowIdx}
                              className="hover:bg-veyra-850/60 text-slate-300 transition-colors"
                            >
                              {tableData.columns.map((col) => {
                                const val = row[col.column_name];
                                let renderedVal: React.ReactNode = String(val);

                                if (val === null || val === undefined) {
                                  renderedVal = <span className="text-slate-600 italic">NULL</span>;
                                } else if (typeof val === 'boolean') {
                                  renderedVal = (
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
                                  renderedVal = (
                                    <span className="text-3xs text-slate-400 truncate block max-w-[200px]" title={JSON.stringify(val)}>
                                      {JSON.stringify(val)}
                                    </span>
                                  );
                                } else if (col.column_name.includes('timestamp') || col.column_name.includes('_at')) {
                                  renderedVal = (
                                    <span className="text-slate-400 whitespace-nowrap">
                                      {new Date(val).toLocaleString('en-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                      })}
                                    </span>
                                  );
                                } else if (col.column_name.includes('amount') || col.column_name.includes('balance')) {
                                  renderedVal = (
                                    <span className="text-slate-100 font-semibold">
                                      ₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  );
                                }

                                return (
                                  <td
                                    key={col.column_name}
                                    className={`py-2 px-3 whitespace-nowrap ${
                                      col.isPrimaryKey ? 'bg-amber-950/10 text-amber-200' : ''
                                    }`}
                                  >
                                    {renderedVal}
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
              )}

              {/* PAGINATION CONTROLS */}
              {tableData && tableData.pagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-2xs font-mono text-slate-400 border-t border-veyra-800">
                  <div>
                    SHOWING{' '}
                    <strong className="text-slate-200">
                      {Math.min((page - 1) * pageSize + 1, tableData.pagination.totalRows)}
                    </strong>{' '}
                    TO{' '}
                    <strong className="text-slate-200">
                      {Math.min(page * pageSize, tableData.pagination.totalRows)}
                    </strong>{' '}
                    OF <strong className="text-slate-200">{tableData.pagination.totalRows}</strong> ROWS
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1 || isLoadingData}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>PREV</span>
                    </button>

                    <span className="px-2 py-1 text-slate-300 font-bold">
                      PAGE {page} OF {Math.max(1, tableData.pagination.totalPages)}
                    </span>

                    <button
                      onClick={() => setPage(Math.min(tableData.pagination.totalPages, page + 1))}
                      disabled={page >= tableData.pagination.totalPages || isLoadingData}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-veyra-850 hover:bg-veyra-800 border border-veyra-750 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
                    >
                      <span>NEXT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW MODE 2: SCHEMA DICTIONARY */}
          {activeViewMode === 'SCHEMA' && (
            <div className="bg-veyra-900 border border-veyra-800/80 rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
                  COLUMN SPECIFICATIONS & CONSTRAINTS
                </h3>
                <span className="text-2xs font-mono text-slate-400">
                  {tableData?.columns?.length || 0} TOTAL ATTRIBUTES
                </span>
              </div>

              <div className="border border-veyra-800/80 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-veyra-850 border-b border-veyra-800 font-mono text-2xs uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">COLUMN NAME</th>
                      <th className="py-2.5 px-3">DATA TYPE</th>
                      <th className="py-2.5 px-3">NULLABLE</th>
                      <th className="py-2.5 px-3">DEFAULT</th>
                      <th className="py-2.5 px-3">KEY CONSTRAINT</th>
                      <th className="py-2.5 px-3">RELATIONSHIP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-veyra-800/60 font-mono text-2xs">
                    {tableData?.columns?.map((col) => (
                      <tr key={col.column_name} className="hover:bg-veyra-850/60 text-slate-300">
                        <td className="py-2.5 px-3 font-bold text-slate-200 flex items-center gap-1.5">
                          {col.isPrimaryKey ? (
                            <Key className="w-3 h-3 text-amber-400" />
                          ) : (
                            <Hash className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{col.column_name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-blue-300 font-mono">
                          {col.data_type}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-3xs ${
                              col.is_nullable === 'NO'
                                ? 'bg-red-950/40 text-red-400 border border-red-800/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {col.is_nullable === 'NO' ? 'NOT NULL' : 'NULLABLE'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-3xs font-mono">
                          {col.column_default || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          {col.isPrimaryKey ? (
                            <span className="px-1.5 py-0.5 rounded text-3xs bg-amber-950/40 text-amber-300 border border-amber-800/40 font-bold">
                              PRIMARY KEY
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          {col.foreignKey ? (
                            <span className="flex items-center gap-1 text-blue-400 text-3xs bg-blue-950/40 px-2 py-0.5 rounded border border-blue-800/40">
                              <LinkIcon className="w-2.5 h-2.5" />
                              REFERENCES {col.foreignKey.foreign_table}({col.foreignKey.foreign_column})
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 3: FOREIGN KEYS & RELATIONAL GRAPH */}
          {activeViewMode === 'RELATIONS' && (
            <div className="bg-veyra-900 border border-veyra-800/80 rounded p-4 space-y-4">
              <div className="border-b border-veyra-800 pb-3">
                <h3 className="text-xs font-bold font-mono text-slate-100 uppercase flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-400" />
                  RELATIONAL INTEGRITY & FOREIGN KEY MAPPING
                </h3>
                <p className="text-2xs text-slate-400 mt-1">
                  Foreign key constraints linking <code className="text-blue-300 font-mono">public.{selectedTableName}</code> to parent/child entities in the financial database.
                </p>
              </div>

              {tableData?.foreignKeys && tableData.foreignKeys.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tableData.foreignKeys.map((fk, idx) => (
                    <div
                      key={idx}
                      className="bg-veyra-950 border border-veyra-800 rounded p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between text-2xs font-mono">
                        <span className="text-amber-400 font-bold">CONSTRAINT #{idx + 1}</span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 text-3xs">
                          CASCADE RESTRICTED
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <div className="bg-veyra-900 border border-veyra-750 rounded px-2 py-1 text-slate-200">
                          {selectedTableName}.{fk.column_name}
                        </div>
                        <span className="text-slate-500 font-bold">⟶</span>
                        <div className="bg-blue-950/40 border border-blue-800/50 rounded px-2 py-1 text-blue-300">
                          {fk.foreign_table}.{fk.foreign_column}
                        </div>
                      </div>

                      <div className="text-3xs text-slate-400 pt-1">
                        Ensures referential validity between {selectedTableName} and parent table{' '}
                        <button
                          onClick={() => handleTableSelect(fk.foreign_table)}
                          className="text-blue-400 underline hover:text-blue-300"
                        >
                          {fk.foreign_table}
                        </button>
                        .
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-slate-500 bg-veyra-950/40 rounded border border-veyra-800/60">
                  No outbound foreign key constraints defined for this entity.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
