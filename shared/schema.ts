import { pgTable, text, serial, integer, boolean, decimal, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
});

// Fixed Deposit schema
export const fixedDeposits = pgTable("fixed_deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fdNumber: text("fd_number").notNull(),
  bankName: text("bank_name").notNull(),
  principalAmount: decimal("principal_amount", { precision: 12, scale: 2 }).notNull(),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }).notNull(),
  tenure: integer("tenure").notNull(), // in months
  tenureType: text("tenure_type").notNull().default("months"), // months or years
  startDate: date("start_date").notNull(),
  maturityDate: date("maturity_date").notNull(),
  interestAmount: decimal("interest_amount", { precision: 12, scale: 2 }),
  maturityAmount: decimal("maturity_amount", { precision: 12, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFDSchema = createInsertSchema(fixedDeposits).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Income schema
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  source: text("source").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurrenceFrequency: text("recurrence_frequency"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIncomeSchema = createInsertSchema(incomes).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Expense schema
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  isRecurring: boolean("is_recurring").default(false).notNull(),
  recurrenceFrequency: text("recurrence_frequency"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Goal schema
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  targetDate: date("target_date").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Monthly Budget schema
export const monthlyBudgets = pgTable("monthly_budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalIncome: decimal("total_income", { precision: 12, scale: 2 }).notNull(),
  totalExpense: decimal("total_expense", { precision: 12, scale: 2 }).notNull(),
  savings: decimal("savings", { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBudgetSchema = createInsertSchema(monthlyBudgets).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Define type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type FixedDeposit = typeof fixedDeposits.$inferSelect;
export type InsertFixedDeposit = z.infer<typeof insertFDSchema>;

export type Income = typeof incomes.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;

export type MonthlyBudget = typeof monthlyBudgets.$inferSelect;
export type InsertMonthlyBudget = z.infer<typeof insertBudgetSchema>;
