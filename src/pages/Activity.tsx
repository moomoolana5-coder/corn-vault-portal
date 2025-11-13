import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useActivityMetrics, useUpdateActivityMetric } from '@/hooks/useActivityMetrics';
import { useIsAdmin } from '@/hooks/useAdminRole';
import { useAccount } from 'wagmi';
import { Loader2, TrendingUp, Flame, Coins, RefreshCw, Shield } from 'lucide-react';

const metricConfig = {
  lp_burn: {
    label: 'LP Burn',
    icon: Flame,
    description: 'Total LP tokens burned',
  },
  corn_burn: {
    label: 'CORN Burn',
    icon: Flame,
    description: 'Total CORN tokens burned',
  },
  staking_pool: {
    label: 'Staking Pool',
    icon: Coins,
    description: 'Total tokens in staking pool',
  },
  buyback: {
    label: 'Buyback',
    icon: TrendingUp,
    description: 'Total buyback amount',
  },
};

export default function Activity() {
  const { address } = useAccount();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin(address);
  const { data: metrics, isLoading: isLoadingMetrics } = useActivityMetrics();
  const updateMetric = useUpdateActivityMetric();

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleInputChange = (metricName: string, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [metricName]: value,
    }));
  };

  const handleUpdate = (metricName: string) => {
    const value = formValues[metricName];
    if (!value || isNaN(Number(value))) return;

    updateMetric.mutate({
      metricName,
      value: Number(value),
      updatedBy: address,
    });

    // Clear input after update
    setFormValues((prev) => ({
      ...prev,
      [metricName]: '',
    }));
  };

  if (isLoadingMetrics) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
          <div className="container mx-auto px-4 py-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-corn-gold to-primary bg-clip-text text-transparent">
                Activity Metrics
              </h1>
              <p className="text-muted-foreground">
                Public metrics dashboard
              </p>
              {isAdmin && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-sm">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-primary font-medium">Admin Mode</span>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {metrics?.map((metric) => {
                const config = metricConfig[metric.metric_name as keyof typeof metricConfig];
                if (!config) return null;

                const Icon = config.icon;
                const currentValue = formValues[metric.metric_name] || '';

                return (
                  <Card key={metric.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-primary" />
                        {config.label}
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground">Current Value</div>
                        <div className="text-2xl font-bold text-primary">
                          {metric.value.toLocaleString()}
                        </div>
                        {metric.updated_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Last updated: {new Date(metric.updated_at).toLocaleString()}
                          </div>
                        )}
                      </div>

                      {isAdmin && !isCheckingAdmin && (
                        <div className="space-y-2">
                          <Label htmlFor={metric.metric_name}>New Value (Admin Only)</Label>
                          <div className="flex gap-2">
                            <Input
                              id={metric.metric_name}
                              type="number"
                              placeholder="Enter new value"
                              value={currentValue}
                              onChange={(e) => handleInputChange(metric.metric_name, e.target.value)}
                              min="0"
                              step="0.01"
                            />
                            <Button
                              onClick={() => handleUpdate(metric.metric_name)}
                              disabled={!currentValue || updateMetric.isPending}
                              size="icon"
                            >
                              {updateMetric.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {isAdmin && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Admin Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>• Only admins can update these metrics</p>
                  <p>• Values are displayed publicly to all visitors</p>
                  <p>• Updates are tracked with timestamp and wallet address</p>
                  <p>• Use decimal values for precision (e.g., 123.45)</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">About Activity Metrics</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>These metrics show the cumulative activity of the CORN protocol:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>LP Burn:</strong> Total liquidity provider tokens burned</li>
                  <li><strong>CORN Burn:</strong> Total CORN tokens permanently removed from circulation</li>
                  <li><strong>Staking Pool:</strong> Total value locked in staking contracts</li>
                  <li><strong>Buyback:</strong> Total amount used for token buybacks</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
