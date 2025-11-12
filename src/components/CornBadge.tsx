import cornLogo from '@/assets/corn-logo-new.png';
import { Link } from 'react-router-dom';

export function CornBadge() {
  return (
    <Link to="/" className="inline-flex items-center gap-3 group">
      <img 
        src={cornLogo} 
        alt="CORN PROTOCOL" 
        className="w-12 h-12 transition-transform group-hover:scale-110"
      />
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-corn bg-clip-text text-transparent">
          CORN PROTOCOL
        </span>
        <span className="text-xs text-muted-foreground">Multi-Pool Staking</span>
      </div>
    </Link>
  );
}
