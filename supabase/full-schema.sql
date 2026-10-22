-- full-schema.sql
create extension if not exists "uuid-ossp";

create table if not exists categories (
  id bigserial primary key,
  name text unique not null,
  description text
);

create table if not exists locations (
  id bigserial primary key,
  name text unique not null,
  type text default 'service'
);

create table if not exists articles (
  id bigserial primary key,
  reference text unique not null,
  designation text not null,
  category text,
  location text,
  stock integer default 0,
  seuil integer default 0,
  unit text default 'unité',
  tracking_type text default 'consommable',
  created_at timestamptz default now()
);

create table if not exists stock_movements (
  id uuid primary key default uuid_generate_v4(),
  article_reference text,
  quantity integer not null,
  reason text,
  created_at timestamptz default now()
);

create table if not exists inventories (
  id bigserial primary key,
  reference text unique not null,
  title text,
  date date,
  status text default 'open',
  created_at timestamptz default now()
);

insert into categories(name, description)
values
  ('Consommables informatiques', 'Toners, rubans et consommables'),
  ('Équipements informatiques', 'Ordinateurs, serveurs et périphériques'),
  ('Câbles & accessoires', 'Câbles, rallonges et accessoires')
on conflict (name) do nothing;

insert into locations(name, type)
values
  ('Magasin informatique', 'magasin'),
  ('Comptabilité', 'service'),
  ('Direction générale', 'service'),
  ('Salle serveur', 'salle')
on conflict (name) do nothing;

insert into articles(reference, designation, category, location, stock, seuil, unit, tracking_type)
values
  ('MAG-001', 'Toner HP 19A', 'Consommables informatiques', 'Magasin informatique', 8, 4, 'unité', 'consommable'),
  ('MAG-002', 'Carton de câble RJ45', 'Câbles & accessoires', 'Magasin informatique', 12, 6, 'carton', 'consommable'),
  ('AST-010', 'Ordinateur portable Dell', 'Équipements informatiques', 'Direction générale', 1, 0, 'unité', 'actif'),
  ('MAG-003', 'Onduleur APC', 'Équipements informatiques', 'Salle serveur', 2, 0, 'unité', 'actif'),
  ('MAG-004', 'Adaptateur USB-C', 'Câbles & accessoires', 'Comptabilité', 14, 7, 'unité', 'consommable')
on conflict (reference) do nothing;

alter table articles enable row level security;
alter table stock_movements enable row level security;
alter table inventories enable row level security;

create policy "articles_read_all" on articles for select using (true);
create policy "articles_insert_all" on articles for insert with check (true);
create policy "articles_update_all" on articles for update using (true) with check (true);
create policy "articles_delete_all" on articles for delete using (true);

create policy "movements_read_all" on stock_movements for select using (true);
create policy "movements_insert_all" on stock_movements for insert with check (true);

create policy "inventories_read_all" on inventories for select using (true);
create policy "inventories_insert_all" on inventories for insert with check (true);
create policy "inventories_update_all" on inventories for update using (true) with check (true);
