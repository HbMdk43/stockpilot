# StockPilot

StockPilot — Plateforme intelligente de gestion de stock, parc informatique et inventaires.

## Aperçu

Ce dépôt contient une version fonctionnelle de démonstration du projet StockPilot, connectée à Supabase et prête à être utilisée en local ou déployée.

## Stack

- Frontend : React + Vite
- Base de données : Supabase PostgreSQL
- Déploiement : Vercel / Netlify / GitHub Pages (statique)

## Démarrage rapide

1. Installer les dépendances :

```bash
npm install
```

2. Copier les variables d’environnement :

```bash
cp .env.example .env
```

3. Lancer le projet :

```bash
npm run dev
```

Le projet s’ouvre par défaut sur :

```text
http://localhost:5173
```

## Variables d’environnement

```env
VITE_SUPABASE_URL=https://qseslzjhrufikcxwzvmk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SIhilZKB1c5o5851ZV0rHQ_IovqvKvT
```

## Supabase

Le projet utilise les tables suivantes :

- `articles`
- `stock_movements`
- `inventories`

Des scripts SQL sont présents dans `supabase/schema.sql` et `supabase/seed.sql`.

## Déploiement

Pour déployer en production :

- pousser le repo sur GitHub
- connecter le repo à Vercel
- ajouter les variables d’environnement Vercel
- publier le site

## Remarques

- En local, si Supabase n’est pas prêt ou n’a pas les tables, l’application utilise des données de démonstration.
- Pour une vraie production, il est recommandé d’activer le RLS et de définir des politiques strictes.

## Structure

```text
.
├── src/
├── supabase/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── README.md
└── .gitignore
```
