import { Link } from 'react-router-dom';
import { Twitter, Send } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 mt-20 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6">
          {/* Social Media Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://x.com/cornprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-background/60 border border-border/40 text-muted-foreground hover:text-corn-gold hover:border-corn-gold/50 hover:bg-corn-gold/10 transition-all duration-300 hover:shadow-glow-corn"
              aria-label="Follow us on X (Twitter)"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://t.me/cornprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-background/60 border border-border/40 text-muted-foreground hover:text-corn-gold hover:border-corn-gold/50 hover:bg-corn-gold/10 transition-all duration-300 hover:shadow-glow-corn"
              aria-label="Join our Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>
          
          {/* Copyright */}
          <p className="text-xs text-center text-muted-foreground">
            © {currentYear} CORN PROTOCOL. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
