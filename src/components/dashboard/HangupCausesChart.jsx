import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import api from '../../services/api';

const HangupCausesChart = () => {
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

  if (loading) return <div className="p-4 text-center">Cargando datos...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Principales Causas de Fallo</h3>
      <div className="h-80">
        <Bar 
          data={chartData} 
          options={{
            indexAxis: 'y', // <-- Esto lo hace horizontal
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default HangupCausesChart;