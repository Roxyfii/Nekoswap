import { createAppKit } from '@reown/appkit/react'
import React, { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, polygon, cronos, bsc,} from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// 0. Setup queryClient
const queryClient = new QueryClient()

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined in your environment variables.');
}
// 2. Create a metadata object - optional
const metadata = {
  name: 'Nekoswap',
  description: '(AMM) AUTO MARKET MAKER',
  url: 'http://localhost:3001', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 3. Set the networks
const networks = [mainnet, arbitrum,polygon,cronos,bsc]

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, arbitrum,polygon,cronos,bsc],
  projectId,
  metadata,
  features: {
    swaps: false, // Optional - true by default
    email: true,
    onramp: false, // default to true
    socials: [
      "google",
    
    ],
    emailShowWallets: true, // default to true
  },
  allWallets: "SHOW", // default to SHOW
});

export default function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}