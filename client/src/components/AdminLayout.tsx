import { Outlet } from "react-router-dom";
import AdminSidebar, { AdminSidebarContent } from "./AdminSidebar";
import AdminMobileNav from "./AdminMobileNav";
import MobileHeader from "./MobileHeader";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader title="Admin Portal">
        <AdminSidebarContent />
      </MobileHeader>
      <AdminSidebar className="hidden md:flex" />
      <main className="md:ml-[280px] min-h-screen pb-20 md:pb-0 pt-16 md:pt-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
      <AdminMobileNav />
    </div>
  );
};

export default AdminLayout;
