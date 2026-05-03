import { Search, Bell, Moon, Sun, Shield, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
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

        {/* Divider */}
        <div className="w-px h-6 bg-border-primary hidden sm:block"></div>

        {/* Avatar */}
        <Link
          to={"/home/profile"}
          className="w-9 h-9 rounded-full bg-surface-interactive flex items-center justify-center text-sm font-medium cursor-pointer hover:ring-2 hover:ring-border-muted transition overflow-hidden"
        >
          <img
            src="https://plus.unsplash.com/premium_photo-1763856261042-b0931522b878?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0MXx8fGVufDB8fHx8fA%3D%3D"
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </div>
  );
}
