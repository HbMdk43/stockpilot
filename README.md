# StockPilot

StockPilot — plateforme intelligente de gestion de stock, parc informatique et inventaires.

## Aperçu

Ce dépôt contient une version fonctionnelle de démonstration, prête à être utilisée en local et à être connectée à Supabase pour les données réelles.

## Stack

- Frontend : React + Vite
- API serveur : Vercel Serverless Functions
- Base de données : Supabase PostgreSQL
- Déploiement : Vercel

## Prérequis

- Node.js 18+
- npm
- compte Supabase
- compte Vercel

## Installation locale

1. Installer les dépendances :

```bash
npm install
```

2. Copier le fichier environnement :

```bash
cp .env.example .env
```

3. Définir vos variables :

```env
VITE_SUPABASE_URL=https://qseslzjhrufikcxwzvmk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_SIhilZKB1c5o5851ZV0rHQ_IovqvKvT
SUPABASE_URL=https://qseslzjhrufikcxwzvmk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

4. Lancer le projet :

```bash
npm run dev
```

Le projet est accessible sur :

```text
http://localhost:5173
```

## API Vercel

Le dépôt inclut des fonctions serverless Vercel dans `api/` :

- `api/health.js` : vérification de santé de l’application
- `api/articles.js` : lecture et écriture des articles via Supabase et une clé service role côté serveur

### Exemple de route

```text
GET /api/health
GET /api/articles
POST /api/articles
PATCH /api/articles
```

Ces routes sont prêtes pour un déploiement sur Vercel.

## Base de données Supabase

Les scripts SQL sont disponibles dans :

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
- API Vercel prête à déployer

## Déploiement Vercel

1. Pousser le dépôt sur GitHub
2. Créer un projet Vercel
3. Importer le dépôt
4. Ajouter les variables d’environnement suivantes :

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

5. Déployer

## Sécurité

- La clé `anon` est utilisée côté frontend.
- La clé `service role` est réservée au serveur et ne doit jamais être exposée dans le navigateur.
- Le projet utilise des routes serverless pour limiter les points d’exposition.
- En production, il est recommandé de sécuriser l’accès avec RLS et des rôles stricts.

## Structure

```text
.
├── api/
├── src/
├── supabase/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env.example
├── README.md
├── .gitignore
└── LICENSE
```
