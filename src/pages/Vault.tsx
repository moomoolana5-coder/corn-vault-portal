import { useAccount } from 'wagmi';
import { CornBadge } from '@/components/CornBadge';
import { TokenPanel } from '@/components/TokenPanel';
import { VaultPanel } from '@/components/VaultPanel';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { CORN_ADDRESS, VECORN_ADDRESS } from '@/lib/chains';
import { AlertCircle } from 'lucide-react';

export default function Vault() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <CornBadge />
          <nav className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/access">
              <Button variant="ghost">Access</Button>
            </Link>
            <Link to="/docs">
              <Button variant="ghost">Docs</Button>
            </Link>
            <w3m-button />
          </nav>
        </header>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-corn bg-clip-text text-transparent">
            Vault Dashboard
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Manage your CORN and veCORN holdings, stake for rewards
          </p>

          {!isConnected && (
            <Card className="p-8 mb-8 border-border/50 bg-card/50 backdrop-blur-sm text-center">
              <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-foreground">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to view your balances and access staking features.
              </p>
              <w3m-button />
            </Card>
          )}

          {/* Token Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <TokenPanel address={CORN_ADDRESS} walletAddress={address} />
            <TokenPanel address={VECORN_ADDRESS} walletAddress={address} />
          </div>

          {/* Staking Interface */}
          <VaultPanel />

          {/* Distribution Note */}
          <Card className="p-6 mt-6 border-border/50 bg-secondary/30 backdrop-blur-sm">
            <h4 className="font-bold mb-2 text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" />
              Distribution Note
            </h4>
            <p className="text-sm text-muted-foreground">
              Tax 5% didistribusikan berkala oleh Treasury sesuai alokasi: 2% Add LP (burn), 1% Buyback & Burn, 
              1% Treasury, dan 1% Staking Pool. Mekanisme otomatis melalui router akan diluncurkan dalam tahap berikutnya.
            </p>
          </Card>
        </div>

        <Footer />
      </div>
    </div>
  );
}
