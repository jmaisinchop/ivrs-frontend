import React, { useState } from "react";
import { FiBarChart2, FiTable, FiTrendingUp } from "react-icons/fi";
import { useReportData } from '../hooks/useReportData';
import ReportFilters from './ReportFilters';
import ReportSummaryCards from './ReportSummaryCards';
import ReportTable from './ReportTable';

const ReportPage = () => {
    const [viewMode, setViewMode] = useState("table"); 
    const {
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        filterStatus,
        setFilterStatus,
        loading,
        fetchData,
        downloadReport,
        allRows,
        filteredRows,
    } = useReportData();

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
                            className={`px-4 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${viewMode === item.mode ? "bg-brand-primary text-white shadow-md" : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-dark-700/70"}`}
                        >
                            <item.icon /> {item.label}
                        </button>
                    ))}
                </div>
            </header>

            <ReportFilters 
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                onFetch={fetchData}
                onDownload={downloadReport}
                loading={loading}
                hasData={allRows.length > 0}
            />

            <ReportSummaryCards allRows={allRows} filteredRows={filteredRows} />

            {viewMode === "table" && (
                <ReportTable rows={filteredRows} loading={loading} />
            )}
            
            {viewMode === "chart" && (
                <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700">
                    <div className="h-72 flex items-center justify-center text-slate-400 dark:text-slate-500 text-center p-4">
                        <div>
                            <FiBarChart2 className="mx-auto h-12 w-12 mb-2"/>
                            Área para gráficos interactivos. <br/> (Implementación futura)
                        </div>
                    </div>
                </div>
            )}

            {allRows.length > 0 && (
                <footer className="text-xs text-slate-500 dark:text-slate-400 text-center py-4 border-t border-slate-200 dark:border-dark-700 mt-4">
                    Reporte generado el {new Date().toLocaleDateString('es-EC')} a las {new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                </footer>
            )}
        </div>
    );
};

export default ReportPage;