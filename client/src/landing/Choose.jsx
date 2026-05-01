import React from "react";
import image from "./assets/6a867dc5-e94f-4dbc-a386-b3e6c93fe1d2.png"

const Choose = () => {
  const stats = [
    {
      title: "500+",
      subtitle: "projects",
      desc: "Built homes of various sizes and styles",
    },
    {
      title: "15 years",
      subtitle: "experience",
      desc: "Working in the construction market",
    },
    {
      title: "98%",
      subtitle: "clients",
      desc: "Trust us and recommend to others",
    },
    {
      title: "100+",
      subtitle: "employees",
      desc: "Professional construction team",
    },
  ];

  return (
    <section className="w-full min-h-screen flex  flex-col-reverse  lg:flex-row gap-10 p-4 lg:px-20">

      {/* STATS */}
      <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-[#18181B] text-white rounded-2xl p-5 flex flex-col justify-between min-h-[140px]"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold ">
                {item.title}
              </h2>
              <p className="text-sm text-[#99A1AF]">
                {item.subtitle}
              </p>
            </div>

            <p className="text-xs text-[#99A1AF] mt-3 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* IMAGE */}
      <div className="w-full lg:w-1/2">
        <div className="relative w-full h-[250px] sm:h-[350px] lg:h-full rounded-3xl overflow-hidden">
          <img
            src={image}
            alt="dashboard"
            className="w-full h-full object-cover"
          />

          <div className="absolute top-4 left-4 bg-white text-gray-800 text-xs px-3 py-1 rounded-full shadow">
            Why choose us?
          </div>
        </div>
      </div>

    </section>
  );
};

export default Choose;