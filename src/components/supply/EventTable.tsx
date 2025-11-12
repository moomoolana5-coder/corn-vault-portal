import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';
import { formatUnits } from '@/lib/format';
import type { SupplyEvent } from '@/hooks/useSupplyController';

interface EventTableProps {
  events: SupplyEvent[];
}

export function EventTable({ events }: EventTableProps) {
  const formatEventData = (event: SupplyEvent) => {
    switch (event.type) {
      case 'ExecutedDistribution':
        return `Total: ${parseFloat(formatUnits(event.data.totalCorn, 18)).toFixed(2)} CORN`;
      case 'LpAddedAndBurned':
        return `LP: ${parseFloat(formatUnits(event.data.lpMinted, 18)).toFixed(2)} | CORN: ${parseFloat(formatUnits(event.data.cornUsed, 18)).toFixed(2)}`;
      case 'BuybackAndBurned':
        return `Burned: ${parseFloat(formatUnits(event.data.cornBurned, 18)).toFixed(2)} CORN`;
      case 'Routed':
        return `Amount: ${parseFloat(formatUnits(event.data.amount, 18)).toFixed(2)} CORN`;
      case 'SetCooldowns':
        return `LP: ${event.data.addLpSec}s | Buyback: ${event.data.buybackSec}s`;
      case 'WithdrawCorn':
        return `Amount: ${parseFloat(formatUnits(event.data.amount, 18)).toFixed(2)} CORN`;
      default:
        return 'Config updated';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'LpAddedAndBurned':
      case 'BuybackAndBurned':
        return 'text-orange-500';
      case 'Routed':
        return 'text-blue-500';
      case 'ExecutedDistribution':
        return 'text-green-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Details</TableHead>
            <TableHead className="text-right">Tx</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No events found
              </TableCell>
            </TableRow>
          ) : (
            events.map((event, i) => (
              <TableRow key={`${event.txHash}-${i}`}>
                <TableCell className="text-sm">
                  {new Date(event.timestamp * 1000).toLocaleString()}
                </TableCell>
                <TableCell className={`text-sm font-medium ${getEventColor(event.type)}`}>
                  {event.type}
                </TableCell>
                <TableCell className="text-sm">{formatEventData(event)}</TableCell>
                <TableCell className="text-right">
                  <a
                    href={`https://scan.pulsechain.com/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
