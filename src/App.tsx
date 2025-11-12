import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { config } from './lib/wagmi';
import Home from "./pages/Home";
import Vault from "./pages/Vault";
import Staking from "./pages/Staking";
import Admin from "./pages/Admin";
import ControlSupply from "./pages/ControlSupply";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Create Web3Modal
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id';

createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'hsl(43, 96%, 64%)',
    '--w3m-border-radius-master': '8px',
  }
});

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vault" element={<Vault />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/control-supply" element={<ControlSupply />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
