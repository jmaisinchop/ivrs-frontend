import React, { useState, useEffect } from 'react';
import  api  from '../services/api';
import { toast } from 'react-hot-toast';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { 
    ArrowPathIcon, PhoneIcon, ChatBubbleBottomCenterTextIcon, CheckCircleIcon, PlayCircleIcon, 
    ClockIcon, PaperAirplaneIcon, ExclamationTriangleIcon, UserGroupIcon, SparklesIcon, ScaleIcon,
    ChartBarIcon, ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

// --- Componente Reutilizable para Tarjetas de Resumen ---
const StatCard = ({ title, value, icon, color, darkColor }) => (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-5 flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
        <div className={`p-3 rounded-full ${color} ${darkColor}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

// --- Componente Principal del Dashboard ---
const DashboardPage = () => {
    // Estado para todos los datos del dashboard
    const [stats, setStats] = useState(null);
    const [agentStats, setAgentStats] = useState(null);
    const [dailyChartData, setDailyChartData] = useState([]);
    const [successTrendData, setSuccessTrendData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('week'); // 'week' o 'month'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const days = range === 'week' ? 7 : 30;

                // Hacemos todas las peticiones en paralelo para que la carga sea más rápida
                const [overviewRes, dailyCallsRes, successTrendRes, agentRes] = await Promise.all([
                    api.get('/stats/dashboard-overview'),
                    api.get(`/stats/calls/daily?days=${days}`),
                    api.get(`/stats/calls/success-trend?days=${days}`),
                    api.get(`/stats/agents/leaderboard?days=${days}`)
                ]);

                setStats(overviewRes.data);
                setAgentStats(agentRes.data);
                
                // Formateamos los datos para los gráficos
                setDailyChartData(dailyCallsRes.data.map(d => ({
                    name: new Date(d.day).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    "Llamadas Totales": d.llamadas,
                    "Llamadas Exitosas": d.exitosas,
                })));

                setSuccessTrendData(successTrendRes.data.map(t => ({
                    name: new Date(t.day).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    "Tasa de Éxito": parseFloat((t.successRate * 100).toFixed(1)),
                })));

            } catch (error) {
                toast.error("No se pudieron cargar las estadísticas del dashboard.");
                console.error("Error al cargar datos del dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [range]); // El efecto se vuelve a ejecutar cada vez que el usuario cambia el rango de fechas

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <ArrowPathIcon className="h-10 w-10 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return <div className="text-center p-8 text-gray-700 dark:text-gray-300">No se pudieron cargar los datos del dashboard.</div>;
    }

    // Datos para el gráfico de pastel de WhatsApp
    const whatsappPieData = [
        { name: 'Enviados', value: stats.whatsapp.sent || 0, color: '#10b981' },
        { name: 'Pendientes', value: stats.whatsapp.pending || 0, color: '#f59e0b' },
        { name: 'Fallidos', value: stats.whatsapp.failed || 0, color: '#ef4444' },
    ];

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* --- Cabecera --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                 <div>
                    <select onChange={(e) => setRange(e.target.value)} value={range} className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="week">Últimos 7 días</option>
                        <option value="month">Últimos 30 días</option>
                    </select>
                </div>
            </div>

            {/* --- Sección IVR --- */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center border-b-2 border-blue-500 pb-2"><PhoneIcon className="h-6 w-6 mr-3 text-blue-500"/>Resumen de IVR</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Campañas Activas" value={stats.ivr.activeCampaigns} icon={<PlayCircleIcon className="h-7 w-7 text-white"/>} color="bg-blue-500" darkColor="dark:bg-blue-600" />
                    <StatCard title="Llamadas en Curso" value={stats.ivr.ongoingCalls} icon={<ClockIcon className="h-7 w-7 text-white"/>} color="bg-yellow-500" darkColor="dark:bg-yellow-600" />
                    <StatCard title="Canales en Uso" value={`${stats.ivr.channels.used} / ${stats.ivr.channels.total}`} icon={<ChartBarIcon className="h-7 w-7 text-white"/>} color="bg-red-500" darkColor="dark:bg-red-600" />
                    <StatCard title="Tasa de Éxito" value={`${(stats.ivr.successRate * 100).toFixed(1)}%`} icon={<ArrowTrendingUpIcon className="h-7 w-7 text-white"/>} color="bg-purple-500" darkColor="dark:bg-purple-600" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"><h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Rendimiento de Llamadas</h3><ResponsiveContainer width="100%" height={300}><BarChart data={dailyChartData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" /><XAxis dataKey="name" stroke="rgb(156 163 175)" /><YAxis stroke="rgb(156 163 175)" /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} /><Legend /><Bar dataKey="Llamadas Totales" fill="#3b82f6" /><Bar dataKey="Llamadas Exitosas" fill="#10b981" /></BarChart></ResponsiveContainer></div>
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"><h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Tendencia de Tasa de Éxito</h3><ResponsiveContainer width="100%" height={300}><LineChart data={successTrendData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" /><XAxis dataKey="name" stroke="rgb(156 163 175)" /><YAxis stroke="rgb(156 163 175)" unit="%" domain={[0, 100]} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }} /><Legend /><Line type="monotone" dataKey="Tasa de Éxito" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} /></LineChart></ResponsiveContainer></div>
                </div>
            </section>

            {/* --- Sección WhatsApp --- */}
            <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center border-b-2 border-green-500 pb-2"><ChatBubbleBottomCenterTextIcon className="h-6 w-6 mr-3 text-green-500"/>Resumen de WhatsApp</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Campañas Activas" value={stats.whatsapp.activeCampaigns} icon={<PlayCircleIcon className="h-7 w-7 text-white"/>} color="bg-green-500" darkColor="dark:bg-green-600" />
                    <StatCard title="Mensajes Enviados" value={stats.whatsapp.sent} icon={<PaperAirplaneIcon className="h-7 w-7 text-white"/>} color="bg-cyan-500" darkColor="dark:bg-cyan-600" />
                    <StatCard title="Mensajes Pendientes" value={stats.whatsapp.pending} icon={<ClockIcon className="h-7 w-7 text-white"/>} color="bg-orange-500" darkColor="dark:bg-orange-600" />
                    <StatCard title="Mensajes Fallidos" value={stats.whatsapp.failed} icon={<ExclamationTriangleIcon className="h-7 w-7 text-white"/>} color="bg-red-500" darkColor="dark:bg-red-600" />
                </div>
                 <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"><h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Distribución de Mensajes</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={whatsappPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>{whatsappPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}/><Legend /></PieChart></ResponsiveContainer></div>
            </section>
            
            {/* --- Sección Análisis de Agentes --- */}
            {agentStats && (
            <section>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center border-b-2 border-purple-500 pb-2"><UserGroupIcon className="h-6 w-6 mr-3 text-purple-500"/>Análisis de Agentes</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col items-center justify-center text-center"><SparklesIcon className="h-12 w-12 text-yellow-400 mb-2"/><h3 className="text-lg font-bold text-gray-800 dark:text-white">Agente Destacado</h3><p className="text-2xl font-semibold text-indigo-500 dark:text-indigo-400 mt-2">{agentStats.topPerformer?.username || 'N/A'}</p><p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agentStats.topPerformer?.prediction || 'No hay datos suficientes.'}</p></div>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"><StatCard title="Promedio Llamadas por Agente" value={agentStats.averageCalls} icon={<PhoneIcon className="h-7 w-7 text-white"/>} color="bg-cyan-500" darkColor="dark:bg-cyan-600" /><StatCard title="Tasa de Éxito Promedio" value={`${agentStats.averageSuccessRate}%`} icon={<ScaleIcon className="h-7 w-7 text-white"/>} color="bg-teal-500" darkColor="dark:bg-teal-600" /></div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-x-auto p-4"><h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">Tabla de Rendimiento de Agentes</h3><table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pos.</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Agente</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Llamadas Totales</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Llamadas Exitosas</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tasa de Éxito</th></tr></thead><tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">{agentStats.leaderboard.map((agent, index) => (<tr key={agent.userid} className="hover:bg-gray-50 dark:hover:bg-gray-700"><td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">#{index + 1}</td><td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{agent.username}</td><td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{agent.totalcalls}</td><td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{agent.successfulcalls}</td><td className="px-6 py-4 text-sm font-semibold text-purple-600 dark:text-purple-400">{(agent.successrate * 100).toFixed(2)}%</td></tr>))}</tbody></table></div>
            </section>
            )}
        </div>
    );
};

export default DashboardPage;