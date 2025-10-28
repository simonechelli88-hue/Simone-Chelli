import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import appIcon from "@assets/download_1761304117067.png";

interface EmployeeNavProps {
  user: User;
}

export function EmployeeNav({ user }: EmployeeNavProps) {
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const displayName = user.fullName || "Dipendente";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img 
              src={appIcon} 
              alt="EURO EL Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">RAPPORTINI EURO EL</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Gestione rapportini di lavoro</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium" data-testid="text-user-name">{displayName}</span>
            <span className="text-xs text-muted-foreground">Dipendente</span>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Esci
          </Button>
        </div>
      </div>
    </header>
  );
}
