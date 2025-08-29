import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../services/api'; // ✅ CORRECCIÓN: Importación por defecto

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WhatsappStatusChart = () => {
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
        
        // Excluimos las campañas activas para el gráfico
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Cargando datos del gráfico...</div>;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Estado de Campañas de WhatsApp</h3>
      <div style={{ height: '300px' }}>
        <Bar 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
          }}
        />
      </div>
    </div>
  );
};

export default WhatsappStatusChart;