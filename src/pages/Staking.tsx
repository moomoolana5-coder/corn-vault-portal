import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTokenMeta, useFormattedBalance } from '@/hooks/useErc20';
import { CORN_ADDRESS, VECORN_ADDRESS } from '@/lib/chains';
import { AlertCircle, Lock, Unlock, Gift } from 'lucide-react';
import { useState } from 'react';
import { formatBalance } from '@/lib/format';

export default function Staking() {
  const { address, isConnected } = useAccount();
  const cornMeta = useTokenMeta(CORN_ADDRESS);
  const veCornMeta = useTokenMeta(VECORN_ADDRESS);
  const cornBalance = useFormattedBalance(CORN_ADDRESS, address, cornMeta.decimals);
  const veCornBalance = useFormattedBalance(VECORN_ADDRESS, address, veCornMeta.decimals);
  
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-corn bg-clip-text text-transparent">
            Staking
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Stake veCORN to earn rewards from the staking pool
          </p>

          {!isConnected && (
            <Card className="p-8 mb-8 border-border/50 bg-card/50 backdrop-blur-sm text-center">
              <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-foreground">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to access staking features.
              </p>
              <w3m-button />
            </Card>
          )}

          {isConnected && (
            <>
              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your CORN Balance</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatBalance(cornBalance.formatted)} {cornMeta.symbol}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <Gift className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Your veCORN Balance</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatBalance(veCornBalance.formatted)} {veCornMeta.symbol}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Staking Interface */}
              <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm mb-8">
                <Tabs defaultValue="stake" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="stake">Stake</TabsTrigger>
                    <TabsTrigger value="unstake">Unstake</TabsTrigger>
                    <TabsTrigger value="claim">Claim Rewards</TabsTrigger>
                  </TabsList>

                  <TabsContent value="stake" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="stake-amount">Amount to Stake</Label>
                      <div className="flex gap-2">
                        <Input
                          id="stake-amount"
                          type="number"
                          placeholder="0.0"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={() => setStakeAmount(cornBalance.formatted)}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Available: {formatBalance(cornBalance.formatted)} {cornMeta.symbol}
                      </p>
                    </div>
                    <Button className="w-full" size="lg">
                      <Lock className="w-4 h-4 mr-2" />
                      Stake veCORN
                    </Button>
                  </TabsContent>

                  <TabsContent value="unstake" className="space-y-4 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="unstake-amount">Amount to Unstake</Label>
                      <div className="flex gap-2">
                        <Input
                          id="unstake-amount"
                          type="number"
                          placeholder="0.0"
                          value={unstakeAmount}
                          onChange={(e) => setUnstakeAmount(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          onClick={() => setUnstakeAmount(veCornBalance.formatted)}
                        >
                          MAX
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Staked: {formatBalance(veCornBalance.formatted)} {veCornMeta.symbol}
                      </p>
                    </div>
                    <Button className="w-full" variant="secondary" size="lg">
                      <Unlock className="w-4 h-4 mr-2" />
                      Unstake veCORN
                    </Button>
                  </TabsContent>

                  <TabsContent value="claim" className="space-y-4 mt-6">
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
                        <Gift className="w-8 h-8 text-accent" />
                      </div>
                      <p className="text-2xl font-bold text-foreground mb-2">0.00 CORN</p>
                      <p className="text-sm text-muted-foreground mb-6">Pending Rewards</p>
                      <Button className="w-full" variant="default" size="lg" disabled>
                        <Gift className="w-4 h-4 mr-2" />
                        Claim Rewards
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Info Card */}
              <Card className="p-6 border-accent/20 bg-accent/5 backdrop-blur-sm">
                <h4 className="font-bold mb-3 text-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  How Staking Works
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Stake your CORN to receive veCORN tokens</li>
                  <li>• Earn rewards from the 1% staking pool allocation</li>
                  <li>• Rewards are distributed periodically by the Treasury</li>
                  <li>• Unstake anytime to convert veCORN back to CORN</li>
                  <li>• Higher veCORN balance = higher reward share</li>
                </ul>
              </Card>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
