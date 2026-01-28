create table public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id bigint not null,
    content jsonb not null,
    -- A grouping key (could be a room UUID or just a string like 'general')
    channel_id text not null,
    created_at timestamptz default now() not null,
    status text default 'sent' check (status in ('sent', 'edited', 'deleted'))
);

alter publication supabase_realtime add table public.messages;

create index messages_channel_id_created_at_idx on public.messages (channel_id, created_at);