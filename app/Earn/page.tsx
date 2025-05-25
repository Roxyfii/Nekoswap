"use client";
import React from "react";

import PoolList from "@/components/staking";
import pools from "@/Data/pools.json"
import { Footer } from "@/components/Footer";
export default function EarnPage() {
  return (
    <div className="flex justify-center items-center flex-wrap">
       <header className="bg-gradient-to py-10 px-6 shadow-lg">
       <div className="max-w-7xl mx-auto text-center px-4">
  <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight animate-fade-in">
    💎 Staking Pools
  </h1>

</div>

</header>
       <PoolList pools={pools} />
       <Footer/>
    </div>
  );
}
