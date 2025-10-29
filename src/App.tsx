import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { PRIVY_APP_ID } from "./lib/constants";

const queryClient = new QueryClient();

// Check if we have a valid Privy App ID (not the placeholder)
const hasValidPrivyAppId = PRIVY_APP_ID && !PRIVY_APP_ID.startsWith('clxxx');

const App = () => {
  const content = (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );

  // Only wrap with PrivyProvider if we have a valid App ID
  if (hasValidPrivyAppId) {
    return (
      <PrivyProvider
        appId={PRIVY_APP_ID}
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#a855f7',
            logo: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/scroll.svg',
          },
        }}
      >
        {content}
      </PrivyProvider>
    );
  }

  return content;
};

export default App;
