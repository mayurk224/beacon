
import { Link } from "react-router-dom";
import Navbar from "./Navbar";

import { useTheme } from "next-themes";

const MainLayout = () => {
  const { theme } = useTheme();


  return (
    <section className="w-full min-h-screen bg-surface-elevated text-primary relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg 
          className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] opacity-[0.12] dark:opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] rotate-[15deg]" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="uneven-lines" width="400" height="400" patternUnits="userSpaceOnUse">
              {/* Main Grid Lines - Uneven spacing and varying weights */}
              <line x1="0" y1="40" x2="400" y2="40" stroke="currentColor" strokeWidth="1" />
              <line x1="0" y1="130" x2="400" y2="130" stroke="currentColor" strokeWidth="0.5" />
              <line x1="0" y1="280" x2="400" y2="280" stroke="currentColor" strokeWidth="1.5" />
              <line x1="0" y1="350" x2="400" y2="350" stroke="currentColor" strokeWidth="0.5" />
              
              <line x1="60" y1="0" x2="60" y2="400" stroke="currentColor" strokeWidth="1.2" />
              <line x1="180" y1="0" x2="180" y2="400" stroke="currentColor" strokeWidth="0.5" />
              <line x1="320" y1="0" x2="320" y2="400" stroke="currentColor" strokeWidth="1.5" />

              {/* Decorative "accents" - random small segments */}
              <line x1="20" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="2.5" />
              <line x1="350" y1="350" x2="350" y2="280" stroke="currentColor" strokeWidth="2.5" />
              
              {/* Short vertical "stiches" */}
              <line x1="120" y1="40" x2="120" y2="60" stroke="currentColor" strokeWidth="1" />
              <line x1="240" y1="280" x2="240" y2="310" stroke="currentColor" strokeWidth="1" />
              
              {/* Dots at specific intersections for a technical look */}
              <circle cx="60" cy="40" r="2" fill="currentColor" />
              <circle cx="320" cy="280" r="2" fill="currentColor" />
              <circle cx="180" cy="130" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#uneven-lines)" />
        </svg>
      </div>

      <div className="w-full h-16 fixed z-50">
        <Navbar/>
      </div>


      {/* hero section */}
      <div className="relative z-10 pt-50 pb-14 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-3xl">
          <h1 className="text-5xl text-primary font-semibold">Resolution at the speed of thought.</h1>
          <p className="font-light text-lg text-muted md:px-2">Incident helps modern engineering teams automate responses, coordinate communication, and learn from every failure in a single, beautiful workspace.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/home" className="btn-primary px-6!  py-2! text-sm font-medium">
              Get Started
            </Link>
            <Link to="/home" className="px-6 py-2 border border-border-muted rounded bg-transparent hover:bg-surface-elevated hover:border-brand hover:text-brand transition-colors text-[13px] font-medium text-primary">
              View Demo
            </Link>
          </div>
         </div>
      </div>  


        {/* about section */}
      <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex p-8">
        <div className=" w-full overflow-hidden rounded-lg">
          <img
            src={`${theme === "dark" ? "./landing1.png" : "./landing2.png"}`}
            alt="Placeholder"
            className="w-full h-auto rounded-md object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-surface-elevated via-surface-elevated/70 to-transparent" />
        </div>
      </div>



    </section>
  );
};

export default MainLayout;