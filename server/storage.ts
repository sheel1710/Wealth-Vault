import { 
  User, InsertUser, 
  FixedDeposit, InsertFixedDeposit,
  Income, InsertIncome,
  Expense, InsertExpense,
  Goal, InsertGoal,
  MonthlyBudget, InsertMonthlyBudget
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Storage interface
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // FD management
  createFD(fd: InsertFixedDeposit): Promise<FixedDeposit>;
  getFDById(id: number): Promise<FixedDeposit | undefined>;
  getFDsByUserId(userId: number): Promise<FixedDeposit[]>;
  updateFD(id: number, fd: Partial<InsertFixedDeposit>): Promise<FixedDeposit | undefined>;
  deleteFD(id: number): Promise<boolean>;
  
  // Income management
  createIncome(income: InsertIncome): Promise<Income>;
  getIncomeById(id: number): Promise<Income | undefined>;
  getIncomesByUserId(userId: number): Promise<Income[]>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: number): Promise<boolean>;
  
  // Expense management
  createExpense(expense: InsertExpense): Promise<Expense>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  getExpensesByUserId(userId: number): Promise<Expense[]>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Goal management
  createGoal(goal: InsertGoal): Promise<Goal>;
  getGoalById(id: number): Promise<Goal | undefined>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  updateGoal(id: number, goal: Partial<InsertGoal>): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
  
  // Budget management
  createBudget(budget: InsertMonthlyBudget): Promise<MonthlyBudget>;
  getBudgetById(id: number): Promise<MonthlyBudget | undefined>;
  getBudgetsByUserId(userId: number): Promise<MonthlyBudget[]>;
  updateBudget(id: number, budget: Partial<InsertMonthlyBudget>): Promise<MonthlyBudget | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private fixedDeposits: Map<number, FixedDeposit>;
  private incomes: Map<number, Income>;
  private expenses: Map<number, Expense>;
  private goals: Map<number, Goal>;
  private budgets: Map<number, MonthlyBudget>;
  
  private userIdCounter: number;
  private fdIdCounter: number;
  private incomeIdCounter: number;
  private expenseIdCounter: number;
  private goalIdCounter: number;
  private budgetIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.fixedDeposits = new Map();
    this.incomes = new Map();
    this.expenses = new Map();
    this.goals = new Map();
    this.budgets = new Map();
    
    this.userIdCounter = 1;
    this.fdIdCounter = 1;
    this.incomeIdCounter = 1;
    this.expenseIdCounter = 1;
    this.goalIdCounter = 1;
    this.budgetIdCounter = 1;
    
    // Create memory store for sessions
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      ...userData,
      created_at: now
    };
    this.users.set(id, user);
    return user;
  }

  // Fixed Deposit Methods
  async createFD(fdData: InsertFixedDeposit): Promise<FixedDeposit> {
    const id = this.fdIdCounter++;
    const now = new Date();
    const fd: FixedDeposit = {
      id,
      ...fdData,
      created_at: now,
      updated_at: now
    };
    this.fixedDeposits.set(id, fd);
    return fd;
  }

  async getFDById(id: number): Promise<FixedDeposit | undefined> {
    return this.fixedDeposits.get(id);
  }

  async getFDsByUserId(userId: number): Promise<FixedDeposit[]> {
    return Array.from(this.fixedDeposits.values()).filter(
      (fd) => fd.userId === userId
    );
  }

  async updateFD(id: number, fdData: Partial<InsertFixedDeposit>): Promise<FixedDeposit | undefined> {
    const fd = await this.getFDById(id);
    if (!fd) return undefined;

    const updatedFD: FixedDeposit = {
      ...fd,
      ...fdData,
      updated_at: new Date()
    };
    this.fixedDeposits.set(id, updatedFD);
    return updatedFD;
  }

  async deleteFD(id: number): Promise<boolean> {
    return this.fixedDeposits.delete(id);
  }

  // Income Methods
  async createIncome(incomeData: InsertIncome): Promise<Income> {
    const id = this.incomeIdCounter++;
    const now = new Date();
    const income: Income = {
      id,
      ...incomeData,
      created_at: now,
      updated_at: now
    };
    this.incomes.set(id, income);
    return income;
  }

  async getIncomeById(id: number): Promise<Income | undefined> {
    return this.incomes.get(id);
  }

  async getIncomesByUserId(userId: number): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(
      (income) => income.userId === userId
    );
  }

  async updateIncome(id: number, incomeData: Partial<InsertIncome>): Promise<Income | undefined> {
    const income = await this.getIncomeById(id);
    if (!income) return undefined;

    const updatedIncome: Income = {
      ...income,
      ...incomeData,
      updated_at: new Date()
    };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }

  async deleteIncome(id: number): Promise<boolean> {
    return this.incomes.delete(id);
  }

  // Expense Methods
  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const id = this.expenseIdCounter++;
    const now = new Date();
    const expense: Expense = {
      id,
      ...expenseData,
      created_at: now,
      updated_at: now
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      (expense) => expense.userId === userId
    );
  }

  async updateExpense(id: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = await this.getExpenseById(id);
    if (!expense) return undefined;

    const updatedExpense: Expense = {
      ...expense,
      ...expenseData,
      updated_at: new Date()
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Goal Methods
  async createGoal(goalData: InsertGoal): Promise<Goal> {
    const id = this.goalIdCounter++;
    const now = new Date();
    const goal: Goal = {
      id,
      ...goalData,
      created_at: now,
      updated_at: now
    };
    this.goals.set(id, goal);
    return goal;
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async updateGoal(id: number, goalData: Partial<InsertGoal>): Promise<Goal | undefined> {
    const goal = await this.getGoalById(id);
    if (!goal) return undefined;

    const updatedGoal: Goal = {
      ...goal,
      ...goalData,
      updated_at: new Date()
    };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }

  // Budget Methods
  async createBudget(budgetData: InsertMonthlyBudget): Promise<MonthlyBudget> {
    const id = this.budgetIdCounter++;
    const now = new Date();
    const budget: MonthlyBudget = {
      id,
      ...budgetData,
      created_at: now,
      updated_at: now
    };
    this.budgets.set(id, budget);
    return budget;
  }

  async getBudgetById(id: number): Promise<MonthlyBudget | undefined> {
    return this.budgets.get(id);
  }

  async getBudgetsByUserId(userId: number): Promise<MonthlyBudget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId
    );
  }

  async updateBudget(id: number, budgetData: Partial<InsertMonthlyBudget>): Promise<MonthlyBudget | undefined> {
    const budget = await this.getBudgetById(id);
    if (!budget) return undefined;

    const updatedBudget: MonthlyBudget = {
      ...budget,
      ...budgetData,
      updated_at: new Date()
    };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }
}

// Create and export a singleton instance
export const storage = new MemStorage();
