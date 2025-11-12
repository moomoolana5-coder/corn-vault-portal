import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Info } from 'lucide-react';
import { STAKING_VAULT } from '@/lib/chains';

export function VaultPanel() {
  if (!STAKING_VAULT) {
    return (
      <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-foreground">Staking Vault Coming Soon</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          The staking vault contract will be announced soon. Rewards from the 1% staking allocation 
          are currently routed weekly by the Treasury team.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent text-xs">
          <Info className="w-4 h-4" />
          <span>Tax allocation: 5% → 1% to Staking Pool</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 text-foreground">Staking Vault</h3>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Stake your veCORN to earn rewards from the staking pool allocation.
        </p>
        <div className="flex gap-3">
          <Button className="flex-1" variant="default">
            Stake veCORN
          </Button>
          <Button className="flex-1" variant="secondary">
            Unstake
          </Button>
        </div>
        <Button className="w-full" variant="outline">
          Claim Rewards
        </Button>
      </div>
    </Card>
  );
}
