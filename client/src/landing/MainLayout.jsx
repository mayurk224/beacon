import { LayoutDashboard } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const MainLayout = () => {
  return (
    <section className="w-full h-screen bg-[#1A1A1A] flex items-center justify-center">
      
      <div className="w-full max-w-xl text-center px-6 py-10 bg-[#111] rounded-2xl shadow-lg border border-zinc-800">
        
        <h1 className="text-3xl font-semibold text-white mb-4">
          Landing Page Coming Soon
        </h1>

        <p className="text-zinc-400 mb-8">
          We're working on something clean and powerful. Stay tuned.
        </p>

        <Link
          to="/home"
          className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-3 rounded-xl transition-all duration-200 border border-zinc-700"
        >
          <LayoutDashboard size={18} />
          Go to Main UI
        </Link>

      </div>

    </section>
  );
};

export default MainLayout;