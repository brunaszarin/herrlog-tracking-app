import { LayoutDashboard, Truck, Upload, Map, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import herrlogLogo from "@assets/herrlog-logo.png";

const navigationItems = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Veículos', id: 'vehicles', icon: Truck },
  { name: 'Upload JSON', id: 'upload', icon: Upload },
  { name: 'Mapa de Rotas', id: 'map', icon: Map },
];

const bottomItems = [
  { name: 'Configurações', id: 'settings', icon: Settings },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-sidebar text-sidebar-foreground shadow-lg fixed h-full z-40">
        {/* Logo Section */}
        <div className="flex items-center justify-center py-6 px-4">
          <img 
            src={herrlogLogo} 
            alt="Herrlog" 
            className="h-32 w-auto filter brightness-0 invert"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.name}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'
                  }`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          <Separator className="my-6 bg-sidebar-border" />

          <div className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.name}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                      : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className={`w-4 h-4 ${
                    isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'
                  }`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </aside>
    </>
  );
}
