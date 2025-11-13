import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMoralisActivity, ActivityRecord } from '@/hooks/useMoralisActivity';
import { formatBalance } from '@/lib/format';
import { RefreshCw, ExternalLink, Flame, Droplets, Send, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const EXPLORER_URL = 'https://scan.pulsechain.com';

type FilterType = 'ALL' | 'LP_BURN' | 'CORN_BURN' | 'ROUTED_STAKING' | 'BUYBACK';

export default function Monitor() {
  const { metrics, activities, loading, error, refetch } = useMoralisActivity(true, 30000);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filteredActivities = activities.filter(
    (activity) => filter === 'ALL' || activity.type === filter
  );

  const getTypeLabel = (type: ActivityRecord['type']) => {
    switch (type) {
      case 'LP_BURN':
        return 'LP Burn';
      case 'CORN_BURN':
        return 'CORN Burn';
      case 'ROUTED_STAKING':
        return 'Routed → Staking';
      case 'BUYBACK':
        return 'Buyback';
      default:
        return 'Unknown';
    }
  };

  const getTypeBadgeVariant = (type: ActivityRecord['type']) => {
    switch (type) {
      case 'LP_BURN':
        return 'destructive';
      case 'BUYBACK':
        return 'default';
      case 'ROUTED_STAKING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Wallet Activity Monitor
              </h1>
              <p className="text-muted-foreground">
                Real-time tracking of CORN Supply Controller operations via Moralis
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              size="lg"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <Card className="p-4 border-destructive bg-destructive/10">
              <p className="text-destructive text-sm">
                Error: {error}
              </p>
            </Card>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="LP Burned (Lifetime)"
              value={formatBalance(metrics.lpBurned, 2)}
              subtitle="CORN/WPLS LP"
              icon={Flame}
              isLoading={loading}
            />
            <StatCard
              title="CORN Burned (Lifetime)"
              value={formatBalance(metrics.cornBurned, 2)}
              subtitle="🌽 CORN"
              icon={Flame}
              isLoading={loading}
            />
            <StatCard
              title="Routed → Staking"
              value={formatBalance(metrics.routedToStaking, 2)}
              subtitle="🌽 CORN to Staking"
              icon={Send}
              isLoading={loading}
            />
            <StatCard
              title="Buyback (Lifetime)"
              value={formatBalance(metrics.buyback, 2)}
              subtitle="🌽 CORN Bought & Burned"
              icon={TrendingUp}
              isLoading={loading}
            />
          </div>

          {/* Activity Table */}
          <Card className="border-border/40 bg-gradient-card backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Activity History</h2>
                
                {/* Filter Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant={filter === 'ALL' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('ALL')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'LP_BURN' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('LP_BURN')}
                  >
                    <Droplets className="w-3 h-3 mr-1" />
                    LP
                  </Button>
                  <Button
                    variant={filter === 'CORN_BURN' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('CORN_BURN')}
                  >
                    <Flame className="w-3 h-3 mr-1" />
                    Burn
                  </Button>
                  <Button
                    variant={filter === 'ROUTED_STAKING' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('ROUTED_STAKING')}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Routed
                  </Button>
                  <Button
                    variant={filter === 'BUYBACK' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('BUYBACK')}
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Buyback
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-border/40 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/40">
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead className="text-right">Transaction</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No activities found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActivities.map((activity) => (
                        <TableRow key={activity.id} className="border-border/40">
                          <TableCell className="font-medium">
                            {activity.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getTypeBadgeVariant(activity.type)}>
                              {getTypeLabel(activity.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono">
                            {formatBalance(activity.value, 4)} 🌽
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            #{activity.blockNumber.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              asChild
                            >
                              <a
                                href={`${EXPLORER_URL}/tx/${activity.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                View
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Auto-refreshes every 30 seconds • Powered by Moralis API
              </p>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
