import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidbar';
import AdminBottomBar from '../components/AdminBottomBar';

const AdminMain = () => {
  return (
    <section className="h-screen w-full flex bg-[#0D0D0D] overflow-hidden">
      
      {/* Sidebar (desktop only) */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full overflow-y-auto pb-[60px] md:pb-0">
        <Outlet />
      </div>

      {/* Bottom Bar (mobile only) */}
      <AdminBottomBar />

    </section>
  );
};

export default AdminMain;