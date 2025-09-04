import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  PlayIcon,
  PauseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const StatusBadge = ({ status }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const statusMap = {
    RUNNING: { base: "border-green-500/30 bg-green-100 text-green-700", dark: "dark:border-green-400/40 dark:bg-green-500/20 dark:text-green-300", label: "Activa", icon: <PlayIcon /> },
    PAUSED: { base: "border-yellow-500/30 bg-yellow-100 text-yellow-700", dark: "dark:border-yellow-400/40 dark:bg-yellow-500/20 dark:text-yellow-300", label: "Pausada", icon: <PauseIcon /> },
    SCHEDULED: { base: "border-blue-500/30 bg-blue-100 text-blue-700", dark: "dark:border-blue-400/40 dark:bg-blue-500/20 dark:text-blue-300", label: "Programada", icon: <CalendarDaysIcon /> },
    COMPLETED: { base: "border-slate-500/30 bg-slate-200 text-slate-700", dark: "dark:border-slate-500/40 dark:bg-slate-600/30 dark:text-slate-300", label: "Completada", icon: <CheckCircleIcon /> },
    CANCELLED: { base: "border-red-500/30 bg-red-100 text-red-700", dark: "dark:border-red-400/40 dark:bg-red-500/20 dark:text-red-300", label: "Cancelada", icon: <XCircleIcon /> },
  };

  const statusInfo = statusMap[status?.toUpperCase()] || { base: "border-slate-400/30 bg-slate-100 text-slate-600", dark: "dark:border-slate-500/40 dark:bg-slate-700/30 dark:text-slate-400", label: status || "Desconocido", icon: <InformationCircleIcon /> };
  const themeClass = isDarkMode ? statusInfo.dark : statusInfo.base;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center whitespace-nowrap w-max ${themeClass}`}>
      {React.cloneElement(statusInfo.icon, { className: "h-3.5 w-3.5 mr-1.5" })}
      {statusInfo.label}
    </span>
  );
};

export default StatusBadge;