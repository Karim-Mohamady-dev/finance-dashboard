import { useEffect, useMemo, useState } from 'react'
import {
  ArrowsClockwise,
  Bank,
  ChartBar,
  ChartPie,
  Coins,
  CreditCard,
  GlobeHemisphereWest,
  MagnifyingGlass,
  PiggyBank,
  Plus,
  Receipt,
  Trash,
  TrendDown,
  TrendUp,
  Wallet,
  X,
} from '@phosphor-icons/react'
import { detectLang, useDict, type Lang } from './i18n'
import {
  ACCOUNT_IDS,
  CATEGORIES,
  HOLDINGS,
  MONTHS,
  SEED_ACCOUNTS,
  SEED_TRANSACTIONS,
  formatMoney,
  type Account,
  type AccountId,
  type CategoryId,
  type Transaction,
} from './data/finance'

const LANG_KEY = 'finance-dashboard-lang'
const ACCOUNTS_KEY = 'finance-dashboard-accounts'
const TX_KEY = 'finance-dashboard-transactions'
const MONTH_KEY = 'finance-dashboard-month'

const ACCOUNT_ICON: Record<AccountId, typeof Wallet> = {
  checking: Wallet,
  savings: PiggyBank,
  investments: TrendUp,
  credit: CreditCard,
}

const ACCOUNT_TONE: Record<AccountId, string> = {
  checking: 'bg-amber-400/10 text-amber-300 ring-amber-400/30',
  savings: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/30',
  investments: 'bg-sky-400/10 text-sky-300 ring-sky-400/30',
  credit: 'bg-rose-400/10 text-rose-300 ring-rose-400/30',
}

function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return SEED_ACCOUNTS
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return SEED_ACCOUNTS
    const ok = parsed.every(
      (a): a is Account =>
        !!a && typeof a === 'object' &&
        typeof (a as Account).id === 'string' &&
        typeof (a as Account).balanceCents === 'number' &&
        ACCOUNT_IDS.includes((a as Account).id),
    )
    return ok && parsed.length === 4 ? parsed : SEED_ACCOUNTS
  } catch {
    return SEED_ACCOUNTS
  }
}

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TX_KEY)
    if (!raw) return SEED_TRANSACTIONS
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return SEED_TRANSACTIONS
    return parsed.filter(
      (p): p is Transaction =>
        !!p && typeof p === 'object' &&
        typeof (p as Transaction).id === 'string' &&
        typeof (p as Transaction).date === 'string' &&
        typeof (p as Transaction).description === 'string' &&
        typeof (p as Transaction).amountCents === 'number' &&
        CATEGORIES.includes((p as Transaction).category) &&
        ACCOUNT_IDS.includes((p as Transaction).account),
    )
  } catch {
    return SEED_TRANSACTIONS
  }
}

function loadMonth(): string {
  try {
    const saved = localStorage.getItem(MONTH_KEY)
    if (saved && MONTHS.some((m) => m.id === saved)) return saved
  } catch {
    // storage unavailable
  }
  return '2026-11'
}

