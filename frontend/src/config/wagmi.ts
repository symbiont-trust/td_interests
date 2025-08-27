import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Get projectId at https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'default-project-id'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'My Interests',
  description: 'Social networking based on shared interests',
  url: 'https://myinterests.app', // origin must match your domain & subdomain
  icons: ['https://myinterests.app/favicon.ico']
}

// Create wagmiConfig
export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({ projectId, metadata }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

export { mainnet, sepolia }