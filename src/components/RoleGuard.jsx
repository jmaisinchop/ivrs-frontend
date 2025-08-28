import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const RoleGuard = ({ roles, children }) => {
  const { user } = useContext(AuthContext);

  if (!user?.role) return null;
  if (!roles.includes(user.role)) {
    return null; 
  }
  return children;
};

export default RoleGuard;
