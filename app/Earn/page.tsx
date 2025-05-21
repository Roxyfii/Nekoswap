"use client";
import React from "react";

import PoolList from "@/components/staking";
import pools from "@/Data/pools.json"
import { Footer } from "@/components/Footer";
export default function EarnPage() {
  return (
    <div className="flex justify-center items-center flex-wrap">
       <header className="bg-gradient-to py-10 px-6 shadow-lg">
  <div className="max-w-7xl mx-auto text-center">
    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight animate-fade-in">
      🚀 Staking Pool
    </h1>
    <p className="mt-4 text-lg text-indigo-200 max-w-xl mx-auto animate-fade-in delay-200">
    Earn passive income by staking your tokens securely and efficiently.
    </p>
  </div>
</header>
       <PoolList pools={pools} />
       <Footer/>
    </div>
  );
}
