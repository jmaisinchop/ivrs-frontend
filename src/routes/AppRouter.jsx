// src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "../pages/Dashboard";
import CampaignList from "../pages/CampaignList";
import CampaignCreate from "../pages/CampaignCreate";
import CampaignDetail from "../pages/CampaignDetail";
import Login from "../pages/LoginPage";
import NotFound from "../pages/NotFound";
import { useAuth } from "../contexts/AuthContext";
import WhatsappPage from '../pages/WhatsappPage';
// ⚠️ Hook fuera del render directo de <Routes>
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === undefined) return null; // aún cargando

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="campaigns" element={<CampaignList />} />
          <Route path="campaigns/create" element={<CampaignCreate />} />
          <Route path="campaigns/:id" element={<CampaignDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
