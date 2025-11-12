import { defineChain } from 'viem';

export const pulsechain = defineChain({
  id: 369,
  name: 'PulseChain',
  network: 'pulsechain',
  nativeCurrency: {
    decimals: 18,
    name: 'Pulse',
    symbol: 'PLS',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_RPC_URL || 'https://rpc.pulsechain.com'],
    },
    public: {
      http: [import.meta.env.VITE_RPC_URL || 'https://rpc.pulsechain.com'],
    },
  },
  blockExplorers: {
    default: { name: 'PulseScan', url: 'https://scan.pulsechain.com' },
  },
});

export const CORN_ADDRESS = (import.meta.env.VITE_CORN || '0xd7661cce8EeD01CBAA0188FAcdDE2e46c4Ebe4B0') as `0x${string}`;
export const VECORN_ADDRESS = (import.meta.env.VITE_VECORN || '0x3facf37bc7d46fe899a3fe4991c3ee8a8e7ab489') as `0x${string}`;
export const STAKING_VAULT = import.meta.env.VITE_STAKING_VAULT as `0x${string}` | undefined;
export const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD' as `0x${string}`;
