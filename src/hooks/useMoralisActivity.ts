import { useState, useEffect } from 'react';
import { formatUnits } from 'viem';
import { decodeEventFromLog, DecodedEvent } from '@/lib/moralisDecoder';

const MORALIS_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjcyYzI1ZDZkLTIwYmYtNDI0Ni1hOGQ3LWNkN2JmZGYxY2I1NiIsIm9yZ0lkIjoiNDc5NDA1IiwidXNlcklkIjoiNDkzMjA3IiwidHlwZUlkIjoiYWM2M2RlY2QtOTk0NS00MjFjLWIzMDEtNzlkNTI2YjBjM2Q1IiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3NjIyMzcxMjMsImV4cCI6NDkxNzk5NzEyM30.IBA7bYfOqWhRkeah-zrpB5X-p_z_ZlU7vpEd4nvwgUo';
const API_BASE = 'https://deep-index.moralis.io/api/v2.2';
const CHAIN = 'pulsechain';
const CONTROLLER_ADDRESS = '0x9D86aB0c305633A1e77cfEADF62d07AB70e7CCf5';
const LP_TOKEN_ADDRESS = '0x02E711624e739005a365dC094e59D65e593b65C7';
const CORN_TOKEN_ADDRESS = '0xd7661cce8EeD01CBAA0188FAcdDE2e46c4Ebe4B0';
const DEAD_ADDRESS = '0x0000000000000000000000000000000000000369';

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

      // Fetch LP token burns (Transfer to DEAD address) with pagination
      let lpBurnTransfers: any[] = [];
      {
        let cursor: string | null = null;
        do {
          const url = new URL(`${API_BASE}/erc20/${LP_TOKEN_ADDRESS}/transfers`);
          url.searchParams.set('chain', CHAIN);
          url.searchParams.set('to_address', DEAD_ADDRESS);
          url.searchParams.set('limit', '100');
          if (cursor) url.searchParams.set('cursor', cursor);

          const resp = await fetch(url.toString(), {
            headers: { 'X-API-Key': MORALIS_API_KEY, accept: 'application/json' },
          });
          if (!resp.ok) break;
          const data = await resp.json();
          lpBurnTransfers.push(...(data.result || []));
          cursor = data.cursor || null;
        } while (cursor && lpBurnTransfers.length < 1000);
      }

      // Fetch CORN burns (Transfer CORN -> DEAD) with pagination
      let cornBurnTransfers: any[] = [];
      {
        let cursor: string | null = null;
        do {
          const url = new URL(`${API_BASE}/erc20/${CORN_TOKEN_ADDRESS}/transfers`);
          url.searchParams.set('chain', CHAIN);
          url.searchParams.set('to_address', DEAD_ADDRESS);
          url.searchParams.set('limit', '100');
          if (cursor) url.searchParams.set('cursor', cursor);

          const resp = await fetch(url.toString(), {
            headers: { 'X-API-Key': MORALIS_API_KEY, accept: 'application/json' },
          });
          if (!resp.ok) break;
          const data = await resp.json();
          cornBurnTransfers.push(...(data.result || []));
          cursor = data.cursor || null;
        } while (cursor && cornBurnTransfers.length < 1000);
      }

      // Fetch wallet transactions (pagination)
      const transactions: any[] = [];
      {
        let cursor: string | null = null;
        do {
          const url = new URL(`${API_BASE}/${CONTROLLER_ADDRESS}/transactions`);
          url.searchParams.set('chain', CHAIN);
          url.searchParams.set('limit', '100');
          if (cursor) url.searchParams.set('cursor', cursor);

          const resp = await fetch(url.toString(), {
            headers: { 'X-API-Key': MORALIS_API_KEY, accept: 'application/json' },
          });
          if (!resp.ok) break;
          const data = await resp.json();
          transactions.push(...(data.result || []));
          cursor = data.cursor || null;
        } while (cursor && transactions.length < 500);
      }

      // Aggregate metrics and collect activities
      let totalLpBurned = 0n;
      let totalCornBurned = 0n;
      let totalRoutedStaking = 0n;
      let totalBuyback = 0n;
      const activityList: ActivityRecord[] = [];

      // Process LP burns first
      lpBurnTransfers.forEach((transfer: any) => {
        // Only count burns from controller address
        if (transfer.from_address?.toLowerCase() === CONTROLLER_ADDRESS.toLowerCase()) {
          const burnAmount = BigInt(transfer.value || 0);
          totalLpBurned += burnAmount;

          activityList.push({
            id: `lp-${transfer.transaction_hash}-${transfer.log_index}`,
            date: new Date(transfer.block_timestamp),
            txHash: transfer.transaction_hash,
            type: 'LP_BURN',
            value: formatUnits(burnAmount, 18),
            blockNumber: parseInt(transfer.block_number),
          });
        }
      });

      // Process CORN burns via ERC20 Transfer to DEAD
      cornBurnTransfers.forEach((transfer: any) => {
        if (transfer.from_address?.toLowerCase() === CONTROLLER_ADDRESS.toLowerCase()) {
          const burnAmount = BigInt(transfer.value || 0);
          totalCornBurned += burnAmount;

          activityList.push({
            id: `corn-${transfer.transaction_hash}-${transfer.log_index}`,
            date: new Date(transfer.block_timestamp),
            txHash: transfer.transaction_hash,
            type: 'CORN_BURN',
            value: formatUnits(burnAmount, 18),
            blockNumber: parseInt(transfer.block_number),
          });
        }
      });

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
