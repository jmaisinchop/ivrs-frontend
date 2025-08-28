import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useWhatsappSocket } from '../hooks/useWhatsappSocket';
import { WhatsappConnection } from '../components/whatsapp/WhatsappConnection';
import { WhatsappSender } from '../components/whatsapp/WhatsappSender';
import { WhatsappCampaigns } from '../components/whatsapp/WhatsappCampaigns';
import { startWhatsappSessionAPI, sendWhatsappMessageAPI } from '../services/api';

const WhatsappPage = () => {
    const { status, qrCode } = useWhatsappSocket();
    const [message, setMessage] = useState('');
    const [numbers, setNumbers] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);
    const [isStuck, setIsStuck] = useState(false);

    useEffect(() => {
        let timer;
        if (status === 'loading') {
            setIsStuck(false);
            timer = setTimeout(() => {
                if (status === 'loading') {
                    setIsStuck(true);
                    toast.warn("La conexión está tardando más de lo esperado.");
                }
            }, 15000);
        } else {
            setIsStuck(false);
            clearTimeout(timer);
        }
        return () => clearTimeout(timer);
    }, [status]);

    const handleConnect = async () => {
        setLoadingAction(true);
        setIsStuck(false);
        toast.info('Iniciando conexión, por favor espera...');
        try {
            await startWhatsappSessionAPI();
        } catch (error) {
            toast.error('Error al solicitar la sesión de WhatsApp.');
        } finally {
            setTimeout(() => setLoadingAction(false), 5000);
        }
    };

    const handleForceSync = () => {
        window.location.reload();
    };

    const handleSend = async (e) => {
        e.preventDefault();
        const numberList = numbers.split('\n').filter(n => n.trim() !== '');
        if (!message || numberList.length === 0) {
            return toast.warn('Debes escribir un mensaje y al menos un número.');
        }

        setLoadingAction(true);
        let successCount = 0;
        let errorCount = 0;

        for (const number of numberList) {
            try {
                await sendWhatsappMessageAPI(number, message);
                successCount++;
            } catch (err) {
                errorCount++;
                toast.error(`Error al enviar a ${number}: ${err.response?.data?.message || 'Error desconocido'}`);
            }
        }
        
        if (successCount > 0) {
            toast.success(`${successCount} de ${numberList.length} mensajes encolados para envío.`);
        }
        if (errorCount === 0) {
            setMessage('');
            setNumbers('');
        }
        
        setLoadingAction(false);
    };

    return (
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-dark-900 min-h-screen space-y-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">
                Mensajería de WhatsApp
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WhatsappConnection
                    status={status}
                    qrCode={qrCode}
                    onConnect={handleConnect}
                    loading={loadingAction || (status === 'loading' && !isStuck)}
                    isStuck={isStuck}
                    onForceSync={handleForceSync}
                />
                <WhatsappSender
                    message={message}
                    setMessage={setMessage}
                    numbers={numbers}
                    setNumbers={setNumbers}
                    onSend={handleSend}
                    loading={loadingAction}
                    isConnected={status === 'connected'}
                />
            </div>

            {status === 'connected' && (
                <div>
                    <WhatsappCampaigns />
                </div>
            )}
        </div>
    );
};

export default WhatsappPage;