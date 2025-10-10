import { useState } from "react";
import { Menu, X, LayoutDashboard, Truck, Upload, Map, Settings } from "lucide-react";
import herrlogLogo from "@assets/herrlog-logo.png";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Veículos', id: 'vehicles', icon: Truck },
  { name: 'Upload JSON', id: 'upload', icon: Upload },
  { name: 'Mapa de Rotas', id: 'map', icon: Map },
];

const bottomItems = [
  { name: 'Configurações', id: 'settings', icon: Settings },
];

interface MobileHeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function MobileHeader({ activeSection, onSectionChange }: MobileHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-30 flex items-center px-4">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-muted"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-4 flex items-center space-x-2">
          <img 
            src={herrlogLogo} 
            alt="Herrlog" 
            className="h-6 w-auto filter brightness-0 invert dark:brightness-100 dark:invert-0"
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)}>
          <aside className="w-64 bg-sidebar text-sidebar-foreground h-full shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
              <img 
                src={herrlogLogo} 
                alt="Herrlog" 
                className="h-20 w-auto filter brightness-0 invert"
              />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded hover:bg-sidebar-accent"
                data-testid="button-close-mobile-menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="p-4">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                      data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>

              <Separator className="my-4 bg-sidebar-border" />

              <div className="space-y-1">
                {bottomItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`}
                      data-testid={`mobile-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
