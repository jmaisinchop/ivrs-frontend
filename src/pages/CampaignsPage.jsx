/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { LayoutContext } from '../components/MainLayout';
import ContactTable from "../components/ContactTable";
import {
  createCampaignAPI,
  getAllCampaignsMinimalAPI,
  startCampaignAPI,
  pauseCampaignAPI,
  cancelCampaignAPI,
  updateCampaignAPI,
  duplicateCampaignAPI,
} from "../services/api";
import { toast } from "react-toastify";
import ContactsModal from "./ContactsModal";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from 'dayjs/plugin/isBetween';
import DatePicker, { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";

import { motion, AnimatePresence } from "framer-motion";
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  UserPlusIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
registerLocale('es', es);

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

const CampaignForm = ({ formData, errors, loading, onInputChange, onDateChange, onSubmit, onCancel, formMode }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const baseInputClasses = "w-full p-3 rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 dark:focus:ring-offset-dark-800 focus:ring-offset-2";
  const getInputDynamicClasses = (hasError) => {
    const errorStateClasses = "border-red-500 dark:border-red-400 ring-1 ring-red-500 dark:ring-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/50 dark:focus:ring-red-400/50";
    const normalStateClasses = isDarkMode ? "border-slate-600 bg-slate-700 text-slate-100 placeholder-slate-500 focus:border-brand-accent focus:ring-brand-accent/50" : "border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-brand-primary focus:ring-brand-primary/50";
    return hasError ? errorStateClasses : normalStateClasses;
  };

  return (
    <form onSubmit={onSubmit} className={`p-6 border-t ${isDarkMode ? 'border-dark-700' : 'border-slate-200'}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="campaignName" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            Nombre de la Campaña <span className={`text-red-500 ${isDarkMode ? 'dark:text-red-400' : ''} ml-0.5`}>*</span>
          </label>
          <input id="campaignName" name="name" value={formData.name} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.name)}`} placeholder="Ej: Promoción Verano 2024" />
          {errors.name && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="campaignMessage" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Mensaje (opcional)</label>
          <input id="campaignMessage" name="message" value={formData.message} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.message)}`} placeholder="Mensaje que se reproducirá en la llamada" />
          {errors.message && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="startDate" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1.5" />Fecha de Inicio<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <DatePicker id="startDate" selected={formData.startDate} onChange={(date) => onDateChange(date, "startDate")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" className={`${baseInputClasses} ${getInputDynamicClasses(errors.startDate)}`} placeholderText="DD/MM/AAAA HH:mm" popperClassName={isDarkMode ? "react-datepicker-dark" : ""} minDate={new Date()} locale="es" wrapperClassName="w-full" />
          {errors.startDate && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.startDate}</p>}
        </div>
        <div>
          <label htmlFor="endDate" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><CalendarDaysIcon className="h-4 w-4 mr-1.5" />Fecha de Fin<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <DatePicker id="endDate" selected={formData.endDate} onChange={(date) => onDateChange(date, "endDate")} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" className={`${baseInputClasses} ${getInputDynamicClasses(errors.endDate)}`} placeholderText="DD/MM/AAAA HH:mm" popperClassName={isDarkMode ? "react-datepicker-dark" : ""} minDate={formData.startDate || new Date()} locale="es" wrapperClassName="w-full" />
          {errors.endDate && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.endDate}</p>}
        </div>
        <div>
          <label htmlFor="concurrentCalls" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1.5" />Llamadas Concurrentes<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <input id="concurrentCalls" type="number" name="concurrentCalls" min="1" max="50" value={formData.concurrentCalls} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.concurrentCalls)}`} placeholder="Ej: 10" />
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Máx. 50.</p>
          {errors.concurrentCalls && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.concurrentCalls}</p>}
        </div>
      </div>
      {/* ✅ CÓDIGO MODIFICADO: Se cambia la estructura de 2 a 3 columnas y se añade el nuevo campo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label htmlFor="maxRetries" className={`block text-sm font-medium mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
            <span className="flex items-center"><InformationCircleIcon className="h-4 w-4 mr-1.5" />Intentos Máximos<span className={`text-red-500 ml-0.5`}>*</span></span>
          </label>
          <input id="maxRetries" type="number" name="maxRetries" min="0" max="10" value={formData.maxRetries} onChange={onInputChange} className={`${baseInputClasses} ${getInputDynamicClasses(errors.maxRetries)}`} placeholder="Ej: 3" />
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Reintentos por contacto (0-10).</p>
          {errors.maxRetries && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.maxRetries}</p>}
        </div>

        <div className="md:col-span-2 flex items-center justify-start pt-5 md:pt-0">
          <label htmlFor="retryOnAnswer" className="flex items-center cursor-pointer">
            <div className="relative">
              <input 
                id="retryOnAnswer" 
                type="checkbox" 
                name="retryOnAnswer"
                checked={formData.retryOnAnswer} 
                onChange={onInputChange} 
                className="sr-only"
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${formData.retryOnAnswer ? 'bg-brand-primary' : (isDarkMode ? 'bg-slate-600' : 'bg-slate-300')}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.retryOnAnswer ? 'translate-x-6' : ''}`}></div>
            </div>
            <div className="ml-3 text-sm">
              <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                Reintento Inmediato
              </span>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Vuelve a llamar al instante si no contestan.
              </p>
            </div>
          </label>
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className={`px-6 py-2.5 border rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'border-slate-600 text-slate-300 hover:bg-slate-700 focus:ring-slate-500 focus:ring-offset-dark-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-brand-primary focus:ring-offset-white'}`}>Cancelar</button>
        <button type="submit" disabled={loading} className={`bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg text-sm font-medium flex items-center justify-center transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${isDarkMode ? 'focus:ring-brand-accent focus:ring-offset-dark-800' : 'focus:ring-brand-primary focus:ring-offset-white'}`}>
          {loading ? ( <><ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />Procesando...</> ) : (
            <>
              {formMode === 'edit' && <PencilSquareIcon className="h-5 w-5 mr-2" />}
              {formMode === 'duplicate' && <DocumentDuplicateIcon className="h-5 w-5 mr-2" />}
              {formMode === 'create' && <PlusCircleIcon className="h-5 w-5 mr-2" />}
              {formMode === 'edit' ? "Guardar Cambios" : formMode === 'duplicate' ? 'Crear Duplicado' : "Programar Campaña"}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

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
            {/* ✅ CÓDIGO MODIFICADO: Se añade el nuevo campo a la lista de detalles */}
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

