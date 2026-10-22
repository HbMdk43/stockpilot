-- Schema de base pour StockPilot
create extension if not exists "uuid-ossp";

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
  id uuid default uuid_generate_v4() primary key,
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

insert into articles(reference, designation, category, location, stock, seuil, unit, tracking_type)
values
  ('MAG-001', 'Toner HP 19A', 'Consommables informatiques', 'Magasin informatique', 8, 4, 'unité', 'consommable'),
  ('MAG-002', 'Carton de câble RJ45', 'Câbles & accessoires', 'Magasin informatique', 12, 6, 'carton', 'consommable'),
  ('AST-010', 'Ordinateur portable Dell', 'Équipements informatiques', 'Direction générale', 1, 0, 'unité', 'actif'),
  ('MAG-003', 'Onduleur APC', 'Équipements informatiques', 'Salle serveur', 2, 0, 'unité', 'actif'),
  ('MAG-004', 'Adaptateur USB-C', 'Câbles & accessoires', 'Comptabilité', 14, 7, 'unité', 'consommable')
on conflict (reference) do nothing;
