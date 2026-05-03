import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Users,
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
    <aside className="w-45 lg:w-65 border-r flex flex-col h-full bg-surface-bar border-border-primary text-primary">
      <div className="px-3 lg:px-6 py-4 lg:py-3.5 border-b border-border-primary">
        <Link to="/admin" className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 lg:w-9 h-8 lg:h-9 rounded-lg overflow-hidden bg-surface-inset flex items-center justify-center">
            <img
              src="/logo.webp"
              alt="logo"
              className="w-full h-full object-cover mix-blend-difference"
            />
          </div>
          <div>
            <h1 className="text-primary text-sm font-semibold tracking-wide uppercase">
              Beacon Admin
            </h1>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-2 lg:px-3 py-3 lg:py-4 space-y-1 text-xs lg:text-sm">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = isActive(path);

          return (
            <Link
              key={path}
              to={path}
              className={`group flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-surface-interactive text-primary shadow-inner'
                  : 'text-muted hover:bg-surface-inset hover:text-primary'
              }`}
            >
              <Icon
                size={16}
                className={`transition ${active ? 'text-primary' : 'group-hover:text-primary'}`}
              />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 lg:px-3 py-3 lg:py-4 border-t border-border-primary">
        <Link
          to="/home"
          className="group flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg transition-all duration-200 text-muted hover:bg-surface-inset hover:text-primary"
        >
          <ArrowLeft size={16} className="transition group-hover:text-primary" />
          <span className="font-medium">Back to User Page</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
