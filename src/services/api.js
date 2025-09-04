import axios from "axios";


const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para inyectar el token
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("userData");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ================== AUTH ================== */
export const loginAPI = (username, password) =>
  api.post("/auth/login", { username, password });

export const logoutAPI = () => api.post("/auth/logout");
export const forceLogoutAPI = (userId) =>
  api.post("/auth/force/logout", { userId });
export const getProfileAPI = () => api.get("/auth/me"); // <-- AÑADE ESTA LÍNEA

/* ================== USERS ================== */
export const createUserAPI = (userData) => api.post("/users", userData);
export const getAllUsersAPI = () => api.get("/users");
export const updatePasswordAPI = (userId, newPassword) =>
  api.put("/users/update-password", { userId, newPassword });
export const updateUserAPI = (userId, userData) =>
  api.put(`/users/${userId}`, userData);

/* ================== CAMPAIGNS ================== */
export const createCampaignAPI = (data) => api.post("/campaigns", data);
export const addContactsAPI = (campaignId, contacts) =>
  api.post(`/campaigns/${campaignId}/contacts`, { contacts });
export const startCampaignAPI = (campaignId) =>
  api.post(`/campaigns/${campaignId}/start`);
export const pauseCampaignAPI = (campaignId) =>
  api.post(`/campaigns/${campaignId}/pause`);
export const cancelCampaignAPI = (campaignId) =>
  api.post(`/campaigns/${campaignId}/cancel`);
export const getCampaignAPI = (campaignId) => api.get(`/campaigns/${campaignId}`);
export const getAllCampaignsMinimalAPI = () => api.get("/campaigns/all/minimal");
export const updateCampaignAPI = (id, data) => api.patch(`/campaigns/${id}`, data);
export const duplicateCampaignAPI = (id, data) => api.post(`/campaigns/${id}/duplicate`, data);


// Summaries
export const getActiveCampaignsCountAPI = (range = "month") =>
  api.get(`/campaigns/summary/active?range=${range}`);
export const getOngoingCallsCountAPI = (range = "month") =>
  api.get(`/campaigns/summary/ongoing?range=${range}`);
export const getSuccessRateAPI = (range = "month") =>
  api.get(`/campaigns/summary/success-rate?range=${range}`);
export const getTotalContactsAPI = (range = "month") =>
  api.get(`/campaigns/summary/contacts?range=${range}`);
export const getCallsPerMonthAPI = (range = "month") =>
  api.get(`/campaigns/stats/calls-per-month?range=${range}`);
export const getCallStatusDistributionAPI = (range = "month") =>
  api.get(`/campaigns/stats/call-status-distribution?range=${range}`);

/* ================== CHANNEL LIMIT ================== */
export const assignChannelLimitAPI = (userId, maxChannels) =>
  api.post("/channel-limit/assign", { userId, maxChannels });
export const getAllLimitsAPI = () => api.get("/channel-limit/all");
export const updateChannelLimitAPI = (userId, newMaxChannels) =>
  api.put("/channel-limit/update", { userId, newMaxChannels });
export const getLimitForUserAPI = (userId) =>
  api.get(`/channel-limit/${userId}`);

/* ================== SYSTEM CHANNELS ================== */
export const setSystemChannelsAPI = (totalChannels) =>
  api.post("/system-channels/set", { totalChannels });
export const getSystemChannelsAPI = () => api.get("/system-channels/total");


/* ============ STATS ============ */
export const getOverviewAPI = () => api.get('/stats/overview');
export const getDailyCallsAPI = d => api.get(`/stats/calls/daily?days=${d}`);
export const getMonthlyCallsAPI = m => api.get(`/stats/calls/monthly?months=${m}`);
export const getHourlyCallsAPI = d => api.get(`/stats/calls/hourly?days=${d}`);
export const getSuccessTrendAPI = d => api.get(`/stats/calls/success-trend?days=${d}`);
export const getCallStatusDistAPI = d => api.get(`/stats/calls/status-distribution?days=${d}`);
export const getAttemptsEfficiencyAPI = d => api.get(`/stats/calls/attempts-efficiency?days=${d}`);
export const getTopHangupCausesAPI = (l = 5, d = 30) => api.get(`/stats/calls/hangup-causes?limit=${l}&days=${d}`);
export const getRetryRateAPI = d => api.get(`/stats/calls/retry-rate?days=${d}`);
export const getAgentPerformanceAPI = d => api.get(`/stats/agents/performance?days=${d}`);
export const getCampaignLeaderboardAPI = l => api.get(`/stats/campaigns/leaderboard?limit=${l}`);
export const getChannelUsageAPI = () => api.get('/stats/channels/usage');

/* ----- nuevas métricas ----- */
export const getFailureTrendAPI = d => api.get(`/stats/calls/failure-trend?days=${d}`);
export const getSuccessRateHourAPI = d => api.get(`/stats/calls/success-rate-hour?days=${d}`);
export const getBusyHoursAPI = (l = 5, d = 30) => api.get(`/stats/calls/busy-hours?limit=${l}&days=${d}`);
export const getAvgPerCampaignAPI = d => api.get(`/stats/calls/avg-per-campaign?days=${d}`);
export const getActiveDurationsAPI = () => api.get('/stats/campaigns/active-durations');
export const getChannelPressureAPI = () => api.get('/stats/channels/pressure');

// Exportamos la instancia por si quieres usar api directamente
// ==== LIVE CONTACTS ====
export const getContactsLiveAPI = (
  id, status = 'ALL', limit = 50, page = 1
) =>
  api.get(`/campaigns/${id}/contacts/live`, {
    params: { status, limit, offset: (page - 1) * limit },
  });

export const getContactsPagesAPI = (
  id, status = 'ALL', limit = 50
) =>
  api.get(`/campaigns/${id}/contacts/pages`, {
    params: { status, limit },
  });
/* =========== REPORTES =========== */
export const getCampaignSummaryAPI = (start, end) =>
  api.get(`/stats/campaigns/summary?start=${start}&end=${end}`);

export const downloadCampaignReportAPI = (start, end) =>
  api.get('/stats/campaigns/report', {        // ← usamos la instancia api
    params: { start, end },
    responseType: 'blob',                    // ¡necesario para binarios!
  });


/* ============ FIN­SOLRED ============ */
export const getPadresNivelesAPI = () => api.get('/contactos/padres-niveles');
export const getContactosPorNivelAPI = (niveles, esPropia) =>
  api.post("/contactos/contactosnivel", { niveles, esPropia });



/* whatsapp*/
export const startWhatsappSessionAPI = () => api.post('/whatsapp/start-session');

export const sendWhatsappMessageAPI = (to, text) => api.post('/whatsapp/send-message', { to, text });

export const getWhatsappStatusAPI = () => api.get('/whatsapp/status');

export const createWhatsappCampaignAPI = (data) => 
  api.post('/whatsapp-campaigns', data);

export const addWhatsappContactsAPI = (campaignId, contacts) =>
  api.post(`/whatsapp-campaigns/${campaignId}/contacts`, { contacts });

export const getAllWhatsappCampaignsAPI = () => 
  api.get('/whatsapp-campaigns');

export const startWhatsappCampaignAPI = (id) =>
  api.post(`/whatsapp-campaigns/${id}/start`);

export const pauseWhatsappCampaignAPI = (id) =>
  api.post(`/whatsapp-campaigns/${id}/pause`);
  
export const cancelWhatsappCampaignAPI = (id) =>
  api.post(`/whatsapp-campaigns/${id}/cancel`);




export default api;