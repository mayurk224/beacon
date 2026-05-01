import { Search, Bell, Moon, Sun, Shield, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="h-full flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 ">


      <div className="flex items-center w-full max-w-[320px] h-[38px] px-3 rounded-lg border border-[#262626] bg-[#111111] focus-within:border-[#4F8CFF] transition-colors">

        <Search className="w-4 h-4 text-neutral-500 mr-2 flex-shrink-0" />

        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent outline-none text-sm text-neutral-300 placeholder-neutral-500"
        />

      </div>
      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* Admin Panel */}
        <Link
          to="/admin"
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-neutral-200"
          title="Admin Panel"
        >
          <Shield size={18} />
        </Link>


        {/* Divider */}
        <div className="w-px h-6 bg-neutral-800 hidden sm:block"></div>

        {/* Avatar */}
        <Link
          to={'/home/profile'}
          className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium cursor-pointer hover:ring-2 hover:ring-zinc-700 transition overflow-hidden"
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
};