import { CornBadge } from './CornBadge';
import { Button } from './ui/button';
import { NavLink } from './NavLink';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <CornBadge />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Home
            </NavLink>
            <NavLink
              to="/vault"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/staking"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              activeClassName="text-primary"
            >
              Staking
            </NavLink>
            <div className="ml-4">
              <w3m-button />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <nav className="flex flex-col gap-4">
              <NavLink
                to="/"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                activeClassName="text-primary"
                onClick={() => setIsOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/vault"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                activeClassName="text-primary"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/staking"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                activeClassName="text-primary"
                onClick={() => setIsOpen(false)}
              >
                Staking
              </NavLink>
              <div className="pt-2">
                <w3m-button />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
