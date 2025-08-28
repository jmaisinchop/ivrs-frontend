import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CampaignsPage from "./pages/CampaignsPage";
import ChannelsPage from "./pages/ChannelsPage";
import UsersPage from "./pages/UsersPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./components/MainLayout";
import ReportPage from "./pages/ReportPage";
import WhatsappPage from './pages/WhatsappPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas anidadas dentro del layout */}
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
        <Route path="/reports" element={<ReportPage />} />
        <Route path="/whatsapp" element={<WhatsappPage />} />


      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
