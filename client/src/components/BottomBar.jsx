import React from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Bell,
  BookOpen,
  BarChart3,
  Puzzle,
  Users
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomBar = () => {
  const { pathname } = useLocation();

  const navItems = [
    { icon: LayoutDashboard, path: "/home" },
    { icon: AlertTriangle, path: "/home/incidents" },
    { icon: Bell, path: "/home/alerts" },
    { icon: BookOpen, path: "/home/play_book" },
    { icon: BarChart3, path: "/home/analytics" },
    { icon: Users, path: "/home/team" }
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#121212] border-t border-neutral-800 z-50">
      <div className="flex items-center justify-between px-2 py-2">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={i}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 py-1"
            >
              <Icon
                size={20}
                className={`transition ${
                  isActive
                    ? "text-white"
                    : "text-neutral-500"
                }`}
              />
              {/* Optional dot indicator */}
              {isActive && (
                <span className="w-1 h-1 mt-1 bg-white rounded-full"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomBar;