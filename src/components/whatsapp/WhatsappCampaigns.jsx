import React, { useState, useEffect, useContext } from 'react';
import  api  from '../../services/api';
import { AuthContext } from '../../contexts/AuthContext';
import { PlusIcon, EyeIcon, PlayIcon, PauseIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';


import CreateCampaignModal from './CreateCampaignModal';
import CampaignDetailsModal from './CampaignDetailsModal';

const WhatsappCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    // Estados para controlar los modales (los implementaremos después)
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await api.get('/whatsapp-campaigns');
            setCampaigns(response.data);
        } catch (error) {
            toast.error("No se pudieron cargar las campañas de WhatsApp.");
            console.error("Error al cargar campañas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleAction = async (campaignId, action) => {
        try {
            await api.post(`/whatsapp-campaigns/${campaignId}/${action}`);
            let actionText = '';
            if (action === 'start') actionText = 'iniciada';
            if (action === 'pause') actionText = 'pausada';
            if (action === 'cancel') actionText = 'cancelada';

            toast.success(`Campaña ${actionText} con éxito.`);
            fetchCampaigns(); // Recargar la lista para ver el cambio de estado
        } catch (error) {
            toast.error(`Error al ${action} la campaña.`);
            console.error(`Error en la acción ${action}:`, error);
        }
    };

    const handleViewDetails = (campaign) => {
        setSelectedCampaign(campaign);
        setDetailsModalOpen(true);
    };

    const getStatusChip = (status) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'RUNNING': return `${baseClasses} bg-green-200 text-green-800`;
            case 'PAUSED': return `${baseClasses} bg-yellow-200 text-yellow-800`;
            case 'COMPLETED': return `${baseClasses} bg-blue-200 text-blue-800`;
            case 'CANCELLED': return `${baseClasses} bg-red-200 text-red-800`;
            default: return `${baseClasses} bg-gray-200 text-gray-800`;
        }
    };

    const calculateTotalContacts = (stats) => {
        // Suma todos los valores de las estadísticas para obtener el total
        return Object.values(stats).reduce((sum, count) => sum + count, 0);
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Campañas de WhatsApp</h1>
                <button
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Crear Nueva Campaña
                </button>
            </div>

            {loading ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Cargando campañas...</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Contactos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Enviados</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pendientes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fallidos</th>
                                {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Creado por</th>
                                )}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {campaigns.map(campaign => (
                                <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={getStatusChip(campaign.status)}>{campaign.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-bold">{calculateTotalContacts(campaign.stats)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">{campaign.stats.sent || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">{campaign.stats.pending || 0}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{campaign.stats.failed || 0}</td>
                                    {(user.role === 'ADMIN' || user.role === 'SUPERVISOR') && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.createdByName || 'N/A'}</td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button onClick={() => handleViewDetails(campaign)} className="text-indigo-600 hover:text-indigo-900" title="Ver Detalles"><EyeIcon className="h-5 w-5" /></button>
                                        {campaign.status === 'PAUSED' && <button onClick={() => handleAction(campaign.id, 'start')} className="text-green-600 hover:text-green-900" title="Iniciar Campaña"><PlayIcon className="h-5 w-5" /></button>}
                                        {campaign.status === 'RUNNING' && <button onClick={() => handleAction(campaign.id, 'pause')} className="text-yellow-600 hover:text-yellow-900" title="Pausar Campaña"><PauseIcon className="h-5 w-5" /></button>}
                                        {(campaign.status === 'RUNNING' || campaign.status === 'PAUSED') && <button onClick={() => handleAction(campaign.id, 'cancel')} className="text-red-600 hover:text-red-900" title="Cancelar Campaña"><XCircleIcon className="h-5 w-5" /></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}



            <CreateCampaignModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCampaignCreated={fetchCampaigns}
            />

            {selectedCampaign && (
                <CampaignDetailsModal
                    isOpen={isDetailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    campaignId={selectedCampaign.id}
                />
            )}

        </div>
    );
};

export default WhatsappCampaigns;