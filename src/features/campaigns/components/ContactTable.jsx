import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { getContactsLiveAPI, getContactsPagesAPI } from "../../../services/api";
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from "@heroicons/react/20/solid";

const LIMIT = 50;

const statusPillMap = {
  ALL: { base: "border-slate-500/30 bg-slate-500/10 text-slate-600", dark: "dark:border-slate-500/40 dark:bg-slate-500/20 dark:text-slate-300", label: "Todos"},
  CALLING: { base: "border-blue-500/30 bg-blue-500/10 text-blue-600", dark: "dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-300", label: "Llamando"},
  SUCCESS: { base: "border-green-500/30 bg-green-500/10 text-green-600", dark: "dark:border-green-500/40 dark:bg-green-500/20 dark:text-green-300", label: "Éxito"},
  FAILED: { base: "border-red-500/30 bg-red-500/10 text-red-600", dark: "dark:border-red-500/40 dark:bg-red-500/20 dark:text-red-300", label: "Fallido"},
  PENDING: { base: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600", dark: "dark:border-yellow-500/40 dark:bg-yellow-500/20 dark:text-yellow-300", label: "Pendiente"},
  NOT_CALLED: { base: "border-gray-500/30 bg-gray-500/10 text-gray-600", dark: "dark:border-gray-500/40 dark:bg-gray-500/20 dark:text-gray-300", label: "No Llamado"},
};

const StatePill = ({ statusKey }) => {
  const pillInfo = statusPillMap[statusKey?.toUpperCase()] || statusPillMap.PENDING;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border inline-block ${pillInfo.base} ${pillInfo.dark}`}>
      {pillInfo.label}
    </span>
  );
};

const ContactTable = ({ campId }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const firstLoad = useRef(true);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!campId) return;
      try {
        const { data } = await getContactsPagesAPI(campId, statusFilter, LIMIT);
        if (mounted) {
          setPages(data);
          if (page > data && data > 0) setPage(data);
          else if (data === 0 && page !== 1) setPage(1);
        }
      } catch (err) { console.error("Error fetching contact pages:", err); if(mounted) setPages(1); }
    };
    run();
    return () => { mounted = false; };
  }, [campId, statusFilter, page]);

  useEffect(() => {
    let mounted = true;
    const fetchRows = async () => {
      if (!campId) return;
      setLoading(true); setError(null);
      try {
        const { data } = await getContactsLiveAPI(campId, statusFilter, LIMIT, page);
        if (mounted) setRows(data.rows || []);
      } catch (err) {
        console.error("Error fetching live contacts:", err);
        if (mounted) { setRows([]); setError("No se pudieron cargar los contactos.");}
      } finally {
        if (mounted) {
          setLoading(false);
          if (firstLoad.current) firstLoad.current = false;
          if (tableContainerRef.current) tableContainerRef.current.scrollTop = 0;
        }
      }
    };

    fetchRows();
    const intervalId = setInterval(fetchRows, 2500);
    return () => { mounted = false; clearInterval(intervalId); };
  }, [campId, statusFilter, page]);
  
  const filterButtonBase = "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-800 focus:ring-brand-primary";
  const filterButtonActive = "bg-brand-primary text-white shadow-sm";
  const filterButtonInactive = isDarkMode 
    ? "bg-dark-600 text-slate-300 hover:bg-dark-500" 
    : "bg-slate-200 text-slate-700 hover:bg-slate-300";
  
  const paginationButtonClass = `p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 dark:focus:ring-offset-dark-800 focus:ring-brand-primary ${isDarkMode ? 'bg-dark-600 hover:bg-dark-500 text-slate-300 disabled:text-slate-500' : 'bg-slate-200 hover:bg-slate-300 text-slate-700 disabled:text-slate-400'}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.keys(statusPillMap).map((sKey) => (
          <button key={sKey} onClick={() => { setStatusFilter(sKey); setPage(1); }}
            className={`${filterButtonBase} ${statusFilter === sKey ? filterButtonActive : filterButtonInactive}`}>
            {statusPillMap[sKey].label}
          </button>
        ))}
      </div>

      <div ref={tableContainerRef} className={`relative overflow-auto max-h-96 border rounded-lg shadow-sm ${isDarkMode ? 'border-dark-600' : 'border-slate-200'}`}>
        <table className={`min-w-full divide-y text-sm ${isDarkMode ? 'divide-dark-600' : 'divide-slate-200'}`}>
          <thead className={`${isDarkMode ? 'bg-dark-700/60 backdrop-blur-sm' : 'bg-slate-50/80 backdrop-blur-sm'} sticky top-0 z-10`}>
            <tr>
              {["Teléfono", "Nombre", "Estado", "Intentos"].map(header => (
                <th key={header} scope="col" className={`px-4 py-3 text-left font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} uppercase tracking-wider`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'bg-dark-800 divide-dark-700' : 'bg-white divide-slate-100'}`}>
            {firstLoad.current && loading && (
              <tr><td colSpan={4} className={`px-4 py-10 text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cargando contactos iniciales...</td></tr>
            )}
            {!firstLoad.current && error && (
              <tr><td colSpan={4} className={`px-4 py-10 text-center text-red-500 dark:text-red-400`}>{error}</td></tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr><td colSpan={4} className={`px-4 py-10 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>No hay contactos para mostrar.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className={`transition-colors duration-100 ${isDarkMode ? 'hover:bg-dark-700/70' : 'hover:bg-slate-50/70'}`}>
                <td className={`px-4 py-2.5 font-medium whitespace-nowrap ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{r.phone}</td>
                <td className={`px-4 py-2.5 truncate whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{r.name || "-"}</td>
                <td className="px-4 py-2.5 whitespace-nowrap"><StatePill statusKey={r.callStatus || "PENDING"} /></td>
                <td className={`px-4 py-2.5 text-center whitespace-nowrap ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{r.attemptCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && !firstLoad.current && (
             <div className={`absolute inset-0 flex items-center justify-center text-xs transition-opacity duration-300 ${isDarkMode ? 'bg-dark-800/80 text-slate-300' : 'bg-white/80 text-slate-600'}`}>
            <ArrowPathIcon className="h-4 w-4 animate-spin mr-2"/> Actualizando...
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading} className={paginationButtonClass}>
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Anterior</span>
          </button>
          <span className={`text-sm tabular-nums ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Página {page} de {pages}
          </span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages || loading} className={paginationButtonClass}>
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Siguiente</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactTable;