create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 60),
  last_name text not null default '' check (char_length(last_name) <= 60),
  phone text not null default '' check (char_length(phone) <= 30),
  address text not null default '' check (char_length(address) <= 160),
  plan text not null default 'Pro',
  created_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, mask text not null, kind text not null, detail text not null default '',
  balance numeric(12,2) not null default 0, sort int not null default 0
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  merchant text not null check (char_length(merchant) between 1 and 80),
  description text not null default '' check (char_length(description) <= 120),
  account_mask text not null check (account_mask in ('1233','2345','4402')),
  category text not null check (category in ('Refund','Shopping','Subscription','Salary','Bills','Transfer','Entertainment','Food & drink','Transport','Health','Housing','Other')),
  status text not null default 'Completed' check (status in ('Completed','Pending','Failed')),
  amount numeric(12,2) not null check (amount <> 0 and abs(amount) <= 50000),
  note text not null default '' check (char_length(note) <= 200),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index transactions_user_time on public.transactions(user_id, occurred_at desc);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, plan text not null, amount numeric(10,2) not null, cycle text not null default 'monthly',
  next_date date not null, state text not null, autopay boolean not null default true, sort int not null default 0
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  tone text not null, icon text not null, title text not null, body text not null,
  action text, created_at timestamptz not null default now(), read_at timestamptz
);
create index notifications_user_time on public.notifications(user_id, created_at desc);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null, icon text not null, tag text, unread int not null default 0,
  updated_at timestamptz not null default now()
);
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender text not null check (sender in ('me','agent','system')),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index messages_thread_time on public.messages(thread_id, created_at);
create index messages_user on public.messages(user_id);
create index threads_user on public.threads(user_id);
create index subscriptions_user on public.subscriptions(user_id);
create index accounts_user on public.accounts(user_id);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  label text not null, mask text not null, theme text not null, kind text not null, detail text not null,
  frozen boolean not null default false, online boolean not null default true, contactless boolean not null default true,
  atm boolean not null default true, international boolean not null default false, gambling boolean not null default false,
  sort int not null default 0
);
create index cards_user on public.cards(user_id);

create table public.preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 8192),
  updated_at timestamptz not null default now()
);

-- RLS: every row belongs to exactly one user
do $$
declare t text;
begin
  foreach t in array array['accounts','transactions','subscriptions','notifications','threads','messages','cards'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "own rows select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
alter table public.preferences enable row level security;
create policy "own prefs select" on public.preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "own prefs insert" on public.preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own prefs update" on public.preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- message must belong to caller's own thread
create policy "message thread owned" on public.messages as restrictive for insert to authenticated
  with check (exists (select 1 from public.threads t where t.id = thread_id and t.user_id = (select auth.uid())));

revoke all on all tables in schema public from anon;
