import React from 'react';
import { motion } from 'framer-motion';
import { FiBarChart2, FiUsers, FiActivity } from "react-icons/fi";

const ReportSummaryCards = ({ allRows, filteredRows }) => {
    
    // Función para sumar una propiedad específica de las filas filtradas
    const sum = (key) => filteredRows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
  
    // Cálculos para las métricas de resumen
    const totalContacts = sum("total");
    const successfulContacts = sum("success");
    const failedContacts = sum("failed");
    const pendingContacts = sum("pending");
    const globalSuccessRate = totalContacts > 0 ? (successfulContacts / totalContacts) * 100 : 0;

    // Animaciones para las tarjetas
    const cardAnimation = {
        initial: { opacity: 0, y: 20 },
        animate: { 
            opacity: 1, 
            y: 0, 
            transition: { 
                duration: 0.4, 
                ease: "easeOut", 
                staggerChildren: 0.1 // Anima las tarjetas hijas una tras otra
            } 
        },
    };

    const cardItemAnimation = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
    };

    // Datos para renderizar las tarjetas de forma dinámica
    const summaryData = [
        { 
            title: "Campañas Filtradas", 
            value: filteredRows.length, 
            totalValue: allRows.length, 
            color: "bg-brand-primary dark:bg-brand-primary", 
            icon: FiBarChart2 
        },
        { 
            title: "Total Contactos", 
            value: totalContacts.toLocaleString(), 
            subMetrics: [ 
                {label: "Éxito", count: successfulContacts, color: "bg-green-500 dark:bg-green-500"}, 
                {label: "Falla", count: failedContacts, color: "bg-red-500 dark:bg-red-500"}, 
                {label: "Pend.", count: pendingContacts, color: "bg-yellow-500 dark:bg-yellow-500"} 
            ], 
            icon: FiUsers 
        },
        { 
            title: "Tasa de Éxito Global", 
            value: `${globalSuccessRate.toFixed(1)}%`, 
            totalValue: 100, 
            color: "bg-green-500 dark:bg-green-500", 
            icon: FiActivity 
        }
    ];

    // No renderizar nada si no hay datos iniciales
    if (allRows.length === 0) {
        return null;
    }

    return (
        <motion.div 
            variants={cardAnimation} 
            initial="initial" 
            animate="animate" 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
            {summaryData.map((item, idx) => (
                <motion.div 
                    key={idx} 
                    variants={cardItemAnimation} 
                    className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700"
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium text-slate-500 dark:text-slate-400 text-sm">{item.title}</h3>
                        <item.icon className="h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0"/>
                    </div>
                    <p className="text-3xl font-bold text-brand-primary dark:text-brand-accent mt-1">{item.value}</p>
                    
                    {/* Barra de Progreso para Campañas y Tasa de Éxito */}
                    {item.totalValue && typeof item.value === 'number' && (
                        <div className="mt-3 h-2 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value && item.totalValue ? (item.value / item.totalValue) * 100 : 0}%` }}></div>
                        </div>
                    )}
                    {item.totalValue && typeof item.value === 'string' && parseFloat(item.value) >= 0 && (
                        <div className="mt-3 h-2 bg-slate-200 dark:bg-dark-600 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${parseFloat(item.value)}%` }}></div>
                        </div>
                    )}

                    {/* Barra de Progreso Segmentada para Total de Contactos */}
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
                </motion.div>
            ))}
        </motion.div>
    );
};

export default ReportSummaryCards;