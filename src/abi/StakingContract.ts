export const stakingAbi = [
  {
    inputs: [],
    name: 'poolLength',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'pools',
    outputs: [
      { internalType: 'address', name: 'stakeToken', type: 'address' },
      { internalType: 'address', name: 'rewardToken', type: 'address' },
      { internalType: 'uint256', name: 'accRewardPerShare', type: 'uint256' },
      { internalType: 'uint256', name: 'lastTime', type: 'uint256' },
      { internalType: 'uint256', name: 'rewardsPerSecond', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
      { internalType: 'uint256', name: 'totalStaked', type: 'uint256' },
      { internalType: 'bool', name: 'paused', type: 'bool' },
      { internalType: 'string', name: 'label', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'userInfo',
    outputs: [
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
      { internalType: 'uint256', name: 'rewardDebt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pid', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'pendingReward',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pid', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'pid', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'pid', type: 'uint256' }],
    name: 'harvest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256[]', name: 'pids', type: 'uint256[]' }],
    name: 'claimAll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
