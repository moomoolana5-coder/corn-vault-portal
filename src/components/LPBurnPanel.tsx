import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, ExternalLink } from 'lucide-react';

interface BurnTx {
  hash: string;
  label: string;
  amount?: string;
}

const burnTransactions: BurnTx[] = [
  {
    hash: '0xfcd7d876627a97fa77512c9295aa7339b61a60a928bd08f2d8a517563bf74cdc',
    label: 'LP Burn Transaction',
    amount: '2% Tax Allocation',
  },
];

export function LPBurnPanel() {
  const openTransaction = (hash: string) => {
    window.open(`https://otter.pulsechain.com/tx/${hash}`, '_blank');
  };

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-destructive/10">
          <Flame className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">LP Burn</h3>
          <p className="text-sm text-muted-foreground">Permanent liquidity removal</p>
        </div>
      </div>

      <div className="space-y-3">
        {burnTransactions.map((tx) => (
          <div 
            key={tx.hash}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1">{tx.label}</p>
              {tx.amount && (
                <p className="text-xs text-muted-foreground">{tx.amount}</p>
              )}
              <p className="text-xs font-mono text-muted-foreground mt-1">
                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openTransaction(tx.hash)}
              className="ml-4"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <div className="mt-4 p-4 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-bold text-accent">2% of every transaction</span> adds liquidity to the pool, 
            then the LP tokens are permanently burned. This creates deep, permanent liquidity that can never be removed.
          </p>
        </div>
      </div>
    </Card>
  );
}
