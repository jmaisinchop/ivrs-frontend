import React from 'react';
import { motion } from 'framer-motion';
import { UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const ChannelLimitsTable = ({ limites, cardVariants, customIndex }) => {

    const getProgressBarColor = (percentage) => {
        if (percentage > 85) return "bg-red-500 dark:bg-red-500";
        if (percentage > 60) return "bg-yellow-500 dark:bg-yellow-500";
        return "bg-green-500 dark:bg-green-500";
    };

    const getAvailableColor = (available, max) => {
        if (available <= 0) return "text-red-600 dark:text-red-400 font-bold";
        if (available <= Math.max(2, max * 0.1)) return "text-yellow-600 dark:text-yellow-400 font-semibold";
        return "text-green-600 dark:text-green-400";
    };

    return (
        <motion.div
            custom={customIndex}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-lg overflow-hidden"
        >
            <div className="px-6 py-5 border-b border-slate-200 dark:border-dark-700 flex items-center">
                <UsersIcon className="h-6 w-6 text-brand-primary dark:text-brand-accent mr-3 flex-shrink-0" />
                <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-accent">
                    Límites Asignados a Usuarios ({limites.length})
                </h2>
            </div>

            {limites.length === 0 ? (
                <div className="text-center py-10 px-6">
                    <ChartBarIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">No se han asignado límites de canales.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Utilice el formulario de arriba para comenzar.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-700">
                        <thead className="bg-slate-100 dark:bg-dark-700/60">
                            <tr>
                                {["Usuario", "Límite", "En Uso", "Disponibles", "Uso (%)"].map((th) => (
                                    <th key={th} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{th}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-800 divide-y divide-slate-200 dark:divide-dark-700">
                            {limites.map((l) => {
                                const percentage = l.maxChannels > 0 ? (l.usedChannels / l.maxChannels) * 100 : 0;
                                const available = l.maxChannels - l.usedChannels;

                                return (
                                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/70 transition-colors duration-100">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${l.user.role === 'ADMIN' ? 'bg-brand-primary' : l.user.role === 'SUPERVISOR' ? 'bg-brand-secondary' : 'bg-brand-accent'}`}>
                                                    {l.user.firstName?.charAt(0).toUpperCase()}{l.user.lastName?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{l.user.firstName} {l.user.lastName}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{l.user.role} - @{l.user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{l.maxChannels}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{l.usedChannels}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getAvailableColor(available, l.maxChannels)}`}>{available}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-20 sm:w-28 bg-slate-200 dark:bg-slate-600 rounded-full h-2.5 mr-2">
                                                    <div className={`h-2.5 rounded-full ${getProgressBarColor(percentage)} transition-all duration-500`} style={{ width: `${percentage > 100 ? 100 : percentage}%` }} />
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{Math.round(percentage)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </motion.div>
    );
};

export default ChannelLimitsTable;