import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CooldownInfoProps {
  addLpCooldown?: bigint;
  buybackCooldown?: bigint;
  lastAddLpAt?: bigint;
  lastBuybackAt?: bigint;
}

export function CooldownInfo({ addLpCooldown, buybackCooldown, lastAddLpAt, lastBuybackAt }: CooldownInfoProps) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (lastAt?: bigint, cooldown?: bigint) => {
    if (!lastAt || !cooldown) return 'Loading...';
    
    const nextEligible = Number(lastAt) + Number(cooldown);
    const remaining = nextEligible - now;
    
    if (remaining <= 0) return 'Ready now ✓';
    
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/40">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Cooldown Timers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Next Add-LP Eligible</div>
          <div className="text-lg font-semibold text-foreground">
            {getTimeRemaining(lastAddLpAt, addLpCooldown)}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Next Buyback Eligible</div>
          <div className="text-lg font-semibold text-foreground">
            {getTimeRemaining(lastBuybackAt, buybackCooldown)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
