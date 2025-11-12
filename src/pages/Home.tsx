import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { StatCard } from '@/components/StatCard';
import { TaxBreakdown } from '@/components/TaxBreakdown';
import { HolderPanel } from '@/components/HolderPanel';
import { LPBurnPanel } from '@/components/LPBurnPanel';
import { Footer } from '@/components/Footer';
import { useTokenMeta, useFormattedBalance, useDeadBalance } from '@/hooks/useErc20';
import { CORN_ADDRESS, VECORN_ADDRESS } from '@/lib/chains';
import { formatBalance } from '@/lib/format';
import { Coins, Lock, Flame, ArrowRight } from 'lucide-react';

export default function Home() {
  const { address } = useAccount();
  
  const cornMeta = useTokenMeta(CORN_ADDRESS);
  const veCornMeta = useTokenMeta(VECORN_ADDRESS);
  const cornBalance = useFormattedBalance(CORN_ADDRESS, address, cornMeta.decimals);
  const veCornBalance = useFormattedBalance(VECORN_ADDRESS, address, veCornMeta.decimals);
  const burnedBalance = useDeadBalance(CORN_ADDRESS);

  const formattedCornSupply = cornMeta.totalSupply && cornMeta.decimals
    ? formatBalance(parseFloat((Number(cornMeta.totalSupply) / Math.pow(10, cornMeta.decimals)).toFixed(2)))
    : '0';

  const formattedVeCornSupply = veCornMeta.totalSupply && veCornMeta.decimals
    ? formatBalance(parseFloat((Number(veCornMeta.totalSupply) / Math.pow(10, veCornMeta.decimals)).toFixed(2)))
    : '0';

  const formattedBurned = burnedBalance.balance && cornMeta.decimals
    ? formatBalance(parseFloat((Number(burnedBalance.balance) / Math.pow(10, cornMeta.decimals)).toFixed(2)))
    : '0';

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8">

        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-corn bg-clip-text text-transparent">
            CORN VAULT
          </h1>
          <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Stake veCORN to unlock premium access, earn vault rewards, 
            and help shape the future of the ecosystem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/vault">
              <Button size="lg" className="text-base px-8 shadow-glow-corn">
                Stake veCORN
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Live Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="CORN Total Supply"
              value={formattedCornSupply}
              subtitle={cornMeta.symbol || 'CORN'}
              icon={Coins}
              isLoading={cornMeta.isLoading}
            />
            <StatCard
              title="veCORN Total Supply"
              value={formattedVeCornSupply}
              subtitle={veCornMeta.symbol || 'veCORN'}
              icon={Lock}
              isLoading={veCornMeta.isLoading}
            />
            {address && (
              <StatCard
                title="Your CORN Balance"
                value={formatBalance(cornBalance.formatted)}
                subtitle={cornMeta.symbol || 'CORN'}
                isLoading={cornBalance.isLoading}
              />
            )}
            {Number(formattedBurned) > 0 && (
              <StatCard
                title="Burned CORN"
                value={formattedBurned}
                subtitle="Permanently removed"
                icon={Flame}
                isLoading={burnedBalance.isLoading}
              />
            )}
          </div>

          <HolderPanel tokenAddress={CORN_ADDRESS} />
        </section>

        {/* Tax Breakdown & LP Burn */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Tax Mechanism</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <TaxBreakdown />
            <LPBurnPanel />
          </div>
        </section>

        {/* About Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center text-foreground">What is CORN Vault?</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                CORN Vault is the utility hub of the CORN ecosystem. By staking veCORN, you unlock premium access, 
                earn a share of vault rewards, and help shape the future through tiered access levels.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                The 5% tax mechanism on transactions (buy/sell) is allocated as follows: 2% Add LP (burned), 
                1% Buyback & Burn, 1% Treasury, and 1% Staking Pool. Distribution is handled periodically by the Treasury 
                to maintain liquidity, create deflationary pressure, fund development, and incentivize stakers.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                CORN is not just a token—it's an access key and loyalty layer for users contributing 
                to ecosystem growth.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
