import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormattedBalance, useTokenMeta } from '@/hooks/useErc20';
import { VECORN_ADDRESS } from '@/lib/chains';
import { Shield, Crown, Star, Lock } from 'lucide-react';

const tiers = [
  {
    level: 1,
    name: 'Tier 1',
    requirement: 100,
    icon: Shield,
    color: 'text-accent',
    benefits: ['Private updates', 'Early announcements', 'Community badge'],
  },
  {
    level: 2,
    name: 'Tier 2',
    requirement: 1000,
    icon: Star,
    color: 'text-primary',
    benefits: ['All Tier 1 benefits', 'Priority allocation', 'Exclusive content', 'Direct support'],
  },
  {
    level: 3,
    name: 'Tier 3',
    requirement: 10000,
    icon: Crown,
    color: 'text-corn-gold',
    benefits: ['All Tier 2 benefits', 'Council vote', 'Beta access', 'Strategic input', 'VIP events'],
  },
];

export default function Access() {
  const { address, isConnected } = useAccount();
  const veCornMeta = useTokenMeta(VECORN_ADDRESS);
  const veCornBalance = useFormattedBalance(VECORN_ADDRESS, address, veCornMeta.decimals);
  const [verifying, setVerifying] = useState(false);
  const [currentTier, setCurrentTier] = useState<number | null>(null);

  const verifyAccess = () => {
    setVerifying(true);
    const balance = parseFloat(veCornBalance.formatted || '0');
    
    let tier = 0;
    if (balance >= 10000) tier = 3;
    else if (balance >= 1000) tier = 2;
    else if (balance >= 100) tier = 1;
    
    setTimeout(() => {
      setCurrentTier(tier);
      setVerifying(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-corn bg-clip-text text-transparent">
            Access Tiers
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Hold veCORN to unlock premium access and benefits
          </p>

          {/* Verify Section */}
          {isConnected && (
            <Card className="p-8 mb-12 border-primary/50 bg-card/50 backdrop-blur-sm text-center">
              <h3 className="text-xl font-bold mb-4 text-foreground">Verify Your Access Level</h3>
              <p className="text-muted-foreground mb-4">
                Your veCORN Balance: <span className="font-bold text-primary">{parseFloat(veCornBalance.formatted || '0').toFixed(2)}</span>
              </p>
              <Button 
                size="lg" 
                onClick={verifyAccess}
                disabled={verifying}
                className="shadow-glow-corn"
              >
                {verifying ? 'Verifying...' : 'Verify Access'}
              </Button>
              
              {currentTier !== null && (
                <div className="mt-6 p-4 rounded-xl bg-secondary">
                  {currentTier === 0 ? (
                    <p className="text-muted-foreground flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      You need at least 100 veCORN to unlock Tier 1
                    </p>
                  ) : (
                    <p className="text-foreground font-bold flex items-center justify-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Access Granted: Tier {currentTier}
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <Card 
                key={tier.level}
                className="p-6 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all hover:shadow-glow-corn"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-foreground">{tier.name}</h3>
                  <div className={`p-3 rounded-xl bg-secondary ${tier.color}`}>
                    <tier.icon className="w-6 h-6" />
                  </div>
                </div>
                
                <Badge variant="secondary" className="mb-4">
                  ≥ {tier.requirement.toLocaleString()} veCORN
                </Badge>

                <ul className="space-y-2">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          {!isConnected && (
            <Card className="p-8 mt-8 border-border/50 bg-card/50 backdrop-blur-sm text-center">
              <p className="text-muted-foreground mb-4">
                Connect your wallet to verify your access tier
              </p>
              <w3m-button />
            </Card>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
