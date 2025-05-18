// src/components/HeroSection.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import {Button} from "@heroui/button";

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] flex flex-wrap items-center justify-center px-2 py-12 gap-8 ">
      
      {/* Teks */}
      <div className="max-w-xl p-2 mb-8 ">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
        Welcome to  <span className="text-orange-500">NekoSwap</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
           A fast, secure, and user-friendly <strong>decentralized exchange (DEX)</strong> platform. Swap, earn, and grow your assets with the latest Web3 technology.
        </p>
        <div className="flex gap-5 items-center justify-center">
        <Button
      className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
      radius="full"
    >
      Trade
    </Button>
        <Button color="primary" variant="ghost">
        Learn
      </Button>
        </div>
      </div>

      {/* Gambar dengan animasi naik turun */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
        }}
        className="w-full md:w-1/2 p-2"
      >
        <Image
          alt="Animasi NekoSwap"
          src="/images/cat.png"
          width={600}
          height={600}
          priority
          className="mx-auto rounded-2xl shadow-xl"
        />
      </motion.div>
    </section>
  );
}
