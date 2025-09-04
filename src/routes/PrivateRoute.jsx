import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../features/authentication/contexts/AuthContext";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-dark-900">
            <ArrowPathIcon className="h-10 w-10 animate-spin text-brand-primary dark:text-brand-accent" />
            <p className="mt-3 text-slate-600 dark:text-slate-400">Verificando sesión...</p>
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;