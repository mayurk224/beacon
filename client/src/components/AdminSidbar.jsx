import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Network,
  LayoutDashboard,
  AlertTriangle,
  Server,
  BarChart3,
  Users,
  Settings,
  Shield,
  ArrowLeft,
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    {icon:BarChart3,label:"Activity",path:"/admin/activity"},
    {icon:Shield,label:"Roles",path:"/admin/roles"}

  ];


  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="h-full w-[240px] border-r border-[#262626] bg-[#0D0D0D] flex flex-col py-6 px-4 z-50">
      {/* Logo / Brand */}
      <Link to="/admin" className="mb-10 flex items-center gap-3 px-2 uppercase text-white transition-opacity">
  <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 lg:w-9 h-8 lg:h-9 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center">
            <img
              src="/logo.webp"
              alt="logo"
              className="w-full h-full object-cover mix-blend-difference"
            />
          </div>
          <div>
            <h1 className={`text-white text-sm font-semibold tracking-wide  uppercase`}>
              Beacon Admin
            </h1>
          </div>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 px-3 py-2 rounded transition-colors duration-150 ${
              isActive(path)
                ? 'text-[#4F8CFF] bg-[#1A1A1A] font-medium'
                : 'text-gray-400 hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </nav>
<Link
  to="/home"
  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] text-gray-300 hover:text-white hover:bg-[#262626] transition-colors"
>
  <ArrowLeft className="w-4 h-4" />
  Back to User Page
</Link>

    </aside>
  );
};

export default AdminSidebar;