import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  familyId: integer("family_id").references(() => families.id),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const families = sqliteTable("families", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["expense", "income"] }).notNull(),
  icon: text("icon"),
  color: text("color"),
  userId: integer("user_id").references(() => users.id),
  familyId: integer("family_id").references(() => families.id),
});

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  description: text("description").notNull().default(""),
  date: text("date").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  familyId: integer("family_id").references(() => families.id),
  receiptUrl: text("receipt_url"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const incomes = sqliteTable("incomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  description: text("description").notNull().default(""),
  date: text("date").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  familyId: integer("family_id").references(() => families.id),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const budgets = sqliteTable("budgets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  amount: real("amount").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  familyId: integer("family_id").references(() => families.id),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const recurringExpenses = sqliteTable("recurring_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  amount: real("amount").notNull(),
  description: text("description").notNull().default(""),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  frequency: text("frequency", { enum: ["daily", "weekly", "monthly", "yearly"] }).notNull(),
  nextDate: text("next_date").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  familyId: integer("family_id").references(() => families.id),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const sessions = sqliteTable("sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const plannedExpenses = sqliteTable("planned_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  dueDate: text("due_date").notNull(),
  frequency: text("frequency", { enum: ["one_time", "monthly", "quarterly", "yearly"] }).notNull().default("one_time"),
  notes: text("notes").default(""),
  userId: integer("user_id").references(() => users.id).notNull(),
  familyId: integer("family_id").references(() => families.id),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});
