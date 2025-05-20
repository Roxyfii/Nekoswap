"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThemeSwitch } from "./theme-switch"; // asumsikan komponen theme switch

const BottomNavbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = (path: string) => {
    setDropdownOpen(false);
    router.push(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full border-t shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-xl mx-auto flex justify-between items-center py-2 px-5 text-gray-700 dark:text-gray-300 font-medium font-sans">
        {/* Swap Button */}
        <button
          onClick={() => navigate("/addliquidity")}
          className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          style={{ fontSize: "0.75rem" }}
          aria-label="Swap"
        >
          {/* Exchange Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 7h16M4 17h16M10 7l5 5-5 5"
            />
          </svg>
          <span>Swap</span>
        </button>

        {/* More Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            style={{ fontSize: "0.75rem" }}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="More menu"
          >
            Menu
            <svg
              className={`w-3 h-3 mt-1 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow-lg min-w-[160px] text-gray-700 dark:text-gray-300 font-medium">
              {/* Duplicate Swap here */}
              <button
                onClick={() => navigate("/addliquidity")}
                className="block w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors rounded"
              >
                Swap
              </button>
              <button
                onClick={() => navigate("/Earn")}
                className="block w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors rounded"
              >
                Earn
              </button>
              <button
                onClick={() => navigate("/Nft")}
                className="block w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors rounded"
              >
                NFT
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="block w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors rounded"
              >
                SDK
              </button>
              <button
                onClick={() => navigate("/Sdk")}
                className="block w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors rounded"
              >
                WhitePaper
              </button>
              <button
                onClick={() => navigate("/Lauchpad")}
                className="block w-full text-left px-4 py-2 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-colors rounded"
              >
                Lauchpad
              </button>
              <div className="border-t border-gray-300 dark:border-gray-700 mt-1 px-4 py-2">
                <ThemeSwitch />
              </div>
            </div>
          )}
        </div>

        {/* Earn Button */}
        <button
          onClick={() => navigate("/Earn")}
          className="flex flex-col items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          style={{ fontSize: "0.75rem" }}
          aria-label="Earn"
        >
          {/* Coin icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={2} />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v8m-2-4h4"
              stroke="currentColor"
              strokeWidth={2}
            />
          </svg>
          <span>Earn</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavbar;
