import { Link } from 'react-router-dom';
import { Twitter, Send, Github, FileText, Shield, BookOpen } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 mt-20 bg-gradient-card backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-corn flex items-center justify-center">
                <span className="text-lg">🌽</span>
              </div>
              <h3 className="text-lg font-bold bg-gradient-corn bg-clip-text text-transparent">
                CORN VAULT
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Multi-pool staking platform on PulseChain. Stake CORN, veCORN, WPLS, and USDC to earn rewards with transparent tokenomics.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                Home
              </Link>
              <Link 
                to="/staking" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                Staking Pools
              </Link>
              <Link 
                to="/vault" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                Dashboard
              </Link>
              <a 
                href="https://scan.pulsechain.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Shield className="w-3 h-3" />
                Block Explorer
              </a>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Resources</h4>
            <nav className="flex flex-col space-y-2">
              <a 
                href="https://docs.pulsechain.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <BookOpen className="w-3 h-3" />
                Documentation
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Github className="w-3 h-3" />
                GitHub
              </a>
              <a 
                href="#" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <FileText className="w-3 h-3" />
                Whitepaper
              </a>
            </nav>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Community</h4>
            <div className="flex flex-col space-y-3">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Twitter className="w-4 h-4" />
                Twitter
              </a>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Telegram
              </a>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Contract Address:</p>
              <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                0xd7...e4B0
              </code>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {currentYear} CORN VAULT. All rights reserved. Built on PulseChain.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="#" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </a>
              <span className="text-muted-foreground">•</span>
              <a 
                href="#" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
