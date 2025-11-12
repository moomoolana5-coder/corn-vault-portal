import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  isLoading?: boolean;
}

export function StatCard({ title, value, subtitle, icon: Icon, isLoading }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-border/40 bg-gradient-card backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground mb-2">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="ml-4 p-3 rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
