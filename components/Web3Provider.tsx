// components/Web3Provider.tsx
"use client";

import { WagmiProvider } from "wagmi";
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bsc, cronos, mainnet, polygon } from "wagmi/chains";
import { ReactNode, useState } from "react";

const config = getDefaultConfig({
  appName: "Nekoswap DApp",
  projectId: "f79a38e56bf80c47e010dc510d552243",
  chains: [mainnet, polygon, bsc, cronos],
});

export default function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          coolMode
          theme={darkTheme({
            accentColor: "#ff8a00", // warna orange
          })}
        >
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
