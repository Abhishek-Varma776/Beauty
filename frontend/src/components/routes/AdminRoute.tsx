import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../../context/AuthContext";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return <div className="section-shell py-10 text-sm text-slate-600">Loading admin access...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile || profile.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
