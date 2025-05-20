"use client";
import React from "react";
import React from "react";

const launchpadTokens = [
  {
    name: "NekoToken",
    symbol: "NEKO",
    logo: "/images/logo.png", // Ganti sesuai path gambar token
    launchDate: "June 15, 2025",
    description:
      "NekoToken is the native utility token for Nekoswap ecosystem, powering staking, governance, and rewards.",
    features: [
      "Staking rewards",
      "Governance voting",
      "Liquidity mining incentives",
    ],
    listingUrl: "/launchpad/neko-token", // Link ke halaman detail token atau daftar
  },
  {
    name: "MewCoin",
    symbol: "MEW",
    logo: "/images/mewcoin-logo.png",
    launchDate: "July 10, 2025",
    description:
      "MewCoin is a community-driven token with a focus on NFTs and DeFi innovations.",
    features: [
      "NFT marketplace integration",
      "Yield farming",
      "Cross-chain compatibility",
    ],
    listingUrl: "/launchpad/mew-coin",
  },
];

const LaunchpadSection = () => {
  return (
    <section className="bg-white dark:bg-gray-900 py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Nekoswap Launchpad
        </h2>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Discover and support the newest tokens launching on Nekoswap. Join the
          community early and be part of the next big projects!
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        {launchpadTokens.map(
          ({ name, symbol, logo, launchDate, description, features, listingUrl }, idx) => (
            <div
              key={idx}
              className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md p-8 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={logo}
                  alt={`${name} logo`}
                  className="w-14 h-14 rounded-full object-cover border-2 border-pink-500"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {name} <span className="text-pink-500">({symbol})</span>
                  </h3>
                  <p className="text-pink-600 dark:text-pink-400 font-semibold">
                    Launch Date: {launchDate}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">{description}</p>

              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-1">
                {features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>

              <a
                href={listingUrl}
                className="mt-auto inline-block bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg px-6 py-3 text-center transition"
              >
                View Details & Apply
              </a>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default LaunchpadSection;
