import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import api from '../../../services/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CallsOverTimeChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/stats/calls/daily?days=30');
        const labels = data.map(d => d.day);
        const totalCalls = data.map(d => d.llamadas);
        const successfulCalls = data.map(d => d.exitosas);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Llamadas Totales',
              data: totalCalls,
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Llamadas Exitosas',
              data: successfulCalls,
              borderColor: '#10B981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching daily calls data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center text-slate-500 dark:text-slate-400">Cargando datos del gráfico...</div>;

  return (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-slate-200">Rendimiento de Llamadas (Últimos 30 días)</h3>
      <div className="h-80">
        <Line 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
};

export default CallsOverTimeChart;