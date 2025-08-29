import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import  api  from '../services/api';

// Importar todos los componentes del dashboard
import TrendStatCard from '../components/dashboard/TrendStatCard';
import IvrStatusChart from '../components/dashboard/IvrStatusChart';
import WhatsappStatusChart from '../components/dashboard/WhatsappStatusChart';
import CallsOverTimeChart from '../components/dashboard/CallsOverTimeChart';
import AgentLeaderboard from '../components/dashboard/AgentLeaderboard';
import HangupCausesChart from '../components/dashboard/HangupCausesChart';
import { useDashboardSocket } from '../hooks/useDashboardSocket';

const DashboardPage = () => {
  const [stats, setStats] = useState({ 
    ivr: { 
      activeCampaigns: { value: 0, change: 0 }, 
      ongoingCalls: { value: 0, change: 0 }, 
      successRate: { value: 0, change: 0 } 
    }, 
    whatsapp: {
      activeCampaigns: 0,
      pending: 0
    } 
  });
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useDashboardSocket(setStats);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/stats/dashboard-overview');
        setStats(response.data);
      } catch (error) {
        console.error("Error al cargar las estadísticas del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <p className="text-xl text-gray-600">Cargando dashboard...</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard General</h1>
        <p className="text-gray-600">Bienvenido, {user?.firstName}. Aquí tienes un resumen completo de la operación.</p>
      </div>

      {/* Fila de Tarjetas con Tendencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TrendStatCard title="Campañas IVR Activas" metric={stats.ivr.activeCampaigns} />
        <TrendStatCard title="Llamadas IVR en Curso" metric={stats.ivr.ongoingCalls} />
        <TrendStatCard title="Tasa de Éxito IVR" metric={stats.ivr.successRate} isPercentage={true} />
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
            <h3 className="text-gray-500 font-medium">Campañas WSP Activas</h3>
            <p className="text-4xl font-bold text-gray-800 mt-2">{stats.whatsapp.activeCampaigns || 0}</p>
        </div>
      </div>
      
      {/* Gráfico principal de rendimiento a lo largo del tiempo */}
      <div className="mb-8">
        <CallsOverTimeChart />
      </div>

      {/* Fila de Gráficos de Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <IvrStatusChart />
        <WhatsappStatusChart />
      </div>

      {/* Fila de Tablas y Gráficos de Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AgentLeaderboard />
        <HangupCausesChart />
      </div>
    </div>
  );
};

export default DashboardPage;