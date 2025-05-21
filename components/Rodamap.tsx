"use client";
import React from "react";

const Roadmap = () => {
  const roadmapData = [
    {
      quarter: "Q2 2025",
      title: "Launch & Initial Offering",
      details: [
        "Nekoswap Token Launch",
        "Initial DEX Offering (IDO)",
        "Liquidity Pool Setup",
      ],
    },
    {
      quarter: "Q3 2025",
      title: "Platform Development",
      details: [
        "Launch Swap & Staking Features",
        "Integrate NFT Marketplace",
        "Community Growth Campaign",
      ],
    },
    {
      quarter: "Q4 2025",
      title: "Expansion & Partnerships",
      details: [
        "Cross-chain Bridge Integration",
        "Strategic Partnerships",
        "Governance DAO Launch",
      ],
    },
    {
      quarter: "Q1 2026",
      title: "Scaling & Ecosystem",
      details: [
        "Mobile App Launch",
        "Advanced Analytics Dashboard",
        "Gamefi App Launch",
      ],
    },
  ];

  return (
    <section className="bg-gray-50 dark:bg-black py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12 text-center">
          Nekoswap Roadmap
        </h2>
        <div className="relative border-l-4 border-pink-500 dark:border-pink-400 ml-6 md:ml-12">
          {roadmapData.map(({ quarter, title, details }, idx) => (
            <div key={idx} className="mb-12 ml-6 md:ml-12 relative">
              {/* Dot */}
              <span className="absolute -left-9 top-2 w-6 h-6 bg-pink-500 dark:bg-pink-400 rounded-full border-4 border-white dark:border-gray-900"></span>

              <time className="text-pink-600 dark:text-pink-400 font-semibold text-lg">
                {quarter}
              </time>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {title}
              </h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-3 space-y-1">
                {details.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
