import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";
import herrlogLogo from 'figma:asset/afb28dab6d270e8f7e712bdb918800d7884dd2fb.png';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      onLogin(email, password);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src={herrlogLogo} 
            alt="Herrlog Vehicle Tracker" 
            className="mx-auto h-[146px] w-auto mb-2"
          />
        </div>

        {/* Login Form */}
        <Card className="bg-card border border-border shadow-lg rounded-3xl transition-colors">
          <CardHeader className="text-center pb-6">
            <h2 className="text-xl font-semibold text-primary text-[20px]">Fazer Login</h2>
            <p className="text-muted-foreground text-sm mt-[-5px] text-[14px] px-[65px] mr-[0px] mb-[-26px] ml-[0px] px-[80px] py-[4px]">Entre com suas credenciais para acessar o sistema</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 mt-[-25px] mr-[0px] mb-[16px] ml-[0px]">
                <Label htmlFor="email" className="text-primary text-sm font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="bg-input-background border border-border focus:border-primary focus:ring-0 rounded-2xl transition-all h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-primary text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-input-background border border-border focus:border-primary focus:ring-0 rounded-2xl transition-all h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-all rounded-full p-1 hover:bg-muted"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-muted-foreground cursor-pointer text-sm">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 border rounded-full transition-all flex items-center justify-center ${
                      rememberMe 
                        ? 'bg-primary border-primary' 
                        : 'bg-card border-border'
                    }`}>
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  Lembrar-me
                </label>
                <a href="#" className="text-primary hover:underline text-sm font-medium">
                  Esqueceu a senha?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-11 mt-[9px] transition-all shadow-lg hover:shadow-xl mr-[0px] mb-[0px] ml-[0px] px-[24px] py-[12px]"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-xs my-[-11px] py-[7px] px-[0px] mx-[0px]">
            © 2025 Herrlog Solutions. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}