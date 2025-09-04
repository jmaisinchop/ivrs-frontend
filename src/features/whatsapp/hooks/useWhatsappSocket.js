import { useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../authentication/contexts/AuthContext';
import { getWhatsappStatusAPI } from '../../../services/api';


const VITE_API_URL = import.meta.env.VITE_SOCKET_URL; 

export const useWhatsappSocket = () => {
    const { user } = useContext(AuthContext);
    const [status, setStatus] = useState('loading');
    const [qrCode, setQrCode] = useState('');

    const handleError = useCallback(() => {
        setStatus('disconnected');
        setQrCode('');
    }, []);

    useEffect(() => {
        if (!user || !user.id) return;

        let socket;
        const initialize = async () => {
            try {
                const response = await getWhatsappStatusAPI();
                setStatus(response.data.status);
                setQrCode(response.data.qr || '');
            } catch (error) {
                console.error("Error al obtener estado inicial de WhatsApp:", error);
                handleError();
            }
        };

        initialize();

        socket = io(VITE_API_URL, { path: '/socket.io' }); 
        
        socket.on('connect_error', handleError);

        socket.on(`whatsapp-qr-${user.id}`, (qr) => {
            setStatus('waiting-qr');
            setQrCode(qr);
        });

        socket.on(`whatsapp-status-${user.id}`, (data) => {
            setStatus(data.status);
            if (data.status !== 'waiting-qr') {
                setQrCode('');
            }
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [user, handleError]);

    return { status, qrCode };
};