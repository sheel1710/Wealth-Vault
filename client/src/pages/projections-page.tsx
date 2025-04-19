import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import SidebarNav from "@/components/layout/sidebar-nav";
import TopNav from "@/components/layout/top-nav";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, Wallet } from "lucide-react";
import { FixedDeposit } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
} from "recharts";

export default function ProjectionsPage() {
  const { user } = useAuth();
  const [projectionPeriod, setProjectionPeriod] = useState("3Y");
  
  // Fetch FDs data for projections
  const { data: fds, isLoading: isFDsLoading } = useQuery<FixedDeposit[]>({
    queryKey: ["/api/fixed-deposits"],
  });
  
  // Calculate the projection data
  const calculateFDGrowth = (fds: FixedDeposit[] | undefined, years: number) => {
    if (!fds || fds.length === 0) return [];
    
    const totalPrincipal = fds.reduce((sum, fd) => sum + Number(fd.principalAmount), 0);
    const avgInterestRate = fds.reduce((sum, fd) => sum + Number(fd.interestRate), 0) / fds.length;
    
    const months = years * 12;
    const data = [];
    
    let currentAmount = totalPrincipal;
    for (let i = 0; i <= months; i += 6) {
      // Simple interest calculation for demonstration (in production, compound interest would be more complex)
      const monthsElapsed = i;
      const interest = (totalPrincipal * (avgInterestRate / 100) * (monthsElapsed / 12));
      const projectedValue = totalPrincipal + interest;
      
      data.push({
        month: i === 0 ? "Now" : `${i}M`,
        value: Math.round(projectedValue),
      });
    }
    
    return data;
  };
  
  const getYears = () => {
    switch (projectionPeriod) {
      case "1Y": return 1;
      case "3Y": return 3;
      case "5Y": return 5;
      case "10Y": return 10;
      default: return 3;
    }
  };
  
  const projectionData = calculateFDGrowth(fds, getYears());
  
  // Calculate projection stats
  const initialValue = projectionData[0]?.value || 0;
  const finalValue = projectionData[projectionData.length - 1]?.value || 0;
  const interestEarned = finalValue - initialValue;
  const annualReturn = fds && fds.length > 0 
    ? fds.reduce((sum, fd) => sum + Number(fd.interestRate), 0) / fds.length
    : 0;
  
  return (
    <div className="flex h-screen bg-neutral">
      {/* Sidebar (Desktop) */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav title="Financial Projections" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral p-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-dark">Investment Growth Projections</h2>
              <p className="text-sm text-gray-500">Visualize the future value of your investments</p>
            </div>
          </div>

          {/* Projection Chart */}
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Investment Growth Projection</CardTitle>
              <div className="flex space-x-2">
                <div className="flex space-x-1 border rounded-md p-1">
                  <Button 
                    variant={projectionPeriod === "1Y" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setProjectionPeriod("1Y")}
                    className="text-xs font-medium"
                  >
                    1Y
                  </Button>
                  <Button 
                    variant={projectionPeriod === "3Y" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setProjectionPeriod("3Y")}
                    className="text-xs font-medium"
                  >
                    3Y
                  </Button>
                  <Button 
                    variant={projectionPeriod === "5Y" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setProjectionPeriod("5Y")}
                    className="text-xs font-medium"
                  >
                    5Y
                  </Button>
                  <Button 
                    variant={projectionPeriod === "10Y" ? "default" : "ghost"} 
                    size="sm"
                    onClick={() => setProjectionPeriod("10Y")}
                    className="text-xs font-medium"
                  >
                    10Y
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isFDsLoading ? (
                <div className="flex justify-center p-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : fds && fds.length > 0 ? (
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={projectionData}
                      margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, "Value"]}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Projected Value"
                        stroke="#2563eb"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-500">No Investment Data</h3>
                  <p className="text-gray-400 mt-2">Add fixed deposits to see projections</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Initial Investment</p>
                    <p className="text-lg font-semibold text-text-dark">
                      ₹{initialValue.toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Projected Value ({projectionPeriod})</p>
                    <p className="text-lg font-semibold text-primary">
                      ₹{finalValue.toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Total Interest Earned</p>
                    <p className="text-lg font-semibold text-success">
                      ₹{interestEarned.toLocaleString('en-IN')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-500 mb-1">Avg. Annual Return</p>
                    <p className="text-lg font-semibold text-warning">
                      {annualReturn.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Section */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Comparison</CardTitle>
              <CardDescription>
                Compare current investments by bank and maturity dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="byBank">
                <TabsList>
                  <TabsTrigger value="byBank">By Bank</TabsTrigger>
                  <TabsTrigger value="byMaturity">By Maturity</TabsTrigger>
                </TabsList>
                <TabsContent value="byBank" className="mt-6">
                  {isFDsLoading ? (
                    <div className="flex justify-center p-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : fds && fds.length > 0 ? (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={fds.reduce((acc, fd) => {
                            const existingBank = acc.find(item => item.bank === fd.bankName);
                            if (existingBank) {
                              existingBank.amount += Number(fd.principalAmount);
                            } else {
                              acc.push({ bank: fd.bankName, amount: Number(fd.principalAmount) });
                            }
                            return acc;
                          }, [] as { bank: string; amount: number }[])}
                          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="bank" />
                          <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                          <Tooltip 
                            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Amount"]}
                          />
                          <Legend />
                          <Bar dataKey="amount" name="Investment Amount" fill="#2563eb" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500">No Data to Compare</h3>
                      <p className="text-gray-400 mt-2">Add fixed deposits to see comparisons</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="byMaturity" className="mt-6">
                  {isFDsLoading ? (
                    <div className="flex justify-center p-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : fds && fds.length > 0 ? (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={fds.reduce((acc, fd) => {
                            const year = new Date(fd.maturityDate).getFullYear();
                            const quarter = Math.floor(new Date(fd.maturityDate).getMonth() / 3) + 1;
                            const period = `${year} Q${quarter}`;
                            
                            const existingPeriod = acc.find(item => item.period === period);
                            if (existingPeriod) {
                              existingPeriod.amount += Number(fd.principalAmount);
                            } else {
                              acc.push({ period, amount: Number(fd.principalAmount) });
                            }
                            return acc;
                          }, [] as { period: string; amount: number }[]).sort((a, b) => a.period.localeCompare(b.period))}
                          margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="period" />
                          <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                          <Tooltip 
                            formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Amount"]}
                          />
                          <Legend />
                          <Bar dataKey="amount" name="Maturing Amount" fill="#10b981" />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-500">No Data to Compare</h3>
                      <p className="text-gray-400 mt-2">Add fixed deposits to see comparisons</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
