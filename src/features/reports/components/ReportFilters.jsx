import React from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from 'date-fns/locale/es';
import { FiDownload, FiSearch, FiCalendar, FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";

registerLocale('es', es);

const ReportFilters = ({ startDate, setStartDate, endDate, setEndDate, filterStatus, setFilterStatus, onFetch, onDownload, loading, hasData }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700"
        >
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
                        onClick={onFetch}
                        disabled={loading}
                        className="px-5 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg flex items-center gap-2 transition-colors duration-150 shadow-md hover:shadow-lg disabled:opacity-60"
                    >
                        <FiSearch /> {loading ? "Consultando..." : "Consultar"}
                    </button>
                    {hasData && (
                        <button
                            onClick={onDownload}
                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-150 shadow-md hover:shadow-lg"
                        > <FiDownload /> Exportar </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ReportFilters;