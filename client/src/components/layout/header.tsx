import { Search, Bell, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface HeaderProps {
  activeSection: string;
}

export default function Header({ activeSection }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  }, []);

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'dashboard':
        return 'DASHBOARD PRINCIPAL';
      case 'vehicles':
        return 'GESTÃO DE VEÍCULOS';
      case 'upload':
        return 'UPLOAD DE DADOS';
      case 'map':
        return 'MAPA DE ROTAS';
      case 'settings':
        return 'CONFIGURAÇÕES';
      default:
        return 'SISTEMA DE RASTREAMENTO';
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shadow-sm transition-colors">
      <div className="flex items-center gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-primary font-medium uppercase tracking-wide" data-testid="text-brand">HERRLOG</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground uppercase tracking-wide" data-testid="text-section">{getSectionTitle(activeSection)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
          <Input 
            placeholder="Buscar veículos, placas..." 
            className="pl-10 w-80 bg-input-background border-border focus:border-primary focus:ring-primary"
            data-testid="input-search"
          />
        </div>
        
        {/* Dark Mode Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleDarkMode}
          className="text-primary hover:text-primary bg-card border border-border hover:bg-muted transition-colors"
          data-testid="button-theme-toggle"
        >
          {darkMode ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
        </Button>
        
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-primary hover:text-primary bg-card border border-border hover:bg-muted transition-colors"
          data-testid="button-notifications"
        >
          <Bell className="w-4 h-4 text-primary" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs p-0 flex items-center justify-center">
            3
          </Badge>
        </Button>
        
        {/* Time Display */}
        <div className="text-sm text-muted-foreground hidden md:block" data-testid="text-time">
          {new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </header>
  );
}
