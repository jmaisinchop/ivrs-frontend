import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
    getAllWhatsappCampaignsAPI, 
    startWhatsappCampaignAPI, 
    pauseWhatsappCampaignAPI,
    cancelWhatsappCampaignAPI
} from '../../services/api';
import { ArrowPathIcon, PlusIcon, PlayIcon, PauseIcon, StopIcon } from '@heroicons/react/24/outline';
import { CreateCampaignModal } from './CreateCampaignModal';
import { ManageContactsModal } from './ManageContactsModal';

const CampaignCard = ({ campaign, onManageContacts, onAction }) => {
    const stats = campaign.stats || {};
    const total = Object.values(stats).reduce((acc, count) => acc + count, 0);
    const sent = (stats.sent || 0) + (stats.delivered || 0) + (stats.read || 0);
    const failed = stats.failed || 0;
    const progress = total > 0 ? ((sent + failed) / total) * 100 : 0;
    
    return (
    <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700 flex flex-col h-full">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-semibold text-lg text-brand-primary dark:text-brand-accent">{campaign.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                    Programada para: {new Date(campaign.sendDate).toLocaleString('es-EC')}
                </p>
                 <p className="text-xs text-slate-500">
                    {campaign.startedAt ? `Inició: ${new Date(campaign.startedAt).toLocaleString('es-EC')}` : 'Aún no ha iniciado'}
                </p>
            </div>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                campaign.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' :
                campaign.status === 'RUNNING' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                campaign.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' :
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
            }`}>
                {campaign.status}
            </span>
        </div>
        <div className="mt-3 flex-grow">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progreso ({total} contactos)</span>
                <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-dark-600 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
                <span className="text-green-600">Enviados: {sent}</span>
                <span className="text-red-600">Fallidos: {failed || 0}</span>
            </div>
        </div>
        <div className="mt-4 pt-3 border-t dark:border-dark-600 flex justify-between items-center">
            <div className="flex gap-2">
                {campaign.status === 'PAUSED' && <button onClick={() => onAction('start', campaign.id)} title="Iniciar Campaña" className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"><PlayIcon className="h-5 w-5"/></button>}
                {campaign.status === 'RUNNING' && <button onClick={() => onAction('pause', campaign.id)} title="Pausar Campaña" className="p-2 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"><PauseIcon className="h-5 w-5"/></button>}
                {(campaign.status === 'PAUSED' || campaign.status === 'RUNNING') && <button onClick={() => onAction('cancel', campaign.id)} title="Terminar Campaña" className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"><StopIcon className="h-5 w-5"/></button>}
            </div>
            <button onClick={() => onManageContacts(campaign)} className="text-sm bg-slate-200 hover:bg-slate-300 dark:bg-dark-700 dark:hover:bg-dark-600 px-3 py-1.5 rounded-md font-medium">
                Gestionar Contactos
            </button>
        </div>
    </div>
)};

export const WhatsappCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isManageModalOpen, setManageModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const fetchCampaigns = useCallback(async (showToast = false) => {
        setLoading(true);
        try {
            const { data } = await getAllWhatsappCampaignsAPI();
            setCampaigns(data);
            if (showToast) toast.info("Lista de campañas actualizada.");
        } catch (error) {
            toast.error("No se pudieron cargar las campañas de WhatsApp.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
        // Actualiza la lista de campañas periódicamente para ver el progreso
        const interval = setInterval(() => fetchCampaigns(), 15000); 
        return () => clearInterval(interval);
    }, [fetchCampaigns]);

    const handleManageContacts = (campaign) => {
        setSelectedCampaign(campaign);
        setManageModalOpen(true);
    };

    const handleAction = async (action, campaignId) => {
        const actionsMap = {
            start: { api: startWhatsappCampaignAPI, success: "Campaña iniciada." },
            pause: { api: pauseWhatsappCampaignAPI, success: "Campaña pausada." },
            cancel: { api: cancelWhatsappCampaignAPI, success: "Campaña terminada." },
        };

        if (!actionsMap[action]) return;

        if (action === 'cancel' && !window.confirm('¿Estás seguro de que quieres terminar esta campaña? No se podrá reanudar.')) {
            return;
        }

        try {
            await actionsMap[action].api(campaignId);
            toast.success(actionsMap[action].success);
            fetchCampaigns();
        } catch (error) {
            toast.error(`Error al ${action} la campaña.`);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-dark-700">
                <header className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Campañas de Envío</h2>
                    <div className="flex gap-2">
                        <button onClick={() => fetchCampaigns(true)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-dark-700" title="Refrescar">
                            <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white rounded-lg shadow-md hover:bg-brand-secondary text-sm font-medium">
                            <PlusIcon className="h-4 w-4" />
                            Crear Campaña
                        </button>
                    </div>
                </header>
                
                {loading && campaigns.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">Cargando...</div>
                ) : campaigns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} onManageContacts={handleManageContacts} onAction={handleAction} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No hay campañas creadas.</p>
                        <p className="text-xs mt-1">Haz clic en "Crear Campaña" para empezar.</p>
                    </div>
                )}
            </div>

            <CreateCampaignModal 
                show={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCampaignCreated={() => fetchCampaigns(true)}
            />
            <ManageContactsModal
                show={isManageModalOpen}
                campaign={selectedCampaign}
                onClose={() => setManageModalOpen(false)}
                onCampaignUpdated={() => fetchCampaigns(true)}
            />
        </>
    );
};