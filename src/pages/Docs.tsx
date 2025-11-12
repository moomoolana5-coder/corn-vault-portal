import { CornBadge } from '@/components/CornBadge';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink } from 'lucide-react';
import { CORN_ADDRESS, VECORN_ADDRESS } from '@/lib/chains';
import { toast } from 'sonner';

export default function Docs() {
  const copyAddress = (address: string, name: string) => {
    navigator.clipboard.writeText(address);
    toast.success(`${name} address copied to clipboard`);
  };

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
            <Link to="/vault">
              <Button variant="ghost">Vault</Button>
            </Link>
            <Link to="/access">
              <Button variant="ghost">Access</Button>
            </Link>
            <w3m-button />
          </nav>
        </header>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-corn bg-clip-text text-transparent">
            Documentation
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Everything you need to know about CORN Vault
          </p>

          {/* Contract Addresses */}
          <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Contract Addresses</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-bold text-foreground mb-1">CORN Token</p>
                  <p className="text-sm font-mono text-muted-foreground break-all">{CORN_ADDRESS}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyAddress(CORN_ADDRESS, 'CORN')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`https://scan.pulsechain.com/token/${CORN_ADDRESS}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-bold text-foreground mb-1">veCORN Token</p>
                  <p className="text-sm font-mono text-muted-foreground break-all">{VECORN_ADDRESS}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyAddress(VECORN_ADDRESS, 'veCORN')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`https://scan.pulsechain.com/token/${VECORN_ADDRESS}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="font-bold text-foreground mb-1">Network</p>
                <p className="text-sm text-muted-foreground">PulseChain Mainnet (Chain ID: 369)</p>
              </div>
            </div>
          </Card>

          {/* Tokenomics */}
          <Card className="p-6 mb-8 border-border/50 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Tokenomics</h2>
            <div className="prose prose-invert max-w-none">
              <h3 className="text-xl font-bold text-foreground mb-3">Tax Structure (5%)</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">2% Add LP (Burn):</strong> Adds liquidity to the pool then permanently burns the LP tokens, creating lasting liquidity.</li>
                <li><strong className="text-foreground">1% Buyback & Burn:</strong> Buys CORN from the market and burns it, reducing total supply.</li>
                <li><strong className="text-foreground">1% Treasury:</strong> Funds development, marketing, and ecosystem growth.</li>
                <li><strong className="text-foreground">1% Staking Pool:</strong> Rewards veCORN stakers who lock their tokens.</li>
              </ul>

              <h3 className="text-xl font-bold text-foreground mb-3 mt-6">What is veCORN?</h3>
              <p className="text-muted-foreground">
                veCORN (Vote-Escrowed CORN) is the governance and utility token of the CORN ecosystem. 
                By holding veCORN, you gain access to premium features, rewards from the staking pool, 
                and voting rights on key decisions.
              </p>

              <h3 className="text-xl font-bold text-foreground mb-3 mt-6">Access Tiers</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Tier 1 (≥100 veCORN):</strong> Private updates, early announcements</li>
                <li><strong className="text-foreground">Tier 2 (≥1,000 veCORN):</strong> Priority allocation, exclusive content</li>
                <li><strong className="text-foreground">Tier 3 (≥10,000 veCORN):</strong> Council vote, beta access, strategic input</li>
              </ul>
            </div>
          </Card>

          {/* Disclaimer */}
          <Card className="p-6 border-destructive/50 bg-destructive/5 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-3 text-foreground">⚠️ Disclaimer</h2>
            <p className="text-sm text-muted-foreground">
              Operasi on-chain bersifat final dan tidak dapat diubah. Cryptocurrency melibatkan risiko tinggi. 
              Pastikan Anda memahami sepenuhnya mekanisme CORN Vault, tax structure, dan risiko yang terkait 
              sebelum berpartisipasi. Hanya gunakan dana yang siap Anda kelola. Tim CORN Vault tidak bertanggung 
              jawab atas kerugian yang mungkin timbul.
            </p>
          </Card>
        </div>

        <Footer />
      </div>
    </div>
  );
}
