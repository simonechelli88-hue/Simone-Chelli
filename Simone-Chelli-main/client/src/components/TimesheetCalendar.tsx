import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimesheetForm } from "./TimesheetForm";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Timesheet } from "@shared/schema";

interface TimesheetCalendarProps {
  userId: string;
}

export function TimesheetCalendar({ userId }: TimesheetCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: timesheets, isLoading } = useQuery<Timesheet[]>({
    queryKey: ["/api/timesheets", userId, format(currentMonth, "yyyy-MM")],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDate(null);
  };

  const getTimesheetForDate = (date: Date) => {
    if (!timesheets) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    return timesheets.find(t => t.date === dateStr);
  };

  const getDayStyle = (date: Date) => {
    const timesheet = getTimesheetForDate(date);
    if (!timesheet) return "";
    
    switch (timesheet.type) {
      case "LAVORATO":
        return "bg-primary/10 border-primary";
      case "MALATTIA":
        return "bg-destructive/10 border-destructive";
      case "FERIE":
        return "bg-chart-2/10 border-chart-2";
      default:
        return "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="lg:sticky lg:top-24 h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {format(currentMonth, "MMMM yyyy", { locale: it })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                data-testid="button-prev-month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                data-testid="button-next-month"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {/* Fill empty days at start */}
              {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {/* Render calendar days */}
              {days.map((date) => {
                const timesheet = getTimesheetForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentDay = isToday(date);
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square rounded-lg border-2 p-1 text-sm font-medium
                      transition-all hover-elevate active-elevate-2
                      ${getDayStyle(date)}
                      ${isSelected ? "ring-2 ring-primary ring-offset-2" : "border-transparent"}
                      ${isCurrentDay ? "bg-accent" : ""}
                      ${!isSameMonth(date, currentMonth) ? "opacity-30" : ""}
                    `}
                    data-testid={`button-date-${format(date, "yyyy-MM-dd")}`}
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <span>{format(date, "d")}</span>
                      {timesheet && (
                        <span className="text-xs mt-1">
                          {timesheet.hours}h
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          <div className="mt-6 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-primary bg-primary/10"></div>
              <span>Lavorato</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-destructive bg-destructive/10"></div>
              <span>Malattia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-chart-2 bg-chart-2/10"></div>
              <span>Ferie</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        {selectedDate ? (
          <TimesheetForm 
            userId={userId} 
            date={selectedDate}
            existingTimesheet={getTimesheetForDate(selectedDate) || undefined}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="w-16 h-16 text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Seleziona una data</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Clicca su un giorno del calendario per registrare o modificare il tuo rapportino di lavoro.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
