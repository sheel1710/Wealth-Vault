import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertFDSchema, insertIncomeSchema, insertExpenseSchema, insertGoalSchema } from "@shared/schema";

function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Fixed Deposit routes
  app.get("/api/fixed-deposits", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const fds = await storage.getFDsByUserId(userId);
      res.json(fds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fixed deposits" });
    }
  });

  app.post("/api/fixed-deposits", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertFDSchema.parse({ ...req.body, userId });
      const newFD = await storage.createFD(validatedData);
      res.status(201).json(newFD);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create fixed deposit" });
      }
    }
  });

  app.get("/api/fixed-deposits/:id", ensureAuthenticated, async (req, res) => {
    try {
      const fdId = parseInt(req.params.id);
      const fd = await storage.getFDById(fdId);
      
      if (!fd) {
        return res.status(404).json({ message: "Fixed deposit not found" });
      }
      
      // Ensure user can only access their own FDs
      if (fd.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(fd);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fixed deposit" });
    }
  });

  app.put("/api/fixed-deposits/:id", ensureAuthenticated, async (req, res) => {
    try {
      const fdId = parseInt(req.params.id);
      const fd = await storage.getFDById(fdId);
      
      if (!fd) {
        return res.status(404).json({ message: "Fixed deposit not found" });
      }
      
      // Ensure user can only update their own FDs
      if (fd.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertFDSchema.partial().parse(req.body);
      const updatedFD = await storage.updateFD(fdId, validatedData);
      res.json(updatedFD);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update fixed deposit" });
      }
    }
  });

  app.delete("/api/fixed-deposits/:id", ensureAuthenticated, async (req, res) => {
    try {
      const fdId = parseInt(req.params.id);
      const fd = await storage.getFDById(fdId);
      
      if (!fd) {
        return res.status(404).json({ message: "Fixed deposit not found" });
      }
      
      // Ensure user can only delete their own FDs
      if (fd.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteFD(fdId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete fixed deposit" });
    }
  });

  // Income routes
  app.get("/api/incomes", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const incomes = await storage.getIncomesByUserId(userId);
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incomes" });
    }
  });

  app.post("/api/incomes", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertIncomeSchema.parse({ ...req.body, userId });
      const newIncome = await storage.createIncome(validatedData);
      res.status(201).json(newIncome);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create income" });
      }
    }
  });

  app.put("/api/incomes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const incomeId = parseInt(req.params.id);
      const income = await storage.getIncomeById(incomeId);
      
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      
      if (income.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertIncomeSchema.partial().parse(req.body);
      const updatedIncome = await storage.updateIncome(incomeId, validatedData);
      res.json(updatedIncome);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update income" });
      }
    }
  });

  app.delete("/api/incomes/:id", ensureAuthenticated, async (req, res) => {
    try {
      const incomeId = parseInt(req.params.id);
      const income = await storage.getIncomeById(incomeId);
      
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      
      if (income.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteIncome(incomeId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Expense routes
  app.get("/api/expenses", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const expenses = await storage.getExpensesByUserId(userId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertExpenseSchema.parse({ ...req.body, userId });
      const newExpense = await storage.createExpense(validatedData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.put("/api/expenses/:id", ensureAuthenticated, async (req, res) => {
    try {
      const expenseId = parseInt(req.params.id);
      const expense = await storage.getExpenseById(expenseId);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      if (expense.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateExpense(expenseId, validatedData);
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update expense" });
      }
    }
  });

  app.delete("/api/expenses/:id", ensureAuthenticated, async (req, res) => {
    try {
      const expenseId = parseInt(req.params.id);
      const expense = await storage.getExpenseById(expenseId);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      if (expense.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteExpense(expenseId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Goal routes
  app.get("/api/goals", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const validatedData = insertGoalSchema.parse({ ...req.body, userId });
      const newGoal = await storage.createGoal(validatedData);
      res.status(201).json(newGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validatedData = insertGoalSchema.partial().parse(req.body);
      const updatedGoal = await storage.updateGoal(goalId, validatedData);
      res.json(updatedGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete("/api/goals/:id", ensureAuthenticated, async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteGoal(goalId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Dashboard summary endpoint
  app.get("/api/dashboard/summary", ensureAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const fds = await storage.getFDsByUserId(userId);
      const incomes = await storage.getIncomesByUserId(userId);
      const expenses = await storage.getExpensesByUserId(userId);
      
      // Calculate total investment (sum of all active FD principal amounts)
      const totalInvestment = fds
        .filter(fd => fd.isActive)
        .reduce((sum, fd) => sum + Number(fd.principalAmount), 0);
      
      // Count active FDs
      const activeFDs = fds.filter(fd => fd.isActive).length;
      
      // Calculate interest earned (simplified - could be more complex in real app)
      const interestEarnedYTD = fds
        .filter(fd => fd.isActive)
        .reduce((sum, fd) => sum + (Number(fd.interestAmount) || 0), 0);
      
      // Find FDs maturing in next 30 days
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const maturingSoon = fds.filter(fd => {
        const maturityDate = new Date(fd.maturityDate);
        return fd.isActive && maturityDate >= today && maturityDate <= thirtyDaysLater;
      });
      
      // Calculate monthly income and expenses
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const monthlyIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
      });
      
      const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
      });
      
      const totalMonthlyIncome = monthlyIncomes.reduce(
        (sum, income) => sum + Number(income.amount), 0
      );
      
      const totalMonthlyExpense = monthlyExpenses.reduce(
        (sum, expense) => sum + Number(expense.amount), 0
      );
      
      const monthlySavings = totalMonthlyIncome - totalMonthlyExpense;
      
      // Group expenses by category
      const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
        const category = expense.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Number(expense.amount);
        return acc;
      }, {} as Record<string, number>);
      
      // Prepare the response
      res.json({
        totalInvestment,
        activeFDs,
        interestEarnedYTD,
        maturingSoonCount: maturingSoon.length,
        maturingSoon,
        monthlyFinances: {
          totalIncome: totalMonthlyIncome,
          totalExpenses: totalMonthlyExpense,
          savings: monthlySavings,
          expensesByCategory
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
