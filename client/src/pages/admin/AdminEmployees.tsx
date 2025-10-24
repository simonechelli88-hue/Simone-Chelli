import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { useToast } from "@/hooks/use-toast";
import { AdminNav } from "@/components/AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, WorkPhase } from "@shared/schema";

interface EmployeeHoursData {
  user: User;
  totalHours: number;
  phases: {
    phaseId: number;
    phase: WorkPhase;
    hours: number;
  }[];
}

export default function AdminEmployees() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  const { data: employees, isLoading: employeesLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const { data: employeeHours, isLoading: hoursLoading } = useQuery<EmployeeHoursData[]>({
    queryKey: ["/api/admin/employee-hours"],
    retry: false,
  });

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

  const selectedEmployee = employeeHours?.find(e => e.user.id === selectedUserId);

  return (
    <div className="min-h-screen bg-background">
      <AdminNav user={user} />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gestione Dipendenti</h2>
          <p className="text-muted-foreground">
            Visualizza le ore lavorate per dipendente e per fase
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Dipendenti ({employees?.length || 0})</CardTitle>
              <CardDescription>Seleziona un dipendente per visualizzare i dettagli</CardDescription>
            </CardHeader>
            <CardContent>
              {employeesLoading || hoursLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {employeeHours?.map(({ user: emp, totalHours }) => (
                    <button
                      key={emp.id}
                      onClick={() => setSelectedUserId(emp.id)}
                      className={`
                        w-full text-left p-3 rounded-lg border-2 transition-all
                        hover-elevate active-elevate-2
                        ${selectedUserId === emp.id 
                          ? "border-primary bg-primary/5" 
                          : "border-transparent bg-card"
                        }
                      `}
                      data-testid={`button-employee-${emp.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">
                            {emp.firstName && emp.lastName 
                              ? `${emp.firstName} ${emp.lastName}` 
                              : emp.email
                            }
                          </div>
                          <div className="text-sm text-muted-foreground truncate">{emp.email}</div>
                        </div>
                        <div className="ml-2 flex flex-col items-end gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {totalHours}h
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                  {(!employeeHours || employeeHours.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nessun dipendente trovato</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employee Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Dettaglio Ore per Fase</CardTitle>
              <CardDescription>
                {selectedEmployee 
                  ? `Ore registrate da ${selectedEmployee.user.firstName && selectedEmployee.user.lastName ? `${selectedEmployee.user.firstName} ${selectedEmployee.user.lastName}` : selectedEmployee.user.email}`
                  : "Seleziona un dipendente per visualizzare i dettagli"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEmployee ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">Nessun dipendente selezionato</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Seleziona un dipendente dalla lista per visualizzare le ore lavorate suddivise per fase.
                  </p>
                </div>
              ) : selectedEmployee.phases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <svg className="w-16 h-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold mb-2">Nessun rapportino registrato</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Questo dipendente non ha ancora registrato ore lavorate.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Totale Ore</span>
                      <span className="text-2xl font-bold" data-testid={`total-hours-${selectedEmployee.user.id}`}>
                        {selectedEmployee.totalHours} ore
                      </span>
                    </div>
                  </div>

                  {/* Hours Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-semibold text-sm">Codice Fase</th>
                            <th className="text-left p-4 font-semibold text-sm">Descrizione</th>
                            <th className="text-right p-4 font-semibold text-sm">Ore Totali</th>
                            <th className="text-center p-4 font-semibold text-sm">Stato</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedEmployee.phases.map(({ phase, hours }) => {
                            const isOverThreshold = hours > phase.hourThreshold;
                            return (
                              <tr key={phase.id} className="hover:bg-muted/20" data-testid={`phase-row-${phase.id}`}>
                                <td className="p-4 font-medium">{phase.code}</td>
                                <td className="p-4 text-sm text-muted-foreground">{phase.description}</td>
                                <td className="p-4 text-right font-semibold" data-testid={`hours-${phase.id}`}>
                                  {hours}h
                                </td>
                                <td className="p-4 text-center">
                                  <Badge
                                    variant={isOverThreshold ? "destructive" : "default"}
                                    className={isOverThreshold ? "" : "bg-chart-2 hover:bg-chart-2/80"}
                                    data-testid={`status-${phase.id}`}
                                  >
                                    {isOverThreshold 
                                      ? `Oltre soglia (${phase.hourThreshold}h)` 
                                      : `Entro soglia (${phase.hourThreshold}h)`
                                    }
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-chart-2 hover:bg-chart-2/80">Esempio</Badge>
                      <span className="text-muted-foreground">Ore entro la soglia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Esempio</Badge>
                      <span className="text-muted-foreground">Ore oltre la soglia</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
