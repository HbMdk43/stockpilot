-- Données de seed / test
insert into articles(reference, designation, category, location, stock, seuil, unit, tracking_type)
values
  ('MAG-005', 'Clavier sans fil', 'Équipements informatiques', 'Magasin informatique', 6, 0, 'unité', 'actif'),
  ('MAG-006', 'Rallonge électrique', 'Câbles & accessoires', 'Magasin informatique', 10, 5, 'unité', 'consommable'),
  ('MAG-007', 'Toner Canon 230A', 'Consommables informatiques', 'Comptabilité', 3, 2, 'unité', 'consommable')
on conflict (reference) do nothing;
