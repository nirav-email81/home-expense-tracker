import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = path.join(process.cwd(), "src", "db", "data.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      family_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS families (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      owner_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
        icon TEXT,
        color TEXT,
        user_id INTEGER,
        family_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (family_id) REFERENCES families(id)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_unique ON categories(name, type, COALESCE(user_id, -1), COALESCE(family_id, -1));

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      family_id INTEGER,
      receipt_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      family_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      family_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS recurring_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category_id INTEGER NOT NULL,
      frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      next_date TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      family_id INTEGER,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (family_id) REFERENCES families(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS planned_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      due_date TEXT NOT NULL,
      frequency TEXT NOT NULL DEFAULT 'one_time' CHECK(frequency IN ('one_time', 'monthly', 'quarterly', 'yearly')),
      notes TEXT DEFAULT '',
      user_id INTEGER NOT NULL,
      family_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (family_id) REFERENCES families(id)
    );
  `);

  try {
    sqlite.exec("ALTER TABLE families ADD COLUMN owner_id INTEGER");
  } catch {
    // column already exists
  }

  const count = sqlite.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
  if (count.c === 0) {
    const insertCat = sqlite.prepare("INSERT OR IGNORE INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)");
    const defaultCategories = [
      ["Food & Dining", "expense", "utensils", "#ef4444"],
      ["Rent", "expense", "home", "#f97316"],
      ["Transport", "expense", "car", "#eab308"],
      ["Utilities", "expense", "zap", "#22c55e"],
      ["Shopping", "expense", "shopping-bag", "#06b6d4"],
      ["Entertainment", "expense", "film", "#8b5cf6"],
      ["Healthcare", "expense", "heart-pulse", "#ec4899"],
      ["Education", "expense", "book-open", "#6366f1"],
      ["Other Expense", "expense", "more-horizontal", "#78716c"],
      ["Salary", "income", "briefcase", "#22c55e"],
      ["Freelance", "income", "laptop", "#06b6d4"],
      ["Investments", "income", "trending-up", "#8b5cf6"],
      ["Other Income", "income", "more-horizontal", "#78716c"],
    ];
    for (const [name, type, icon, color] of defaultCategories) {
      insertCat.run(name, type, icon, color);
    }
  }
}

initDb();
