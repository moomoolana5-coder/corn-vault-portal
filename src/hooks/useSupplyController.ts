import { useEffect, useState } from 'react';
import { usePublicClient, useReadContract, useAccount } from 'wagmi';
import { decodeEventLog, type Abi } from 'viem';
import { ADDR } from '@/config/addresses';
import ControllerABI from '@/abi/CornSupplyController.json';
import ERC20ABI from '@/abi/ERC20.json';

export interface SupplyOverview {
  lpBurned: bigint;
  cornBurned: bigint;
  routedTreasury: bigint;
  routedStaking: bigint;
  lastProcessedTime?: number;
  lastProcessedHash?: string;
  totalTxCount: number;
}

export interface SupplyEvent {
  timestamp: number;
  blockNumber: bigint;
  txHash: string;
  type: string;
  data: any;
}

export function useSupplyOverview() {
  const [overview, setOverview] = useState<SupplyOverview>({
    lpBurned: 0n,
    cornBurned: 0n,
    routedTreasury: 0n,
    routedStaking: 0n,
    totalTxCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const loadData = async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 100000n; // Last ~100k blocks

        const logs = await publicClient.getContractEvents({
          address: ADDR.controller as `0x${string}`,
          abi: ControllerABI as Abi,
          fromBlock,
          toBlock: currentBlock,
        });

        let lpBurned = 0n,
          cornBurned = 0n,
          toTreasury = 0n,
          toStaking = 0n,
          txCount = 0,
          lastProcessedTime: number | undefined,
          lastProcessedHash: string | undefined;

        for (const log of logs) {
          try {
            txCount++;
            const args = log.args as any;
            
            switch (log.eventName) {
              case 'LPBurnExecuted':
                // LP burn menggunakan CORN dan WPLS, kita track CORN yang digunakan
                lpBurned += (args.cornUsed || 0n) as bigint;
                break;
              case 'BuybackBurnExecuted':
                // Buyback burn untuk mengurangi supply CORN
                cornBurned += (args.cornBurned || 0n) as bigint;
                break;
              case 'Routed':
                const routedTo = (args.to as string).toLowerCase();
                const amount = args.amount as bigint;
                if (routedTo === ADDR.staking.toLowerCase()) {
                  toStaking += amount;
                } else if (routedTo === ADDR.treasury.toLowerCase()) {
                  toTreasury += amount;
                }
                break;
              case 'ProcessAll':
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                lastProcessedTime = Number(block.timestamp);
                lastProcessedHash = log.transactionHash;
                break;
            }
          } catch (e) {
            console.error('Error parsing log:', e);
          }
        }

        setOverview({
          lpBurned,
          cornBurned,
          routedTreasury: toTreasury,
          routedStaking: toStaking,
          totalTxCount: txCount,
          lastProcessedTime,
          lastProcessedHash,
        });
      } catch (error) {
        console.error('Error loading supply overview:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [publicClient]);

  return { overview, loading };
}

export function useSupplyEvents() {
  const [events, setEvents] = useState<SupplyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    if (!publicClient) return;

    const loadEvents = async () => {
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 50000n; // Last ~50k blocks

        const logs = await publicClient.getContractEvents({
          address: ADDR.controller as `0x${string}`,
          abi: ControllerABI as Abi,
          fromBlock,
          toBlock: currentBlock,
        });

        const parsedEvents: SupplyEvent[] = [];

        for (const log of logs) {
          try {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });

            parsedEvents.push({
              timestamp: Number(block.timestamp),
              blockNumber: log.blockNumber,
              txHash: log.transactionHash,
              type: log.eventName as string,
              data: log.args,
            });
          } catch (e) {
            // Skip malformed logs
          }
        }

        setEvents(parsedEvents.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
    const interval = setInterval(loadEvents, 20000); // Refresh every 20s

    return () => clearInterval(interval);
  }, [publicClient]);

  return { events, loading };
}

export function useCooldowns() {
  const { data: addLpCooldown } = useReadContract({
    address: ADDR.controller as `0x${string}`,
    abi: ControllerABI,
    functionName: 'addLpCooldown',
  });

  const { data: buybackCooldown } = useReadContract({
    address: ADDR.controller as `0x${string}`,
    abi: ControllerABI,
    functionName: 'buybackCooldown',
  });

  const { data: lastAddLpAt } = useReadContract({
    address: ADDR.controller as `0x${string}`,
    abi: ControllerABI,
    functionName: 'lastAddLpAt',
  });

  const { data: lastBuybackAt } = useReadContract({
    address: ADDR.controller as `0x${string}`,
    abi: ControllerABI,
    functionName: 'lastBuybackAt',
  });

  return {
    addLpCooldown: addLpCooldown as bigint | undefined,
    buybackCooldown: buybackCooldown as bigint | undefined,
    lastAddLpAt: lastAddLpAt as bigint | undefined,
    lastBuybackAt: lastBuybackAt as bigint | undefined,
  };
}
