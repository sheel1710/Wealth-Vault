import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertFDSchema, insertIncomeSchema, insertExpenseSchema, insertGoalSchema, insertNoteSchema } from "@shared/schema";

// No longer requiring authentication
function getDefaultUserId() {
  // Return a default user ID for personal use
  return 1;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // No longer using authentication routes
  // setupAuth(app);

  // Fixed Deposit routes
  app.get("/api/fixed-deposits", async (req, res) => {
    try {
      const userId = getDefaultUserId();
      const fds = await storage.getFDsByUserId(userId);
      res.json(fds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fixed deposits" });
    }
  });

  app.post("/api/fixed-deposits", async (req, res) => {
    try {
      const userId = getDefaultUserId();
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

  app.get("/api/fixed-deposits/:id", async (req, res) => {
    try {
      const fdId = parseInt(req.params.id);
      const fd = await storage.getFDById(fdId);
      
      if (!fd) {
        return res.status(404).json({ message: "Fixed deposit not found" });
      }
      
      res.json(fd);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch fixed deposit" });
    }
  });

  app.put("/api/fixed-deposits/:id", async (req, res) => {
    try {
      const fdId = parseInt(req.params.id);
      const fd = await storage.getFDById(fdId);
      
      if (!fd) {
        return res.status(404).json({ message: "Fixed deposit not found" });
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

  app.delete("/api/fixed-deposits/:id", async (req, res) => {
    try {
      const fdId = parseInt(req.params.id);
      const fd = await storage.getFDById(fdId);
      
      if (!fd) {
        return res.status(404).json({ message: "Fixed deposit not found" });
      }
      
      await storage.deleteFD(fdId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete fixed deposit" });
    }
  });

  // Income routes
  app.get("/api/incomes", async (req, res) => {
    try {
      const userId = getDefaultUserId();
      const incomes = await storage.getIncomesByUserId(userId);
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incomes" });
    }
  });

  app.post("/api/incomes", async (req, res) => {
    try {
      const userId = getDefaultUserId();
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

  app.put("/api/incomes/:id", async (req, res) => {
    try {
      const incomeId = parseInt(req.params.id);
      const income = await storage.getIncomeById(incomeId);
      
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
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

  app.delete("/api/incomes/:id", async (req, res) => {
    try {
      const incomeId = parseInt(req.params.id);
      const income = await storage.getIncomeById(incomeId);
      
      if (!income) {
        return res.status(404).json({ message: "Income not found" });
      }
      
      await storage.deleteIncome(incomeId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete income" });
    }
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const userId = getDefaultUserId();
      const expenses = await storage.getExpensesByUserId(userId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const userId = getDefaultUserId();
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

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const expenseId = parseInt(req.params.id);
      const expense = await storage.getExpenseById(expenseId);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
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

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const expenseId = parseInt(req.params.id);
      const expense = await storage.getExpenseById(expenseId);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      await storage.deleteExpense(expenseId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Goal routes
  app.get("/api/goals", async (req, res) => {
    try {
      const userId = getDefaultUserId();
      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      const userId = getDefaultUserId();
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

  app.put("/api/goals/:id", async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
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

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const userId = getDefaultUserId();
      const notes = await storage.getNotesByUserId(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const userId = getDefaultUserId();
      const validatedData = insertNoteSchema.parse({ ...req.body, userId });
      const newNote = await storage.createNote(validatedData);
      res.status(201).json(newNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const validatedData = insertNoteSchema.partial().parse(req.body);
      const updatedNote = await storage.updateNote(noteId, validatedData);
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update note" });
      }
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      await storage.deleteNote(noteId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      await storage.deleteGoal(goalId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Dashboard summary endpoint
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const userId = getDefaultUserId();
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
