import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { setSystemChannelsAPI } from '../../../services/api';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const GlobalChannelSettings = ({ totalCanales, onUpdate, cardVariants, customIndex }) => {
    const [nuevoTotal, setNuevoTotal] = useState("");
    const [loading, setLoading] = useState(false);

    const handleEstablecerTotal = async () => {
        if (!nuevoTotal || Number(nuevoTotal) < 0) {
            return toast.warning("Por favor ingrese un valor total válido y positivo.");
        }
        setLoading(true);
        try {
            await setSystemChannelsAPI(Number(nuevoTotal));
            toast.success("Total de canales del sistema actualizado exitosamente.");
            setNuevoTotal("");
            onUpdate(); 
        } catch {
            toast.error("Error al actualizar el total de canales del sistema.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            custom={customIndex}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg p-6"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent mb-2 sm:mb-0">
                    Configuración Global de Canales
                </h2>
                <div className="px-3 py-1.5 rounded-full bg-brand-accent/10 dark:bg-brand-primary/20 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Total Disponible:</span>{" "}
                    <span className="font-bold text-brand-secondary dark:text-brand-accent">
                        {totalCanales}
                    </span>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full md:w-auto">
                    <label htmlFor="nuevoTotalInput" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nuevo Total de Canales del Sistema</label>
                    <input
                        id="nuevoTotalInput"
                        type="number"
                        min="0"
                        placeholder="Ej: 100"
                        value={nuevoTotal}
                        onChange={(e) => setNuevoTotal(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                </div>
                <motion.button
                    onClick={handleEstablecerTotal}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="w-full md:w-auto px-6 py-2.5 bg-brand-primary hover:bg-brand-secondary text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? (<><ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> Actualizando...</>) : "Establecer Total"}
                </motion.button>
            </div>
        </motion.div>
    );
};

export default GlobalChannelSettings;