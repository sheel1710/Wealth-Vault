import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import FDRecordsPage from "@/pages/fd-records-page";
import IncomeExpensePage from "@/pages/income-expense-page";
import ProjectionsPage from "@/pages/projections-page";
import SettingsPage from "@/pages/settings-page";
import AuthPage from "@/pages/auth-page";
import TestAuthPage from "@/pages/test-auth";
import { ProtectedRoute } from "./lib/protected-route";

function App() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/fd-records" component={FDRecordsPage} />
      <ProtectedRoute path="/income-expense" component={IncomeExpensePage} />
      <ProtectedRoute path="/projections" component={ProjectionsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/test-auth" component={TestAuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
