import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileBottomNav from "./MobileBottomNav";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="md:ml-[280px] min-h-screen pb-20 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default DashboardLayout;
