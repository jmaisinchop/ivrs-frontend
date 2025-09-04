import React, { useContext } from "react";
import { AuthContext } from "../../features/authentication/contexts/AuthContext";

const RoleGuard = ({ roles, children }) => {
  const { user } = useContext(AuthContext);

  if (!user?.role) {
    return null; // Si no hay usuario o rol, no mostrar nada
  }

  if (!roles.includes(user.role)) {
    return null; // Si el rol del usuario no está en la lista permitida, no mostrar nada
  }

  // Si el rol está permitido, renderizar los componentes hijos
  return <>{children}</>;
};

export default RoleGuard;