import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader, FiAlertCircle } from 'react-icons/fi';

const getBadgeClasses = (status, isDark) => {
    const base = "px-2.5 py-1 rounded-full text-xs font-semibold capitalize";
    const statusMap = {
      SCHEDULED: isDark ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700",
      RUNNING: isDark ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700",
      PAUSED: isDark ? "bg-yellow-500/20 text-yellow-300" : "bg-yellow-100 text-yellow-700",
      COMPLETED: isDark ? "bg-slate-600/40 text-slate-300" : "bg-slate-200 text-slate-700",
      CANCELLED: isDark ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-700",
    };
    return `${base} ${statusMap[status?.toUpperCase()] || (isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-800")}`;
};

const ReportTable = ({ rows, loading }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Lógica simple para detectar el modo oscuro de Tailwind
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700 overflow-hidden"
        >
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-700 text-sm">
                    <thead className="bg-slate-100 dark:bg-dark-700/60 sticky top-0 z-10">
                        <tr>
                            {["Campaña", "Estado", "Inicio", "Fin", "Creador", "Total", "Éxito", "Falla", "Pend.", "% Éxito"].map((h) => (
                                <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-dark-700 bg-white dark:bg-dark-800">
                        <AnimatePresence>
                            {loading && (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <td colSpan={10} className="py-10 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                                            <FiLoader className="animate-spin h-7 w-7 text-brand-primary dark:text-brand-accent" />
                                            Cargando datos...
                                        </div>
                                    </td>
                                </motion.tr>
                            )}
                        </AnimatePresence>
                        {!loading && rows.length === 0 && (
                            <tr>
                                <td colSpan={10} className="py-10 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                                        <FiAlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
                                        <p className="font-semibold">No hay datos para mostrar</p>
                                        <p className="text-xs">Intente ajustar los filtros o el rango de fechas.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {!loading && rows.map((r) => (
                            <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout className="hover:bg-slate-50 dark:hover:bg-dark-700/70 transition-colors duration-100">
                                <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">{r.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap"><span className={getBadgeClasses(r.status, isDarkMode)}>{r.status || "N/A"}</span></td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.start}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.end}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.created_by}</td>
                                <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{r.total?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-green-600 dark:text-green-400 font-medium">{r.success?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-red-600 dark:text-red-400 font-medium">{r.failed?.toLocaleString()}</td>
                                <td className="px-4 py-3 text-yellow-600 dark:text-yellow-400 font-medium">{r.pending?.toLocaleString()}</td>
                                <td className="px-4 py-3 font-semibold">
                                    <span className={r.success_rate >= 0.5 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                                        {(r.success_rate * 100).toFixed(1)}%
                                    </span>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ReportTable;