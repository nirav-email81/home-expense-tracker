# Home Expense Tracker — Setup Guide for Newbies

This guide walks you through downloading, setting up, and running the project on Windows or Linux.

---

## Prerequisites

### 1. Install Node.js

Node.js is required to run the application. You need **Node.js 18+** (preferably 20 or 22).

**Windows:**
1. Go to https://nodejs.org/
2. Download the "LTS" version (e.g., 22.x)
3. Run the installer — click Next through all steps (defaults are fine)
4. Open **Command Prompt** (`Win + R`, type `cmd`, press Enter)
5. Verify installation:
   ```
   node --version
   npm --version
   ```
   You should see version numbers like `v22.x.x` and `10.x.x`.

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install -y curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install nodejs
```

### 2. Install Git

Git is needed to download the project from GitHub.

**Windows:**
1. Go to https://git-scm.com/download/win
2. Download and run the installer (defaults are fine)
3. After installation, open **Command Prompt** and verify:
   ```
   git --version
   ```

**Linux:**
```bash
sudo apt install git      # Ubuntu/Debian
sudo dnf install git      # Fedora
git --version
```

### 3. Text Editor / IDE (Recommended)

Install **Visual Studio Code**: https://code.visualstudio.com/

---

## Download the Project

Open **Command Prompt** (Windows) or **Terminal** (Linux) and run:

```bash
git clone https://github.com/nirav-email81/home-expense-tracker.git
cd home-expense-tracker
```

This creates a folder `home-expense-tracker` and downloads all files.

---

## Install Dependencies

Inside the project folder, run:

```bash
npm install
```

This reads `package.json` and downloads all required libraries into a `node_modules` folder.  
It may take 1-2 minutes on first run.

---

## Set Up Environment Variables

Create a file named `.env` in the project root folder:

**Windows (Command Prompt):**
```bash
copy nul .env
```

**Linux:**
```bash
touch .env
```

Open `.env` in any text editor and add:

```
SESSION_SECRET=your-super-secret-key-change-this-in-production
```

You can use any random string as the secret.   
For production, generate a strong one:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as your `SESSION_SECRET`.

---

## Run the Development Server

```bash
npm run dev
```

You should see output like:
```
▲ Next.js 16.x.x
- Local: http://localhost:3000
```

Open your web browser and go to **http://localhost:3000**

The database file (`src/db/data.db`) is created automatically on the first run, along with default categories (seeded).

---

## Build for Production

```bash
npm run build
npm start
```

The first command compiles the app (may take 10-30 seconds).  
The second starts the production server on `http://localhost:3000`.

---

## Project Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run linter (if configured) |

---

## Common Troubleshooting

### "node is not recognized" / "command not found"
Node.js is not installed or not in PATH. Reinstall Node.js and ensure "Add to PATH" is checked during installation.

### "npm install" fails with permission errors
- **Windows**: Run Command Prompt as Administrator
- **Linux**: Do NOT use `sudo npm install`. If you get permission errors, fix npm's folder permissions:
  ```bash
  mkdir ~/.npm-global
  npm config set prefix '~/.npm-global'
  ```
  Then add `export PATH=~/.npm-global/bin:$PATH` to `~/.bashrc` and run `source ~/.bashrc`.

### Port 3000 already in use
Change the port:
```bash
npm run dev -- -p 3001
```

### "SQLITE_ERROR" on startup
Delete the database file to reset:
```bash
del src\db\data.db          # Windows
rm src/db/data.db            # Linux
```
The file will be recreated automatically on next run.

### "Cannot find module 'better-sqlite3'"
```bash
npm rebuild better-sqlite3
```

### Blank page or errors after update
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

## Tools Overview

| Tool | Purpose | Install Link |
|------|---------|-------------|
| **Node.js** | Runs JavaScript on the server | https://nodejs.org/ |
| **npm** | Package manager (comes with Node.js) | — |
| **Git** | Version control, download code | https://git-scm.com/ |
| **VS Code** | Code editor | https://code.visualstudio.com/ |
| **SQLite Browser** (optional) | View/edit the database file | https://sqlitebrowser.org/ |

---

## Project Architecture (Quick Overview)

```
HOME-EXPENSE-TRACKER/
├── src/
│   ├── app/                    # All pages and API routes
│   │   ├── api/                # Backend endpoints
│   │   ├── (auth)/             # Login + Register pages
│   │   └── (protected)/        # Main app pages
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Buttons, inputs, tables, etc.
│   │   └── shared/             # Sidebar navigation
│   ├── db/                     # Database setup and schema
│   ├── lib/                    # Utilities (auth, formatting)
├── proxy.ts                    # Auth middleware
├── next.config.ts              # Next.js configuration
└── package.json                # Project metadata and scripts
```

---

## First-Time User Flow

1. Open http://localhost:3000
2. Click "Register" → create an account
3. You're taken to the Dashboard
4. Start by adding **Categories** (or use the pre-seeded defaults)
5. Add **Expenses** and **Income**
6. Set **Budgets** for monthly limits
7. Use **Recurring** for regular expenses and **Planned** for major expected expenses
8. Track **Investments** (deposits, mutual funds, gold, art)
9. Explore **Reports** for charts and CSV/PDF export
10. Optionally, create a **Family** to share with household members

---

## Getting Help

If you encounter issues:
- Check error messages in the **browser console** (F12 → Console tab)
- Check the **terminal** where `npm run dev` is running
- Re-read the relevant section above
- Search existing GitHub Issues for the project
