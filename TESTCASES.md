# Home Expense Tracker — Test Cases

> All monetary amounts are in Indian Rupees (₹).

---

## 1. Authentication

### TC-AUTH-01: Successful Registration
1. Navigate to `/register`
2. Enter name, email (new), password
3. Click "Register"
4. **Expected**: Redirect to `/dashboard`, user is logged in

### TC-AUTH-02: Duplicate Email Registration
1. Navigate to `/register`
2. Enter email that already exists
3. Click "Register"
4. **Expected**: Error message "Email already registered", stays on register page

### TC-AUTH-03: Successful Login
1. Navigate to `/login`
2. Enter registered email + correct password
3. Click "Log In"
4. **Expected**: Redirect to `/dashboard`

### TC-AUTH-04: Invalid Login
1. Navigate to `/login`
2. Enter wrong password
3. Click "Log In"
4. **Expected**: Error message "Invalid credentials"

### TC-AUTH-05: Logout
1. While logged in, click "Logout" in sidebar
2. **Expected**: Redirect to `/login`, session cookie cleared

### TC-AUTH-06: Protected Route Redirect
1. While logged out, navigate to `/expenses`
2. **Expected**: Redirect to `/login`

---

## 2. Expenses

### TC-EXP-01: Create Expense
1. Go to Expenses page
2. Click "Add Expense"
3. Enter amount, description, date, category
4. Click "Add Expense"
5. **Expected**: Toast "Expense added", expense appears in table

### TC-EXP-02: Edit Expense
1. Click pencil icon on an existing expense
2. Modify amount/description/date/category
3. Click "Update Expense"
4. **Expected**: Toast "Expense updated", row reflects changes

### TC-EXP-03: Delete Expense
1. Click trash icon on an expense
2. **Expected**: Toast "Expense deleted", row removed

### TC-EXP-04: Search Expenses
1. Type in search box
2. **Expected**: Table filters to matching results

### TC-EXP-05: Pagination
1. Create 16+ expenses
2. **Expected**: Page 1 shows 15 items, page navigation appears
3. Click "Next"
4. **Expected**: Shows remaining items on page 2

### TC-EXP-06: Filter by Date Range
1. Open Filters
2. Set "From" and "To" dates
3. **Expected**: Only expenses in the date range shown

### TC-EXP-07: Filter by Category
1. Open Filters → select a category
2. **Expected**: Only expenses of that category shown

### TC-EXP-08: Filter by Min Amount
1. Open Filters → enter minimum amount
2. **Expected**: Only expenses >= that amount shown

### TC-EXP-09: Sort by Amount
1. Select "Amount" in sort dropdown
2. **Expected**: Expenses sorted by amount
3. Toggle asc/desc button
4. **Expected**: Order reverses

### TC-EXP-10: Sort by Category
1. Select "Category" in sort dropdown
2. **Expected**: Expenses sorted alphabetically by category name

### TC-EXP-11: Sort by "By" (User Name)
1. Select "By" in sort dropdown
2. **Expected**: Expenses sorted alphabetically by user name

---

## 3. Incomes

### TC-INC-01: Create Income
1. Go to Income page
2. Click "Add Income"
3. Enter amount, description, date, category
4. Click "Add Income"
5. **Expected**: Toast "Income added", entry appears

### TC-INC-02: Edit Income
1. Click pencil icon on an income entry
2. Modify and save
3. **Expected**: Changes reflected

### TC-INC-03: Delete Income
1. Click trash icon
2. **Expected**: Entry removed

### TC-INC-04: Pagination
1. Create 16+ incomes
2. **Expected**: Pagination controls appear
3. Navigate pages
4. **Expected**: Correct items per page

### TC-INC-05: Sort
1. Sort by amount, category, date, or user name
2. **Expected**: Table reorders correctly
3. Toggle asc/desc
4. **Expected**: Order reverses

---

## 4. Budgets

### TC-BGT-01: Set Budget
1. Go to Budgets page
2. Click "Set Budget"
3. Select category, enter amount
4. Click "Set Budget"
5. **Expected**: Budget card appears with progress bar

### TC-BGT-02: Budget Progress
1. Create an expense in the same category + month
2. **Expected**: Progress bar reflects spent amount

### TC-BGT-03: Over Budget Alert
1. Set a low budget, add expense exceeding it
2. **Expected**: Card border turns red, "Over budget by ₹X" message

### TC-BGT-04: Delete Budget
1. Click trash icon on a budget card
2. **Expected**: Budget removed

### TC-BGT-05: Month/Year Switch
1. Change month or year selector
2. **Expected**: Budgets and spent amounts update

---

## 5. Categories

### TC-CAT-01: View Categories
1. Go to Categories page
2. **Expected**: Shows expense and income categories with color dots

### TC-CAT-02: Create Category
1. Click "Add Category"
2. Enter name, select type, pick color
3. **Expected**: New category appears

### TC-CAT-03: Edit Category
1. Click pencil icon
2. Rename, change color
3. **Expected**: Category updated

