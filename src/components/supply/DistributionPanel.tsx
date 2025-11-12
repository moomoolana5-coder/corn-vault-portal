import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { shortenAddress } from '@/lib/format';
import { ADDR } from '@/config/addresses';

export function DistributionPanel() {
  const distributions = [
    { label: 'Auto-LP → 0xdead', percent: 40, icon: '🔥', address: ADDR.dead, color: 'text-orange-500' },
    { label: 'Buyback & Burn', percent: 20, icon: '🔥', address: ADDR.dead, color: 'text-red-500' },
    { label: 'Treasury', percent: 20, icon: '💼', address: ADDR.treasury, color: 'text-blue-500' },
    { label: 'Staking', percent: 20, icon: '🥇', address: ADDR.staking, color: 'text-green-500' },
  ];

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Distribution Model (40/20/20/20)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {distributions.map((dist, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{dist.icon}</span>
                <span className={`text-sm font-medium ${dist.color}`}>{dist.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">{dist.percent}%</span>
            </div>
            <Progress value={dist.percent} className="h-2" />
            <div className="text-xs text-muted-foreground font-mono">
              {shortenAddress(dist.address, 6)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
