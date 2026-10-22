# Guide de déploiement et de sécurisation de StockPilot

## 1. Objectif

Ce document explique comment :
- déployer StockPilot en local,
- déployer le projet en ligne,
- connecter le frontend à Supabase,
- sécuriser la base de données,
- utiliser les bonnes variables d’environnement,
- protéger les accès côté serveur.

---

## 2. Architecture recommandée

La meilleure structure pour ce projet est :

- Frontend : React + Vite
- API : Vercel Serverless Functions ou serveur local Node
- Base de données : Supabase PostgreSQL
- Stockage fichiers : Supabase Storage
- Sécurité : Row Level Security (RLS) sur Supabase
- Déploiement : Vercel pour la version web

Schéma logique :

- GitHub → code source
- Supabase → base de données + stockages
- Vercel → hébergement du frontend et des API serverless
- Local local → tests, développements internes

---

## 3. Déploiement local

### 3.1 Installation locale

Dans le dossier du projet :

```bash
cd stockpilot
npm install
cp .env.example .env
npm run dev
```

Le projet est généralement accessible sur :

```text
http://localhost:5173
```

### 3.2 Build de production local

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Puis ouvrir :

```text
http://localhost:4173
```

### 3.3 Déploiement local sur machine serveur

Pour un serveur interne ou une machine Linux, le plus propre est :

- Node.js installé
- PM2 pour le service
- Nginx pour le reverse proxy

Exemple PM2 :

```bash
npm install -g pm2
pm2 start "npm run preview -- --host 0.0.0.0 --port 4173" --name stockpilot
pm2 save
pm2 startup
```

Exemple de config Nginx :

```nginx
server {
    listen 80;
    server_name stockpilot.local;

    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 4. Déploiement en ligne sur Vercel

C’est la solution la plus simple pour un projet React + API serverless.

### 4.1 Étapes

1. Créer un dépôt GitHub.
2. Aller sur https://vercel.com.
3. Importer le dépôt `HbMdk43/stockpilot`.
4. Sélectionner le framework : Vite.
5. Configurer le build :
   - Build command : `npm run build`
   - Output directory : `dist`
6. Ajouter les variables d’environnement.
7. Déployer.

### 4.2 Variables d’environnement Vercel

Il faut ajouter ces variables :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 4.3 Points importants

- `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont utilisées côté front.
- `SUPABASE_SERVICE_ROLE_KEY` est réservée au serveur et ne doit jamais être exposée dans le navigateur.
- Les routes `/api/*` sont conçues pour des appels serveur uniquement.

---

## 5. Déploiement sur d’autres hébergements

Tu peux aussi déployer sur :

- Render
- Railway
- Fly.io
- DigitalOcean App Platform
- GitHub Pages uniquement pour un site statique simple

Important :

- GitHub Pages ne convient pas pour un projet avec API backend.
- Vercel et Render sont les meilleurs choix pour ce type d’application.

---

## 6. Variables d’environnement

Exemple de fichier `.env.example` :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

Exemple de `.env` local :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Règle de sécurité

- `.env` ne doit jamais être publié sur GitHub.
- Il faut ajouter `.env` dans le `.gitignore`.

---

## 7. Connexion du frontend à Supabase

Fichier typique : `src/lib/supabase.js`

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Exemple d’utilisation

```js
const { data, error } = await supabase.from('articles').select('*');
console.log(data, error);
```

---

## 8. Connexion serveur à Supabase

Le serveur doit utiliser la clé `service role`, jamais la clé publique.

Exemple :

```js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
```

### Exemple route API

```js
export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin.from('articles').select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
}
```

---

## 9. Sécuriser la base de données Supabase

Il faut activer le RLS (Row Level Security) sur chaque table sensible.

### Exemple SQL

```sql
alter table articles enable row level security;
alter table stock_movements enable row level security;
alter table inventories enable row level security;
```

### Politiques basiques

