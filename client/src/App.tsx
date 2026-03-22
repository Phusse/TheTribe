import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Pledge from "./pages/Pledge";
import Dashboard from "./pages/Dashboard";
import Training from "./pages/Training";
import LiveSessions from "./pages/LiveSessions";
import Messages from "./pages/Messages";
import Groups from "./pages/Groups";
import Connections from "./pages/Connections";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import AdminOverview from "./pages/admin/AdminOverview";
import UserManagement from "./pages/admin/UserManagement";
import InviteManagement from "./pages/admin/InviteManagement";
import AdminGroups from "./pages/admin/AdminGroups";
import AdminTraining from "./pages/admin/AdminTraining";
import AdminSessions from "./pages/admin/AdminSessions";
import AdminStats from "./pages/admin/AdminStats";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

// Inner component lives inside BrowserRouter so it can use routing hooks if needed
const AppRoutes = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    const handleMaintenance = () => setIsMaintenance(true);
    window.addEventListener("app:maintenance", handleMaintenance);
    return () => window.removeEventListener("app:maintenance", handleMaintenance);
  }, []);

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/pledge" element={<Pledge />} />

      {/* Member workspace */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="training" element={<Training />} />
          <Route path="live" element={<LiveSessions />} />
          <Route path="messages" element={<Messages />} />
          <Route path="groups" element={<Groups />} />
          <Route path="connections" element={<Connections />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Admin / SuperAdmin workspace */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="invites" element={<InviteManagement />} />
          <Route path="groups" element={<AdminGroups />} />
          <Route path="training" element={<AdminTraining />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
