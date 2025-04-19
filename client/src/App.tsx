import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import DashboardPage from "@/pages/dashboard-page";
import FDRecordsPage from "@/pages/fd-records-page";
import IncomeExpensePage from "@/pages/income-expense-page";
import ProjectionsPage from "@/pages/projections-page";
import SettingsPage from "@/pages/settings-page";

function App() {
  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/fd-records" component={FDRecordsPage} />
      <Route path="/income-expense" component={IncomeExpensePage} />
      <Route path="/projections" component={ProjectionsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
