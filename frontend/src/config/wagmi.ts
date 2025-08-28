import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// Get projectId at https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'default-project-id'

if (!projectId) throw new Error('Project ID is not defined')

// Set up queryClient for TanStack Query
export const queryClient = new QueryClient()

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, sepolia],
  projectId,
  ssr: false // Set to true if using server side rendering
})

// Set up metadata
const metadata = {
  name: 'My Interests',
  description: 'Social networking based on shared interests',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://myinterests.app',
  icons: ['https://myinterests.app/favicon.ico']
}

// Create the AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet, sepolia],
  metadata,
  projectId,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord'],
    emailShowWallets: true
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#ffffff',
    '--w3m-border-radius-master': '8px'
  }
})

export const config = wagmiAdapter.wagmiConfig

export { mainnet, sepolia }