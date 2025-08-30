import { useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../contexts/AuthContext';
import { getWhatsappStatusAPI } from '../services/api';
import { WHATSAPP_WS_URL } from '../services/api'; // <-- Importa la URL
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
                console.error("Error al obtener estado inicial:", error);
                handleError();
            }
        };

        initialize();

        socket = io(WHATSAPP_WS_URL);
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