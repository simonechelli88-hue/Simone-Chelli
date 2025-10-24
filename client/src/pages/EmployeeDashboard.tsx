import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { useToast } from "@/hooks/use-toast";
import { EmployeeNav } from "@/components/EmployeeNav";
import { TimesheetCalendar } from "@/components/TimesheetCalendar";

export default function EmployeeDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Auto logout after 1 hour of inactivity
  useInactivityTimeout(() => {
    toast({
      title: "Sessione scaduta",
      description: "Sei stato disconnesso per inattività. Effettua nuovamente l'accesso.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/logout";
    }, 2000);
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Non autenticato",
        description: "Effettua l'accesso per continuare.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EmployeeNav user={user} />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-username">
            Benvenuto, {user.fullName.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground">
            Registra i tuoi rapportini giornalieri selezionando la data dal calendario.
          </p>
        </div>
        <TimesheetCalendar userId={user.id} />
      </main>
    </div>
  );
}
