import {
  LayoutDashboard,
  AlertTriangle,
  Bell,
  BookOpen,
  BarChart3,
  Puzzle,
  Users,
  Settings
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const { pathname } = useLocation();

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/home" },
    { name: "Incidents", icon: AlertTriangle, path: "/home/incidents" },
    { name: "Alerts", icon: Bell, path: "/home/alerts" },
    { name: "Playbooks", icon: BookOpen, path: "/home/play_book" },
    { name: "Analytics", icon: BarChart3, path: "/home/analytics" },
    { name: "Team", icon: Users, path: "/home/team" }
  ];

  return (
    <aside className="w-45 lg:w-65 border-r flex flex-col h-full bg-surface-bar border-border-primary text-primary">

      {/* Logo */}
      <div className="px-3 lg:px-6 py-4 lg:py-3.5 border-b border-border-primary">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 lg:w-9 h-8 lg:h-9 rounded-lg overflow-hidden bg-surface-inset flex items-center justify-center">
            <img
              src="/logo.webp"
              alt="logo"
              className="w-full h-full object-cover mix-blend-difference"
            />
          </div>
          <div>
            <h1 className={`text-primary text-sm font-semibold tracking-wide  uppercase`}>
              Beacon
            </h1>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 lg:px-3 py-3 lg:py-4 space-y-1 text-xs lg:text-sm">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={i}
              to={item.path}
              className={`group flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg transition-all duration-200
              ${
                isActive
                  ? "bg-surface-interactive text-primary shadow-inner"
                  : "text-muted hover:bg-surface-inset hover:text-primary"
              }`}
            >
              <Icon
                size={16}
                className={`transition ${
                  isActive ? "text-primary" : "group-hover:text-primary"
                }`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 lg:px-3 py-3 lg:py-4 border-t border-border-primary">
        <Link
          to="/home/user_settings"
          className={`group flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg transition-all duration-200
          ${
            pathname === "/settings"
              ? "bg-surface-interactive text-brand"
              : "text-muted hover:bg-surface-inset hover:text-primary"
          }`}
        >
          <Settings
            size={16}
            className="group-hover:text-primary transition"
          />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
