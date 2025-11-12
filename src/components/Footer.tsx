import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 mt-20 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <p className="text-xs text-center text-muted-foreground">
          © {currentYear} CORN PROTOCOL. All rights reserved
        </p>
      </div>
    </footer>
  );
}
