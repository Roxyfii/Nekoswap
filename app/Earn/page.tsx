"use client";
import React from "react";

import PoolList from "@/components/staking";
import pools from "@/Data/pools.json"
import { Footer } from "@/components/Footer";
export default function EarnPage() {
  return (
    <div className="flex justify-center items-center flex-wrap">
       <PoolList pools={pools} />
       <Footer/>
    </div>
  );
}
