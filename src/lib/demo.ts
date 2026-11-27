// Historical series for charts. Live records (transactions, notifications, messages, cards…) come from Supabase.

/** Weekly expenses, weeks starting Sunday Aug 3 2025 → Jul 26 2026. 1 square = $50. */
export const WEEKS_THIS_YEAR = [350,250,350,200,400,350,350,300,350,400,250,500,300,500,400,450,300,350,550,450,500,450,300,250,300,350,200,250,200,300,450,350,400,350,300,400,350,500,500,450,350,300,250,600,500,650,500,450,450,450,350,500];
export const WEEKS_LAST_YEAR = [250,450,450,350,300,250,400,450,250,300,300,400,400,400,300,350,400,250,600,550,650,350,200,150,200,250,300,350,300,250,400,550,350,450,400,450,450,450,450,500,400,450,400,650,450,400,550,550,400,400,550,450];
export const WEEK0 = new Date(Date.UTC(2025, 7, 3));
export const WEEK_NOTES: Record<number, string> = { 45: "mostly Travel ($380)", 43: "mostly Housing ($300)", 18: "mostly Shopping ($210)" };

/** Daily spend in July (index 0 = Jul 1), budget $200/day. 0 = no spend yet. */
export const JULY_DAILY_SPEND = [146,40,20,90,60,22,210,15,35,230,85,40,20,95,240,30,60,25,210,55,30,40,25,0,0,0,0,0,0,0,0];
export const JULY_DAILY_INCOME = [0,0,0,0,0,0,4750,0,0,0,0,0,0,0,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

export const WEEKLY_LIMIT = { spent: 1640, limit: 2000, daysLeft: 3, dailyAvg: 234 };

export const REPORT_MONTHS = [
  { m: "Jan", income: 4600, spending: 3200 },
  { m: "Feb", income: 4700, spending: 3000 },
  { m: "Mar", income: 4500, spending: 3000 },
  { m: "Apr", income: 4500, spending: 2700 },
  { m: "May", income: 4600, spending: 2900 },
  { m: "Jun", income: 4700, spending: 3350 },
  { m: "Jul", income: 4750, spending: 3280 },
];

export const CATEGORIES = [
  { name: "Housing", icon: "bank", amount: 1250, color: "var(--color-chart-primary)" },
  { name: "Food & drink", icon: "food", amount: 520, color: "var(--color-chart-1)" },
  { name: "Transport", icon: "car", amount: 310, color: "var(--color-chart-4)" },
  { name: "Shopping", icon: "shopping", amount: 290, color: "var(--color-chart-2)" },
  { name: "Subscriptions", icon: "subscription", amount: 140, color: "var(--color-chart-5)" },
  { name: "Health", icon: "health", amount: 95, color: "var(--color-chart-3)" },
] as const;

export const LOANS = [
  { id: "car", title: "Car loan · Toyota RAV4", icon: "car", remaining: 12480, total: 24000, apr: 5.9, monthly: 486.2, nextDue: "Jul 28, 2026", final: "Mar 2028", autopay: true, color: "var(--color-chart-primary)" },
  { id: "student", title: "Student loan", icon: "dollar", remaining: 8920, total: 18500, apr: 4.2, monthly: 210, nextDue: "Aug 3, 2026", final: "Nov 2029", autopay: false, color: "var(--color-chart-3)" },
] as const;

export const UPCOMING = [
  { m: "Jul", d: 28, title: "Car loan · Toyota RAV4", from: "From Checking •••• 1233", amount: 486.2, autopay: true },
  { m: "Aug", d: 3, title: "Student loan", from: "From Checking •••• 1233", amount: 210, autopay: false },
  { m: "Aug", d: 15, title: "Visa •••• 4402 statement", from: "From Savings •••• 2345", amount: 250, autopay: false },
  { m: "Aug", d: 28, title: "Car loan · Toyota RAV4", from: "From Checking •••• 1233", amount: 486.2, autopay: true },
];
export const LOAN_HISTORY = [
  { title: "Car loan", date: "Jun 28, 2026", amount: 486.2, state: "Completed" },
  { title: "Student loan", date: "Jun 3, 2026", amount: 210, state: "Completed" },
  { title: "Car loan", date: "May 28, 2026", amount: 486.2, state: "Completed" },
  { title: "Student loan", date: "May 3, 2026", amount: 210, state: "Late · $15 fee" },
];

export const FAQS = [
  { q: "How do I freeze a card?", a: "Open Cards, pick the card and choose Freeze card. New payments are blocked instantly; subscriptions on that card will fail until you unfreeze it." },
  { q: "When does my weekly limit reset?", a: "Every Monday at 12:00 am in your time zone. You can change the limit and the alert thresholds in Settings → Preferences." },
  { q: "Why is a transaction still pending?", a: "Merchants have up to 5 business days to settle a card payment. The amount is held from your balance until it posts." },
  { q: "How do I dispute a charge?", a: "Open the transaction and choose Report an issue, or message support. Disputes can be opened up to 120 days after a charge." },
  { q: "Can I pay my loan early without a fee?", a: "Yes. Extra payments go straight to principal and there is no early payoff fee on FinToe loans." },
];

export const TERMS = [
  { h: "Your account", p: "You must be 18 or older and a US resident to open an account. Keep your login details private; you’re responsible for activity on your account until you tell us it was compromised." },
  { h: "Payments & transfers", p: "Transfers between FinToe accounts are instant. External transfers arrive in 1–3 business days. We may hold a payment for review if it looks unusual, and we’ll tell you why." },
  { h: "Fees", p: "There’s no monthly fee. International card payments cost 1.5% of the amount. Late loan payments cost $15. See the Fee schedule tab for the full list." },
  { h: "Cards", p: "Freeze a card any time in Cards. Report a lost or stolen card right away — you won’t pay for charges made after you report it." },
  { h: "Disputes", p: "You can dispute a charge up to 120 days after it posts. We’ll credit you temporarily within 10 business days while we investigate." },
  { h: "Closing your account", p: "You can close your account at any time once your balance is zero. Statements stay available for 7 years." },
  { h: "Contact", p: "Reach us 24/7 by chat, at +1 (800) 555-0199, or by email. We reply to emails within one business day." },
];
