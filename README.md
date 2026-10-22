# StockPilot

StockPilot — plateforme intelligente de gestion de stock, parc informatique et inventaires.

## Aperçu

Ce dépôt contient une version fonctionnelle de démonstration, prête à être utilisée en local et à être connectée à Supabase pour les données réelles.

## Stack

- Frontend : React + Vite
- Base de données : Supabase PostgreSQL
- Déploiement : Vercel / Netlify / GitHub Pages

## Prérequis

- Node.js 18+
- npm
- un projet Supabase actif

## Démarrage

1. Installer les dépendances :

```bash
npm install
```

2. Copier le fichier d’environnement :

```bash
cp .env.example .env
```

3. Lancer le projet :

```bash
npm run dev
```

Le projet est accessible sur :

```text
http://localhost:5173
```

## Variables d’environnement

```env
VITE_SUPABASE_URL=https://qseslzjhrufikcxwzvmk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SIhilZKB1c5o5851ZV0rHQ_IovqvKvT
```

## Base de données Supabase

Le schéma complet est disponible dans :

- `supabase/full-schema.sql`
- `supabase/secure-rls.sql`

### Exécution rapide dans Supabase SQL Editor

1. Ouvrir le projet Supabase
2. Aller dans SQL Editor
3. Copier le contenu de `supabase/full-schema.sql`
4. Exécuter
5. Pour production, activer ensuite les politiques de `supabase/secure-rls.sql`

## Fonctionnalités du projet

- tableau de bord de stock
- articles et seuils
- inventaires
- alertes
- rapports synthèse
- connexion Supabase prête
- données de démonstration si la base n’est pas encore connectée

## Déploiement

### Déploiement local

```bash
npm install
cp .env.example .env
npm run dev
```

### Déploiement en ligne

- pousser le repo sur GitHub
- connecter le repo sur Vercel
- ajouter les variables d’environnement
- déployer

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
├── .gitignore
└── LICENSE
```

## Notes importantes

- La clé `anon` Supabase est destinée au frontend.
- La clé `service role` ne doit jamais être exposée dans le navigateur.
- En production, il est recommandé de sécuriser les accès avec RLS et rôles.
