-- =============================================================================
-- GYMTrack — Phase 6 Database Migration: AI Fitness Coach
-- =============================================================================

-- ─── 1. ai_conversations table ───────────────────────────────────────────────
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_conversations_user_id_idx on public.ai_conversations(user_id);
create index if not exists ai_conversations_updated_at_idx on public.ai_conversations(updated_at desc);

-- Trigger for updated_at
drop trigger if exists set_ai_conversations_updated_at on public.ai_conversations;
create trigger set_ai_conversations_updated_at
  before update on public.ai_conversations
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.ai_conversations enable row level security;
create policy "ai_conversations: select own" on public.ai_conversations for select using (auth.uid() = user_id);
create policy "ai_conversations: insert own" on public.ai_conversations for insert with check (auth.uid() = user_id);
create policy "ai_conversations: update own" on public.ai_conversations for update using (auth.uid() = user_id);
create policy "ai_conversations: delete own" on public.ai_conversations for delete using (auth.uid() = user_id);

-- ─── 2. ai_messages table ────────────────────────────────────────────────────
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  structured_data jsonb, -- For storing AI workout proposals or other structured data
  created_at timestamptz not null default now()
);

create index if not exists ai_messages_conversation_id_idx on public.ai_messages(conversation_id);
create index if not exists ai_messages_created_at_idx on public.ai_messages(created_at asc);

-- RLS
alter table public.ai_messages enable row level security;

-- Policy relies on the parent conversation's user_id
create policy "ai_messages: select own" on public.ai_messages for select 
using (
  exists (
    select 1 from public.ai_conversations 
    where id = ai_messages.conversation_id 
    and user_id = auth.uid()
  )
);

create policy "ai_messages: insert own" on public.ai_messages for insert 
with check (
  exists (
    select 1 from public.ai_conversations 
    where id = conversation_id 
    and user_id = auth.uid()
  )
);

create policy "ai_messages: delete own" on public.ai_messages for delete 
using (
  exists (
    select 1 from public.ai_conversations 
    where id = ai_messages.conversation_id 
    and user_id = auth.uid()
  )
);
