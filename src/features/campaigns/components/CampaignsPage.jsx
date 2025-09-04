import React, { useEffect, useState, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from 'dayjs/plugin/isBetween';
import DatePicker, { registerLocale } from "react-datepicker";
import es from 'date-fns/locale/es';

import { 
    getAllCampaignsMinimalAPI, 
    startCampaignAPI, 
    pauseCampaignAPI, 
    cancelCampaignAPI, 
    createCampaignAPI, 
    updateCampaignAPI, 
    duplicateCampaignAPI 
} from "../../../services/api";
import { useTheme } from "../../../contexts/ThemeContext";
import { LayoutContext } from '../../../components/layout/MainLayout';

import ContactsModal from "./ContactsModal";
import CampaignForm from "./CampaignForm";
import CampaignCard from "./CampaignCard";

import { motion, AnimatePresence } from "framer-motion";
import { 
    PlusCircleIcon, 
    MagnifyingGlassIcon, 
    BriefcaseIcon, 
    ArrowPathIcon, 
    PlayIcon, 
    CalendarDaysIcon, 
    ChartBarIcon, 
    ChevronDownIcon, 
    ChevronUpIcon, 
    InformationCircleIcon 
} from "@heroicons/react/24/outline";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
registerLocale('es', es);

const CampaignsPage = () => {
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
    }, []);
  
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
                            <CampaignCard 
                                key={campaign.id} 
                                campaign={campaign} 
                                expanded={expandedCampaign === campaign.id} 
                                onToggleExpand={toggleExpandCampaign} 
                                onStart={handleStart} 
                                onPause={handlePause} 
                                onCancel={handleCancelCampaign} 
                                onOpenContacts={openContactsModal} 
                                onEdit={handleEditClick} 
                                onDuplicate={handleDuplicateClick} 
                                isRefreshing={isRefreshingGlobal} 
                            />
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