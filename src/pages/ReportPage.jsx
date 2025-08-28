import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Estilo base
import es from 'date-fns/locale/es'; // Importar locale español
registerLocale('es', es); // Registrar locale español

import { toast } from "react-toastify";
import { 
    FiDownload, FiSearch, FiBarChart2, FiCalendar, FiFilter, 
    FiTable, FiTrendingUp, FiPieChart, FiAlertCircle, FiUsers, FiActivity, FiLoader // FiLoader para el spinner
} from "react-icons/fi"; 

import {
  getCampaignSummaryAPI,
  downloadCampaignReportAPI,
} from "../services/api";

import { AuthContext } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";


/* ---------- Badge por estado (mejorado para modo oscuro) ---------- */
const getBadgeClasses = (status, isDark) => {
  const baseClasses = "px-2.5 py-1 rounded-full text-xs font-semibold capitalize";
  // Asegúrate que los nombres de status aquí coincidan EXACTAMENTE con los que vienen de tu API.
  const statusMap = {
    SCHEDULED: isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700",
    RUNNING: isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700",
    PAUSED: isDark ? "bg-yellow-500/20 text-yellow-300" : "bg-yellow-100 text-yellow-700",
    COMPLETED: isDark ? "bg-slate-600/40 text-slate-300" : "bg-slate-200 text-slate-700",
    CANCELLED: isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700",
    // Añade más estados si es necesario
  };
  return `${baseClasses} ${statusMap[status?.toUpperCase()] || (isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-800")}`;
};

