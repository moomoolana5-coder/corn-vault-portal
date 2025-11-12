import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { formatUnits } from '@/lib/format';
import { useState } from 'react';

interface BalancesBoxProps {
  cornInController?: bigint;
  wplsInController?: bigint;
  cornInTreasury?: bigint;
  cornInStaking?: bigint;
  onRefresh: () => void;
}

export function BalancesBox({
  cornInController,
  wplsInController,
  cornInTreasury,
  cornInStaking,
  onRefresh,
}: BalancesBoxProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatBalance = (value?: bigint, decimals = 18) => {
    if (!value) return '0.00';
    const num = parseFloat(formatUnits(value, decimals));
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Contract Balances</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8 w-8"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Controller</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">🌽 CORN</span>
                <span className="font-semibold">{formatBalance(cornInController)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">⚡ WPLS</span>
                <span className="font-semibold">{formatBalance(wplsInController)}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Destinations</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">💼 Treasury</span>
                <span className="font-semibold">{formatBalance(cornInTreasury)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">🥇 Staking</span>
                <span className="font-semibold">{formatBalance(cornInStaking)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
