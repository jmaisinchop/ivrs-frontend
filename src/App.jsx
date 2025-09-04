import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import PrivateRoute from "./routes/PrivateRoute";

import LoginPage from "./features/authentication/components/LoginPage";
import DashboardPage from "./features/dashboard/components/DashboardPage";
import CampaignsPage from "./features/campaigns/components/CampaignsPage";
import ChannelsPage from "./features/channels/components/ChannelsPage";
import UsersPage from "./features/users/components/UsersPage";
import ReportPage from "./features/reports/components/ReportPage";
import WhatsappPage from "./features/whatsapp/components/WhatsappPage";
import NotFoundPage from "./pages/NotFoundPage"; 

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas que usarán el layout principal (Navbar, Sidebar) */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="channels" element={<ChannelsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="reports" element={<ReportPage />} />
        <Route path="whatsapp" element={<WhatsappPage />} />
        {/* Aquí puedes agregar futuras rutas protegidas, como /audit */}
      </Route>

      {/* Ruta para páginas no encontradas */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;