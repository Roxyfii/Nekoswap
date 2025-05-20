"use client";
import React from "react";

const HeroTokenomics = () => {
  return (
    <section className="bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 text-white py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left content */}
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Nekoswap Tokenomics
          </h1>
          <p className="text-lg md:text-xl max-w-md text-purple-200">
            Designed to empower community and ensure sustainable growth, Nekoswap’s tokenomics prioritize fair distribution, rewards, and liquidity.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
            <div className="bg-white bg-opacity-20 rounded-lg p-5">
              <h3 className="text-2xl font-bold text-pink-300">Total Supply</h3>
              <p className="mt-1 text-xl font-semibold">1,000,000,000 $NEKO</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-5">
              <h3 className="text-2xl font-bold text-pink-300">Community Rewards</h3>
              <p className="mt-1 text-xl font-semibold">40%</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-5">
              <h3 className="text-2xl font-bold text-pink-300">Liquidity Pool</h3>
              <p className="mt-1 text-xl font-semibold">30%</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-5">
              <h3 className="text-2xl font-bold text-pink-300">Development & Marketing</h3>
              <p className="mt-1 text-xl font-semibold">20%</p>
            </div>
          </div>

          <button
            onClick={() => window.open("https://nekoswap.io/whitepaper", "_blank")}
            className="mt-8 inline-block bg-pink-400 hover:bg-pink-500 transition-colors text-white font-semibold py-3 px-8 rounded-full shadow-lg"
            aria-label="Read Nekoswap Whitepaper"
          >
            Read Whitepaper
          </button>
        </div>

        {/* Right content - illustration */}
        <div className="flex-1 flex justify-center">
          <img
            src="/images/logo.png"
            alt="Nekoswap Tokenomics Illustration"
            className="max-w-sm w-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroTokenomics;
