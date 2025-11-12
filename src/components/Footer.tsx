import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-20 py-8 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 CORN VAULT. Built on PulseChain.
          </div>
          <div className="flex gap-6">
            <Link to="/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Docs
            </Link>
            <a 
              href="https://scan.pulsechain.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Explorer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
