-- Create merchants table (public read/write)
create table public.merchants (
  merchant_id text primary key,
  merchant_name text not null
);

-- Create transactions table (per-user)
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  amount numeric not null, -- positive=credit, negative=debit
  category text,
  note text,
  merchant_id text references merchants(merchant_id),
  mode text,
  created_at timestamp default now()
);

-- Enable RLS
alter table merchants enable row level security;
alter table transactions enable row level security;

-- ------------------------
-- merchants policies
-- ------------------------
create policy "Anyone logged in can read merchants"
on merchants
for select
using (auth.role() = 'authenticated');

create policy "Anyone logged in can insert merchants"
on merchants
for insert
with check (auth.role() = 'authenticated');

create policy "Anyone logged in can update merchants"
on merchants
for update
using (auth.role() = 'authenticated');

create policy "Anyone logged in can delete merchants"
on merchants
for delete
using (auth.role() = 'authenticated');

-- ------------------------
-- transactions policies
-- ------------------------
create policy "Users can read own transactions"
on transactions
for select
using (auth.uid() = user_id);

create policy "Users can insert own transactions"
on transactions
for insert
with check (auth.uid() = user_id);

create policy "Users can update own transactions"
on transactions
for update
using (auth.uid() = user_id);

create policy "Users can delete own transactions"
on transactions
for delete
using (auth.uid() = user_id);
