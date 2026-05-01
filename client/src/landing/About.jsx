import React from "react";

const About = () => {
  return (
    <section className="w-full min-h-screen bg-black text-white px-6 lg:px-20 py-16">
      
      {/* Top Text */}
      <div className="max-w-5xl">
        <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
          Innovation is central to our ethos. We continually explore new 
          <span className="text-blue-500"> technologies</span> and strategies to 
          <span className="text-pink-400"> revolutionize</span> how people interact with finances.
        </h1>
      </div>

      {/* Grid Cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Card 1 */}
        <div className="bg-[#171717] rounded-2xl p-6 flex flex-col justify-between lg:h-[540px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-400" />
            <div className="w-10 h-10 rounded-full bg-gray-500" />
            <div className="w-10 h-10 rounded-full bg-gray-600" />
          </div>
          <div>
            <h2 className="text-4xl font-bold">18k</h2>
            <p className="text-gray-400 mt-2">Forward Strategies.</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className=" rounded-2xl p-6 flex flex-col justify-between lg:h-[540px]">
          <p className="text-gray-400 text-sm">
            Committed to reshaping finance with groundbreaking tech and forward strategies.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col justify-between lg:h-[540px]">
          <div>
            <span className="text-green-400 text-sm">+56%</span>
            <h3 className="text-lg font-medium mt-4">
              Empowering Our Clients with Elevated Financial Standards
            </h3>
          </div>
          <p className="text-gray-400 text-sm mt-6">Driving Financial Excellence.</p>
        </div>

        {/* Card 4 */}
        <div className=" rounded-2xl p-6 flex flex-col justify-between lg:h-[540px]">
          <div>
            <p className="text-gray-400 text-sm">Financial Standards:</p>
            <h3 className="text-lg font-medium mt-2">Investing Insights</h3>
          </div>
        </div>

        {/* Card 5 (Chart) */}
        <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col justify-between lg:h-[540px]">
          <div>
            <h3 className="text-lg font-medium">Financial Excellence</h3>
            <p className="text-gray-400 text-sm mt-2">
              Unlocking Data Insights: Providing invaluable guidance for informed decision-making.
            </p>
          </div>

          <div className="flex items-end gap-3 mt-6 h-32">
            <div className="w-8 bg-blue-300 h-12 rounded" />
            <div className="w-8 bg-blue-400 h-20 rounded" />
            <div className="w-8 bg-blue-500 h-28 rounded" />
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-zinc-900 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden lg:h-[540px]">
          <div>
            <p className="text-gray-400 text-sm">Constant Connection:</p>
            <h3 className="text-lg font-medium mt-2">Your Financial Ally</h3>
          </div>

          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-pink-500/30 to-transparent rounded-full" />
        </div>

      </div>
    </section>
  );
};

export default About;