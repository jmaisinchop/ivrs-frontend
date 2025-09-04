import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from "jwt-decode";
import { forceLogoutAPI, loginAPI, logoutAPI, getProfileAPI } from "../../../services/api"; // <-- RUTA ACTUALIZADA

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async (message = "Sesión cerrada con éxito") => {
    if (user?.token) {
        try {
            await logoutAPI();
        } catch (e) {
            console.error("Fallo al contactar al endpoint de logout:", e);
        }
    }
    
    setUser(null);
    localStorage.removeItem("userData");
    toast.info(message, { theme: "colored" });
    navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error al parsear datos de usuario desde localStorage", error);
      localStorage.removeItem("userData");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const expirationCheckInterval = setInterval(async () => {
      if (user?.token) {
        try {
          const decoded = jwtDecode(user.token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            console.warn("Token expirado, ejecutando force logout...");
            await forceLogoutAPI(user.id);
            logout("Tu sesión ha expirado. Por favor, inicia sesión de nuevo.");
          }
        } catch (err) {
          console.error("Token inválido, cerrando sesión:", err);
          logout("Hubo un error con tu sesión. Por favor, inicia sesión de nuevo.");
        }
      }
    }, 15000);

    return () => clearInterval(expirationCheckInterval);
  }, [user, logout]);

  useEffect(() => {
    const permissionRefreshInterval = setInterval(async () => {
      if (user?.token) {
        try {
          const { data: freshUser } = await getProfileAPI();
          
          if (user.canAccessIvrs !== freshUser.canAccessIvrs || 
              user.canAccessWhatsapp !== freshUser.canAccessWhatsapp) 
          {
            console.log("Permisos actualizados detectados. Refrescando sesión local.");
            toast.info("Tus permisos han sido actualizados.", { theme: "colored" });
            
            const updatedUserData = {
              ...user,
              ...freshUser,
            };
            
            setUser(updatedUserData);
            localStorage.setItem("userData", JSON.stringify(updatedUserData));
          }
        } catch (error) {
          console.error("Error al refrescar el perfil, la sesión puede ser inválida.", error);
        }
      }
    }, 60000);

    return () => clearInterval(permissionRefreshInterval);
  }, [user]);

  const login = async (username, password) => {
    try {
      const { data } = await loginAPI(username, password);

      const userData = {
        token: data.access_token,
        ...data.user,
        initials: `${data.user.firstName.charAt(0)}${data.user.lastName.charAt(0)}`.toUpperCase(),
      };

      setUser(userData);
      localStorage.setItem("userData", JSON.stringify(userData));

      toast.success(`¡Bienvenido, ${data.user.firstName}!`, { theme: "colored" });
      navigate("/");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Credenciales inválidas o error de conexión.";
      toast.error(errorMessage, { theme: "colored" });
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user?.token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};