const CampaignsPage = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [campaigns, setCampaigns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCampaignId, setCurrentCampaignId] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshingGlobal, setIsRefreshingGlobal] = useState(false);
  
  const initialFormData = { name: "", startDate: null, endDate: null, maxRetries: 3, concurrentCalls: 10, message: "", retryOnAnswer: false };
  const [formData, setFormData] = useState(initialFormData);
  const [loadingForm, setLoadingForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [sourceCampaign, setSourceCampaign] = useState(null);

  const [historyStartDate, setHistoryStartDate] = useState(new Date());
  const [historyEndDate, setHistoryEndDate] = useState(new Date());

  const mainContentRef = useContext(LayoutContext);

  const fetchCampaigns = useCallback(async (showToast = false) => {
    setIsRefreshingGlobal(true);
    try {
      const { data } = await getAllCampaignsMinimalAPI();
      setCampaigns(data);
      if (showToast) toast.info("Listado actualizado.");
    } catch (err) {
      toast.error("Error al cargar campañas.");
    } finally {
      setIsRefreshingGlobal(false);
    }
  }, [user]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const processedValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (date, field) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido.";
    if (!formData.startDate) newErrors.startDate = "La fecha de inicio es requerida.";
    if (!formData.endDate) { newErrors.endDate = "La fecha de fin es requerida."; }
    else if (formData.startDate && dayjs(formData.endDate).isBefore(dayjs(formData.startDate))) {
      newErrors.endDate = "La fecha de fin no puede ser anterior al inicio.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const payload = {
      name: formData.name,
      startDate: dayjs(formData.startDate).format("DD-MM-YYYY HH:mm:ss"),
      endDate: dayjs(formData.endDate).format("DD-MM-YYYY HH:mm:ss"),
      maxRetries: Number(formData.maxRetries),
      concurrentCalls: Number(formData.concurrentCalls),
      message: formData.message,
      retryOnAnswer: formData.retryOnAnswer,
    };
  
    setLoadingForm(true);
    try {
      if (formMode === 'edit') {
        await updateCampaignAPI(sourceCampaign.id, payload);
        toast.success("Campaña actualizada.");
      } else if (formMode === 'duplicate') {
        await duplicateCampaignAPI(sourceCampaign.id, payload);
        toast.success(`Campaña duplicada.`);
      } else {
        await createCampaignAPI(payload);
        toast.success("Campaña creada.");
      }
      
      handleCancelForm();
      await fetchCampaigns();
    } catch (err) {
      toast.error(err.response?.data?.message || `Error en la operación.`);
    } finally {
      setLoadingForm(false);
    }
  };
  
  const handleEditClick = (campaign) => {
    setFormMode('edit');
    setSourceCampaign(campaign);
    setFormData({
      name: campaign.name,
      startDate: new Date(campaign.startDate),
      endDate: new Date(campaign.endDate),
      maxRetries: campaign.maxRetries,
      concurrentCalls: campaign.concurrentCalls,
      message: campaign.message || "",
      retryOnAnswer: campaign.retryOnAnswer || false,
    });
    setIsFormOpen(true);
    if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDuplicateClick = (campaign) => {
    setFormMode('duplicate');
    setSourceCampaign(campaign);
    setFormData({
      name: `Copia de ${campaign.name}`,
      startDate: null,
      endDate: null,
      maxRetries: campaign.maxRetries,
      concurrentCalls: campaign.concurrentCalls,
      message: campaign.message || "",
      retryOnAnswer: campaign.retryOnAnswer || false,
    });
    setIsFormOpen(true);
    if (mainContentRef.current) mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setSourceCampaign(null);
    setFormMode('create');
    setFormData(initialFormData);
    setErrors({});
  };

  const handleApiAction = async (actionFunc, successMsg, errorMsgPrefix, campaignId) => {
    try {
      await actionFunc(campaignId);
      toast.success(successMsg);
      setTimeout(() => fetchCampaigns(), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || errorMsgPrefix);
    }
  };

  const handleStart = (id) => handleApiAction(startCampaignAPI, "Campaña reanudada.", "Error al reanudar", id);
  const handlePause = (id) => handleApiAction(pauseCampaignAPI, "Campaña pausada.", "Error al pausar", id);
  const handleCancelCampaign = (id) => {
    if (window.confirm("¿Está seguro que desea cancelar esta campaña?")) {
      handleApiAction(cancelCampaignAPI, "Campaña cancelada.", "Error al cancelar", id);
    }
  };

  const openContactsModal = (id) => { setCurrentCampaignId(id); setShowModal(true); };
  const toggleExpandCampaign = (id) => !isRefreshingGlobal && setExpandedCampaign(expandedCampaign === id ? null : id);
  
  const filteredCampaigns = campaigns
    .filter(campaign => {
      const statusUpper = campaign.status?.toUpperCase();
      if (activeTab === "active") return ["RUNNING", "PAUSED"].includes(statusUpper);
      if (activeTab === "scheduled") return statusUpper === "SCHEDULED";
      if (activeTab === "completed") return ["COMPLETED", "CANCELLED"].includes(statusUpper);
      return true;
    })
    .filter(campaign => {
      return campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (campaign.id && campaign.id.toString().includes(searchTerm));
    })
    .filter(campaign => {
      if (activeTab === 'completed') {
        if (!historyStartDate || !historyEndDate) return true;
        return dayjs(campaign.startDate).isBetween(
          dayjs(historyStartDate).startOf('day'),
          dayjs(historyEndDate).endOf('day'),
          'day',
          '[]' 
        );
      }
      return true;
    })
    .sort((a, b) => dayjs(b.startDate).diff(dayjs(a.startDate)));
  
  const tabBaseClass = "px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center transition-colors duration-150 focus:outline-none";
  const tabActiveClass = "bg-brand-primary text-white shadow-md";
  const tabInactiveClass = isDarkMode ? "bg-slate-700 text-slate-300 hover:bg-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <div className={`p-4 sm:p-6 min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-slate-50'}`}>
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-semibold flex items-center ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              <BriefcaseIcon className={`h-6 w-6 mr-2.5 ${isDarkMode ? 'text-brand-accent' : 'text-brand-primary'}`} />
              Gestión de Campañas
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <input type="search" placeholder="Buscar ID o Nombre..." aria-label="Buscar campañas" className={`pl-10 pr-4 py-2.5 w-full border rounded-lg focus:ring-2 focus:border-transparent text-sm shadow-sm ${isDarkMode ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-brand-accent' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:ring-brand-primary'}`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            </div>
            <button onClick={() => fetchCampaigns(true)} disabled={isRefreshingGlobal} title="Actualizar listado" className={`flex items-center text-sm px-3 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-60 focus:outline-none focus:ring-2 dark:focus:ring-offset-dark-800 focus:ring-offset-2 focus:ring-brand-primary shadow-sm ${isDarkMode ? 'bg-slate-700 text-brand-accent hover:bg-slate-600' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20'}`}>
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshingGlobal ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-1.5">{isRefreshingGlobal ? "Actualizando..." : "Actualizar"}</span>
            </button>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg mb-6 overflow-hidden ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-slate-200'}`}>
          <button onClick={() => isFormOpen ? handleCancelForm() : setIsFormOpen(true)} className={`w-full px-5 py-4 flex justify-between items-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset ${isDarkMode ? (isFormOpen ? 'bg-brand-accent/10 focus:ring-brand-accent/30' : 'hover:bg-dark-700/70 focus:ring-slate-600/30') : (isFormOpen ? 'bg-brand-primary/5 focus:ring-brand-primary/30' : 'hover:bg-slate-50 focus:ring-slate-300/30')}`}>
            <h2 className={`text-lg font-semibold flex items-center ${isDarkMode ? (isFormOpen ? 'text-brand-accent' : 'text-slate-200') : (isFormOpen ? 'text-brand-primary' : 'text-slate-700')}`}>
              <PlusCircleIcon className="h-6 w-6 mr-2" />
              {formMode === 'edit' ? "Modificando Campaña" : formMode === 'duplicate' ? "Duplicar Campaña" : isFormOpen ? "Ocultar Formulario" : "Crear Nueva Campaña"}
            </h2>
            {isFormOpen ? <ChevronUpIcon className={`h-6 w-6 ${isDarkMode ? 'text-brand-accent' : 'text-brand-primary'}`} /> : <ChevronDownIcon className={`h-6 w-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />}
          </button>
          <AnimatePresence>
            {isFormOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <CampaignForm formData={formData} errors={errors} loading={loadingForm} onInputChange={handleInputChange} onDateChange={handleDateChange} onSubmit={handleSubmit} onCancel={handleCancelForm} formMode={formMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`rounded-xl shadow-lg overflow-hidden ${isDarkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border border-slate-200'}`}>
          <div className={`px-5 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${isDarkMode ? 'bg-dark-800/60 border-dark-700' : 'bg-slate-50/90 border-slate-200'}`}>
            <div>
              <h2 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>Listado de Campañas</h2>
              <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {`${filteredCampaigns.length} ${filteredCampaigns.length === 1 ? "campaña encontrada" : "campañas encontradas"}`}
              </p>
            </div>
            <div className={`flex space-x-1 sm:space-x-2 p-1 rounded-lg shadow-inner ${isDarkMode ? 'bg-dark-700/50' : 'bg-slate-200'}`}>
              {[ { id: "active", label: "Activas", icon: PlayIcon }, { id: "scheduled", label: "Programadas", icon: CalendarDaysIcon }, { id: "completed", label: "Histórico", icon: ChartBarIcon } ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${tabBaseClass} ${activeTab === tab.id ? tabActiveClass : tabInactiveClass}`}>
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />{tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <AnimatePresence>
            {activeTab === 'completed' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`bg-slate-50 dark:bg-dark-800/50 border-b border-slate-200 dark:border-dark-700 overflow-hidden`}>
                <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex-shrink-0">Filtrar Histórico por Fecha de Inicio:</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <DatePicker selected={historyStartDate} onChange={(date) => setHistoryStartDate(date)} selectsStart startDate={historyStartDate} endDate={historyEndDate} dateFormat="dd/MM/yyyy" className="w-full sm:w-32 border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent outline-none" locale="es" />
                        <span className="text-slate-500">-</span>
                        <DatePicker selected={historyEndDate} onChange={(date) => setHistoryEndDate(date)} selectsEnd startDate={historyStartDate} endDate={historyEndDate} minDate={historyStartDate} dateFormat="dd/MM/yyyy" className="w-full sm:w-32 border border-slate-300 dark:border-slate-600 px-3 py-2 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-primary dark:focus:ring-brand-accent outline-none" locale="es" />
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isRefreshingGlobal && filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center"><ArrowPathIcon className={`mx-auto h-10 w-10 mb-3 animate-spin ${isDarkMode ? 'text-brand-accent' : 'text-brand-primary'}`} /><p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Actualizando listado...</p></div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="p-8 text-center"><div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${isDarkMode ? 'bg-dark-700' : 'bg-slate-100'}`}><InformationCircleIcon className={`h-8 w-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} /></div><h3 className={`text-lg font-medium mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{searchTerm ? `No hay campañas para "${searchTerm}"` : `No hay campañas en esta vista`}</h3></div>
          ) : (
            <div className={`divide-y ${isDarkMode ? 'divide-dark-700' : 'divide-slate-200'}`}>
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} expanded={expandedCampaign === campaign.id} onToggleExpand={toggleExpandCampaign} onStart={handleStart} onPause={handlePause} onCancel={handleCancelCampaign} onOpenContacts={openContactsModal} onEdit={handleEditClick} onDuplicate={handleDuplicateClick} isRefreshing={isRefreshingGlobal} />
              ))}
            </div>
          )}
        </div>
        
        {showModal && <ContactsModal campaignId={currentCampaignId} onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
};

export default CampaignsPage;