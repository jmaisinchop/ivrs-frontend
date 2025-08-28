/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useEffect,
  useState,
  useContext,
  useCallback
} from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext"; // Importar useTheme
import {
  getOverviewAPI,
  getDailyCallsAPI,
  getMonthlyCallsAPI,
  getSuccessTrendAPI,
  getCallStatusDistAPI,
  getAttemptsEfficiencyAPI,
  getTopHangupCausesAPI,
  getRetryRateAPI,
  getAgentPerformanceAPI,
  getCampaignLeaderboardAPI,
  getChannelUsageAPI,
  getFailureTrendAPI,
  getSuccessRateHourAPI,
  getBusyHoursAPI,
  getAvgPerCampaignAPI,
  getActiveDurationsAPI,
  getChannelPressureAPI
} from "../services/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Paleta y gradientes (se mantienen, son para los gráficos directamente)
const palette = [
  "#6366F1", "#10B981", "#3B82F6", "#EC4899", "#F59E0B",
  "#EF4444", "#A855F7", "#14B8A6", "#64748B", "#8B5CF6"
];

const gradients = {
  indigo: ["#6366F1", "#8B5CF6"], emerald: ["#10B981", "#14B8A6"],
  blue: ["#3B82F6", "#60A5FA"], pink: ["#EC4899", "#F472B6"],
  amber: ["#F59E0B", "#FBBF24"], red: ["#EF4444", "#F87171"],
  purple: ["#A855F7", "#C084FC"], teal: ["#0D9488", "#14B8A6"],
  cyan: ["#06B6D4", "#22D3EE"], gray: ["#64748B", "#94A3B8"]
};

// Ajustar chartTheme para usar colores consistentes con Tailwind
const getChartStyling = (isDarkMode) => ({
  textColor: isDarkMode ? "#9CA3AF" : "#6B7280", // gray-400 dark, gray-500 light
  axisLineColor: isDarkMode ? "#334155" : "#E5E7EB", // slate-700 dark, gray-200 light
  gridColor: isDarkMode ? "#1e293b" : "#F3F4F6", // dark.800 dark, gray-100 light
  tooltipBg: isDarkMode ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)", // dark.800 con alpha
  tooltipBorder: isDarkMode ? "1px solid rgba(71, 85, 105, 0.5)" : "1px solid rgba(0, 0, 0, 0.1)", // slate-600 con alpha
  cardBg: isDarkMode ? "#0f172a" : "#FFFFFF", // dark.900 dark, white light (para elementos dentro del chart si es necesario)
  cardBorder: isDarkMode ? "#334155" : "#E5E7EB" // slate-700 dark, gray-200 light
});


