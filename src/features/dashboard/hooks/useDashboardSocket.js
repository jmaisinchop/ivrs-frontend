import { useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { AuthContext } from '../../authentication/contexts/AuthContext'; 
import api from '../../../services/api'; 

const VITE_API_URL = import.meta.env.VITE_API_BASE_URL;

export const useDashboardSocket = (setStats) => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;


    const socket = io(VITE_API_URL, {
      path: '/socket.io',
    });

    socket.on('connect', () => {
      console.log('Conectado al WebSocket del Dashboard.');
    });

    socket.on('dashboardUpdate', async () => {
      console.log('Actualización del dashboard recibida.');
      try {
        const response = await api.get('/stats/dashboard-overview');
        setStats(response.data);
      } catch (error) {
        console.error("Error al refrescar las estadísticas del dashboard:", error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del WebSocket del Dashboard.');
    });

    return () => {
      socket.disconnect();
    };
  }, [user, setStats]);
};