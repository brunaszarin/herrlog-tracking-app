import { 
  LayoutDashboard, 
  Navigation, 
  Truck, 
  Upload, 
  Map, 
  Settings, 
  LogOut
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import herrlogLogo from 'figma:asset/afb28dab6d270e8f7e712bdb918800d7884dd2fb.png';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userName?: string;
}

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Truck, label: "Veículos", id: "vehicles" },
  { icon: Upload, label: "Upload JSON", id: "upload" },
  { icon: Map, label: "Mapa de Rotas", id: "map" },
];

const bottomItems = [
  { icon: Settings, label: "Configurações", id: "settings" },
];

export function Sidebar({ activeSection, onSectionChange, userName = "Usuário" }: SidebarProps) {
  return (
    <div 
      className="w-64 h-full bg-sidebar flex flex-col"
      style={{ 
        isolation: 'isolate',
        contain: 'layout style paint'
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center px-[0px] py-[112px] mx-[0px] my-[-83px]">
        <img 
          src={herrlogLogo} 
          alt="Herrlog Vehicle Tracker" 
          className="h-[118px] w-auto filter brightness-0 invert py-[-31px] px-[-5px] py-[0px] my-[16px] mx-[0px] my-[-14px] px-[0px] py-[-15px]"
        />
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-[-7px] py-[52px] my-[-74px] mx-[0px] py-[65px] px-[12px]">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSectionChange(item.id)}
              className={`w-full justify-start gap-3 transition-colors ${
                activeSection === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm" 
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className={`w-4 h-4 ${
                activeSection === item.id ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70"
              }`} />
              {item.label}
            </Button>
          ))}
        </div>
        
        <Separator className="my-6 bg-sidebar-border" />
        
        <div className="space-y-1">
          {bottomItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSectionChange(item.id)}
              className={`w-full justify-start gap-3 transition-colors ${
                activeSection === item.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 shadow-sm" 
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <item.icon className={`w-4 h-4 ${
                activeSection === item.id ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70"
              }`} />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
            <span className="text-sidebar-primary-foreground text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">{userName}</p>
            <p className="text-sidebar-foreground/70 text-xs">Administrador</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}