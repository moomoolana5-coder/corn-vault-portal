import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewCard } from '@/components/supply/OverviewCard';
import { CooldownInfo } from '@/components/supply/CooldownInfo';
import { EventTable } from '@/components/supply/EventTable';
import { useSupplyOverview, useSupplyEvents, useCooldowns } from '@/hooks/useSupplyController';
import { ADDR } from '@/config/addresses';
import { Flame, TrendingDown, Vault, Coins, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ControlSupply() {
  const { overview, loading: overviewLoading } = useSupplyOverview();
  const { events, loading: eventsLoading } = useSupplyEvents();
  const cooldowns = useCooldowns();

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Flame className="w-8 h-8 text-primary" />
              Supply Control Monitor
            </h1>
            <p className="text-muted-foreground">
              Live view of LP locks, buybacks, burns, and routed allocations from CORN's controller
            </p>
          </div>

          {/* Controller Info */}
          <Card className="mb-6 bg-gradient-to-br from-card to-card/50 border-border/40">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Controller Address</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <code className="text-sm font-mono text-foreground">{ADDR.controller}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => copyAddress(ADDR.controller)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                asChild
              >
                <a
                  href={`https://scan.pulsechain.com/address/${ADDR.controller}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <OverviewCard
              title="LP Burned (Lifetime)"
              value={overview.lpBurned}
              decimals={18}
              symbol="LP"
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              tooltip="LP tokens are sent to 0xdead (burn), permanently locking liquidity."
            />
            <OverviewCard
              title="CORN Burned (Lifetime)"
              value={overview.cornBurned}
              decimals={18}
              symbol="CORN"
              icon={<TrendingDown className="w-4 h-4 text-red-500" />}
              tooltip="Controller buys CORN with pair tokens and burns it, reducing circulating supply."
            />
            <OverviewCard
              title="Routed → Treasury"
              value={overview.routedTreasury}
              decimals={18}
              symbol="CORN"
              icon={<Vault className="w-4 h-4 text-blue-500" />}
            />
            <OverviewCard
              title="Routed → Staking"
              value={overview.routedStaking}
              decimals={18}
              symbol="CORN"
              icon={<Coins className="w-4 h-4 text-green-500" />}
            />
          </div>

          {/* Cooldown Info */}
          <div className="mb-6">
            <CooldownInfo
              addLpCooldown={cooldowns.addLpCooldown}
              buybackCooldown={cooldowns.buybackCooldown}
              lastAddLpAt={cooldowns.lastAddLpAt}
              lastBuybackAt={cooldowns.lastBuybackAt}
            />
          </div>

          {/* Activity Feed */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40">
            <CardHeader>
              <CardTitle>Activity Stream</CardTitle>
              <CardDescription>
                Recent supply control events (auto-refreshes every 20s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading events...</div>
              ) : (
                <EventTable events={events} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
