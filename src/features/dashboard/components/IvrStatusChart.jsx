import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../../../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const IvrStatusChart = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/stats/ivr-status-distribution');
        const labels = data.map(item => item.status);
        const totals = data.map(item => item.total);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Llamadas',
              data: totals,
              backgroundColor: ['#34D399', '#F87171', '#FBBF24', '#9CA3AF', '#60A5FA'],
              borderColor: isDarkMode ? '#1e293b' : '#FFFFFF',
              borderWidth: 2,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching IVR status data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [isDarkMode]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDarkMode ? '#cbd5e1' : '#475569',
          boxWidth: 20,
          padding: 20,
        },
      },
    },
    cutout: '60%',
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
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-slate-200">Distribución de Llamadas IVR</h3>
      <div className="h-[300px]">
        {chartData && <Doughnut data={chartData} options={options} />}
      </div>
    </div>
  );
};

export default IvrStatusChart;