const ReportPage = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext); 
  const navigate = useNavigate();

  // Detección de tema para los badges (simplificado)
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const checkDarkMode = () => {
      // Primero verifica si tu aplicación tiene una clase 'dark' en el html (típico de Tailwind)
      const hasDarkClass = document.documentElement.classList.contains('dark');
      // Luego, como fallback, verifica las preferencias del sistema
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(hasDarkClass || prefersDark);
    };

    checkDarkMode(); // Verificar al montar

    // Opcional: Escuchar cambios si no usas un ThemeContext que fuerce la clase 'dark'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener('change', handleChange);
    
    // Observador para la clase 'dark' en <html>, si tu ThemeProvider la añade/quita dinámicamente
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);


  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login");
  }, [authLoading, isAuthenticated, navigate]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rows, setRows] = useState([]);
  const [loadingData, setLoadingData] = useState(false); // Renombrado para evitar conflicto con authLoading
  const [viewMode, setViewMode] = useState("table"); 
  const [filterStatus, setFilterStatus] = useState("all");

  const isoFormat = (date) => date ? date.toISOString().slice(0, 10) : "";

  const fetchData = async () => {
    if (!startDate || !endDate) return toast.error("Por favor, seleccione un rango de fechas completo.");
    if (startDate > endDate) return toast.warn("La fecha de inicio no puede ser posterior a la fecha de fin.");
    
    setLoadingData(true);
    try {
      const { data } = await getCampaignSummaryAPI(isoFormat(startDate), isoFormat(endDate));
      setRows(data);
      if (data.length === 0) {
        toast.info("No se encontraron campañas para el rango de fechas seleccionado.");
      }
    } catch (e) {
      toast.error("Error al obtener los datos del reporte.");
    } finally {
      setLoadingData(false);
    }
  };

  const downloadReport = async () => {
    if (!startDate || !endDate) return toast.error("Seleccione un rango de fechas para descargar el reporte.");
    if (rows.length === 0) return toast.warn("No hay datos para exportar con los filtros actuales.");

    try {
      toast.info("Preparando descarga...", { autoClose: 2000 });
      const { data, headers } = await downloadCampaignReportAPI(isoFormat(startDate), isoFormat(endDate));
      const blob = new Blob([data], { type: headers['content-type'] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = (headers['content-disposition'] || '').split('filename=')[1]?.replace(/"/g, '') || `reporte_campanas_${isoFormat(startDate)}_a_${isoFormat(endDate)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Reporte descargado exitosamente.");
    } catch (err) {
      toast.error(`No se pudo descargar el reporte: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
    }
  };

  const filteredRows = filterStatus === "all" ? rows : rows.filter(r => r.status === filterStatus);
  const sum = (key) => filteredRows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
  
  const totalContacts = sum("total");
  const successfulContacts = sum("success");
  const failedContacts = sum("failed");
  const pendingContacts = sum("pending");
  const globalSuccessRate = totalContacts > 0 ? (successfulContacts / totalContacts) * 100 : 0;

  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-full mx-auto space-y-6 bg-slate-50 dark:bg-dark-900 min-h-screen transition-colors duration-300">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-brand-primary dark:text-brand-accent flex items-center gap-2">
            <FiBarChart2 className="text-brand-primary dark:text-brand-accent" />
            Reporte Gerencial de Campañas
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Visualiza y analiza el desempeño de tus campañas.</p>
        </div>
        
        <div className="flex gap-2 p-1 bg-slate-200 dark:bg-dark-800 rounded-lg shadow">
          {[{icon: FiTable, label: "Tabla", mode: "table"}, {icon: FiTrendingUp, label: "Gráficos", mode: "chart"}].map(item => (
             <button
                key={item.mode}
                onClick={() => setViewMode(item.mode)}
                className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all
                           ${viewMode === item.mode 
                             ? "bg-brand-primary text-white shadow-md" 
                             : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-dark-700/70"}`}
              > <item.icon /> {item.label}
            </button>
          ))}
        </div>
      </header>

      <motion.div {...cardAnimation} className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-grow min-w-[220px] sm:min-w-[280px]">
            <label htmlFor="date-range" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Rango de Fechas</label>
            <div className="flex gap-2 items-center">
              <FiCalendar className="text-slate-400 dark:text-slate-500 h-5 w-5 flex-shrink-0"/>
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="yyyy-MM-dd"
                className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholderText="Fecha inicio"
                locale="es"
                wrapperClassName="w-full"
              />
              <span className="text-slate-500 dark:text-slate-400">-</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="yyyy-MM-dd"
                className="w-full border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                placeholderText="Fecha fin"
                locale="es"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          <div className="flex-grow min-w-[200px] sm:min-w-[240px]">
            <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Filtrar por Estado</label>
             <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none"/>
                <select
                    id="status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-600 pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent outline-none appearance-none"
                >
                    <option value="all">Todos los Estados</option>
                    {["SCHEDULED", "RUNNING", "PAUSED", "COMPLETED", "CANCELLED"].map(status => (
                       <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</option>
                    ))}
                </select>
             </div>
          </div>

          <div className="flex gap-3 pt-3 sm:pt-0">
            <button
              onClick={fetchData}
              disabled={loadingData}
              className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg flex items-center gap-2 transition-colors duration-150 shadow-md hover:shadow-lg disabled:opacity-60"
            >
              <FiSearch /> {loadingData ? "Consultando..." : "Consultar"}
            </button>
            {rows.length > 0 && (
              <button
                onClick={downloadReport}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-150 shadow-md hover:shadow-lg"
              > <FiDownload /> Exportar </button>
            )}
          </div>
        </div>
      </motion.div>

      {rows.length > 0 && (
        <motion.div {...cardAnimation} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Campañas Filtradas", value: filteredRows.length, totalValue: rows.length, color: "bg-brand-primary dark:bg-brand-primary", icon: FiBarChart2 },
            { title: "Total Contactos", value: totalContacts.toLocaleString(), subMetrics: [ {label: "Éxito", count: successfulContacts, color: "bg-green-500 dark:bg-green-500"}, {label: "Falla", count: failedContacts, color: "bg-red-500 dark:bg-red-500"}, {label: "Pend.", count: pendingContacts, color: "bg-yellow-500 dark:bg-yellow-500"} ], icon: FiUsers },
            { title: "Tasa de Éxito Global", value: `${globalSuccessRate.toFixed(1)}%`, totalValue: 100, color: "bg-green-500 dark:bg-green-500", icon: FiActivity }
          ].map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-slate-500 dark:text-slate-400 text-sm">{item.title}</h3>
                <item.icon className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
              </div>
              <p className="text-3xl font-bold text-brand-primary dark:text-brand-accent mt-1">{item.value}</p>
              {item.totalValue && typeof item.value !== 'string' && ( // Solo mostrar barra de progreso si value es numérico
                <div className="mt-3 h-2 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value && item.totalValue ? (item.value / item.totalValue) * 100 : 0}%` }}></div>
                </div>
              )}
               {item.totalValue && typeof item.value === 'string' && parseFloat(item.value) >= 0 && ( // Para la tasa de éxito
                <div className="mt-3 h-2 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${parseFloat(item.value)}%` }}></div>
                </div>
              )}
              {item.subMetrics && totalContacts > 0 && (
                 <>
                    <div className="mt-3 flex h-2 rounded-full overflow-hidden">
                        {item.subMetrics.map(sub => (
                            <div key={sub.label} className={sub.color} style={{ width: `${(sub.count / totalContacts) * 100}%`}}></div>
                        ))}
                    </div>
                    <div className="mt-1.5 flex flex-wrap justify-between text-xs text-slate-500 dark:text-slate-400 gap-x-2">
                        {item.subMetrics.map(sub => (
                            <span key={sub.label} className="flex items-center">
                                <span className={`inline-block w-2 h-2 rounded-full mr-1 ${sub.color}`}></span>
                                {sub.label}: {sub.count.toLocaleString()}
                            </span>
                        ))}
                    </div>
                 </>
              )}
            </div>
          ))}
        </motion.div>
      )}

      {viewMode === "table" ? (
        <motion.div {...cardAnimation} className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-700 text-sm">
              <thead className="bg-slate-100 dark:bg-dark-700/60 sticky top-0 z-10">
                <tr>
                  {["Campaña", "Estado", "Inicio", "Fin", "Horario", "Creador", "Total", "Éxito", "Falla", "Pend.", "% Éxito", "Intentos", "Prom. Intentos", "Con Reintento"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap"> {h} </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-700 bg-white dark:bg-dark-800">
                <AnimatePresence>
                  {loadingData && ( // Corregido a loadingData
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={14} className="py-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                          <FiLoader className="animate-spin h-7 w-7 text-brand-primary dark:text-brand-accent" /> {/* Ícono corregido */}
                          Cargando datos...
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
                {!loadingData && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={14} className="py-10 text-center">
                       <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                           <FiAlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
                           <p className="font-semibold">No hay datos disponibles</p>
                           <p className="text-xs">Intente ajustar los filtros o el rango de fechas.</p>
                       </div>
                    </td>
                  </tr>
                )}
                {!loadingData && filteredRows.map((r) => (
                  <motion.tr 
                    key={r.id} 
                    className="hover:bg-slate-50 dark:hover:bg-dark-700/70 transition-colors duration-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout 
                  >
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><span className={getBadgeClasses(r.status, isDarkMode)}>{r.status || "N/A"}</span></td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.start_date || r.start}</td> {/* Adaptado a nombres comunes */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.end_date || r.end}</td> {/* Adaptado a nombres comunes */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.schedule_time || r.hours}</td> {/* Adaptado */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.created_by_name || r.created_by}</td> {/* Adaptado */}
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{r.total_contacts || r.total?.toLocaleString()}</td> {/* Adaptado */}
                    <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">{r.successful_contacts || r.success?.toLocaleString()}</td> {/* Adaptado */}
                    <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">{r.failed_contacts || r.failed?.toLocaleString()}</td> {/* Adaptado */}
                    <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400 font-medium">{r.pending_contacts || r.pending?.toLocaleString()}</td> {/* Adaptado */}
                    <td className="px-4 py-3 font-semibold">
                      <span className={r.success_rate >= 0.5 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                        {(r.success_rate * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.total_attempts || r.attempts}</td> {/* Adaptado */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.average_attempts || r.avg_attempts}</td> {/* Adaptado */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.contacts_with_retry || r.with_retry}</td> {/* Adaptado */}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <motion.div {...cardAnimation} className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Visualización Gráfica de Datos</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary dark:bg-brand-accent/20 dark:text-brand-accent rounded-md text-sm flex items-center gap-1.5"><FiTrendingUp /> Líneas</button>
              <button className="px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-dark-700 dark:text-slate-300 rounded-md text-sm flex items-center gap-1.5"><FiPieChart /> Barras</button>
            </div>
          </div>
          <div className="h-72 bg-slate-100 dark:bg-dark-700 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 text-center p-4">
            <div>
                <FiBarChart2 className="mx-auto h-12 w-12 mb-2"/>
                Área para gráficos interactivos. <br/> (Implementar con una librería como Chart.js, Recharts, o ApexCharts)
            </div>
          </div>
        </motion.div>
      )}

      {rows.length > 0 && (
        <footer className="text-xs text-slate-500 dark:text-slate-400 text-center py-4 border-t border-slate-200 dark:border-dark-700 mt-4">
          Reporte generado el {new Date().toLocaleDateString('es-EC')} a las {new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
        </footer>
      )}
    </div>
  );
};

export default ReportPage;