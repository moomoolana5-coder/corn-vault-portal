import { Card } from '@/components/ui/card';
import { Flame, Droplet, Vault, Users } from 'lucide-react';

const taxItems = [
  { label: 'Add LP (Burn)', percent: 2, icon: Flame, color: 'text-destructive' },
  { label: 'Buyback & Burn', percent: 1, icon: Flame, color: 'text-destructive' },
  { label: 'Treasury', percent: 1, icon: Vault, color: 'text-accent' },
  { label: 'Staking Pool', percent: 1, icon: Users, color: 'text-primary' },
];

export function TaxBreakdown() {
  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4 text-foreground">Tax Breakdown (5%)</h3>
      
      <div className="space-y-4 mb-6">
        {taxItems.map((item) => (
          <div key={item.label} className="flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-secondary ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                <span className="text-sm font-bold text-primary">{item.percent}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-corn"
                  style={{ width: `${(item.percent / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-muted-foreground space-y-2 border-t border-border pt-4">
        <p className="font-medium text-foreground">How it works:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>2% adds liquidity then burns LP tokens (permanent liquidity)</li>
          <li>1% buyback CORN from market and burns (deflationary)</li>
          <li>1% funds development and operations</li>
          <li>1% rewards veCORN stakers</li>
        </ul>
      </div>
    </Card>
  );
}
