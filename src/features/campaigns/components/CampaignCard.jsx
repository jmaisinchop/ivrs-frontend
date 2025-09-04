import React from 'react';
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from '../../../contexts/ThemeContext';
import StatusBadge from './StatusBadge';
import ContactTable from './ContactTable';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  UserPlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

const CampaignCard = React.memo(({ campaign, expanded, onToggleExpand, onStart, onPause, onCancel, onOpenContacts, onEdit, onDuplicate, isRefreshing }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';

    const getProgressStatus = (campaign) => {
        if (campaign.status === "COMPLETED") return 100;
        if (campaign.status === "CANCELLED") return 0;
        const startDate = dayjs(campaign.startDate);
        const endDate = dayjs(campaign.endDate);
        const now = dayjs();
        if (!startDate.isValid() || !endDate.isValid() || now.isBefore(startDate)) return 0;
        if (now.isAfter(endDate)) return 100;
        const totalDuration = endDate.diff(startDate);
        if (totalDuration <= 0) return 50;
        const elapsedDuration = now.diff(startDate);
        return Math.max(0, Math.min(100, Math.round((elapsedDuration / totalDuration) * 100)));
      };
      
      const handleToggle = () => !isRefreshing && onToggleExpand(campaign.id);
    
      const cardHoverClass = isDarkMode ? 'dark:hover:bg-dark-700/50' : 'hover:bg-slate-50';
      const detailBgClass = isDarkMode ? 'bg-dark-700/40 border-dark-600' : 'bg-slate-50/80 border-slate-200';
      const progressBarBg = isDarkMode ? 'bg-slate-600' : 'bg-slate-200';
      let progressBarFill = isDarkMode ? 'bg-brand-accent' : 'bg-brand-primary';
      if (campaign.status === "PAUSED") progressBarFill = isDarkMode ? 'bg-yellow-400' : 'bg-yellow-500';
      if (campaign.status === "CANCELLED") progressBarFill = isDarkMode ? 'bg-red-500/70' : 'bg-red-600/80';
      if (campaign.status === "COMPLETED") progressBarFill = isDarkMode ? 'bg-slate-500' : 'bg-slate-600';
    
      const buttonBaseClass = "flex items-center px-3.5 py-2 text-xs font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dark-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out hover:shadow-md";
      const startButtonClass = `${buttonBaseClass} text-white bg-emerald-600 hover:bg-emerald-500 focus:ring-emerald-500`;
      const pauseButtonClass = `${buttonBaseClass} text-white bg-amber-500 hover:bg-amber-400 focus:ring-amber-500`;
      const cancelButtonClass = `${buttonBaseClass} text-white bg-red-600 hover:bg-red-500 focus:ring-red-500`;
      const defaultButtonClass = `${buttonBaseClass} border ${isDarkMode ? 'border-slate-600 text-slate-300 bg-slate-700 hover:bg-slate-600 focus:ring-brand-accent' : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-100 focus:ring-brand-primary'}`;

    return (
        <div className={`transition-all duration-300 ease-in-out ${isRefreshing ? 'opacity-60 cursor-wait animate-pulse' : ''} ${!expanded ? cardHoverClass : ''} rounded-lg overflow-hidden border ${isDarkMode ? 'border-dark-700' : 'border-slate-200'}`}>
            <button type="button" onClick={handleToggle} aria-expanded={expanded} className={`w-full px-5 py-4 cursor-pointer flex justify-between items-center text-left ${expanded ? (isDarkMode ? 'bg-dark-700/30' : 'bg-slate-50/50') : ''}`}>
                <div className="flex items-center space-x-4 min-w-0">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-lg font-semibold ${isDarkMode ? 'bg-brand-accent/10 text-brand-accent' : 'bg-brand-primary/10 text-brand-primary'}`}>
                    {campaign.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                    <h3 className={`text-base font-semibold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{campaign.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                    <StatusBadge status={campaign.status} />
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} hidden sm:inline-block`}>ID: <span className="font-mono">{campaign.id}</span></span>
                    </div>
                </div>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 ml-2">
                <div className="text-right hidden md:block">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{dayjs(campaign.startDate).format("DD/MM/YY HH:mm")}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Inicio Programado</p>
                </div>
                {expanded ? <ChevronUpIcon className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex-shrink-0`} /> : <ChevronDownIcon className={`h-5 w-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} flex-shrink-0`} />}
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className={`overflow-hidden px-5 py-5 ${detailBgClass} border-t`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5 mb-5 text-sm">
                    {[
                        { label: "Fecha Fin:", value: dayjs(campaign.endDate).format("DD MMM YYYY, HH:mm") },
                        { label: "Max. Intentos:", value: campaign.maxRetries },
                        { label: "Llamadas Simultáneas:", value: campaign.concurrentCalls },
                        { label: "Reintento Inmediato:", value: campaign.retryOnAnswer ? 'Activado' : 'Desactivado' }
                    ].map(detail => (
                        <div key={detail.label} className="flex justify-between items-center">
                            <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>{detail.label}</span>
                            <span className={`font-medium text-right ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{detail.value}</span>
                        </div>
                    ))}
                    <div className="sm:col-span-2 lg:col-span-3 mt-2">
                        <h4 className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-1`}>Progreso de Campaña</h4>
                        <div className={`w-full ${progressBarBg} rounded-full h-2 overflow-hidden`}><div className={`${progressBarFill} h-full rounded-full transition-all duration-500 ease-out`} style={{ width: `${getProgressStatus(campaign)}%` }} /></div>
                    </div>
                    </div>

                    <div className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Contactos de la Campaña</h4>
                    <ContactTable campId={campaign.id} />
                    </div>

                    <div className={`flex flex-wrap justify-end gap-3 pt-4 border-t ${isDarkMode ? 'border-dark-600' : 'border-slate-200'}`}>
                    <button onClick={() => onDuplicate(campaign)} disabled={isRefreshing} className={defaultButtonClass}><DocumentDuplicateIcon className="h-4 w-4 mr-1.5" />Duplicar</button>
                    <button onClick={() => onEdit(campaign)} disabled={isRefreshing} className={defaultButtonClass}><PencilSquareIcon className="h-4 w-4 mr-1.5" />Modificar</button>
                    
                    {campaign.status?.toUpperCase() === "PAUSED" && (
                        <button onClick={() => onStart(campaign.id)} disabled={isRefreshing} className={startButtonClass}><PlayIcon className="h-4 w-4 mr-1.5" />Reanudar</button>
                    )}

                    {campaign.status?.toUpperCase() === "RUNNING" && (<button onClick={() => onPause(campaign.id)} disabled={isRefreshing} className={pauseButtonClass}><PauseIcon className="h-4 w-4 mr-1.5" />Pausar</button>)}
                    {!["COMPLETED", "CANCELLED"].includes(campaign.status?.toUpperCase()) && (<button onClick={() => onCancel(campaign.id)} disabled={isRefreshing} className={cancelButtonClass}><StopIcon className="h-4 w-4 mr-1.5" />Cancelar Campaña</button>)}
                    <button onClick={() => onOpenContacts(campaign.id)} disabled={isRefreshing} className={defaultButtonClass}><UserPlusIcon className="h-4 w-4 mr-1.5" />Administrar Contactos</button>
                    </div>
                </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
});

export default CampaignCard;