import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useAmplitude, trackScreenView } from "./hooks/useAmplitude";
import { useBuilderExposure } from "./hooks/useBuilderExposure";
import { useEffect } from "react";

const queryClient = new QueryClient();

const PageTracker = () => {
  useEffect(() => {
    trackScreenView("landing-page", {
      page_type: "landing",
      section: "home",
    });
  }, []);

  return null;
};

const AppContent = () => {
  useAmplitude();
  useBuilderExposure();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => <AppContent />;

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = (window as any).__root || createRoot(rootElement);
  (window as any).__root = root;
  root.render(<App />);
}