export default function App() {
  const [lang, setLang] = useState<Lang>(() => detectLang())
  const { t } = useDict(lang)

  const [accounts, setAccounts] = useState<Account[]>(loadAccounts)
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions)
  const [month, setMonth] = useState<string>(loadMonth)

  const [selectedAccount, setSelectedAccount] = useState<'all' | AccountId>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | CategoryId>('all')
  const [search, setSearch] = useState('')

  // Add-transaction form
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [txType, setTxType] = useState<'income' | 'expense'>('expense')
  const [txCategory, setTxCategory] = useState<CategoryId>('groceries')
  const [txAccount, setTxAccount] = useState<AccountId>('checking')
  const [txDate, setTxDate] = useState('2026-11-27')
  const [formError, setFormError] = useState('')
  const [formNotice, setFormNotice] = useState('')

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // storage unavailable
    }
  }, [lang])

  useEffect(() => {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
    } catch {
      // storage unavailable
    }
  }, [accounts])

  useEffect(() => {
    try {
      localStorage.setItem(TX_KEY, JSON.stringify(transactions))
    } catch {
      // storage unavailable
    }
  }, [transactions])

  useEffect(() => {
    try {
      localStorage.setItem(MONTH_KEY, month)
    } catch {
      // storage unavailable
    }
  }, [month])

  const locale = lang === 'ar' ? 'ar-EG' : 'en-US'
  const money = (cents: number) => formatMoney(cents, locale)
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale])

  // ---- Live-computed figures ----
  const netWorth = useMemo(() => accounts.reduce((s, a) => s + a.balanceCents, 0), [accounts])
  const portfolioTotal = useMemo(() => HOLDINGS.reduce((s, h) => s + h.valueCents, 0), [])

  const monthTx = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(month)),
    [transactions, month],
  )
  const monthIncome = useMemo(
    () => monthTx.filter((tx) => tx.amountCents > 0).reduce((s, tx) => s + tx.amountCents, 0),
    [monthTx],
  )
  const monthExpenses = useMemo(
    () => monthTx.filter((tx) => tx.amountCents < 0).reduce((s, tx) => s + -tx.amountCents, 0),
    [monthTx],
  )
  const monthNet = monthIncome - monthExpenses
  const savingsRate = monthIncome > 0 ? (monthNet / monthIncome) * 100 : 0

  // Weekly income vs expenses, genuinely aggregated from this month's transactions
  const weeks = useMemo(() => {
    const out = [0, 1, 2, 3].map((w) => ({ income: 0, expenses: 0 }))
    for (const tx of monthTx) {
      const day = Number(tx.date.slice(8, 10))
      const w = Math.min(3, Math.floor((day - 1) / 7))
      if (tx.amountCents > 0) out[w].income += tx.amountCents
      else out[w].expenses += -tx.amountCents
    }
    return out
  }, [monthTx])
  const chartMax = Math.max(...weeks.flatMap((w) => [w.income, w.expenses]), 1)

  const filteredTx = useMemo(() => {
    const q = search.trim().toLowerCase()
    return monthTx
      .filter((tx) => (selectedAccount === 'all' ? true : tx.account === selectedAccount))
      .filter((tx) => (categoryFilter === 'all' ? true : tx.category === categoryFilter))
      .filter((tx) => (q ? tx.description.toLowerCase().includes(q) : true))
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [monthTx, selectedAccount, categoryFilter, search])

  const monthLabel = MONTHS.find((m) => m.id === month)?.labelKey ?? 'months.nov'

  // ---- Actions ----
  const submitTransaction = () => {
    if (desc.trim().length === 0) {
      setFormError(t('form.emptyDesc'))
      return
    }
    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setFormError(t('form.invalidAmount'))
      return
    }
    const cents = Math.round(parsed * 100)
    const signed = txType === 'income' ? cents : -cents
    const tx: Transaction = {
      id: `TX-USER-${Date.now().toString(36).toUpperCase()}`,
      date: txDate,
      description: desc.trim(),
      category: txCategory,
      account: txAccount,
      amountCents: signed,
    }
    setTransactions((prev) => [...prev, tx])
    setAccounts((prev) =>
      prev.map((a) => (a.id === txAccount ? { ...a, balanceCents: a.balanceCents + signed } : a)),
    )
    setFormError('')
    setDesc('')
    setAmount('')
    setFormNotice(t('form.added'))
    window.setTimeout(() => setFormNotice(''), 4000)
  }

  const deleteTransaction = (tx: Transaction) => {
    if (!tx.id.startsWith('TX-USER-')) return
    setTransactions((prev) => prev.filter((p) => p.id !== tx.id))
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === tx.account ? { ...a, balanceCents: a.balanceCents - tx.amountCents } : a,
      ),
    )
  }

  const resetDemo = () => {
    setAccounts(SEED_ACCOUNTS)
    setTransactions(SEED_TRANSACTIONS)
    setMonth('2026-11')
    setSelectedAccount('all')
    setCategoryFilter('all')
    setSearch('')
    setDesc('')
    setAmount('')
    setTxType('expense')
    setFormError('')
    setFormNotice('')
    try {
      localStorage.removeItem(ACCOUNTS_KEY)
      localStorage.removeItem(TX_KEY)
      localStorage.removeItem(MONTH_KEY)
    } catch {
      // storage unavailable
    }
  }

  // Donut geometry
  const R = 80
  const C = 2 * Math.PI * R
  let donutOffset = 0

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-stone-950 shadow-sm">
              <Coins size={26} weight="fill" />
            </span>
            <div>
              <p className="text-2xl font-extrabold tracking-tight">{t('app.name')}</p>
              <p className="text-xs font-semibold text-stone-400">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-stone-700 hover:bg-stone-800"
            >
              <GlobeHemisphereWest size={18} />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <button
              type="button"
              onClick={resetDemo}
              className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-bold shadow-sm ring-1 ring-stone-700 hover:bg-stone-800"
            >
              <ArrowsClockwise size={18} />
              {t('actions.reset')}
            </button>
          </div>
        </header>

        <div className="mt-6">
          <p className="text-sm font-semibold text-amber-400">{t('header.greeting')}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">{t('header.title')}</h1>
          <p className="mt-1 text-sm text-stone-400">{t('header.subtitle')}</p>
        </div>

        {/* Stats row */}
        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-5 text-stone-950 shadow-sm">
            <div className="flex items-center gap-2 text-stone-800">
              <Bank size={18} />
              <p className="text-sm font-semibold">{t('stats.netWorth')}</p>
            </div>
            <p className="mt-2 text-3xl font-extrabold">{money(netWorth)}</p>
            <p className="mt-1 text-xs font-semibold text-stone-800">{t('stats.netWorthSub')}</p>
          </div>
          <div className="rounded-2xl bg-stone-900 p-5 shadow-sm ring-1 ring-stone-800">
            <div className="flex items-center gap-2 text-stone-400">
              <TrendUp size={18} className="text-emerald-400" />
              <p className="text-sm font-semibold">{t('stats.income')}</p>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-emerald-400">{money(monthIncome)}</p>
            <p className="mt-1 text-xs text-stone-400">{t(monthLabel)}</p>
          </div>
          <div className="rounded-2xl bg-stone-900 p-5 shadow-sm ring-1 ring-stone-800">
            <div className="flex items-center gap-2 text-stone-400">
              <TrendDown size={18} className="text-rose-400" />
              <p className="text-sm font-semibold">{t('stats.expenses')}</p>
            </div>
            <p className="mt-2 text-3xl font-extrabold text-rose-400">{money(monthExpenses)}</p>
            <p className="mt-1 text-xs text-stone-400">{t(monthLabel)}</p>
          </div>
          <div className="rounded-2xl bg-stone-900 p-5 shadow-sm ring-1 ring-stone-800">
            <div className="flex items-center gap-2 text-stone-400">
              <ChartPie size={18} className="text-amber-400" />
              <p className="text-sm font-semibold">{t('stats.savingsRate')}</p>
            </div>
            <p className="mt-2 text-3xl font-extrabold">{savingsRate.toFixed(1)}%</p>
            <p className="mt-1 text-xs text-stone-400">
              {t('stats.net')}: {money(monthNet)} · {t('stats.savingsRateSub')}
            </p>
          </div>
        </section>

        {/* Accounts */}
        <section className="mt-6 rounded-2xl bg-stone-900 p-6 shadow-sm ring-1 ring-stone-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">{t('accounts.title')}</h2>
              <p className="mt-1 text-sm text-stone-400">{t('accounts.subtitle')}</p>
            </div>
            {selectedAccount !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedAccount('all')}
                className="flex items-center gap-1 rounded-full bg-stone-800 px-3.5 py-1.5 text-sm font-bold ring-1 ring-stone-700 hover:bg-stone-700"
              >
                <X size={16} />
                {t('actions.clear')}
              </button>
            )}
          </div>
          <p className="mt-2 text-xs font-semibold text-stone-500">{t('accounts.hint')}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {accounts.map((a) => {
              const Icon = ACCOUNT_ICON[a.id]
              const selected = selectedAccount === a.id
              const isCredit = a.id === 'credit'
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAccount(selected ? 'all' : a.id)}
                  className={`rounded-2xl bg-stone-950 p-4 text-start ring-1 transition-all ${
                    selected
                      ? 'ring-2 ring-amber-400'
                      : 'ring-stone-800 hover:ring-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${ACCOUNT_TONE[a.id]}`}>
                      <Icon size={20} weight="fill" />
                    </span>
                    <p className="text-sm font-extrabold">{t(`accounts.${a.id}`)}</p>
                    {selected && (
                      <span className="ms-auto rounded-full bg-amber-400 px-2 py-0.5 text-xs font-extrabold text-stone-950">
                        {t('accounts.selected')}
                      </span>
                    )}
                  </div>
                  <p className={`mt-3 text-2xl font-extrabold ${isCredit ? 'text-rose-400' : ''}`}>
                    {isCredit ? '−' : ''}
                    {money(Math.abs(a.balanceCents))}
                  </p>
                  <p className="text-xs text-stone-400">
                    {isCredit ? t('accounts.owed') : t('accounts.balance')}
                  </p>
                </button>
              )
            })}
          </div>
          <p className="mt-4 border-t border-stone-800 pt-3 text-sm font-bold text-stone-300">
            {t('accounts.total')}: {money(netWorth)}
          </p>
        </section>

        {/* Chart + Investments */}
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <section className="rounded-2xl bg-stone-900 p-6 shadow-sm ring-1 ring-stone-800 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ChartBar size={20} className="text-amber-400" />
                <h2 className="text-lg font-extrabold">{t('chart.title')}</h2>
              </div>
              <div className="flex gap-2">
                {MONTHS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMonth(m.id)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-bold ring-1 transition-colors ${
                      month === m.id
                        ? 'bg-amber-400 text-stone-950 ring-amber-400'
                        : 'bg-stone-950 text-stone-300 ring-stone-700 hover:bg-stone-800'
                    }`}
                  >
                    {t(m.labelKey).split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-sm text-stone-400">{t('chart.subtitle')}</p>
            <p className="mt-3 text-sm font-bold text-stone-300">
              {t('chart.income')}: <span className="text-emerald-400">{money(monthIncome)}</span>
              {' · '}
              {t('chart.expenses')}: <span className="text-rose-400">{money(monthExpenses)}</span>
              {' · '}
              {t('chart.net')}: {money(monthNet)}
            </p>
            {monthTx.length === 0 ? (
              <p className="mt-6 text-sm text-stone-400">{t('chart.noData')}</p>
            ) : (
              <svg viewBox="0 0 640 260" className="mt-4 w-full" role="img" aria-label={t('chart.title')}>
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <line key={f} x1="0" x2="640" y1={210 - f * 170} y2={210 - f * 170} stroke="#292524" strokeWidth="1" />
                ))}
                {weeks.map((w, i) => {
                  const gw = 640 / 4
                  const ih = (w.income / chartMax) * 170
                  const eh = (w.expenses / chartMax) * 170
                  const x = i * gw
                  return (
                    <g key={i}>
                      <rect x={x + gw * 0.2} y={210 - ih} width={gw * 0.26} height={ih} rx={5} fill="#34d399" />
                      <rect x={x + gw * 0.54} y={210 - eh} width={gw * 0.26} height={eh} rx={5} fill="#fb7185" />
                      {w.income > 0 && (
                        <text x={x + gw * 0.33} y={204 - ih} textAnchor="middle" fontSize="10" fontWeight="700" fill="#34d399">
                          {(w.income / 100).toFixed(0)}
                        </text>
                      )}
                      {w.expenses > 0 && (
                        <text x={x + gw * 0.67} y={204 - eh} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fb7185">
                          {(w.expenses / 100).toFixed(0)}
                        </text>
                      )}
                      <text x={x + gw * 0.5} y={230} textAnchor="middle" fontSize="11" fill="#a8a29e">
                        {t(`chart.week${i + 1}`)}
                      </text>
                    </g>
                  )
                })}
                <g fontSize="11" fontWeight="700">
                  <rect x={8} y={244} width={10} height={10} rx={2} fill="#34d399" />
                  <text x={24} y={253} fill="#d6d3d1">{t('chart.income')}</text>
                  <rect x={110} y={244} width={10} height={10} rx={2} fill="#fb7185" />
                  <text x={126} y={253} fill="#d6d3d1">{t('chart.expenses')}</text>
                </g>
              </svg>
            )}
          </section>

          {/* Investments */}
          <section className="rounded-2xl bg-stone-900 p-6 shadow-sm ring-1 ring-stone-800 lg:col-span-2">
            <div className="flex items-center gap-2">
              <ChartPie size={20} className="text-amber-400" />
              <h2 className="text-lg font-extrabold">{t('investments.title')}</h2>
            </div>
            <p className="mt-1 text-sm text-stone-400">{t('investments.subtitle')}</p>
            <div className="mt-5 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="h-44 w-44" role="img" aria-label={t('investments.allocation')}>
                <circle cx="100" cy="100" r={R} fill="none" stroke="#292524" strokeWidth="26" />
                {HOLDINGS.map((h) => {
                  const frac = h.valueCents / portfolioTotal
                  const len = frac * C
                  const el = (
                    <circle
                      key={h.id}
                      cx="100"
                      cy="100"
                      r={R}
                      fill="none"
                      stroke={h.color}
                      strokeWidth="26"
                      strokeDasharray={`${Math.max(0, len - 2)} ${C - Math.max(0, len - 2)}`}
                      strokeDashoffset={-donutOffset}
                      transform="rotate(-90 100 100)"
                    />
                  )
                  donutOffset += len
                  return el
                })}
                <text x="100" y="96" textAnchor="middle" fontSize="12" fill="#a8a29e">
                  {t('investments.totalValue')}
                </text>
                <text x="100" y="116" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fafaf9">
                  {money(portfolioTotal)}
                </text>
              </svg>
            </div>
            <ul className="mt-5 space-y-3">
              {HOLDINGS.map((h) => {
                const share = (h.valueCents / portfolioTotal) * 100
                return (
                  <li key={h.id}>
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 font-bold">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: h.color }} />
                        {h.ticker} <span className="hidden font-normal text-stone-400 sm:inline">· {h.name}</span>
                      </span>
                      <span className="font-bold">{money(h.valueCents)}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${share}%`, backgroundColor: h.color }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-stone-400">
                      {t('investments.share')}: {share.toFixed(1)}%
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* Transactions + Form */}
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <section className="rounded-2xl bg-stone-900 p-6 shadow-sm ring-1 ring-stone-800 lg:col-span-3">
            <div className="flex items-center gap-2">
              <Receipt size={20} className="text-amber-400" />
              <h2 className="text-lg font-extrabold">{t('transactions.title')}</h2>
              <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-extrabold text-amber-300">
                {nf.format(filteredTx.length)} / {nf.format(monthTx.length)}
              </span>
            </div>
            <p className="mt-1 text-sm text-stone-400">
              {t('transactions.subtitle')} · {t(monthLabel)}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <MagnifyingGlass size={16} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('transactions.searchPlaceholder')}
                  className="w-full rounded-lg bg-stone-950 py-2 pe-3 ps-9 text-sm ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as 'all' | CategoryId)}
                className="rounded-lg bg-stone-950 px-3 py-2 text-sm font-bold ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">{t('transactions.allCategories')}</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{t(`categories.${c}`)}</option>
                ))}
              </select>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value as 'all' | AccountId)}
                className="rounded-lg bg-stone-950 px-3 py-2 text-sm font-bold ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="all">{t('transactions.allAccounts')}</option>
                {ACCOUNT_IDS.map((a) => (
                  <option key={a} value={a}>{t(`accounts.${a}`)}</option>
                ))}
              </select>
            </div>
            {filteredTx.length === 0 ? (
              <p className="mt-5 text-sm text-stone-400">{t('transactions.empty')}</p>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {filteredTx.map((tx) => {
                  const isIncome = tx.amountCents > 0
                  return (
                    <li key={tx.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-stone-950 px-4 py-3 ring-1 ring-stone-800">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isIncome ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                        {isIncome ? <TrendUp size={18} /> : <TrendDown size={18} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{tx.description}</p>
                        <p className="text-xs text-stone-400">
                          {tx.date} · {t(`categories.${tx.category}`)} · {t(`accounts.${tx.account}`)}
                        </p>
                      </div>
                      <p className={`text-sm font-extrabold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isIncome ? '+' : '−'}{money(Math.abs(tx.amountCents))}
                      </p>
                      {tx.id.startsWith('TX-USER-') && (
                        <button
                          type="button"
                          onClick={() => deleteTransaction(tx)}
                          title={t('transactions.delete')}
                          className="flex items-center gap-1 rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs font-bold text-rose-400 ring-1 ring-stone-700 hover:bg-rose-400/10"
                        >
                          <Trash size={14} />
                          {t('transactions.delete')}
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
            <p className="mt-4 text-xs text-stone-500">
              {t('transactions.showing')} {nf.format(filteredTx.length)} · {t(monthLabel)}
            </p>
          </section>

          {/* Add transaction */}
          <section className="rounded-2xl bg-stone-900 p-6 shadow-sm ring-1 ring-stone-800 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Plus size={20} className="text-amber-400" />
              <h2 className="text-lg font-extrabold">{t('form.title')}</h2>
            </div>
            <p className="mt-1 text-sm text-stone-400">{t('form.subtitle')}</p>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-stone-400">{t('form.descLabel')}</span>
                <input
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={t('form.descPlaceholder')}
                  className="w-full rounded-lg bg-stone-950 px-3 py-2 text-sm ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-stone-400">{t('form.amountLabel')}</span>
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    inputMode="decimal"
                    className="w-full rounded-lg bg-stone-950 px-3 py-2 text-sm ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-stone-400">{t('form.dateLabel')}</span>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full rounded-lg bg-stone-950 px-3 py-2 text-sm ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400 [color-scheme:dark]"
                  />
                </label>
              </div>
              <div>
                <p className="mb-1 text-xs font-bold text-stone-400">{t('form.typeLabel')}</p>
                <div className="flex gap-2">
                  {(['income', 'expense'] as const).map((ty) => (
                    <button
                      key={ty}
                      type="button"
                      onClick={() => setTxType(ty)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold ring-1 transition-colors ${
                        txType === ty
                          ? ty === 'income'
                            ? 'bg-emerald-400 text-stone-950 ring-emerald-400'
                            : 'bg-rose-400 text-stone-950 ring-rose-400'
                          : 'bg-stone-950 text-stone-300 ring-stone-700 hover:bg-stone-800'
                      }`}
                    >
                      {t(`form.${ty}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-stone-400">{t('form.categoryLabel')}</span>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as CategoryId)}
                    className="w-full rounded-lg bg-stone-950 px-3 py-2 text-sm font-bold ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{t(`categories.${c}`)}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-stone-400">{t('form.accountLabel')}</span>
                  <select
                    value={txAccount}
                    onChange={(e) => setTxAccount(e.target.value as AccountId)}
                    className="w-full rounded-lg bg-stone-950 px-3 py-2 text-sm font-bold ring-1 ring-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {ACCOUNT_IDS.map((a) => (
                      <option key={a} value={a}>{t(`accounts.${a}`)}</option>
                    ))}
                  </select>
                </label>
              </div>
              <button
                type="button"
                onClick={submitTransaction}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-stone-950 hover:bg-amber-300"
              >
                <Plus size={16} weight="bold" />
                {t('form.submit')}
              </button>
              {formError && (
                <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-sm font-semibold text-rose-300 ring-1 ring-rose-400/30">
                  {formError}
                </p>
              )}
              {formNotice && (
                <p className="rounded-lg bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  {formNotice}
                </p>
              )}
            </div>
          </section>
        </div>

        <footer className="mt-8 border-t border-stone-800 pt-4 pb-2 text-center text-xs text-stone-500">
          <p>{t('footer.demo')}</p>
          <p className="mt-1">{t('footer.madeWith')}</p>
        </footer>
      </div>
    </div>
  )
}
