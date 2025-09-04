import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../authentication/contexts/AuthContext';
import api from '../../../services/api';

import TrendStatCard from './TrendStatCard';
import IvrStatusChart from './IvrStatusChart';
import WhatsappStatusChart from './WhatsappStatusChart';
import CallsOverTimeChart from './CallsOverTimeChart';
import AgentLeaderboard from './AgentLeaderboard';
import HangupCausesChart from './HangupCausesChart';
import { useDashboardSocket } from '../hooks/useDashboardSocket';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

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
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-dark-900">
            <ArrowPathIcon className="h-10 w-10 animate-spin text-brand-primary dark:text-brand-accent" />
            <p className="mt-3 text-slate-600 dark:text-slate-400">Cargando dashboard...</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-dark-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Dashboard General</h1>
        <p className="text-gray-600 dark:text-slate-400">Bienvenido, {user?.firstName}. Aquí tienes un resumen completo de la operación.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <TrendStatCard title="Campañas IVR Activas" metric={stats.ivr.activeCampaigns} />
        <TrendStatCard title="Llamadas IVR en Curso" metric={stats.ivr.ongoingCalls} />
        <TrendStatCard title="Tasa de Éxito IVR" metric={stats.ivr.successRate} isPercentage={true} />
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md flex flex-col justify-between">
            <h3 className="text-gray-500 dark:text-slate-400 font-medium">Campañas WSP Activas</h3>
            <p className="text-4xl font-bold text-gray-800 dark:text-slate-100 mt-2">{stats.whatsapp.activeCampaigns || 0}</p>
        </div>
      </div>
      
      <div className="mb-8">
        <CallsOverTimeChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <IvrStatusChart />
        <WhatsappStatusChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AgentLeaderboard />
        <HangupCausesChart />
      </div>
    </div>
  );
};

export default DashboardPage;