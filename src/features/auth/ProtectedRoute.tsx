import { Navigate, Outlet } from "react-router-dom";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useAuth } from "./AuthProvider";
export function ProtectedRoute(){const{session,loading}=useAuth();if(loading)return <div className="app-loader">Loading AECS workspace…</div>;if(isSupabaseConfigured&&!session)return <Navigate to="/login" replace/>;return <Outlet/>}
