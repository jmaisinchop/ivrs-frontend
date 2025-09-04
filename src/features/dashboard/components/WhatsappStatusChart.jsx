import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WhatsappStatusChart = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWhatsappStatus = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/stats/whatsapp-stats');
        
        const { activeCampaigns, ...statuses } = data;
        
        const labels = Object.keys(statuses).map(key => key.charAt(0).toUpperCase() + key.slice(1));
        const totals = Object.values(statuses);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Cantidad de Mensajes',
              data: totals,
              backgroundColor: '#3B82F6',
              borderRadius: 4,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching WhatsApp status data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsappStatus();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' }, // slate-400 : slate-500
            grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
        },
        x: {
            ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' },
            grid: { display: false }
        }
    }
  };

  if (loading) {
    return (
        <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md flex items-center justify-center h-[350px]">
            <div className="text-center">
                <ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-brand-primary dark:text-brand-accent"/>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cargando gráfico...</p>
            </div>
        </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-slate-200">Estado de Campañas de WhatsApp</h3>
      <div className="h-[300px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default WhatsappStatusChart;