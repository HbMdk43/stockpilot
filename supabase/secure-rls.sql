-- secure-rls.sql
alter table articles enable row level security;
alter table stock_movements enable row level security;
alter table inventories enable row level security;

create policy "articles_read_authenticated" on articles for select using (auth.role() = 'authenticated');
create policy "articles_insert_authenticated" on articles for insert with check (auth.role() = 'authenticated');
create policy "articles_update_authenticated" on articles for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "movements_read_authenticated" on stock_movements for select using (auth.role() = 'authenticated');
create policy "movements_insert_authenticated" on stock_movements for insert with check (auth.role() = 'authenticated');

create policy "inventories_read_authenticated" on inventories for select using (auth.role() = 'authenticated');
create policy "inventories_insert_authenticated" on inventories for insert with check (auth.role() = 'authenticated');
create policy "inventories_update_authenticated" on inventories for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
