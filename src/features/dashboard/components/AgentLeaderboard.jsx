import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

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

  if (loading) return <div className="p-4 text-center text-slate-500 dark:text-slate-400">Cargando ranking...</div>;

  return (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-slate-200">Ranking de Agentes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Agente</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Llamadas Totales</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tasa de Éxito</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.slice(0, 5).map((agent) => (
              <tr key={agent.userid} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{agent.username}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">{agent.totalcalls}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">
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

export default AgentLeaderboard; // <-- LÍNEA CLAVE