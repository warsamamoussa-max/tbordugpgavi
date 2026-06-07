# Tableau de Bord UGP-GAVI 2026 — Djibouti

Application React/Vite de suivi du portefeuille GAVI — Programme Élargi de Vaccination.

## Stack
- **Frontend** : React 18 + Vite 5, Recharts, SheetJS/xlsx
- **Backend**  : Netlify Functions (ESM) + Netlify Blobs (stockage PTA)
- **Auth**     : SHA-256 côté client, hash stocké en localStorage

## Développement local
```bash
npm install
npm run dev
```

## Déploiement (GitHub → Netlify)
1. Push sur GitHub
2. Connecter le repo à Netlify (New site → Import from Git)
3. Netlify détecte automatiquement `netlify.toml` :
   - Build command : `npm run build`
   - Publish dir   : `dist`
   - Functions dir : `netlify/functions`
4. Activer **Netlify Blobs** dans Site settings → Storage

## Mots de passe par défaut
| Rôle     | Mot de passe   |
|----------|----------------|
| Visiteur | `GAVI2026DJI`  |
| Admin    | `ADMIN2026DJI` |

Les hashes peuvent être modifiés par l'admin depuis l'interface (stockés en localStorage).

## Feuilles Excel attendues
| Feuille               | Obligatoire | Contenu |
|-----------------------|-------------|---------|
| Suivi budgétaire      | ✓           | Activités PTA, budgets, statuts |
| Hypothèse Act 2026    | —           | Hypothèses budgétaires détaillées |
| Sommaire              | —           | Récapitulatif par subvention |
