import React, { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";
import BottomBar from "../components/BottomBar";

const Layout = () => {


  return (
    <div className={` h-screen w-full lg:flex flex-1 overflow-hidden overflow-y-auto bg-surface text-primary`}>
      
      {/* Sidebar */}
      <div className=" hidden lg:flex">
        <SideBar />
      </div>

      {/* Right Side */}
      <div className="flex flex-col flex-1">
        
        {/* Navbar */}
        <div className="h-[64px] border-b border-border-primary">
          <Navbar/>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full h-full   ">
          <Outlet />
        </main>


       {/* Bottom bar */}
        <div className="h-[64px] lg:hidden  flex">
          <BottomBar/>
        </div>
      </div>
    </div>
  );
};

export default Layout;