### TC-CAT-04: Delete Category
1. Click trash icon on a user-created category
2. **Expected**: Category removed (cannot delete seeded categories)

---

## 6. Recurring Expenses

### TC-REC-01: Add Recurring
1. Go to Recurring page
2. Click "Add Recurring"
3. Enter amount, description, category, frequency, next date
4. **Expected**: Entry appears in table

### TC-REC-02: Toggle Active
1. Toggle the active switch
2. **Expected**: Entry activates/deactivates

### TC-REC-03: Edit/Delete
1. Edit frequency or amount → changes saved
2. Delete → entry removed

---

## 7. Planned Expenses

### TC-PLN-01: Add Planned Expense
1. Go to Planned page
2. Click "Add Planned Expense"
3. Enter name, amount, due date, frequency (one_time/yearly/etc.), notes
4. **Expected**: Entry appears with summary cards updated

### TC-PLN-02: Frequency Filter
1. Add one_time and yearly expenses
2. **Expected**: Summary cards show correct totals per frequency

### TC-PLN-03: Year Filter
1. Change year dropdown
2. **Expected**: Only one_time expenses for that year shown

### TC-PLN-04: Overdue/Upcoming Badges
1. Set a due date in the past → shows "Overdue" badge
2. Set a due date in the future → shows "Upcoming" badge

### TC-PLN-05: Edit/Delete
1. Edit → changes reflected
2. Delete → entry removed

---

## 8. Family

### TC-FAM-01: Create Family
1. Go to Family page (no family)
2. Click "Create Family"
3. Enter family name
4. **Expected**: Family created, user becomes "Owner"

### TC-FAM-02: Add Member
1. As owner, click "Add Member"
2. Enter name, email (new), password
3. **Expected**: Member added to list with account created
4. Log out and log in as new member
5. **Expected**: Member sees family name, income/expenses shared

### TC-FAM-03: Owner Badge
1. View members list
2. **Expected**: Owner has 👑 Crown badge, other members don't

### TC-FAM-04: Non-Owner Cannot Add Members
1. Log in as a non-owner family member
2. Go to Family page
3. **Expected**: "Add Member" button not visible

### TC-FAM-05: No Join by ID
1. Go to Family page without a family
2. **Expected**: Only "Create Family" option shown, no "Join Family"

### TC-FAM-06: Shared Visibility
1. Member A creates an expense
2. Log in as Member B
3. Go to Expenses page
4. **Expected**: Member A's expense visible with "by [Member A]" in the By column

---

## 9. Dashboard

### TC-DSB-01: Summary Cards
1. Go to Dashboard
2. **Expected**: Shows Total Income, Total Expenses, Balance for current month

### TC-DSB-02: Recent Expenses
1. Add some expenses
2. **Expected**: Recent expenses list shows last 5 entries

### TC-DSB-03: Monthly Comparison Chart
1. Ensure there are expenses/incomes in current and last month
2. **Expected**: Bar chart compares income vs expenses across 2 months

### TC-DSB-04: Family Context
1. Create family, add member, add expenses as both members
2. Log in as any member
3. **Expected**: Dashboard shows combined family totals

---

## 10. Reports

### TC-RPT-01: Category Pie Chart
1. Add expenses across multiple categories
2. Go to Reports
3. **Expected**: Pie chart shows breakdown by category

### TC-RPT-02: Income vs Expense Bar Chart
1. **Expected**: Bar chart comparing income and expenses

### TC-RPT-03: Date Range Filter
1. Set Start and End dates
2. Click "Apply"
3. **Expected**: Charts update to the selected period

### TC-RPT-04: CSV Export
1. Click "Export CSV"
2. **Expected**: Downloads a CSV file with the report data

### TC-RPT-05: PDF Export
1. Click "Export PDF"
2. **Expected**: Downloads a PDF with formatted report

---

## 11. Dark Mode

### TC-DRK-01: Toggle Theme
1. Click theme toggle (sun/moon icon) in header
2. **Expected**: UI switches between light/dark modes
3. Refresh page
4. **Expected**: Theme persists (saved in localStorage)

---

## 12. Edge Cases

### TC-EDG-01: Empty State
1. Create a new user, navigate to each page
2. **Expected**: Each page shows helpful empty state message ("No expenses yet", etc.)

### TC-EDG-02: Zero Amount
1. Try to add an expense with amount 0
2. **Expected**: Some validation or allowed (no crash)

### TC-EDG-03: Very Large Amount
1. Add expense with amount 99,99,999
2. **Expected**: INR formatting displays correctly

### TC-EDG-04: Special Characters in Description
1. Add expense with `<script>`, HTML, emoji in description
2. **Expected**: Rendered safely (no XSS), no crash

### TC-EDG-05: Rapid Clicks
1. Double-click "Add Expense" submit button rapidly
2. **Expected**: Only one expense created (React Query handles this)

### TC-EDG-06: Concurrent Family Access
1. Two family members add expenses simultaneously
2. **Expected**: Both appear correctly, no data loss
