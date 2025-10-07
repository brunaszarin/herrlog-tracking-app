import { Search, Bell, Moon, Sun } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface HeaderProps {
  currentSection: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Header({ currentSection, darkMode, onToggleDarkMode }: HeaderProps) {
  const getSectionTitle = (section: string) => {
    switch (section) {
      case "dashboard":
        return "Dashboard Principal";
      case "vehicles":
        return "Gestão de Veículos";
      case "upload":
        return "Upload de Dados";
      case "map":
        return "Mapa de Rotas";
      case "settings":
        return "Configurações";
      default:
        return "Sistema de Rastreamento";
    }
  };

  return (
    <header 
      className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm transition-colors"
      style={{ 
        isolation: 'isolate',
        contain: 'layout style paint'
      }}
    >
      <div className="flex items-center gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary font-medium uppercase tracking-wide">HERRLOG</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground uppercase tracking-wide">{getSectionTitle(currentSection)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
          <Input 
            placeholder="Buscar veículos, placas..." 
            className="pl-10 w-80 bg-input-background border-border focus:border-primary focus:ring-primary"
          />
        </div>
        
        {/* Dark Mode Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleDarkMode}
          className="text-primary hover:text-primary bg-card border border-border hover:bg-muted transition-colors"
        >
          {darkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-primary hover:text-primary bg-card border border-border hover:bg-muted transition-colors">
          <Bell className="w-4 h-4 text-primary" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs p-0 flex items-center justify-center">
            3
          </Badge>
        </Button>
        
        {/* Time Display */}
        <div className="text-sm text-muted-foreground hidden md:block">
          {new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </header>
  );
}