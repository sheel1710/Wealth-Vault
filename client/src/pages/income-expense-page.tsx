import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import SidebarNav from "@/components/layout/sidebar-nav";
import TopNav from "@/components/layout/top-nav";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  ArrowUpCircle, 
  ArrowDownCircle,
  ChevronsUpDown, 
  CalendarRange
} from "lucide-react";
import { Income, Expense } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import AddEditIncomeDialog from "@/components/income-expense/add-edit-income-dialog";
import AddEditExpenseDialog from "@/components/income-expense/add-edit-expense-dialog";

export default function IncomeExpensePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("incomes");
  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editIncome, setEditIncome] = useState<Income | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);

  // Fetch income data
  const { data: incomes, isLoading: isIncomesLoading } = useQuery<Income[]>({
    queryKey: ["/api/incomes"],
  });

  // Fetch expense data
  const { data: expenses, isLoading: isExpensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const totalIncome = incomes?.reduce((sum, income) => sum + Number(income.amount), 0) || 0;
  const totalExpense = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
  const netBalance = totalIncome - totalExpense;

  const handleEditIncome = (income: Income) => {
    setEditIncome(income);
    setIncomeDialogOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditExpense(expense);
    setExpenseDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-neutral">
      {/* Sidebar (Desktop) */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav title="Income & Expenses" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral p-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-dark">Income & Expenses</h2>
              <p className="text-sm text-gray-500">Track and manage your financial flows</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <CalendarRange className="h-4 w-4 mr-2" />
                Select Period
              </Button>
              <Button 
                className="flex items-center bg-success text-white hover:bg-success/90" 
                onClick={() => {
                  setEditIncome(null);
                  setIncomeDialogOpen(true);
                }}
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                Add Income
              </Button>
              <Button 
                className="flex items-center bg-danger text-white hover:bg-danger/90"
                onClick={() => {
                  setEditExpense(null);
                  setExpenseDialogOpen(true);
                }}
              >
                <ArrowDownCircle className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">₹{totalIncome.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-danger">₹{totalExpense.toLocaleString('en-IN')}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Net Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                  ₹{netBalance.toLocaleString('en-IN')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income/Expense Table Tabs */}
          <Card>
            <CardHeader>
              <Tabs defaultValue="incomes" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="incomes">Incomes</TabsTrigger>
                  <TabsTrigger value="expenses">Expenses</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab}>
                <TabsContent value="incomes">
                  {isIncomesLoading ? (
                    <div className="flex justify-center p-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Recurring</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomes && incomes.length > 0 ? (
                          incomes.map((income) => (
                            <TableRow key={income.id}>
                              <TableCell className="font-medium">{income.source}</TableCell>
                              <TableCell>₹{Number(income.amount).toLocaleString('en-IN')}</TableCell>
                              <TableCell>{format(new Date(income.date), 'dd MMM, yyyy')}</TableCell>
                              <TableCell>
                                {income.isRecurring ? (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-success bg-opacity-10 text-success">
                                    {income.recurrenceFrequency}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    One-time
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{income.notes || '-'}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleEditIncome(income)}>
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              No income records found. Add your first one!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                <TabsContent value="expenses">
                  {isExpensesLoading ? (
                    <div className="flex justify-center p-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Recurring</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses && expenses.length > 0 ? (
                          expenses.map((expense) => (
                            <TableRow key={expense.id}>
                              <TableCell className="font-medium">{expense.category}</TableCell>
                              <TableCell>₹{Number(expense.amount).toLocaleString('en-IN')}</TableCell>
                              <TableCell>{format(new Date(expense.date), 'dd MMM, yyyy')}</TableCell>
                              <TableCell>
                                {expense.isRecurring ? (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning bg-opacity-10 text-warning">
                                    {expense.recurrenceFrequency}
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    One-time
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>{expense.notes || '-'}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => handleEditExpense(expense)}>
                                  Edit
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                              No expense records found. Add your first one!
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
      
      {/* Add/Edit Income Dialog */}
      <AddEditIncomeDialog 
        open={incomeDialogOpen} 
        onOpenChange={setIncomeDialogOpen} 
        incomeToEdit={editIncome}
      />
      
      {/* Add/Edit Expense Dialog */}
      <AddEditExpenseDialog 
        open={expenseDialogOpen} 
        onOpenChange={setExpenseDialogOpen} 
        expenseToEdit={editExpense}
      />
    </div>
  );
}
