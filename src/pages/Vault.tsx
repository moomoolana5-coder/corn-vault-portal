import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { TokenPanel } from '@/components/TokenPanel';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { CORN_ADDRESS, VECORN_ADDRESS } from '@/lib/chains';
import { AlertCircle } from 'lucide-react';

export default function Vault() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">

        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 text-center bg-gradient-corn bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-8 md:mb-12 px-4">
            Overview of your CORN and veCORN holdings
          </p>

          {!isConnected && (
            <Card className="p-8 md:p-12 border-border/40 bg-gradient-card backdrop-blur-sm text-center max-w-md mx-auto shadow-xl">
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 mb-4 md:mb-6">
                <AlertCircle className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-foreground">Connect Your Wallet</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6 md:mb-8">
                Please connect your wallet to view your balances and access staking features
              </p>
              <w3m-button />
            </Card>
          )}

          {/* Token Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <TokenPanel address={CORN_ADDRESS} walletAddress={address} />
            <TokenPanel address={VECORN_ADDRESS} walletAddress={address} />
          </div>

          {/* Distribution Note */}
          <Card className="p-4 md:p-6 border-accent/20 bg-gradient-card backdrop-blur-sm shadow-lg">
            <h4 className="text-sm md:text-base font-bold mb-2 text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-accent" />
              Distribution Note
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground">
              The 5% tax is distributed periodically by the Treasury according to allocation: 2% Add LP (burn), 1% Buyback & Burn, 
              1% Treasury, and 1% Staking Pool. Automated distribution via router will be launched in the next phase.
            </p>
          </Card>
        </div>

        <Footer />
      </div>
    </div>
  );
}
