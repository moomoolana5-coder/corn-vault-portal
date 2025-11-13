import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { decodeEventFromLog, DecodedEvent } from '@/lib/moralisDecoder';

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjcyYzI1ZDZkLTIwYmYtNDI0Ni1hOGQ3LWNkN2JmZGYxY2I1NiIsIm9yZ0lkIjoiNDc5NDA1IiwidXNlcklkIjoiNDkzMjA3IiwidHlwZUlkIjoiYWM2M2RlY2QtOTk0NS00MjFjLWIzMDEtNzlkNTI2YjBjM2Q1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjIyMzcxMjMsImV4cCI6NDkxNzk5NzEyM30.IBA7bYfOqWhRkeah-zrpB5X-p_z_ZlU7vpEd4nvwgUo';
const API_BASE = 'https://deep-index.moralis.io/api/v2.2';
const CHAIN = 'pulsechain';
const CONTROLLER_ADDRESS = '0x9D86aB0c305633A1e77cfEADF62d07AB70e7CCf5';

export interface ActivityMetrics {
  lpBurned: string;
  cornBurned: string;
  routedToStaking: string;
  buyback: string;
}

export interface ActivityRecord {
  id: string;
  date: Date;
  txHash: string;
  type: 'LP_BURN' | 'CORN_BURN' | 'ROUTED_STAKING' | 'BUYBACK';
  value: string;
  blockNumber: number;
}

export function useMoralisActivity(autoRefresh = true, refreshInterval = 30000) {
  const [metrics, setMetrics] = useState<ActivityMetrics>({
    lpBurned: '0',
    cornBurned: '0',
    routedToStaking: '0',
    buyback: '0',
  });
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch wallet transactions
      const txsUrl = `${API_BASE}/${CONTROLLER_ADDRESS}`;
      const txsResponse = await fetch(txsUrl, {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'accept': 'application/json',
        },
      });

      if (!txsResponse.ok) {
        throw new Error(`Failed to fetch transactions: ${txsResponse.statusText}`);
      }

      const txsData = await txsResponse.json();
      const transactions = txsData.result || [];

      // Aggregate metrics and collect activities
      let totalLpBurned = 0n;
      let totalCornBurned = 0n;
      let totalRoutedStaking = 0n;
      let totalBuyback = 0n;
      const activityList: ActivityRecord[] = [];

      // Process transactions in batches
      const batchSize = 10;
      for (let i = 0; i < Math.min(transactions.length, 100); i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (tx: any) => {
            try {
              // Fetch transaction verbose (with logs)
              const verboseUrl = `${API_BASE}/transaction/${tx.hash}/verbose?chain=${CHAIN}`;
              const verboseResponse = await fetch(verboseUrl, {
                headers: {
                  'X-API-Key': MORALIS_API_KEY,
                  'accept': 'application/json',
                },
              });

              if (!verboseResponse.ok) return;

              const verboseData = await verboseResponse.json();
              const logs = verboseData.logs || [];
              const timestamp = new Date(tx.block_timestamp).getTime();

              // Process each log
              logs.forEach((log: any) => {
                // Only process logs from controller address
                if (log.address?.toLowerCase() !== CONTROLLER_ADDRESS.toLowerCase()) {
                  return;
                }

                const decoded = decodeEventFromLog(
                  log,
                  tx.hash,
                  timestamp,
                  parseInt(tx.block_number)
                );

                if (!decoded) return;

                // Aggregate metrics
                if (decoded.type === 'LP_BURN') {
                  const cornAmount = BigInt(decoded.data.cornAmount || decoded.data.cornUsed || 0);
                  const wplsAmount = BigInt(decoded.data.wplsAmount || decoded.data.wplsUsed || 0);
                  const lpValue = cornAmount < wplsAmount ? cornAmount : wplsAmount;
                  totalLpBurned += lpValue;

                  activityList.push({
                    id: `${tx.hash}-${log.log_index}`,
                    date: new Date(timestamp),
                    txHash: tx.hash,
                    type: 'LP_BURN',
                    value: formatUnits(lpValue, 18),
                    blockNumber: parseInt(tx.block_number),
                  });
                } else if (decoded.type === 'BUYBACK') {
                  const burnAmount = BigInt(decoded.data.burnedAmount || decoded.data.cornBurned || 0);
                  totalCornBurned += burnAmount;
                  totalBuyback += burnAmount;

                  activityList.push({
                    id: `${tx.hash}-${log.log_index}`,
                    date: new Date(timestamp),
                    txHash: tx.hash,
                    type: 'BUYBACK',
                    value: formatUnits(burnAmount, 18),
                    blockNumber: parseInt(tx.block_number),
                  });
                } else if (decoded.type === 'ROUTED_STAKING') {
                  const amount = BigInt(decoded.data.amount || 0);
                  totalRoutedStaking += amount;

                  activityList.push({
                    id: `${tx.hash}-${log.log_index}`,
                    date: new Date(timestamp),
                    txHash: tx.hash,
                    type: 'ROUTED_STAKING',
                    value: formatUnits(amount, 18),
                    blockNumber: parseInt(tx.block_number),
                  });
                }
              });
            } catch (err) {
              console.error('Error processing transaction:', tx.hash, err);
            }
          })
        );
      }

      // Update state
      setMetrics({
        lpBurned: formatUnits(totalLpBurned, 18),
        cornBurned: formatUnits(totalCornBurned, 18),
        routedToStaking: formatUnits(totalRoutedStaking, 18),
        buyback: formatUnits(totalBuyback, 18),
      });

      // Sort activities by date (newest first)
      activityList.sort((a, b) => b.date.getTime() - a.date.getTime());
      setActivities(activityList);

      setLoading(false);
    } catch (err) {
      console.error('Error fetching Moralis activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();

    if (autoRefresh) {
      const interval = setInterval(fetchActivity, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    metrics,
    activities,
    loading,
    error,
    refetch: fetchActivity,
  };
}
