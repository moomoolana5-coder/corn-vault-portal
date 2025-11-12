import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADDR } from '@/config/addresses';
import ControllerABI from '@/abi/CornSupplyController.json';
import { toast } from 'sonner';
import { AlertCircle, Flame } from 'lucide-react';
import { useEffect } from 'react';

interface ProcessAllButtonProps {
  cornBalance?: bigint;
  disabled?: boolean;
}

export function ProcessAllButton({ cornBalance, disabled }: ProcessAllButtonProps) {
  const { address, chain } = useAccount();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isDisabled = disabled || !cornBalance || cornBalance === 0n || chain?.id !== 369;

  const handleProcessAll = () => {
    if (isDisabled || !address) return;

    writeContract({
      address: ADDR.controller as `0x${string}`,
      abi: ControllerABI as any,
      functionName: 'processAll',
      args: [],
    });
  };

  useEffect(() => {
    if (isPending) {
      toast.loading('Processing distribution...', { id: 'process-all' });
    }
    if (isConfirming) {
      toast.loading('Confirming transaction...', { id: 'process-all' });
    }
    if (isSuccess) {
      toast.success('Distribution processed successfully!', {
        id: 'process-all',
        description: hash ? (
          <a
            href={`https://scan.pulsechain.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on Explorer
          </a>
        ) : undefined,
      });
    }
    if (error) {
      toast.error('Transaction failed', {
        id: 'process-all',
        description: error.message.slice(0, 100),
      });
    }
  }, [isPending, isConfirming, isSuccess, error, hash]);

  if (chain?.id !== 369) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please switch to PulseChain (369) to use this feature
        </AlertDescription>
      </Alert>
    );
  }

  if (!address) {
    return (
      <Alert>
        <AlertDescription>
          Connect your wallet to process distributions
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleProcessAll}
        disabled={isDisabled || isPending || isConfirming}
        className="w-full"
        size="lg"
      >
        <Flame className="w-4 h-4 mr-2" />
        {isPending || isConfirming ? 'Processing...' : 'Process All'}
      </Button>
      
      {cornBalance === 0n && (
        <p className="text-xs text-muted-foreground text-center">
          No CORN balance in controller to process
        </p>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Distribution uses swap & addLiquidity (requires CORN ↔ WPLS route)</p>
        <p>• Small CORN balances may not generate significant LP/Burn</p>
        <p>• MinOut and slippage guards are built into the contract</p>
      </div>
    </div>
  );
}
