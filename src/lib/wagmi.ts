import { createConfig, http } from 'wagmi';
import { pulsechain } from './chains';

export const config = createConfig({
  chains: [pulsechain],
  transports: {
    [pulsechain.id]: http(),
  },
});
