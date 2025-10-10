import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileHeader from "@/components/layout/mobile-header";
import Dashboard from "@/pages/dashboard";
import Vehicles from "@/pages/vehicles";
import Upload from "@/pages/upload";
import MapView from "@/pages/map-view";
import Settings from "@/pages/settings";
import { useIsMobile } from "@/hooks/use-mobile";

type Section = "dashboard" | "vehicles" | "upload" | "map" | "settings";

function AppContent() {
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const isMobile = useIsMobile();

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "vehicles":
        return <Vehicles />;
      case "upload":
        return <Upload />;
      case "map":
        return <MapView />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={(section: string) => setActiveSection(section as Section)} 
      />
      <MobileHeader 
        activeSection={activeSection} 
        onSectionChange={(section: string) => setActiveSection(section as Section)} 
      />
      
      <main className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
        {!isMobile && <Header activeSection={activeSection} />}
        
        <div className="flex-1 overflow-y-auto mt-16 lg:mt-0 bg-background">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
