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

  console.log(`StakingPoolCard - ${stakeTokenSymbol} → ${earnTokenSymbol}:`, {
    stakeTokenData,
    earnTokenData,
    stakeLoading,
    earnLoading,
  });

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-gradient-card backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative p-6">
        {/* Pool Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center -space-x-3">
              {stakeLoading ? (
                <Skeleton className="w-12 h-12 rounded-full" />
              ) : stakeTokenData?.logo ? (
                <img 
                  src={stakeTokenData.logo} 
                  alt={stakeTokenSymbol} 
                  className="w-12 h-12 rounded-full border-2 border-background object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    console.error(`Failed to load image for ${stakeTokenSymbol}:`, stakeTokenData.logo);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold border-2 border-background shadow-md ${stakeTokenData?.logo ? 'hidden' : ''}`}>
                {stakeTokenSymbol.slice(0, 2)}
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 z-10">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              {earnLoading ? (
                <Skeleton className="w-12 h-12 rounded-full" />
              ) : earnTokenData?.logo ? (
                <img 
                  src={earnTokenData.logo} 
                  alt={earnTokenSymbol} 
                  className="w-12 h-12 rounded-full border-2 border-background object-cover shadow-md transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    console.error(`Failed to load image for ${earnTokenSymbol}:`, earnTokenData.logo);
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold border-2 border-background shadow-md ${earnTokenData?.logo ? 'hidden' : ''}`}>
                {earnTokenSymbol.slice(0, 2)}
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-foreground mb-0.5">Stake {stakeTokenSymbol}</p>
              <p className="text-sm text-muted-foreground">Earn {earnTokenSymbol}</p>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-lg bg-background/60 border border-border/40 backdrop-blur-sm">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Available</p>
            <p className="text-lg font-semibold text-foreground">{formatBalance(stakeBalance.formatted)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stakeTokenSymbol}</p>
          </div>
          <div className="p-4 rounded-lg bg-background/60 border border-border/40 backdrop-blur-sm">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Staked</p>
            <p className="text-lg font-semibold text-foreground">0.00</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stakeTokenSymbol}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="stake" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Stake</TabsTrigger>
            <TabsTrigger value="unstake" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">Unstake</TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor={`stake-${stakeTokenAddress}`} className="text-sm font-medium">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id={`stake-${stakeTokenAddress}`}
                  type="number"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="h-11 bg-background/60 border-border/40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStakeAmount(stakeBalance.formatted)}
                  className="px-6 font-medium"
                >
                  MAX
                </Button>
              </div>
            </div>
            <Button className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all">
              <Lock className="w-4 h-4 mr-2" />
              Stake {stakeTokenSymbol}
            </Button>
          </TabsContent>

          <TabsContent value="unstake" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor={`unstake-${stakeTokenAddress}`} className="text-sm font-medium">Amount</Label>
              <div className="flex gap-2">
                <Input
                  id={`unstake-${stakeTokenAddress}`}
                  type="number"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  className="h-11 bg-background/60 border-border/40"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnstakeAmount('0.00')}
                  className="px-6 font-medium"
                >
                  MAX
                </Button>
              </div>
            </div>
            <Button className="w-full h-11 font-medium shadow-md hover:shadow-lg transition-all" variant="secondary">
              <Unlock className="w-4 h-4 mr-2" />
              Unstake {stakeTokenSymbol}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Pending Rewards */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Pending Rewards</p>
              <p className="text-lg font-semibold text-foreground">0.00 <span className="text-sm font-normal text-muted-foreground">{earnTokenSymbol}</span></p>
            </div>
            <Button size="sm" variant="outline" disabled className="font-medium">
              Claim
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
