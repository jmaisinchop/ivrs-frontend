import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import api from '../../../services/api';
import { toast } from 'react-hot-toast';
import { XMarkIcon } from '@heroicons/react/24/solid';

const CampaignDetailsModal = ({ isOpen, onClose, campaignId }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && campaignId) {
            const fetchDetails = async () => {
                setLoading(true);
                try {
                    const response = await api.get(`/whatsapp-campaigns/${campaignId}/details`);
                    setDetails(response.data);
                } catch (error) {
                    toast.error("Error al cargar los detalles de la campaña.");
                    console.error(error);
                    onClose();
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [isOpen, campaignId, onClose]);

    const getStatusChip = (status) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full leading-tight";
        switch (status) {
            case 'SENT': case 'DELIVERED': case 'READ': return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100`;
            case 'PENDING': return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100`;
            case 'SENDING': return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100`;
            case 'FAILED': return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100`;
            default: return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200`;
        }
    };

    const filteredContacts = details ? details.contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const StatCard = ({ title, value, colorClass }) => (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
            <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-300 uppercase">{title}</p>
        </div>
    );

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                {loading ? (
                                    <div className="text-center p-8">Cargando detalles...</div>
                                ) : details ? (
                                    <>
                                        <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 dark:text-white">
                                            {details.campaign.name}
                                        </Dialog.Title>
                                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-white">
                                            <XMarkIcon className="h-6 w-6"/>
                                        </button>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                                            <StatCard title="Total" value={details.stats.total || 0} colorClass="text-gray-800 dark:text-gray-200" />
                                            <StatCard title="Pendientes" value={details.stats.pending || 0} colorClass="text-yellow-600 dark:text-yellow-400" />
                                            <StatCard title="Enviados" value={details.stats.sent || 0} colorClass="text-green-600 dark:text-green-400" />
                                            <StatCard title="Fallidos" value={details.stats.failed || 0} colorClass="text-red-600 dark:text-red-400" />
                                        </div>

                                        <div className="my-4">
                                            <input 
                                                type="text"
                                                placeholder="Buscar por nombre o teléfono..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                            />
                                        </div>
                                        <div className="max-h-80 overflow-y-auto border dark:border-gray-700 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Teléfono</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mensaje de Error</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {filteredContacts.map(contact => (
                                                        <tr key={contact.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{contact.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contact.phone}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap"><span className={getStatusChip(contact.status)}>{contact.status || 'N/A'}</span></td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">{contact.errorMessage || ''}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                                Cerrar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8">No se encontraron detalles para esta campaña.</div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default CampaignDetailsModal;