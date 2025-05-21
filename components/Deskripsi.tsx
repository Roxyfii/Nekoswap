"use client";

export function EarnPassiveIncomeSection() {
  return (
    <section className="bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white py-20 px-8 md:px-24 flex flex-col md:flex-row items-center gap-16 max-w-7xl mx-auto rounded-xl shadow-2xl border border-gray-700">
      {/* Text content */}
      <div className="flex-1 max-w-xl space-y-8">
        <h2 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
          Earn Passive Income
        </h2>
        <p className="text-lg text-gray-300 leading-relaxed">
          With <span className="font-semibold text-pink-400">Nekoswap NFTs</span> and the <span className="font-semibold text-purple-400">NEKO token</span>, you can unlock multiple opportunities to earn passive income.
          Participate in staking, exclusive private token sales, and many other features currently being developed in the Nekoswap ecosystem.
        </p>
        <p className="text-lg text-gray-300 leading-relaxed">
          Stake your tokens to receive rewards regularly, and use your NFTs as exclusive access to premium events and features.
        </p>
        <button className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-pink-600 hover:via-red-500 hover:to-purple-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105">
          Learn More
        </button>
      </div>

      {/* Floating image */}
      <div className="flex-1 max-w-sm relative drop-shadow-[0_25px_25px_rgba(219,39,119,0.4)]">
        <img
          src="/images/swap-i.png" // ganti dengan path gambarmu
          alt="Nekoswap NFT Floating"
          className="w-full h-auto rounded-3xl animate-floating"
          style={{ filter: 'drop-shadow(0 0 15px #d92777)' }}
        />
      </div>

      {/* Animasi floating via style jsx */}
      <style jsx>{`
        @keyframes floating {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-24px) rotate(2deg);
          }
        }
        .animate-floating {
          animation: floating 5s ease-in-out infinite;
          will-change: transform;
          cursor: grab;
          transition: box-shadow 0.3s ease-in-out;
        }
        .animate-floating:hover {
          animation-play-state: paused;
          box-shadow: 0 15px 25px rgba(255, 105, 180, 0.7);
          cursor: grabbing;
          transform: translateY(-30px) rotate(5deg) scale(1.05);
        }
      `}</style>
    </section>
  );
}
