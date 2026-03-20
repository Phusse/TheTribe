import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminMobileNav from "./AdminMobileNav";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="md:ml-[280px] min-h-screen pb-20 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <Outlet />
        </div>
      </main>
      <AdminMobileNav />
    </div>
  );
};

export default AdminLayout;
