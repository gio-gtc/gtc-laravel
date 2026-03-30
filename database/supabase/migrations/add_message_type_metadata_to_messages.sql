-- Run once on existing Supabase projects that already have public.messages without these columns.
alter table public.messages
    add column if not exists message_type text not null default 'text';

alter table public.messages
    add column if not exists metadata jsonb not null default '{}'::jsonb;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'messages_message_type_check'
    ) then
        alter table public.messages
            add constraint messages_message_type_check
            check (message_type in ('text', 'system', 'revision_request'));
    end if;
end $$;
