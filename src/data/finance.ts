export type AccountId = 'checking' | 'savings' | 'investments' | 'credit'
export type CategoryId =
  | 'salary'
  | 'freelance'
  | 'dividends'
  | 'refund'
  | 'rent'
  | 'groceries'
  | 'utilities'
  | 'dining'
  | 'transport'
  | 'entertainment'
  | 'health'
  | 'travel'
  | 'shopping'

export interface Account {
  id: AccountId
  /** Balance in integer cents. The credit card is stored as a negative balance (money owed). */
  balanceCents: number
}

export interface Holding {
  id: string
  name: string
  ticker: string
  /** Value in integer cents. */
  valueCents: number
  color: string
}

export interface Transaction {
  id: string
  date: string // YYYY-MM-DD
  description: string
  category: CategoryId
  account: AccountId
  /** Signed integer cents: positive = income, negative = expense. */
  amountCents: number
}

export interface MonthOption {
  id: string // YYYY-MM
  labelKey: string
}

export const MONTHS: MonthOption[] = [
  { id: '2026-09', labelKey: 'months.sep' },
  { id: '2026-10', labelKey: 'months.oct' },
  { id: '2026-11', labelKey: 'months.nov' },
]

export const SEED_ACCOUNTS: Account[] = [
  { id: 'checking', balanceCents: 842560 },
  { id: 'savings', balanceCents: 2418000 },
  { id: 'investments', balanceCents: 5264075 },
  { id: 'credit', balanceCents: -231840 },
]

export const HOLDINGS: Holding[] = [
  { id: 'vti', name: 'Vanguard Total Stock Market', ticker: 'VTI', valueCents: 1842050, color: '#f59e0b' },
  { id: 'vxus', name: 'Vanguard Total International', ticker: 'VXUS', valueCents: 986025, color: '#38bdf8' },
  { id: 'bnd', name: 'Vanguard Total Bond Market', ticker: 'BND', valueCents: 754000, color: '#34d399' },
  { id: 'aapl', name: 'Apple Inc.', ticker: 'AAPL', valueCents: 621000, color: '#f472b6' },
  { id: 'msft', name: 'Microsoft Corp.', ticker: 'MSFT', valueCents: 461000, color: '#a78bfa' },
  { id: 'cash', name: 'Money market cash', ticker: 'CASH', valueCents: 600000, color: '#94a3b8' },
]

