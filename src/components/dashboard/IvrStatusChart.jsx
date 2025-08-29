import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import api from '../../services/api'; // ✅ CORRECCIÓN: Importación por defecto

ChartJS.register(ArcElement, Tooltip, Legend);

const IvrStatusChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIvrStatus = async () => {
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
              backgroundColor: [
                '#34D399', // SUCCESS
                '#F87171', // FAILED
                '#FBBF24', // OTROS (ej. No contestó)
                '#9CA3AF', // OTROS
              ],
              borderColor: [
                '#FFFFFF',
              ],
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

    fetchIvrStatus();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando datos del gráfico...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Distribución de Llamadas IVR</h3>
      <div style={{ maxHeight: '300px' }}>
        <Doughnut 
          data={chartData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
              },
            },
          }} 
        />
      </div>
    </div>
  );
};

export default IvrStatusChart;