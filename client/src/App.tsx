import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import EmployeeDashboard from "@/pages/EmployeeDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminEmployees from "@/pages/admin/AdminEmployees";
import AdminPhases from "@/pages/admin/AdminPhases";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : user?.isAdmin ? (
        <>
          <Route path="/" component={AdminDashboard} />
          <Route path="/admin/employees" component={AdminEmployees} />
          <Route path="/admin/phases" component={AdminPhases} />
        </>
      ) : (
        <>
          <Route path="/" component={EmployeeDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
