import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Timesheet, WorkPhase, InsertTimesheet } from "@shared/schema";
import { TIMESHEET_TYPES, TimesheetType } from "@/lib/workPhases";

interface TimesheetFormProps {
  userId: string;
  date: Date;
  existingTimesheet?: Timesheet;
}

export function TimesheetForm({ userId, date, existingTimesheet }: TimesheetFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [type, setType] = useState<TimesheetType>(existingTimesheet?.type as TimesheetType || TIMESHEET_TYPES.LAVORATO);
  const [workPhaseId, setWorkPhaseId] = useState<string>(existingTimesheet?.workPhaseId?.toString() || "");
  const [hours, setHours] = useState<string>(existingTimesheet?.hours.toString() || "8");
  const [isEditing, setIsEditing] = useState(!existingTimesheet);

  const { data: phases } = useQuery<WorkPhase[]>({
    queryKey: ["/api/phases"],
  });

  useEffect(() => {
    if (existingTimesheet) {
      setType(existingTimesheet.type as TimesheetType);
      setWorkPhaseId(existingTimesheet.workPhaseId?.toString() || "");
      setHours(existingTimesheet.hours.toString());
      setIsEditing(false);
    } else {
      setType(TIMESHEET_TYPES.LAVORATO);
      setWorkPhaseId("");
      setHours("8");
      setIsEditing(true);
    }
  }, [existingTimesheet, date]);

  useEffect(() => {
    if (type === TIMESHEET_TYPES.MALATTIA || type === TIMESHEET_TYPES.FERIE) {
      setHours("8");
      setWorkPhaseId("");
    }
  }, [type]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertTimesheet) => {
      if (existingTimesheet) {
        return await apiRequest("PATCH", `/api/timesheets/${existingTimesheet.id}`, data);
      } else {
        return await apiRequest("POST", "/api/timesheets", data);
      }
    },
    onSuccess: () => {
      toast({
        title: "Salvato!",
        description: "Il rapportino è stato salvato con successo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
      setIsEditing(false);
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
        description: "Impossibile salvare il rapportino. Riprova.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!existingTimesheet) return;
      return await apiRequest("DELETE", `/api/timesheets/${existingTimesheet.id}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Eliminato",
        description: "Il rapportino è stato eliminato.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets"] });
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
        description: "Impossibile eliminare il rapportino.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (type === TIMESHEET_TYPES.LAVORATO && !workPhaseId) {
      toast({
        title: "Campo obbligatorio",
        description: "Seleziona una fase di lavoro.",
        variant: "destructive",
      });
      return;
    }

    const data: InsertTimesheet = {
      userId,
      date: format(date, "yyyy-MM-dd"),
      type,
      hours: parseInt(hours),
      workPhaseId: type === TIMESHEET_TYPES.LAVORATO && workPhaseId ? parseInt(workPhaseId) : null,
    };

    saveMutation.mutate(data);
  };

  const groupedPhases = phases?.reduce((acc, phase) => {
    if (!acc[phase.category]) {
      acc[phase.category] = [];
    }
    acc[phase.category].push(phase);
    return acc;
  }, {} as Record<string, WorkPhase[]>) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {format(date, "EEEE, d MMMM yyyy", { locale: it })}
        </CardTitle>
        <CardDescription>
          {isEditing ? "Compila il rapportino giornaliero" : "Rapportino registrato"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo di giornata</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as TimesheetType)}
              disabled={!isEditing}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem
                  value={TIMESHEET_TYPES.LAVORATO}
                  id="lavorato"
                  className="peer sr-only"
                  data-testid="radio-lavorato"
                />
                <Label
                  htmlFor="lavorato"
                  className={`
                    flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer
                    transition-all
                    ${type === TIMESHEET_TYPES.LAVORATO 
                      ? "border-primary bg-primary/5 text-primary" 
                      : "border-muted hover-elevate"
                    }
                    ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Lavorato</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value={TIMESHEET_TYPES.MALATTIA}
                  id="malattia"
                  className="peer sr-only"
                  data-testid="radio-malattia"
                />
                <Label
                  htmlFor="malattia"
                  className={`
                    flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer
                    transition-all
                    ${type === TIMESHEET_TYPES.MALATTIA 
                      ? "border-destructive bg-destructive/5 text-destructive" 
                      : "border-muted hover-elevate"
                    }
                    ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-medium">Malattia</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value={TIMESHEET_TYPES.FERIE}
                  id="ferie"
                  className="peer sr-only"
                  data-testid="radio-ferie"
                />
                <Label
                  htmlFor="ferie"
                  className={`
                    flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer
                    transition-all
                    ${type === TIMESHEET_TYPES.FERIE 
                      ? "border-chart-2 bg-chart-2/5 text-chart-2" 
                      : "border-muted hover-elevate"
                    }
                    ${!isEditing ? "opacity-60 cursor-not-allowed" : ""}
                  `}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium">Ferie</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {type === TIMESHEET_TYPES.LAVORATO && (
            <div className="space-y-2">
              <Label htmlFor="phase" className="text-sm font-medium">
                Fase di lavoro *
              </Label>
              <Select
                value={workPhaseId}
                onValueChange={setWorkPhaseId}
                disabled={!isEditing}
              >
                <SelectTrigger id="phase" data-testid="select-phase" className="min-h-12">
                  <SelectValue placeholder="Seleziona una fase..." />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  {Object.entries(groupedPhases).map(([category, categoryPhases]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                        {category}
                      </div>
                      {categoryPhases.map((phase) => (
                        <SelectItem
                          key={phase.id}
                          value={phase.id.toString()}
                          className="py-3"
                        >
                          <div>
                            <div className="font-medium">{phase.code}</div>
                            <div className="text-xs text-muted-foreground">{phase.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hours" className="text-sm font-medium">
              Ore lavorate
            </Label>
            {type === TIMESHEET_TYPES.MALATTIA || type === TIMESHEET_TYPES.FERIE ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-lg">8 ore</span>
                <span className="text-sm text-muted-foreground">(preimpostato)</span>
              </div>
            ) : (
              <Select
                value={hours}
                onValueChange={setHours}
                disabled={!isEditing}
              >
                <SelectTrigger id="hours" data-testid="select-hours" className="min-h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((h) => (
                    <SelectItem key={h} value={h.toString()}>
                      {h} {h === 1 ? "ora" : "ore"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={saveMutation.isPending}
                  data-testid="button-save-timesheet"
                >
                  {saveMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvataggio...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {existingTimesheet ? "Salva modifiche" : "Salva rapportino"}
                    </>
                  )}
                </Button>
                {existingTimesheet && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(false);
                    }}
                    data-testid="button-cancel-edit"
                  >
                    Annulla
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  data-testid="button-edit-timesheet"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Modifica
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                  data-testid="button-delete-timesheet"
                >
                  {deleteMutation.isPending ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </Button>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
