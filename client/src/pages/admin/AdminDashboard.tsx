import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { useToast } from "@/hooks/use-toast";
import { AdminNav } from "@/components/AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Timesheet } from "@shared/schema";

interface StatsData {
  totalEmployees: number;
  activeToday: number;
  totalHoursThisMonth: number;
  phasesCount: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Auto logout after 1 hour of inactivity
  useInactivityTimeout(() => {
    toast({
      title: "Sessione scaduta",
      description: "Sei stato disconnesso per inattività.",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/logout";
    }, 2000);
  });

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Accesso negato",
        description: "Non hai i permessi per accedere a questa sezione.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ["/api/admin/stats"],
    retry: false,
  });

  if (isLoading || !user || statsLoading) {
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
      <AdminNav user={user} />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard Amministrativa</h2>
          <p className="text-muted-foreground">
            Panoramica generale del sistema di rapportini EURO EL
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Dipendenti Totali</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold" data-testid="stat-total-employees">
                  {stats?.totalEmployees || 0}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Attivi Oggi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-chart-2" data-testid="stat-active-today">
                  {stats?.activeToday || 0}
                </div>
                <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ore Questo Mese</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-chart-3" data-testid="stat-hours-month">
                  {stats?.totalHoursThisMonth || 0}
                </div>
                <div className="w-12 h-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-chart-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Fasi di Lavoro</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-chart-4" data-testid="stat-phases">
                  {stats?.phasesCount || 0}
                </div>
                <div className="w-12 h-12 rounded-full bg-chart-4/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-chart-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Accesso Rapido</CardTitle>
              <CardDescription>Gestisci le diverse sezioni del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/admin/employees"
                className="flex items-center justify-between p-4 rounded-lg border-2 border-transparent hover-elevate active-elevate-2 transition-all bg-card"
                data-testid="link-employees"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Gestione Dipendenti</div>
                    <div className="text-sm text-muted-foreground">Visualizza ore e rapportini per dipendente</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              <a
                href="/admin/phases"
                className="flex items-center justify-between p-4 rounded-lg border-2 border-transparent hover-elevate active-elevate-2 transition-all bg-card"
                data-testid="link-phases"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-chart-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Gestione Fasi Lavoro</div>
                    <div className="text-sm text-muted-foreground">Aggiungi, modifica ed elimina fasi di lavoro</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informazioni Sistema</CardTitle>
              <CardDescription>Dettagli sulla configurazione</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <div>
                  <div className="font-medium">Logout Automatico</div>
                  <div className="text-sm text-muted-foreground">Sessione valida per 1 ora di inattività</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <svg className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <div>
                  <div className="font-medium">Soglia Ore Predefinita</div>
                  <div className="text-sm text-muted-foreground">100 ore per fase (modificabile)</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <svg className="w-5 h-5 text-chart-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="font-medium">Tipi Presenza</div>
                  <div className="text-sm text-muted-foreground">Lavorato, Malattia, Ferie (8h preimpostate)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
