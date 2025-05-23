"use client";
import HeroSection from "@/components/HeroSection";
import UserStatsSection from "@/components/UserStatsSections";
import HeroTokenomics from "@/components/HeroTokenomics";
import Roadmap from "@/components/Rodamap";
import TokenBurnSection from "@/components/BurnSection";
import React from "react";
import { EarnPassiveIncomeSection } from "@/components/Deskripsi";
import { Footer } from "@/components/Footer";
export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block text-center justify-center">
        <HeroSection />
        <UserStatsSection />
       <Roadmap/>
      <EarnPassiveIncomeSection/>
      <TokenBurnSection/>
      <main className="min-h-screen py-20 text-gray-900 dark:text-white">
      <HeroTokenomics/>
    </main>
       
      <Footer/>
      </div>
    </section>
  );
}