export const SEED_TRANSACTIONS: Transaction[] = [
  // ---- September 2026 ----
  { id: 'TX-001', date: '2026-09-01', description: 'Monthly salary — Northwind Studio', category: 'salary', account: 'checking', amountCents: 520000 },
  { id: 'TX-002', date: '2026-09-01', description: 'Rent — Maple Court apartment', category: 'rent', account: 'checking', amountCents: -185000 },
  { id: 'TX-003', date: '2026-09-02', description: 'Gym membership — Ironworks Fitness', category: 'health', account: 'checking', amountCents: -3500 },
  { id: 'TX-004', date: '2026-09-03', description: 'Groceries — GreenMart', category: 'groceries', account: 'checking', amountCents: -18475 },
  { id: 'TX-005', date: '2026-09-05', description: 'Electricity & water bill', category: 'utilities', account: 'checking', amountCents: -13280 },
  { id: 'TX-006', date: '2026-09-07', description: 'Dinner — Olive & Thyme', category: 'dining', account: 'credit', amountCents: -6840 },
  { id: 'TX-007', date: '2026-09-08', description: 'Metro card top-up', category: 'transport', account: 'checking', amountCents: -4500 },
  { id: 'TX-008', date: '2026-09-10', description: 'Groceries — GreenMart', category: 'groceries', account: 'checking', amountCents: -14230 },
  { id: 'TX-009', date: '2026-09-12', description: 'Freelance — logo design for Bloom Cafe', category: 'freelance', account: 'checking', amountCents: 85000 },
  { id: 'TX-010', date: '2026-09-15', description: 'Streaming — Streamly subscription', category: 'entertainment', account: 'credit', amountCents: -1599 },
  { id: 'TX-011', date: '2026-09-20', description: 'Quarterly dividends — VTI', category: 'dividends', account: 'investments', amountCents: 12450 },

  // ---- October 2026 ----
  { id: 'TX-012', date: '2026-10-01', description: 'Monthly salary — Northwind Studio', category: 'salary', account: 'checking', amountCents: 520000 },
  { id: 'TX-013', date: '2026-10-01', description: 'Rent — Maple Court apartment', category: 'rent', account: 'checking', amountCents: -185000 },
  { id: 'TX-014', date: '2026-10-04', description: 'Groceries — GreenMart', category: 'groceries', account: 'checking', amountCents: -20120 },
  { id: 'TX-015', date: '2026-10-06', description: 'Electricity & water bill', category: 'utilities', account: 'checking', amountCents: -12840 },
  { id: 'TX-016', date: '2026-10-09', description: 'Metro card top-up', category: 'transport', account: 'checking', amountCents: -4800 },
  { id: 'TX-017', date: '2026-10-11', description: 'Dinner — Casa Verde', category: 'dining', account: 'credit', amountCents: -9230 },
  { id: 'TX-018', date: '2026-10-14', description: 'Freelance — website for Fern & Field', category: 'freelance', account: 'checking', amountCents: 62000 },
  { id: 'TX-019', date: '2026-10-18', description: 'Groceries — GreenMart', category: 'groceries', account: 'checking', amountCents: -16780 },
  { id: 'TX-020', date: '2026-10-20', description: 'Flight — Cairo to Alexandria return', category: 'travel', account: 'credit', amountCents: -34200 },
  { id: 'TX-021', date: '2026-10-22', description: 'Tax refund', category: 'refund', account: 'checking', amountCents: 31500 },
  { id: 'TX-022', date: '2026-10-25', description: 'New winter jacket — Northwind Outfitters', category: 'shopping', account: 'credit', amountCents: -12850 },

  // ---- November 2026 ----
  { id: 'TX-023', date: '2026-11-01', description: 'Monthly salary — Northwind Studio', category: 'salary', account: 'checking', amountCents: 520000 },
  { id: 'TX-024', date: '2026-11-01', description: 'Rent — Maple Court apartment', category: 'rent', account: 'checking', amountCents: -185000 },
  { id: 'TX-025', date: '2026-11-02', description: 'Gym membership — Ironworks Fitness', category: 'health', account: 'checking', amountCents: -3500 },
  { id: 'TX-026', date: '2026-11-03', description: 'Groceries — GreenMart', category: 'groceries', account: 'checking', amountCents: -17640 },
  { id: 'TX-027', date: '2026-11-05', description: 'Electricity & water bill', category: 'utilities', account: 'checking', amountCents: -14110 },
  { id: 'TX-028', date: '2026-11-08', description: 'Dinner — Olive & Thyme', category: 'dining', account: 'credit', amountCents: -7450 },
  { id: 'TX-029', date: '2026-11-10', description: 'Freelance — brand kit for Lumen Yoga', category: 'freelance', account: 'checking', amountCents: 110000 },
  { id: 'TX-030', date: '2026-11-12', description: 'Metro card top-up', category: 'transport', account: 'checking', amountCents: -5200 },
  { id: 'TX-031', date: '2026-11-15', description: 'Streaming — Streamly subscription', category: 'entertainment', account: 'credit', amountCents: -1599 },
  { id: 'TX-032', date: '2026-11-16', description: 'Groceries — GreenMart', category: 'groceries', account: 'checking', amountCents: -15920 },
  { id: 'TX-033', date: '2026-11-18', description: 'Quarterly dividends — VXUS', category: 'dividends', account: 'investments', amountCents: 13875 },
  { id: 'TX-034', date: '2026-11-21', description: 'Running shoes — Northwind Outfitters', category: 'shopping', account: 'credit', amountCents: -21400 },
]

export const CATEGORIES: CategoryId[] = [
  'salary',
  'freelance',
  'dividends',
  'refund',
  'rent',
  'groceries',
  'utilities',
  'dining',
  'transport',
  'entertainment',
  'health',
  'travel',
  'shopping',
]

export const ACCOUNT_IDS: AccountId[] = ['checking', 'savings', 'investments', 'credit']

export function formatMoney(cents: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(cents / 100)
}
