import { useState } from "react";
import { FixedDeposit } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

interface InvestmentGrowthChartProps {
  fixedDeposits: FixedDeposit[];
  isLoading: boolean;
}

export default function InvestmentGrowthChart({ fixedDeposits, isLoading }: InvestmentGrowthChartProps) {
  const [projectionPeriod, setProjectionPeriod] = useState<"1Y" | "3Y" | "5Y" | "10Y">("3Y");
  
  // Calculate the projection data
  const calculateProjection = () => {
    if (!fixedDeposits || fixedDeposits.length === 0) return [];
    
    const totalPrincipal = fixedDeposits.reduce((sum, fd) => sum + Number(fd.principalAmount), 0);
    const avgInterestRate = fixedDeposits.reduce((sum, fd) => sum + Number(fd.interestRate), 0) / fixedDeposits.length;
    
    let years = 3;
    switch (projectionPeriod) {
      case "1Y": years = 1; break;
      case "3Y": years = 3; break;
      case "5Y": years = 5; break;
      case "10Y": years = 10; break;
    }
    
    const months = years * 12;
    const data = [];
    
    for (let i = 0; i <= months; i += (months > 24 ? 6 : 2)) {
      // Simple interest calculation for demonstration (compounding would be more complex)
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
  
  const projectionData = calculateProjection();
  
  // Calculate projection stats
  const initialValue = projectionData[0]?.value || 0;
  const finalValue = projectionData[projectionData.length - 1]?.value || 0;
  const interestEarned = finalValue - initialValue;
  const annualReturn = fixedDeposits && fixedDeposits.length > 0 
    ? fixedDeposits.reduce((sum, fd) => sum + Number(fd.interestRate), 0) / fixedDeposits.length
    : 0;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
        <CardTitle>Investment Growth Projection</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant={projectionPeriod === "1Y" ? "default" : "outline"} 
            size="sm"
            onClick={() => setProjectionPeriod("1Y")}
          >
            1Y
          </Button>
          <Button 
            variant={projectionPeriod === "3Y" ? "default" : "outline"} 
            size="sm"
            onClick={() => setProjectionPeriod("3Y")}
          >
            3Y
          </Button>
          <Button 
            variant={projectionPeriod === "5Y" ? "default" : "outline"} 
            size="sm"
            onClick={() => setProjectionPeriod("5Y")}
          >
            5Y
          </Button>
          <Button 
            variant={projectionPeriod === "10Y" ? "default" : "outline"} 
            size="sm"
            onClick={() => setProjectionPeriod("10Y")}
          >
            10Y
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : fixedDeposits && fixedDeposits.length > 0 ? (
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={projectionData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, "Projected Value"]}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Projected Value"
                  stroke="#2563eb"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-sm font-medium text-gray-500">No Investment Data</h3>
            <p className="text-xs text-gray-400 mt-1">Add fixed deposits to see projections.</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Initial Investment</p>
            <p className="text-lg font-semibold text-text-dark">₹{initialValue.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Projected Value ({projectionPeriod})</p>
            <p className="text-lg font-semibold text-primary">₹{finalValue.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Interest Earned</p>
            <p className="text-lg font-semibold text-success">₹{interestEarned.toLocaleString('en-IN')}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Avg. Annual Return</p>
            <p className="text-lg font-semibold text-warning">{annualReturn.toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
