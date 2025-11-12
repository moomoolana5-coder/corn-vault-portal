import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink } from 'lucide-react';
import { useTokenMeta, useFormattedBalance } from '@/hooks/useErc20';
import { formatBalance, shortenAddress } from '@/lib/format';
import { toast } from 'sonner';

interface TokenPanelProps {
  address: `0x${string}`;
  walletAddress?: `0x${string}`;
  explorerUrl?: string;
}

export function TokenPanel({ address, walletAddress, explorerUrl = 'https://scan.pulsechain.com' }: TokenPanelProps) {
  const { name, symbol, decimals, totalSupply, isLoading: metaLoading } = useTokenMeta(address);
  const { formatted, isLoading: balanceLoading } = useFormattedBalance(address, walletAddress, decimals);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  const openExplorer = () => {
    window.open(`${explorerUrl}/token/${address}`, '_blank');
  };

  if (metaLoading) {
    return (
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </Card>
    );
  }

  const formattedSupply = totalSupply && decimals 
    ? formatBalance(parseFloat((Number(totalSupply) / Math.pow(10, decimals)).toFixed(2)))
    : '0';

  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground">{symbol || 'Token'}</h3>
          <p className="text-sm text-muted-foreground">{name || 'Loading...'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={copyAddress}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={openExplorer}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Contract</span>
          <span className="text-sm font-mono font-medium text-foreground">{shortenAddress(address)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Total Supply</span>
          <span className="text-sm font-bold text-foreground">{formattedSupply} {symbol}</span>
        </div>

        {walletAddress && (
          <div className="flex justify-between items-center py-2 bg-secondary/30 px-3 rounded-lg">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            {balanceLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="text-sm font-bold text-primary">{formatBalance(formatted)} {symbol}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
