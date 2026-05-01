import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Shield,
  ArrowLeft,
} from 'lucide-react';

const AdminBottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: BarChart3, label: 'Activity', path: '/admin/activity' },
    { icon: Shield, label: 'Roles', path: '/admin/roles' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/admin');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D] border-t border-[#262626] flex items-center h-[60px] md:hidden px-2">
      
      {/* Back Button (left side) */}
      <button
        onClick={handleBack}
        className="flex flex-col items-center justify-center text-xs text-gray-400 hover:text-white transition-colors w-[60px]"
      >
        <ArrowLeft className="w-5 h-5 mb-1" />
        <span>Back</span>
      </button>

      {/* Divider (optional but clean) */}
      <div className="w-px h-6 bg-[#262626] mx-1" />

      {/* Navigation */}
      <div className="flex flex-1 justify-around">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center justify-center text-xs transition-colors ${
              isActive(path)
                ? 'text-[#4F8CFF]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span>{label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default AdminBottomBar;