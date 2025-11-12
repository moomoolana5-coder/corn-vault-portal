import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, TrendingUp, Activity } from 'lucide-react';
import { useTransfers } from '@/hooks/useTransfers';
import { compactNumber } from '@/lib/format';

interface HolderPanelProps {
  tokenAddress: `0x${string}`;
}

export function HolderPanel({ tokenAddress }: HolderPanelProps) {
  const { holdersApprox, transfers24h, isLoading, error } = useTransfers(tokenAddress);

  if (error) {
    return (
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">Unable to load holder data</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary" />
        On-Chain Activity
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">Approx. Holders</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{compactNumber(holdersApprox)}</p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-secondary/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">24h Transfers</span>
          </div>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="text-2xl font-bold text-foreground">{compactNumber(transfers24h)}</p>
          )}
        </div>
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Scanning blockchain...
        </p>
      )}
    </Card>
  );
}
