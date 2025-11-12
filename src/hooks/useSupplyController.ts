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

        let lpMinted = 0n,
          cornBurned = 0n,
          toTreasury = 0n,
          toStaking = 0n,
          txCount = 0,
          lastProcessedTime: number | undefined,
          lastProcessedHash: string | undefined;

        for (const log of logs) {
          try {
            txCount++;
            switch (log.eventName) {
              case 'LiquidityAdded':
              case 'LPBurnExecuted':
                lpMinted += ((log.args as any).cornAmount || (log.args as any).cornUsed || 0n) as bigint;
                break;
              case 'BuybackBurn':
                cornBurned += (log.args as any).burnedAmount as bigint;
                break;
              case 'BuybackBurnExecuted':
                cornBurned += (log.args as any).cornBurned as bigint;
                break;
              case 'SentToTreasury':
                toTreasury += (log.args as any).amount as bigint;
                break;
              case 'SentToStaking':
                toStaking += (log.args as any).amount as bigint;
                break;
              case 'Routed':
                const routedTo = ((log.args as any).to as string).toLowerCase();
                if (routedTo === ADDR.treasury.toLowerCase()) {
                  toTreasury += (log.args as any).amount as bigint;
                } else if (routedTo === ADDR.staking.toLowerCase()) {
                  toStaking += (log.args as any).amount as bigint;
                }
                break;
              case 'ProcessAll':
                const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                lastProcessedTime = Number(block.timestamp);
                lastProcessedHash = log.transactionHash;
                break;
            }
          } catch (e) {
            // Skip malformed logs
          }
        }

        setOverview({
          lpBurned: lpMinted,
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
