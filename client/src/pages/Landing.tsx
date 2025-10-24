import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import appIcon from "@assets/download_1761304117067.png";

export default function Landing() {
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      toast({
        title: "Campo obbligatorio",
        description: "Inserisci il tuo codice identificativo",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/login", { accessCode });
      
      // Login successful, invalidate auth query to refresh
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Accesso effettuato!",
        description: `Benvenuto, ${response.user.fullName}!`,
      });
      
      // Redirect will happen automatically via useAuth
    } catch (error: any) {
      toast({
        title: "Errore di accesso",
        description: error.message || "Codice identificativo non valido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={appIcon} 
              alt="EURO EL Logo" 
              className="w-full h-full object-cover"
              data-testid="app-icon"
            />
          </div>
          <CardTitle className="text-3xl font-bold">RAPPORTINI EURO EL</CardTitle>
          <CardDescription className="text-base">
            Sistema di gestione rapportini di lavoro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="text-base font-semibold">
                CODICE IDENTIFICATIVO
              </Label>
              <Input
                id="accessCode"
                type="text"
                placeholder="Inserisci nome e cognome"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                disabled={isLoading}
                className="h-12 text-base"
                data-testid="input-access-code"
                autoComplete="off"
              />
            </div>

            <Button 
              type="submit"
              className="w-full py-6 text-lg font-semibold"
              size="lg"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Accesso in corso...
                </>
              ) : (
                "Accedi al Sistema"
              )}
            </Button>
          </form>

          <div className="space-y-3 text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Registra le ore lavorate giornalmente</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Seleziona le fasi di lavoro</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Traccia malattia e ferie</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Accesso riservato ai dipendenti EURO EL
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
