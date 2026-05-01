import { LayoutDashboard } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import Choose from "./Choose";

const MainLayout = () => {
  return (
    <section className="w-full h-full bg-black text-white ">
      
      <div className="w-full h-[65px] fixed z-50">
        <Navbar/>
      </div>

      {/* all the sections */}
      <div>
          <Hero/>
          <About/>
          <Choose/>
      </div>


   
    </section>
  );
};

export default MainLayout;