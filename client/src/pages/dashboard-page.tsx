import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import SidebarNav from "@/components/layout/sidebar-nav";
import TopNav from "@/components/layout/top-nav";
import MobileNav from "@/components/layout/mobile-nav";
import SummaryCard from "@/components/dashboard/summary-card";
import FDRecordsTable from "@/components/dashboard/fd-records-table";
import UpcomingMaturities from "@/components/dashboard/upcoming-maturities";
import IncomeExpenseChart from "@/components/dashboard/income-expense-chart";
import InvestmentGrowthChart from "@/components/dashboard/investment-growth-chart";
import { useToast } from "@/hooks/use-toast";
import { FixedDeposit } from "@shared/schema";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch dashboard summary data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["/api/dashboard/summary"],
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Fetch fixed deposits data
  const { data: fds, isLoading: isFDsLoading } = useQuery<FixedDeposit[]>({
    queryKey: ["/api/fixed-deposits"],
    staleTime: 60 * 1000, // 1 minute
  });

  return (
    <div className="flex h-screen bg-neutral">
      {/* Sidebar (Desktop) */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav title="Dashboard" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral p-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-dark">Financial Dashboard</h2>
              <p className="text-sm text-gray-500">Track and manage all your fixed deposits in one place</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <SummaryCard 
              title="Total Investment"
              value={isDashboardLoading ? "Loading..." : `₹${dashboardData?.totalInvestment?.toLocaleString('en-IN') || "0"}`}
              icon="money"
            />
            
            <SummaryCard
              title="Active FDs"
              value={isDashboardLoading ? "Loading..." : `${dashboardData?.activeFDs || "0"}`}
              icon="document"
            />
            
            <SummaryCard
              title="Interest Earned (YTD)"
              value={isDashboardLoading ? "Loading..." : `₹${dashboardData?.interestEarnedYTD?.toLocaleString('en-IN') || "0"}`}
              icon="chart"
            />
            
            <SummaryCard
              title="Maturing Soon"
              value={isDashboardLoading ? "Loading..." : `${dashboardData?.maturingSoonCount || "0"}`}
              icon="clock"
              trend={dashboardData?.maturingSoonCount ? "In next 30 days" : undefined}
              trendType="warning"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* FD Records Table (Spans 2 columns) */}
            <div className="lg:col-span-2">
              <FDRecordsTable fixedDeposits={fds || []} isLoading={isFDsLoading} />
            </div>

            {/* Right Column (Upcoming Maturities & Income/Expense) */}
            <div className="space-y-6">
              <UpcomingMaturities maturities={dashboardData?.maturingSoon || []} isLoading={isDashboardLoading} />
              <IncomeExpenseChart 
                monthlyFinances={dashboardData?.monthlyFinances || {
                  totalIncome: 0,
                  totalExpenses: 0,
                  savings: 0,
                  expensesByCategory: {}
                }} 
                isLoading={isDashboardLoading}
              />
            </div>
          </div>

          {/* Investment Growth Chart (Full Width) */}
          <div className="mt-6">
            <InvestmentGrowthChart fixedDeposits={fds || []} isLoading={isFDsLoading} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
