"use client";

import { FaTwitter, FaDiscord, FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="py-10 px-6 md:px-20 text-gray-800 dark:text-white bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-0 border-t border-gray-200 dark:border-gray-700 pt-8">
        {/* Logo + Branding */}
        <div className="flex items-center space-x-3 md:flex-1">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
            <img
              src="/images/logo.png"
              alt="Nekoswap Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-semibold tracking-wide select-none">Nekoswap</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center md:justify-center gap-6 md:flex-1">
          {["Home", "About", "NFTs", "Earn", "Contact"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-base font-medium hover:text-pink-500 dark:hover:text-pink-400 transition-colors duration-300 whitespace-nowrap"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="flex space-x-7 md:flex-1 justify-center md:justify-end text-2xl text-gray-800 dark:text-white">
          <a
            href="https://twitter.com/nekoswap"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-pink-400 transition-colors duration-300"
          >
            <FaTwitter />
          </a>
          <a
            href="https://discord.gg/nekoswap"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="hover:text-purple-400 transition-colors duration-300"
          >
            <FaDiscord />
          </a>
          <a
            href="https://github.com/nekoswap"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
          >
            <FaGithub />
          </a>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400 select-none">
        © {new Date().getFullYear()} Nekoswap. All rights reserved.
      </div>
    </footer>
  );
}
