import { Moon, Sun, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from 'next-themes'
import { useAuth } from "../auth/useAuth";

export default function Navbar() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const { user } = useAuth()

  const toggleTheme = (e) => {
    e.preventDefault()
    const active = resolvedTheme || theme
    setTheme(active === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="h-full flex items-center justify-end px-3 sm:px-6 gap-2 sm:gap-4 ">
      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Admin Panel */}
        <Link
          to="/admin"
          className="p-2 rounded-lg hover:bg-surface-interactive transition-colors text-muted hover:text-secondary"
          title="Admin Panel"
        >
          <Shield size={18} />
        </Link>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg hover:bg-surface-interactive transition-colors text-muted hover:text-secondary"
          title="Toggle theme"
        >
          {(resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />)}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-border-primary hidden sm:block"></div>

        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-primary">
            {user?.name || "Signed-in user"}
          </span>
          <span className="text-xs text-subtle">
            {user?.email || "No email available"}
          </span>
        </div>

        {/* Avatar */}
        <Link
          to={"/home/profile"}
          className="w-9 h-9 rounded-full bg-surface-interactive flex items-center justify-center text-sm font-medium cursor-pointer hover:ring-2 hover:ring-border-muted transition overflow-hidden"
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "User avatar"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