const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState({
    daily: 5, monthly: 2, trend: 60
  });

  // Estados para los datos del dashboard...
  const [ov, setOv] = useState({});
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [trend, setTrend] = useState([]);
  const [statusPie, setStatusPie] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [causes, setCauses] = useState([]);
  const [retry, setRetry] = useState({ retryRate: 0 });
  const [agents, setAgents] = useState([]);
  const [top, setTop] = useState([]);
  const [channels, setChannels] = useState([]);
  const [failTrend, setFailTrend] = useState([]);
  const [hourRate, setHourRate] = useState([]);
  const [busyHrs, setBusyHrs] = useState([]);
  const [avgPerCamp, setAvgPerCamp] = useState(0);
  const [durations, setDurations] = useState({ min: 0, avg: 0, max: 0 });
  const [pressure, setPressure] = useState({ pressure: 0 });

  const formatDate = (dateStr) => format(new Date(dateStr), "d MMM", { locale: es });
  const formatMonth = (monthStr) => format(new Date(monthStr), "MMM yy", { locale: es });
  const formatHour = (hour) => `${String(hour).padStart(2, '0')}:00`;

  const fetchAll = useCallback(async () => {
    try {
      const res = await Promise.allSettled([
        getOverviewAPI(), getDailyCallsAPI(timeRange.daily), getMonthlyCallsAPI(timeRange.monthly),
        getSuccessTrendAPI(timeRange.trend), getCallStatusDistAPI(timeRange.trend),
        getAttemptsEfficiencyAPI(timeRange.trend), getTopHangupCausesAPI(5, timeRange.trend),
        getRetryRateAPI(timeRange.trend), getAgentPerformanceAPI(timeRange.trend),
        getCampaignLeaderboardAPI(5),
        user?.role !== "CALLCENTER" ? getChannelUsageAPI() : Promise.resolve({ data: [] }),
        getFailureTrendAPI(timeRange.trend), getSuccessRateHourAPI(timeRange.trend),
        getBusyHoursAPI(5, timeRange.trend), getAvgPerCampaignAPI(timeRange.trend),
        getActiveDurationsAPI(), getChannelPressureAPI()
      ]);

      const arr = (i) => res[i].status === "fulfilled" ? res[i].value.data : [];
      const obj = (i, def = {}) => res[i].status === "fulfilled" ? res[i].value.data : def;

      setOv(obj(0, {}));
      setDaily(arr(1).map((d) => ({ ...d, day: formatDate(d.day) })));
      setMonthly(arr(2).map((d) => ({ ...d, month: formatMonth(d.month) })));
      setTrend(arr(3).map((d) => ({ ...d, day: formatDate(d.day) })));
      setStatusPie(arr(4));
      setAttempts(arr(5));
      setCauses(arr(6));
      setRetry(obj(7, { retryRate: 0 }));
      setAgents(arr(8));
      setTop(arr(9));
      setChannels(arr(10));
      setFailTrend(arr(11).map((d) => ({ ...d, day: formatDate(d.day) })));
      setHourRate(arr(12).map((d) => ({ ...d, hour: formatHour(d.hour) })));
      setBusyHrs(arr(13).map((d) => ({ ...d, hour: formatHour(d.hour) })));
      setAvgPerCamp(obj(14, { avg: 0 }).avg);
      setDurations(obj(15, { min: 0, avg: 0, max: 0 }));
      setPressure(obj(16, { pressure: 0 }));
      setError(null);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las estadísticas");
    } finally {
      if (loading) setLoading(false);
    }
  }, [user?.role, timeRange, loading]);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 30000);
    return () => clearInterval(id);
  }, [fetchAll]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMsg isDarkMode={isDarkMode} msg={error} />;

  const currentChartStyle = getChartStyling(isDarkMode);

  // Datos para el action de "Llamadas diarias"
  const dailyCallsActionData = {
    todayCalls: daily[0]?.llamadas?.toLocaleString() || 0,
    yesterdayCalls: daily[1]?.llamadas || 0,
    diff: (daily[0]?.llamadas || 0) - (daily[1]?.llamadas || 0),
    hasPreviousDay: daily.length > 1
  };

  // Datos para el action de "Tendencias de éxito/fracaso"
  const trendActionData = {
    successRate: (trend[0]?.successRate * 100 || 0).toFixed(1),
    failureRate: (trend[0]?.failureRate * 100 || 0).toFixed(1)
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Dashboard de Llamadas
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Datos en tiempo real del sistema de llamadas
            </p>
          </div>
          <div className="flex space-x-2 mt-3 sm:mt-0">
            <button
              onClick={() => setTimeRange({ daily: 5, monthly: 2, trend: 60 })}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors
                ${timeRange.daily === 5
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-dark-700 dark:text-slate-200 dark:border-dark-600 dark:hover:bg-dark-600"
                }`}
            >
              5 Días
            </button>
            <button
              onClick={() => setTimeRange({ daily: 14, monthly: 6, trend: 180 })}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors
                ${timeRange.daily === 14
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-dark-700 dark:text-slate-200 dark:border-dark-600 dark:hover:bg-dark-600"
                }`}
            >
              6 Meses
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard title="Campañas activas" value={ov.activeCampaigns} icon={<CampaignIcon />} color="indigo" description={`${timeRange.monthly} meses`} isDarkMode={isDarkMode} />
        <StatCard title="Llamadas en curso" value={ov.ongoingCalls} icon={<CallIcon />} color="teal" description="Tiempo real" isDarkMode={isDarkMode} />
        <StatCard title="Tasa de éxito" value={(ov.successRate * 100).toFixed(1) + "%"} trend={ov.successRate > 0.5 ? "up" : "down"} icon={<SuccessIcon />} color="emerald" description={`Últimos ${timeRange.trend} días`} isDarkMode={isDarkMode} />
        <StatCard title="Canales libres" value={ov.channels?.available} icon={<ChannelIcon />} color="purple" description={`De ${ov.channels?.total || 0} total`} isDarkMode={isDarkMode} />
        <StatCard title="Requieren reintento" value={(retry.retryRate * 100).toFixed(1) + "%"} trend={retry.retryRate > 0.3 ? "up" : "down"} icon={<RetryIcon />} color="amber" description={`Últimos ${timeRange.trend} días`} isDarkMode={isDarkMode} />
        <StatCard title="Prom. llamadas/campaña" value={avgPerCamp.toFixed(1)} icon={<AvgIcon />} color="blue" description={`${timeRange.monthly} meses`} isDarkMode={isDarkMode} />
        <StatCard title="Presión canales" value={(pressure.pressure * 100).toFixed(0) + "%"} trend={pressure.pressure > 0.7 ? "up" : "down"} icon={<PressureIcon />} color={pressure.pressure > 0.7 ? "red" : "cyan"} description="Tiempo real" isDarkMode={isDarkMode} />
        <StatCard title="Duración promedio" value={`${durations.avg}m`} icon={<ClockIcon />} color="gray" description={`Min: ${durations.min}m / Max: ${durations.max}m`} isDarkMode={isDarkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title={`Llamadas diarias (últimos ${timeRange.daily} días)`} subtitle="Tendencia de volumen" isDarkMode={isDarkMode}
          action={
            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-800'}`}>
                {dailyCallsActionData.todayCalls} llamadas
              </span>
              {dailyCallsActionData.hasPreviousDay && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${dailyCallsActionData.diff > 0 ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800') : (isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800')}`}>
                  {dailyCallsActionData.diff > 0 ? "↑" : "↓"} {Math.abs(dailyCallsActionData.diff)} vs ayer
                </span>
              )}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={daily} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={gradients.indigo[0]} stopOpacity={isDarkMode ? 0.5 : 0.8} />
                  <stop offset="95%" stopColor={gradients.indigo[1]} stopOpacity={isDarkMode ? 0.1 : 0.2} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickMargin={10} />
              <YAxis tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} itemStyle={{ color: isDarkMode ? "#E5E7EB" : "#1F2937" }} labelStyle={{ color: isDarkMode ? "#F3F4F6" : "#111827", fontWeight: "600" }} formatter={(value) => [value.toLocaleString(), "Llamadas"]} />
              <Area type="monotone" dataKey="llamadas" stroke={gradients.indigo[0]} fill="url(#dailyGradient)" strokeWidth={2.5} activeDot={{ r: 7, strokeWidth: 2, fill: currentChartStyle.cardBg, stroke: gradients.indigo[0] }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`Tendencias de éxito/fracaso (${timeRange.trend} días)`} subtitle="Comparación de tasas" isDarkMode={isDarkMode}
          action={
            <div className="flex space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
                Éxito: {trendActionData.successRate}%
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-800'}`}>
                Fracaso: {trendActionData.failureRate}%
              </span>
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickMargin={10} />
              <YAxis tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value, name) => [`${(value * 100).toFixed(1)}%`, name === "successRate" ? "Tasa de éxito" : "Tasa de fracaso"]} contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} labelStyle={{ color: isDarkMode ? "#F3F4F6" : "#111827", fontWeight: "600" }} itemStyle={{ color: isDarkMode ? "#E5E7EB" : "#1F2937" }}/>
              <Area type="monotone" dataKey="failureRate" stroke={gradients.red[0]} fill={gradients.red[1]} fillOpacity={isDarkMode ? 0.4 : 0.2} strokeWidth={2} name="Tasa de fracaso" activeDot={{ r: 7, strokeWidth: 2, fill: currentChartStyle.cardBg, stroke: gradients.red[0] }}/>
              <Line type="monotone" dataKey="successRate" stroke={gradients.emerald[0]} strokeWidth={3} dot={{ r: 4, fill: gradients.emerald[0] }} activeDot={{ r: 7, strokeWidth:2, fill: currentChartStyle.cardBg, stroke: gradients.emerald[0]}} name="Tasa de éxito" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title={`Llamadas mensuales (${timeRange.monthly} meses)`} subtitle="Tendencia mensual de volumen" isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthly} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickMargin={10} />
              <YAxis tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickFormatter={(value) => value > 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
              <Tooltip contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} formatter={(value) => [value.toLocaleString(), "Llamadas"]} itemStyle={{ color: isDarkMode ? "#E5E7EB" : "#1F2937" }} labelStyle={{ color: isDarkMode ? "#F3F4F6" : "#111827", fontWeight: "600" }} />
              <Bar dataKey="llamadas" fill={gradients.blue[0]} radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Éxito por hora del día" subtitle={`Promedio últimos ${timeRange.trend} días`} isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourRate} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="hour" tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickMargin={10} />
              <YAxis tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip formatter={(value) => [`${(value * 100).toFixed(1)}%`, "Tasa de éxito"]} contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} itemStyle={{ color: isDarkMode ? "#E5E7EB" : "#1F2937" }} labelStyle={{ color: isDarkMode ? "#F3F4F6" : "#111827", fontWeight: "600" }} />
              <Bar dataKey="successrate" fill={gradients.teal[0]} radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Horas más ocupadas" subtitle={`Top 5 horas (${timeRange.trend} días)`} isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={busyHrs} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <XAxis dataKey="hour" tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickMargin={10} />
              <YAxis tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} tickFormatter={(value) => value.toLocaleString()} />
              <Tooltip contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} formatter={(value) => [value.toLocaleString(), "Llamadas"]} itemStyle={{ color: isDarkMode ? "#E5E7EB" : "#1F2937" }} labelStyle={{ color: isDarkMode ? "#F3F4F6" : "#111827", fontWeight: "600" }} />
              <Bar dataKey="calls" fill={gradients.purple[0]} radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Distribución de estados" subtitle={`Últimos ${timeRange.trend} días`} isDarkMode={isDarkMode}>
          <div className="flex flex-col lg:flex-row items-center h-full">
            <div className="w-full lg:w-1/2 h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPie.filter((i) => i.total > 0)} dataKey="total" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name.split("_")[0]}: ${(percent * 100).toFixed(0)}%`} labelLine={false} labelStyle={{ fontSize: "11px", fontWeight: "600", fill: isDarkMode ? "#cbd5e1" : "#334155", textShadow: isDarkMode ? "1px 1px 2px rgba(0,0,0,0.7)" : "none" }}>
                    {statusPie.filter((i) => i.total > 0).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={palette[idx % palette.length]} stroke={currentChartStyle.cardBg} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} formatter={(value, name, props) => [<span className="font-semibold">{value.toLocaleString()}</span>, <span style={{color: palette[props.payload.payload.idx % palette.length]}}>{props.payload.status.replace(/_/g, " ")}</span>]} />
                </PieChart>
              </ResponsiveContainer>
              {statusPie.filter((i) => i.total > 0).length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center"><p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No hay datos</p></div>
              )}
            </div>
            <div className="w-full lg:w-1/2 mt-4 lg:mt-0 lg:pl-4 space-y-2 overflow-y-auto max-h-64">
              {statusPie.filter((i) => i.total > 0).sort((a, b) => b.total - a.total).map((entry, idx) => {
                const percentage = (entry.total / statusPie.reduce((acc, curr) => acc + curr.total, 0)) * 100;
                return (
                  <div key={`legend-status-${idx}`} className="flex items-start text-xs">
                    <div className="flex-shrink-0 h-3 w-3 rounded-sm mt-0.5 mr-2" style={{ backgroundColor: palette[idx % palette.length] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className={`font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{entry.status.replace(/_/g, " ")}</p>
                        <p className={`font-semibold ml-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{entry.total.toLocaleString()}</p>
                      </div>
                      <div className={`mt-1 w-full rounded-full h-1 ${isDarkMode ? 'bg-dark-700' : 'bg-slate-200'}`}>
                        <div className="h-1 rounded-full" style={{ width: `${percentage}%`, backgroundColor: palette[idx % palette.length] }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Uso de canales" subtitle="Distribución global" isDarkMode={isDarkMode}>
           {channels.filter((c) => c.used > 0).length > 0 ? (
            <div className="flex flex-col lg:flex-row items-center h-full">
              <div className="w-full lg:w-1/2 h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channels.filter((c) => c.used > 0)} dataKey="used" nameKey="username" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false} labelStyle={{ fontSize: "11px", fontWeight: "600", fill: isDarkMode ? "#cbd5e1" : "#334155", textShadow: isDarkMode ? "1px 1px 2px rgba(0,0,0,0.7)" : "none" }}>
                      {channels.filter((c) => c.used > 0).map((entry, idx) => (
                        <Cell key={`cell-channel-${idx}`} fill={palette[(idx + 3) % palette.length]} stroke={currentChartStyle.cardBg} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} formatter={(value, name, props) => [<span className="font-semibold">{value.toLocaleString()}</span>, <span style={{color: palette[(props.payload.payload.idx + 3) % palette.length]}}>{props.payload.username || "Sin nombre"}</span>]}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full lg:w-1/2 mt-4 lg:mt-0 lg:pl-4 space-y-2 overflow-y-auto max-h-64">
                {channels.filter((c) => c.used > 0).sort((a, b) => b.used - a.used).map((entry, idx) => {
                  const totalUsed = channels.reduce((acc, curr) => acc + (curr.used || 0), 0);
                  const percentage = totalUsed > 0 ? (entry.used / totalUsed) * 100 : 0;
                  return (
                    <div key={`legend-channel-${idx}`} className="flex items-start text-xs">
                      <div className="flex-shrink-0 h-3 w-3 rounded-sm mt-0.5 mr-2" style={{ backgroundColor: palette[(idx + 3) % palette.length] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className={`font-medium truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{entry.username || "Sin nombre"}</p>
                          <p className={`font-semibold ml-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{entry.used.toLocaleString()}</p>
                        </div>
                        <div className={`mt-1 w-full rounded-full h-1 ${isDarkMode ? 'bg-dark-700' : 'bg-slate-200'}`}>
                          <div className="h-1 rounded-full" style={{ width: `${percentage}%`, backgroundColor: palette[(idx + 3) % palette.length] }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={`h-64 flex flex-col items-center justify-center text-center p-4 ${isDarkMode ? 'rounded-lg' : ''}`}>
              <svg className={`w-12 h-12 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h4 className={`text-lg font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} mb-1`}>Sin datos de canales</h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>No hay información disponible.</p>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Top campañas por éxito" subtitle="Top 5 con mejor tasa de éxito" isDarkMode={isDarkMode}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDarkMode ? "bg-dark-700/50" : "bg-slate-50"}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Campaña</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Éxito</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Llamadas</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Progreso</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-dark-700' : 'divide-slate-200'}`}>
                {top.map((c, i) => (
                  <tr key={c.id} className={isDarkMode ? "hover:bg-dark-700/40" : "hover:bg-slate-50/70"}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-sm ${isDarkMode ? 'bg-brand-primary/30 text-brand-accent' : 'bg-brand-primary/10 text-brand-primary'} font-semibold`}>{i + 1}</div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{c.name}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{c.campaignType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {(c.successrate * 100).toFixed(1)}%
                        {c.successrate > 0.5 ? <SuccessIcon className="h-4 w-4 text-emerald-500 ml-1" /> : <MinIcon className="h-4 w-4 text-red-500 ml-1" />}
                      </div>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{c.total.toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-dark-700' : 'bg-slate-200'}`}>
                        <div className="h-full bg-brand-primary" style={{ width: `${c.successrate * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <ChartCard title="Rendimiento de agentes" subtitle={`Top agentes (${timeRange.trend} días)`} isDarkMode={isDarkMode}>
           <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className={isDarkMode ? "bg-dark-700/50" : "bg-slate-50"}>
                <tr>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Agente</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Éxito</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Llamadas</th>
                  <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Eficiencia</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-dark-700' : 'divide-slate-200'}`}>
                {agents.map((a) => (
                  <tr key={a.userid} className={isDarkMode ? "hover:bg-dark-700/40" : "hover:bg-slate-50/70"}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>{a.username.charAt(0).toUpperCase()}</div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{a.username}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{a.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{(a.successrate * 100).toFixed(1)}%</td>
                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{a.totalcalls.toLocaleString()}</td>
                     <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`h-2 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-dark-700' : 'bg-slate-200'}`}>
                        <div className="h-full bg-emerald-500" style={{ width: `${a.successrate * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <ChartCard title="Principales causas de cuelgue" subtitle={`Top 5 (${timeRange.trend} días)`} isDarkMode={isDarkMode}>
          <div className="space-y-3">
            {causes.map((c, i) => {
              const totalCauses = causes.reduce((acc, curr) => acc + curr.total, 0);
              const percentage = totalCauses > 0 ? (c.total / totalCauses) * 100 : 0;
              return (
                <div key={c.cause} className="flex items-start text-xs">
                  <div className="flex-shrink-0 h-3 w-3 rounded-sm mt-0.5 mr-2" style={{ backgroundColor: palette[(i + 5) % palette.length] }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className={`font-medium truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{c.cause}</p>
                      <p className={`font-semibold ml-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{c.total.toLocaleString()}</p>
                    </div>
                    <div className={`mt-1 w-full rounded-full h-1 ${isDarkMode ? 'bg-dark-700' : 'bg-slate-200'}`}>
                      <div className="h-1 rounded-full" style={{ width: `${percentage}%`, backgroundColor: palette[(i + 5) % palette.length] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Eficiencia por intentos" subtitle="Relación reintentos y éxito" isDarkMode={isDarkMode}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attempts} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}> {/* Añadido bottom margin para label XAxis */}
              <XAxis dataKey="attemptcount" tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} label={{ value: "Nº Intentos", position: "insideBottom", offset: -10, fill: currentChartStyle.textColor, fontSize: 12 }} />
              <YAxis tick={{ fill: currentChartStyle.textColor }} stroke={currentChartStyle.axisLineColor} label={{ value: "Llamadas", angle: -90, position: "insideLeft", fill: currentChartStyle.textColor, fontSize: 12, dx: -5 }} />
              <Tooltip contentStyle={{ backgroundColor: currentChartStyle.tooltipBg, border: currentChartStyle.tooltipBorder, borderRadius: "0.5rem", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} itemStyle={{ color: isDarkMode ? "#E5E7EB" : "#1F2937" }} labelStyle={{ color: isDarkMode ? "#F3F4F6" : "#111827", fontWeight: "600" }} />
              <Legend wrapperStyle={{ paddingTop: "15px" }} formatter={(value) => (<span className={isDarkMode ? "text-slate-300" : "text-slate-700"}>{value}</span>)} />
              <Bar dataKey="success" stackId="a" fill={gradients.emerald[0]} name="Éxito" radius={[4, 4, 0, 0]} animationDuration={1500} />
              <Bar dataKey="failure" stackId="a" fill={gradients.red[0]} name="Fracaso" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Duración de campañas activas" subtitle="Estadísticas de tiempo" isDarkMode={isDarkMode}>
          <div className="space-y-4 mt-2">
            <DurationRow label="Mínima" value={`${durations.min}m`} icon={<MinIcon />} isDarkMode={isDarkMode} />
            <DurationRow label="Promedio" value={`${durations.avg}m`} icon={<AvgIcon />} isDarkMode={isDarkMode} />
            <DurationRow label="Máxima" value={`${durations.max}m`} icon={<MaxIcon />} isDarkMode={isDarkMode} />
            <div className="pt-4">
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${isDarkMode ? 'text-brand-accent bg-brand-primary/20' : 'text-brand-primary bg-brand-accent/30'}`}>Rango</span>
                  <span className={`text-xs font-semibold inline-block ${isDarkMode ? 'text-brand-accent' : 'text-brand-primary'}`}>{durations.min}m - {durations.max}m</span>
                </div>
                <div className={`overflow-hidden h-2.5 text-xs flex rounded ${isDarkMode ? 'bg-dark-700' : 'bg-slate-200'}`}>
                  <div style={{ width: "100%" }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${isDarkMode ? 'bg-brand-accent' : 'bg-brand-primary'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </>
  );
};

const Spinner = () => ( /* ...código del Spinner... (sin cambios, ya estaba bien para overlay) */
  <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
    <div className="flex flex-col items-center p-6 rounded-lg bg-white dark:bg-dark-800 shadow-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-primary"></div>
      <p className="mt-4 text-slate-700 dark:text-slate-200 font-medium">Cargando datos...</p>
    </div>
  </div>
);
const ErrorMsg = ({ msg, isDarkMode }) => ( /* ...código de ErrorMsg... (ya adaptado) */
  <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
    <div className={`p-6 rounded-lg shadow-xl max-w-md w-full bg-white dark:bg-dark-800`}>
      <div className={`flex items-center justify-center h-12 w-12 rounded-full mx-auto mb-4 bg-red-100 dark:bg-red-500/20`}>
        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-center mb-2 text-slate-900 dark:text-slate-100">
        Error al cargar datos
      </h3>
      <p className="text-sm text-center text-slate-500 dark:text-slate-400">{msg}</p>
      <div className="mt-5 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-primary text-white text-sm font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-dark-800"
        >
          Reintentar
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary 
                     border-slate-300 text-slate-700 hover:bg-slate-50 
                     dark:border-dark-600 dark:text-slate-200 dark:hover:bg-dark-700 dark:focus:ring-offset-dark-800"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  </div>
);
const StatCard = ({ title, value, icon, trend, color = "indigo", description, isDarkMode = false }) => { /* ...código de StatCard... (ya adaptado) */
  const baseColorClasses = {
    indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20",
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20",
    purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/20",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20",
    red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20",
    teal: "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-500/20",
    cyan: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-500/20",
    gray: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/30",
  };
  const trendClasses = {
    up: "text-emerald-500 dark:text-emerald-400",
    down: "text-red-500 dark:text-red-400",
  };
  const currentIconBg = baseColorClasses[color] || baseColorClasses.indigo;
  
  return (
    <div className={`bg-white dark:bg-dark-800 rounded-xl p-5 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-transparent dark:border-dark-700`}>
      <div className="flex items-start">
        <div className={`${currentIconBg} p-3 rounded-lg mr-4 flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className={`text-2xl font-semibold text-slate-800 dark:text-slate-100`}>{value !== undefined && value !== null ? value : '-'}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${trendClasses[trend]}`}>
                {trend === "up" ? (
                  <svg className="h-4 w-4 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="h-4 w-4 inline-block" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                )}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};
const ChartCard = ({ title, subtitle, children, action, isDarkMode = false }) => ( /* ...código de ChartCard... (ya adaptado) */
  <div className={`rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-dark-800 border border-transparent dark:border-dark-700`}>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="mt-3 sm:mt-0">{action}</div>}
    </div>
    {children}
  </div>
);
const DurationRow = ({ label, value, icon, isDarkMode = false }) => ( /* ...código de DurationRow... (ya adaptado) */
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center">
      {React.cloneElement(icon, { className: `${icon.props.className} ${isDarkMode ? 'text-brand-accent' : 'text-brand-primary'}`})}
      <span className={`ml-3 text-sm font-medium text-slate-600 dark:text-slate-300`}>{label}</span>
    </div>
    <span className={`text-sm font-semibold text-slate-800 dark:text-slate-100`}>{value}</span>
  </div>
);

// ICONOS SVG (sin cambios, pero se incluyen para que el código sea completo)
const CampaignIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> </svg> );
const CallIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /> </svg> );
const SuccessIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ChannelIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> </svg> );
const RetryIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> </svg> );
const AvgIcon = ({ className = "w-6 h-6" }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> </svg> );
const PressureIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /> </svg> );
const ClockIcon = () => ( <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const MinIcon = ({ className = "w-5 h-5" }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /> </svg> );
const MaxIcon = ({ className = "w-5 h-5" }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /> </svg> );

export default DashboardPage;