```sql
create policy "articles_read_authenticated"
on articles
for select
using (auth.role() = 'authenticated');

create policy "articles_insert_authenticated"
on articles
for insert
with check (auth.role() = 'authenticated');

create policy "articles_update_authenticated"
on articles
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
```

### Version prototype permissive (à utiliser avec prudence)

```sql
create policy "articles_read_all"
on articles
for select
using (true);

create policy "articles_insert_all"
on articles
for insert
with check (true);
```

Cette solution est utile en démo, mais elle n’est pas recommandée en production.

---

## 10. Tables recommandées pour StockPilot

### 10.1 Articles

```sql
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
```

### 10.2 Mouvements de stock

```sql
create table if not exists stock_movements (
  id uuid primary key default uuid_generate_v4(),
  article_reference text,
  quantity integer not null,
  reason text,
  created_at timestamptz default now()
);
```

### 10.3 Inventaires

```sql
create table if not exists inventories (
  id bigserial primary key,
  reference text unique not null,
  title text,
  date date,
  status text default 'open',
  created_at timestamptz default now()
);
```

---

## 11. Bonnes pratiques de sécurisation

- Utiliser uniquement la clé anon dans le frontend.
- Utiliser la service role uniquement côté serveur.
- Activer RLS sur toutes les tables.
- Ne jamais stocker les secrets dans le code source.
- Ne jamais pousser le fichier `.env` sur GitHub.
- Définir les rôles : admin, manager, staff.
- Vérifier les inputs côté serveur.
- Limiter les permissions d’insert/update/delete selon le profil utilisateur.

---

## 12. Rôle d’utilisateur recommandé

Exemple de table `profiles` :

```sql
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text default 'staff',
  service text,
  created_at timestamptz default now()
);
```

Exemple de politique :

```sql
create policy "profiles_self_read"
on profiles
for select
using (id = auth.uid());
```

---

## 13. Checklist de production

Avant mise en production, vérifie :

- [ ] `.env` absent du dépôt GitHub
- [ ] variables d’environnement configurées sur Vercel / serveur
- [ ] RLS activé sur les tables
- [ ] service role uniquement côté serveur
- [ ] SSL activé pour le domaine
- [ ] uploads limités et validés
- [ ] rôles utilisateur définis
- [ ] logs activés
- [ ] sauvegardes Supabase activées
- [ ] tests en local validés

---

## 14. Exemple de workflow complet

### Local

```bash
cd stockpilot
npm install
cp .env.example .env
npm run dev
```

### Production

1. Push sur GitHub.
2. Connecter le repo à Vercel.
3. Ajouter les variables d’environnement.
4. Déployer.
5. Vérifier la base Supabase.
6. Tester les routes `/api`.
7. Active RLS et les politiques finalisées.

---

## 15. Recommandation finale

Pour un projet de gestion de stock sérieux, le meilleur écosystème est :

- GitHub pour le code
- Supabase pour la base et le stockage
- Vercel pour le frontend et les API
- RLS actif en production
- variables d’environnement sécurisées
- service role uniquement côté serveur

---

## 16. Conclusion

Tu peux donc déployer StockPilot :

- en local pour tester rapidement,
- en ligne sur Vercel pour un site public ou interne,
- sur un serveur local avec Nginx + PM2,
- avec Supabase sans exposer les secrets,
- et avec une sécurisation correcte dès le début.

C’est la meilleure manière de passer d’un prototype fonctionnel à une application exploitable en production.

---

## 17. Fichiers importants dans le projet

- `.env.example`
- `src/lib/supabase.js`
- `api/health.js`
- `api/articles.js`
- `supabase/full-schema.sql`
- `supabase/secure-rls.sql`
- `README.md`

---

## 18. Contact rapide

Pour générer ou mettre à jour ce guide, il suffit de :

- modifier les sections concernées,
- mettre à jour les variables d’environnement,
- vérifier la structure du repo,
- relancer le build sur Vercel.

Ceci est le guide de référence pour l’exploitation sécurisée de StockPilot.
