import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AgentLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/stats/agents/leaderboard');
        setLeaderboard(data.leaderboard);
      } catch (error) {
        console.error("Error fetching agent leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-4 text-center">Cargando ranking...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700">Ranking de Agentes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Llamadas Totales</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa de Éxito</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.slice(0, 5).map((agent) => (
              <tr key={agent.userid}>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{agent.username}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{agent.totalcalls}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 font-semibold">
                  {(agent.successrate * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentLeaderboard;