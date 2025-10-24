import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { AdminNav } from "@/components/AdminNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WorkPhase, InsertWorkPhase } from "@shared/schema";

export default function AdminPhases() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<WorkPhase | null>(null);
  const [formData, setFormData] = useState<InsertWorkPhase>({
    code: "",
    description: "",
    category: "",
    hourThreshold: 100,
  });

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

  const { data: phases, isLoading: phasesLoading } = useQuery<WorkPhase[]>({
    queryKey: ["/api/phases"],
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertWorkPhase) => {
      return await apiRequest("POST", "/api/phases", data);
    },
    onSuccess: () => {
      toast({
        title: "Fase aggiunta",
        description: "La nuova fase di lavoro è stata creata con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/phases"] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autenticato",
          description: "Sessione scaduta. Accesso nuovamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Errore",
        description: "Impossibile creare la fase. Verifica che il codice non sia duplicato.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertWorkPhase> }) => {
      return await apiRequest("PATCH", `/api/phases/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Fase aggiornata",
        description: "La fase di lavoro è stata modificata con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/phases"] });
      setEditingPhase(null);
      resetForm();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autenticato",
          description: "Sessione scaduta. Accesso nuovamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la fase.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/phases/${id}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Fase eliminata",
        description: "La fase di lavoro è stata rimossa dal sistema.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/phases"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autenticato",
          description: "Sessione scaduta. Accesso nuovamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Errore",
        description: "Impossibile eliminare la fase. Potrebbe essere in uso.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      category: "",
      hourThreshold: 100,
    });
  };

  const handleEdit = (phase: WorkPhase) => {
    setEditingPhase(phase);
    setFormData({
      code: phase.code,
      description: phase.description,
      category: phase.category,
      hourThreshold: phase.hourThreshold,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.description || !formData.category) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi richiesti.",
        variant: "destructive",
      });
      return;
    }

    if (editingPhase) {
      updateMutation.mutate({ id: editingPhase.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

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

  const groupedPhases = phases?.reduce((acc, phase) => {
    if (!acc[phase.category]) {
      acc[phase.category] = [];
    }
    acc[phase.category].push(phase);
    return acc;
  }, {} as Record<string, WorkPhase[]>) || {};

  return (
    <div className="min-h-screen bg-background">
      <AdminNav user={user} />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Gestione Fasi di Lavoro</h2>
            <p className="text-muted-foreground">
              Aggiungi, modifica o elimina le fasi di lavoro disponibili
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-phase">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Aggiungi Fase
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Aggiungi Nuova Fase</DialogTitle>
                <DialogDescription>
                  Inserisci i dettagli della nuova fase di lavoro
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Codice Fase *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="es. BOR0101"
                      data-testid="input-code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrizione *</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="es. FORATURA PASSAGGI..."
                      data-testid="input-description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="es. BOR01, EXTRA"
                      data-testid="input-category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Soglia Ore</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="1"
                      value={formData.hourThreshold}
                      onChange={(e) => setFormData({ ...formData, hourThreshold: parseInt(e.target.value) || 100 })}
                      data-testid="input-threshold"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-phase">
                    {createMutation.isPending ? "Salvataggio..." : "Aggiungi Fase"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Fasi di Lavoro ({phases?.length || 0})</CardTitle>
            <CardDescription>
              Gestisci le fasi disponibili per i rapportini dei dipendenti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {phasesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : Object.keys(groupedPhases).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg className="w-16 h-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Nessuna fase configurata</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Aggiungi la prima fase di lavoro cliccando il pulsante in alto.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPhases).map(([category, categoryPhases]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Badge variant="outline">{category}</Badge>
                      <span className="text-sm text-muted-foreground font-normal">
                        ({categoryPhases.length} {categoryPhases.length === 1 ? "fase" : "fasi"})
                      </span>
                    </h3>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="text-left p-4 font-semibold text-sm">Codice</th>
                              <th className="text-left p-4 font-semibold text-sm">Descrizione</th>
                              <th className="text-right p-4 font-semibold text-sm">Soglia Ore</th>
                              <th className="text-right p-4 font-semibold text-sm">Azioni</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {categoryPhases.map((phase) => (
                              <tr key={phase.id} className="hover:bg-muted/20" data-testid={`phase-${phase.id}`}>
                                <td className="p-4 font-medium">{phase.code}</td>
                                <td className="p-4 text-sm">{phase.description}</td>
                                <td className="p-4 text-right">
                                  <Badge variant="secondary">{phase.hourThreshold}h</Badge>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center justify-end gap-2">
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleEdit(phase)}
                                          data-testid={`button-edit-${phase.id}`}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                          <DialogTitle>Modifica Fase</DialogTitle>
                                          <DialogDescription>
                                            Modifica i dettagli della fase di lavoro
                                          </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit}>
                                          <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-code">Codice Fase *</Label>
                                              <Input
                                                id="edit-code"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-description">Descrizione *</Label>
                                              <Input
                                                id="edit-description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-category">Categoria *</Label>
                                              <Input
                                                id="edit-category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <Label htmlFor="edit-threshold">Soglia Ore</Label>
                                              <Input
                                                id="edit-threshold"
                                                type="number"
                                                min="1"
                                                value={formData.hourThreshold}
                                                onChange={(e) => setFormData({ ...formData, hourThreshold: parseInt(e.target.value) || 100 })}
                                              />
                                            </div>
                                          </div>
                                          <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setEditingPhase(null)}>
                                              Annulla
                                            </Button>
                                            <Button type="submit" disabled={updateMutation.isPending}>
                                              {updateMutation.isPending ? "Salvataggio..." : "Salva Modifiche"}
                                            </Button>
                                          </DialogFooter>
                                        </form>
                                      </DialogContent>
                                    </Dialog>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => {
                                        if (confirm(`Sei sicuro di voler eliminare la fase ${phase.code}?`)) {
                                          deleteMutation.mutate(phase.id);
                                        }
                                      }}
                                      disabled={deleteMutation.isPending}
                                      data-testid={`button-delete-${phase.id}`}
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
