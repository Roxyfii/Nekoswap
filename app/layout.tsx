
import "@/styles/globals.css";
import { Viewport } from "next";
import clsx from "clsx";
import Web3Wrapper from "../components/Web3Wrapper";
import { Providers } from "./providers";
import "@rainbow-me/rainbowkit/styles.css";
import { Navbar } from "@/components/navbar";
import BottomNavbar from "@/components/BottomNavbar";
import React from "react";
import { Inter, Fira_Code } from 'next/font/google';

const firaCode = Fira_Code({ subsets: ['latin'] });
const inter = Inter({
  subsets: ['latin'],
  weight: 'variable',
  variable: '--font-inter', // ini hanya valid jika `display: 'swap'` atau lainnya ikut diset
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};
export const metadata = {
  title: "Nekoswap",
  description: "(AMM) AUTO MARKET MAKER",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<html lang="en" className={`${inter.className} ${firaCode.className}`}>
<link rel="icon" type="image/png" href="/images/logo.png" />
      <head />
      <body
         className={clsx(
          "min-h-screen bg-background font-sans antialiased",     
         )}
         >
        <Web3Wrapper>
          <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
            <div className="relative flex flex-col h-screen">
              <Navbar />
              <BottomNavbar/>
              
              <main className="container mx-auto max-w-7xl  px-6 flex-grow">
                {children}
                   
              </main>
              <footer className="w-full flex items-center justify-center py-3"></footer>
            </div>
          
          </Providers>
        </Web3Wrapper>
      </body>
    </html>
  );
}
