"use client";
import { useEffect, useState } from "react";

export default function MobileBrowserWarning() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || "";
    const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);

    const isEthereumBrowser = typeof window !== "undefined" && (window as any).ethereum;

    // Jika mobile dan TIDAK ada window.ethereum, berarti browser biasa
    if (isMobile && !isEthereumBrowser) {
      setShowWarning(true);
    }
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Access Restricted</h2>
        <p className="text-gray-800">
          We apologize for the inconvenience.
          <br />
          <strong>NekoSwap</strong> cannot be used in regular mobile browsers due to CORS policy restrictions.
          <br />
          Please open this dApp using a wallet browser such as:
        </p>
        <ul className="mt-3 text-left text-sm text-gray-700 list-disc list-inside">
          <li>MetaMask Mobile</li>
          <li>Trust Wallet</li>
          <li>Coinbase Wallet</li>
          <li>Rainbow Wallet</li>
        </ul>
        <div className="mt-6">
          <a
            href={`https://link.trustwallet.com/open_url?coin_id=60&url=https://nekoswap-iota.vercel.app/`}
            className="inline-block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
          >
            Open in Trust Wallet
          </a>
        </div>
      </div>
    </div>
  );
}
