import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Unlock, ArrowRight } from 'lucide-react';
import { useFormattedBalance } from '@/hooks/useErc20';
import { useDexScreenerToken } from '@/hooks/useDexScreener';
import { formatBalance } from '@/lib/format';

interface StakingPoolCardProps {
  stakeTokenAddress: `0x${string}`;
  earnTokenAddress: `0x${string}`;
  stakeTokenSymbol: string;
  earnTokenSymbol: string;
  stakeTokenDecimals?: number;
  earnTokenDecimals?: number;
  walletAddress: `0x${string}` | undefined;
}

export function StakingPoolCard({
  stakeTokenAddress,
  earnTokenAddress,
  stakeTokenSymbol,
  earnTokenSymbol,
  stakeTokenDecimals,
  earnTokenDecimals,
  walletAddress,
}: StakingPoolCardProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  const stakeBalance = useFormattedBalance(stakeTokenAddress, walletAddress, stakeTokenDecimals);
  const earnBalance = useFormattedBalance(earnTokenAddress, walletAddress, earnTokenDecimals);
  
  const { data: stakeTokenData, isLoading: stakeLoading } = useDexScreenerToken(stakeTokenAddress);
  const { data: earnTokenData, isLoading: earnLoading } = useDexScreenerToken(earnTokenAddress);

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Pool Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            {stakeLoading ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : stakeTokenData?.logo ? (
              <img src={stakeTokenData.logo} alt={stakeTokenSymbol} className="w-10 h-10 rounded-full border-2 border-background" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold border-2 border-background">
                {stakeTokenSymbol.slice(0, 2)}
              </div>
            )}
            <ArrowRight className="w-5 h-5 text-muted-foreground z-10" />
            {earnLoading ? (
              <Skeleton className="w-10 h-10 rounded-full" />
            ) : earnTokenData?.logo ? (
              <img src={earnTokenData.logo} alt={earnTokenSymbol} className="w-10 h-10 rounded-full border-2 border-background" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold border-2 border-background">
                {earnTokenSymbol.slice(0, 2)}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-foreground">Stake {stakeTokenSymbol}</p>
            <p className="text-sm text-muted-foreground">Earn {earnTokenSymbol}</p>
          </div>
        </div>
      </div>

      {/* Balance Display */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-muted-foreground mb-1">Your {stakeTokenSymbol}</p>
          <p className="font-bold text-foreground">{formatBalance(stakeBalance.formatted)}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-xs text-muted-foreground mb-1">Staked</p>
          <p className="font-bold text-foreground">0.00</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stake" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stake">Stake</TabsTrigger>
          <TabsTrigger value="unstake">Unstake</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-3 mt-4">
          <div className="space-y-2">
            <Label htmlFor={`stake-${stakeTokenAddress}`} className="text-xs">Amount</Label>
            <div className="flex gap-2">
              <Input
                id={`stake-${stakeTokenAddress}`}
                type="number"
                placeholder="0.0"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStakeAmount(stakeBalance.formatted)}
              >
                MAX
              </Button>
            </div>
          </div>
          <Button className="w-full" size="sm">
            <Lock className="w-4 h-4 mr-2" />
            Stake
          </Button>
        </TabsContent>

        <TabsContent value="unstake" className="space-y-3 mt-4">
          <div className="space-y-2">
            <Label htmlFor={`unstake-${stakeTokenAddress}`} className="text-xs">Amount</Label>
            <div className="flex gap-2">
              <Input
                id={`unstake-${stakeTokenAddress}`}
                type="number"
                placeholder="0.0"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnstakeAmount('0.00')}
              >
                MAX
              </Button>
            </div>
          </div>
          <Button className="w-full" variant="secondary" size="sm">
            <Unlock className="w-4 h-4 mr-2" />
            Unstake
          </Button>
        </TabsContent>
      </Tabs>

      {/* Pending Rewards */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Pending Rewards</p>
            <p className="font-bold text-foreground">0.00 {earnTokenSymbol}</p>
          </div>
          <Button size="sm" variant="outline" disabled>
            Claim
          </Button>
        </div>
      </div>
    </Card>
  );
}
