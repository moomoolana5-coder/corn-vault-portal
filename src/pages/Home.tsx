import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CornBadge } from '@/components/CornBadge';
import { StatCard } from '@/components/StatCard';
import { TaxBreakdown } from '@/components/TaxBreakdown';
import { HolderPanel } from '@/components/HolderPanel';
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <CornBadge />
          <nav className="flex items-center gap-4">
            <Link to="/vault">
              <Button variant="ghost">Vault</Button>
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

        {/* Hero Section */}
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-corn bg-clip-text text-transparent">
            CORN VAULT
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Stake veCORN untuk membuka akses premium, memperoleh bagian dari vault rewards, 
            dan ikut menentukan arah ekosistem.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/vault">
              <Button size="lg" className="text-lg px-8 shadow-glow-corn">
                Stake veCORN
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Lihat Dokumen
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Live Statistics</h2>
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

        {/* Tax Breakdown */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Tax Mechanism</h2>
          <div className="max-w-2xl mx-auto">
            <TaxBreakdown />
          </div>
        </section>

        {/* About Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-foreground">What is CORN Vault?</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                CORN Vault adalah pusat utilitas ekosistem CORN. Dengan men-stake veCORN, Anda membuka akses premium, 
                memperoleh bagian dari alokasi vault rewards, dan ikut menentukan arah pengembangan melalui tier akses.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Mekanisme pajak 5% pada transaksi (buy/sell) dialokasikan sebagai berikut: 2% Add LP (dibakar), 
                1% Buyback & Burn, 1% Treasury, dan 1% Staking Pool. Distribusi dilakukan berkala oleh Treasury 
                untuk menjaga likuiditas, menciptakan tekanan deflasi, mendanai pengembangan, dan memberi insentif kepada staker.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                CORN tidak sekadar token—ini adalah access key dan loyalty layer bagi pengguna yang berkontribusi 
                pada pertumbuhan ekosistem.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
