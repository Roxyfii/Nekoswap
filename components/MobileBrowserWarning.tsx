"use client";
import { useEffect, useState } from "react";

export default function MobileBrowserWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [language, setLanguage] = useState<"en" | "id">("en");

  useEffect(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined") return;

    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);
    const isWalletBrowser =
      userAgent.includes("metamask") ||
      userAgent.includes("trust") ||
      userAgent.includes("coinbase") ||
      userAgent.includes("rainbow");
    const hasEthereum = typeof window.ethereum !== "undefined";

    if (isMobile && !isWalletBrowser && !hasEthereum) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  const openTrustWalletApp = () => {
    setShowWarning(false);
    window.location.href = "trust://";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center text-white font-sans">
        {/* Tombol Close */}
        <button
          onClick={() => setShowWarning(false)}
          className="absolute top-4 right-4 text-white text-3xl font-extrabold hover:text-red-400 transition"
          aria-label="Close"
          title="Close"
        >
          &times;
        </button>

        {/* Tombol Translate */}
        <button
          onClick={() => setLanguage(language === "en" ? "id" : "en")}
          className="absolute top-4 left-4 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full px-4 py-1 text-sm font-medium backdrop-blur-sm transition"
          title="Toggle Language"
        >
          {language === "en" ? "Bahasa Indonesia" : "English"}
        </button>

        <h2 className="text-2xl font-bold mb-5 drop-shadow-lg">
          {language === "en" ? "Access Restricted" : "Akses Terbatas"}
        </h2>

        <p className="text-white/90 leading-relaxed mb-5 drop-shadow">
          {language === "en" ? (
            <>
              We apologize for the inconvenience.
              <br />
              <strong>NekoSwap</strong> cannot be used in regular mobile browsers due to CORS policy restrictions.
              <br />
              Please open this dApp using a wallet browser such as:
            </>
          ) : (
            <>
              Kami mohon maaf atas ketidaknyamanan ini.
              <br />
              <strong>NekoSwap</strong> tidak dapat digunakan di browser mobile biasa karena pembatasan kebijakan CORS.
              <br />
              Silakan buka dApp ini menggunakan browser wallet seperti:
            </>
          )}
        </p>

        <ul className="list-disc list-inside text-white/90 mb-6 text-left max-w-xs mx-auto drop-shadow">
          <li>MetaMask Mobile</li>
          <li>Trust Wallet</li>
          <li>Coinbase Wallet</li>
          <li>Rainbow Wallet</li>
        </ul>

        <button
        
          className="w-full bg-white text-orange-600 font-semibold rounded-lg py-3 hover:bg-orange-50 active:scale-95 transition-transform shadow-lg drop-shadow-lg"
          aria-label="Open in Trust Wallet"
        >
          <a
    href="https://link.trustwallet.com/open_url?coin_id=60&url=https://nekoswap-iota.vercel.app/"
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full h-full"
  >
    {language === "en" ? "Open in Trust Wallet" : "Buka di Trust Wallet"}
  </a>
        </button>
      </div>
    </div>
  );
}
