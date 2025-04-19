import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyFinances {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  expensesByCategory: Record<string, number>;
}

interface IncomeExpenseChartProps {
  monthlyFinances: MonthlyFinances;
  isLoading: boolean;
}

export default function IncomeExpenseChart({ monthlyFinances, isLoading }: IncomeExpenseChartProps) {
  // Generate monthly data (this would be from API in a real app)
  const generateMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => {
      const baseIncome = 75000 + Math.random() * 15000;
      const baseExpense = 50000 + Math.random() * 10000;
      const baseSaving = baseIncome - baseExpense;
      
      // Make the last month match the current data
      if (index === months.length - 1) {
        return {
          month,
          income: monthlyFinances.totalIncome,
          expenses: monthlyFinances.totalExpenses,
          savings: monthlyFinances.savings
        };
      }
      
      return {
        month,
        income: Math.round(baseIncome),
        expenses: Math.round(baseExpense),
        savings: Math.round(baseSaving)
      };
    });
  };

  const sortedExpenses = Object.entries(monthlyFinances.expensesByCategory || {})
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / monthlyFinances.totalExpenses) * 100)
    }));

  // Get a nice color for each expense category
  const getExpenseColor = (index: number) => {
    const colors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-secondary"];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader className="p-6 border-b border-gray-200">
        <CardTitle>Monthly Income & Expenses</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-xl font-semibold text-text-dark">₹{monthlyFinances.totalIncome.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-xl font-semibold text-text-dark">₹{monthlyFinances.totalExpenses.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Savings</p>
                <p className="text-xl font-semibold text-success">₹{monthlyFinances.savings.toLocaleString('en-IN')}</p>
              </div>
            </div>
            
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateMonthlyData()} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, ""]} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="Savings" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Key Expenses</h4>
              
              <div className="space-y-3">
                {sortedExpenses.slice(0, 4).map((expense, index) => (
                  <div key={expense.category} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${getExpenseColor(index)} mr-2`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-text-dark">{expense.category}</span>
                        <span className="text-sm font-medium text-text-dark">₹{expense.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`${getExpenseColor(index)} h-1.5 rounded-full`} 
                          style={{ width: `${expense.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* If no expenses, show a placeholder */}
                {sortedExpenses.length === 0 && (
                  <div className="text-center py-4 text-gray-400">
                    No expense data available
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
