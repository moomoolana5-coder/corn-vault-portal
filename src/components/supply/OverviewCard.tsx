import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { formatUnits } from '@/lib/format';

interface OverviewCardProps {
  title: string;
  value: bigint;
  decimals: number;
  symbol: string;
  tooltip?: string;
  icon?: React.ReactNode;
}

export function OverviewCard({ title, value, decimals, symbol, tooltip, icon }: OverviewCardProps) {
  const formatted = formatUnits(value, decimals);
  const numValue = parseFloat(formatted);
  const displayValue = numValue >= 1000000 
    ? (numValue / 1000000).toFixed(2) + 'M'
    : numValue >= 1000
    ? (numValue / 1000).toFixed(2) + 'K'
    : numValue.toFixed(2);

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border-border/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {title}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3 h-3" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {displayValue} <span className="text-lg text-muted-foreground">{symbol}</span>
        </div>
      </CardContent>
    </Card>
  );
}
