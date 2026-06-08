import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index.tsx";
import Fx from "./pages/Fx.tsx";
import MiniDashboard from "./pages/MiniDashboard.tsx";
import Curvas from "./pages/Curvas.tsx";
import Analisis from "./pages/Analisis.tsx";
import Icg from "./pages/Icg.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/fx" element={<Fx />} />
          <Route path="/mini-dashboard" element={<MiniDashboard />} />
          <Route path="/curvas" element={<Curvas />} />
          <Route path="/icg" element={<Icg />} />
          <Route path="/analisis" element={<Analisis />} />
          {/* Redirect old route */}
          <Route path="/dashboard" element={<Navigate to="/fx" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
