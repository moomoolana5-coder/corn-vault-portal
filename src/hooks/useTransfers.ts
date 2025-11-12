import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { parseAbiItem } from 'viem';

const TRANSFER_EVENT = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');
const BLOCKS_TO_SCAN = 30_000;
const CHUNK_SIZE = 2_000;

export function useTransfers(tokenAddress: `0x${string}`) {
  const [holdersApprox, setHoldersApprox] = useState<number>(0);
  const [transfers24h, setTransfers24h] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();

  useEffect(() => {
    let cancelled = false;

    async function fetchTransfers() {
      if (!publicClient) return;

      try {
        setIsLoading(true);
        setError(null);

        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(BLOCKS_TO_SCAN);

        const uniqueAddresses = new Set<string>();
        let totalTransfers = 0;

        // Scan in chunks to avoid timeouts
        for (let i = 0; i < BLOCKS_TO_SCAN; i += CHUNK_SIZE) {
          if (cancelled) return;

          const chunkFrom = fromBlock + BigInt(i);
          const chunkTo = fromBlock + BigInt(Math.min(i + CHUNK_SIZE, BLOCKS_TO_SCAN));

          try {
            const logs = await publicClient.getLogs({
              address: tokenAddress,
              event: TRANSFER_EVENT,
              fromBlock: chunkFrom,
              toBlock: chunkTo,
            });

            logs.forEach((log) => {
              if (log.args.from) uniqueAddresses.add(log.args.from.toLowerCase());
              if (log.args.to) uniqueAddresses.add(log.args.to.toLowerCase());
              totalTransfers++;
            });
          } catch (err) {
            console.warn(`Failed to fetch chunk ${i}-${i + CHUNK_SIZE}:`, err);
          }
        }

        if (!cancelled) {
          setHoldersApprox(uniqueAddresses.size);
          setTransfers24h(totalTransfers);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          console.error('Error fetching transfers:', err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTransfers();

    return () => {
      cancelled = true;
    };
  }, [tokenAddress, publicClient]);

  return {
    holdersApprox,
    transfers24h,
    isLoading,
    error,
  };
}
