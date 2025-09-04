import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import api from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const HangupCausesChart = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/stats/calls/hangup-causes?limit=5');
        const labels = data.map(item => item.cause);
        const totals = data.map(item => item.total);

        setChartData({
          labels,
          datasets: [{
            label: 'Total de Llamadas',
            data: totals,
            backgroundColor: '#EF4444',
            borderColor: '#DC2626',
            borderWidth: 1,
            borderRadius: 4,
          }],
        });
      } catch (error) {
        console.error("Error fetching hangup causes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        grid: { color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }
      },
      y: {
        ticks: { color: isDarkMode ? '#94a3b8' : '#64748b' },
        grid: { display: false }
      }
    },
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
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-slate-200">Principales Causas de Fallo</h3>
      <div className="h-80">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default HangupCausesChart;