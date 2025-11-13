import { decodeEventLog, parseAbiItem } from 'viem';

// Event signatures
const LIQUIDITY_ADDED = parseAbiItem('event LiquidityAdded(uint256 cornAmount, uint256 wplsAmount)');
const BUYBACK_BURN = parseAbiItem('event BuybackBurn(uint256 burnedAmount)');
const BUYBACK_BURN_EXECUTED = parseAbiItem('event BuybackBurnExecuted(uint256 pairSpent, uint256 cornBurned)');
const ROUTED = parseAbiItem('event Routed(address indexed to, uint256 amount, bytes32 tag)');
const SENT_TO_STAKING = parseAbiItem('event SentToStaking(uint256 amount)');
const SENT_TO_TREASURY = parseAbiItem('event SentToTreasury(uint256 amount)');
const LP_BURN_EXECUTED = parseAbiItem('event LPBurnExecuted(uint256 cornUsed, uint256 wplsUsed)');
const TRANSFER = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

export interface DecodedEvent {
  type: 'LP_BURN' | 'CORN_BURN' | 'ROUTED_STAKING' | 'BUYBACK' | 'TREASURY' | 'UNKNOWN';
  data: any;
  timestamp: number;
  txHash: string;
  blockNumber: number;
}

export function decodeEventFromLog(log: any, txHash: string, timestamp: number, blockNumber: number): DecodedEvent | null {
  try {
    const topics = log.topics as `0x${string}`[];
    const data = log.data as `0x${string}`;

    // Try LiquidityAdded
    if (topics[0] === '0x38f8a0c92f4c5b0b6877f878cb4c0c8d348a47b76d716c8e78f425043df9515b') {
      const decoded = decodeEventLog({
        abi: [LIQUIDITY_ADDED],
        data,
        topics: topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      }) as any;
      return {
        type: 'LP_BURN',
        data: {
          cornAmount: decoded.args.cornAmount,
          wplsAmount: decoded.args.wplsAmount,
        },
        timestamp,
        txHash,
        blockNumber,
      };
    }

    // Try BuybackBurn
    if (topics[0] === '0x0eb2b10c87e1c4ff95bd0b92484421e1b354da89f4e87418b0c4c3cd0c7eb925') {
      const decoded = decodeEventLog({
        abi: [BUYBACK_BURN],
        data,
        topics: topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      }) as any;
      return {
        type: 'BUYBACK',
        data: {
          burnedAmount: decoded.args.burnedAmount,
        },
        timestamp,
        txHash,
        blockNumber,
      };
    }

    // Try BuybackBurnExecuted
    if (topics[0] === '0x837d122da8eb344bb8a97782cfa2e9ae54c7ad6d40386bb18587404322257980') {
      const decoded = decodeEventLog({
        abi: [BUYBACK_BURN_EXECUTED],
        data,
        topics: topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      }) as any;
      return {
        type: 'BUYBACK',
        data: {
          pairSpent: decoded.args.pairSpent,
          cornBurned: decoded.args.cornBurned,
        },
        timestamp,
        txHash,
        blockNumber,
      };
    }

    // Try SentToStaking
    if (topics[0] === '0xdcfb4cd8123e8682cdaa55a0b80684b1e34dc3f4727e895b8f609aedeab1263d') {
      const decoded = decodeEventLog({
        abi: [SENT_TO_STAKING],
        data,
        topics: topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      }) as any;
      return {
        type: 'ROUTED_STAKING',
        data: {
          amount: decoded.args.amount,
        },
        timestamp,
        txHash,
        blockNumber,
      };
    }

    // Try SentToTreasury
    if (topics[0] === '0x686d2f0101a1f53528e4dda6dac5ccff301a2f39442451cd0d476468d58f8b16') {
      const decoded = decodeEventLog({
        abi: [SENT_TO_TREASURY],
        data,
        topics: topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      }) as any;
      return {
        type: 'TREASURY',
        data: {
          amount: decoded.args.amount,
        },
        timestamp,
        txHash,
        blockNumber,
      };
    }

    // Try LPBurnExecuted
    if (topics[0] === '0x6bd64abe4326e65824acc8cd0a4fc043a3187d78895100df17a8032929c3f769') {
      const decoded = decodeEventLog({
        abi: [LP_BURN_EXECUTED],
        data,
        topics: topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      }) as any;
      return {
        type: 'LP_BURN',
        data: {
          cornUsed: decoded.args.cornUsed,
          wplsUsed: decoded.args.wplsUsed,
        },
        timestamp,
        txHash,
        blockNumber,
      };
    }

    // Try Routed
    if (topics[0] === '0x26c9722f3a9788adae83c1ac9cffd88e77f74ff5fdb5a8a0296e524f96903bbc') {
      const decoded = decodeEventLog({
        abi: [ROUTED],
        data,
        topics: topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      }) as any;
      
      // Check if routed to staking
      const STAKING_ADDRESS = '0x214841112f761859f03dC441E7F299aE28eFA40B'.toLowerCase();
      const to = (decoded.args.to as string).toLowerCase();
      
      if (to === STAKING_ADDRESS) {
        return {
          type: 'ROUTED_STAKING',
          data: {
            amount: decoded.args.amount,
            to: decoded.args.to,
          },
          timestamp,
          txHash,
          blockNumber,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error decoding event:', error);
    return null;
  }
}
