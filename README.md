# InfluDash

Outil interne de pilotage d'influenceurs : suivi par application, calculs automatiques
(RPM réel, coût d'acquisition, coût/client, panier moyen, marge, ROI), mode de paiement
fixe ou au RPM, thèmes de couleur, PWA installable, et **synchronisation temps réel
multi-appareils** via un compte partagé.

---

## 1. Lancer en local

```bash
npm install
npm run dev
# → http://localhost:3000
```

Sans configuration, l'app tourne en **mode local** : les données restent dans le
navigateur (localStorage). Parfait pour tester. Pour synchroniser téléphone ↔ PC,
passe à l'étape 2.

---

## 2. Activer la sync multi-appareils (Supabase — gratuit, ~5 min)

Tu veux un seul compte accessible depuis tous tes appareils, en temps réel. On utilise
Supabase (Postgres + realtime + auth, offre gratuite suffisante).

1. **Crée un projet** sur [supabase.com](https://supabase.com) (New project, choisis un
   mot de passe de base de données, attends ~2 min).
2. **Crée les tables** : Supabase → `SQL Editor` → `New query` → colle tout le contenu
   de [`supabase/schema.sql`](supabase/schema.sql) → `Run`.
3. **Crée ton compte unique** : Supabase → `Authentication` → `Users` → `Add user` →
   `Create new user` (mets ton email + un mot de passe). C'est ce compte que tu
   utiliseras partout.
   - Optionnel mais recommandé : `Authentication` → `Sign In / Providers` → désactive
     les inscriptions publiques pour que personne d'autre ne puisse créer de compte.
4. **Récupère tes clés** : Supabase → `Project Settings` → `API` → copie `Project URL`
   et la clé `anon public`.
5. **Configure l'app** : copie `.env.local.example` en `.env.local` et remplis :

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

6. Relance `npm run dev`. Un écran de connexion apparaît → connecte-toi avec le compte
   créé à l'étape 3. Toutes les modifs sont désormais synchronisées en direct entre tous
   les appareils connectés à ce compte.

> Sécurité : les données ne sont accessibles qu'aux utilisateurs **authentifiés** (RLS
> activée dans le schéma). Garde donc les inscriptions publiques désactivées.

---

## 3. Déployer (Vercel)

```bash
npx vercel
```

Pendant le déploiement, ajoute les deux variables d'environnement
(`NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans
`Vercel → Project → Settings → Environment Variables`, puis redeploie.

---

## 4. Installer comme application (PWA)

- **iPhone (Safari)** : ouvre l'URL → bouton Partager → « Sur l'écran d'accueil ».
  L'app s'ouvre en plein écran, sans barre Safari, comme une vraie app.
- **Android (Chrome)** : menu ⋮ → « Installer l'application ».
- **PC (Chrome/Edge)** : icône d'installation dans la barre d'adresse.

L'icône, le nom (InfluDash) et le mode plein écran sont définis dans
[`public/manifest.webmanifest`](public/manifest.webmanifest). Les icônes se
régénèrent avec `node scripts/gen-icons.mjs`.

---

## Calculs

| Métrique | Formule |
|---|---|
| Coût influ | forfait fixe (`prix/vidéo × nb vidéos`) **ou** `RPM donné × vues / 1000` |
| Revenu / user | `revenu / users` |
| RPM réel | `revenu / vues × 1000` |
| Panier moyen | `revenu / nb clients` |
| Users / 1000 vues | `users / vues × 1000` |
| Coût / user | `coût influ / users` |
| Coût / client | `coût influ / nb clients` |
| Marge | `revenu − coût influ` |
| ROI | `(revenu − coût influ) / coût influ × 100` |

Tous les champs sont optionnels ; une métrique dont une donnée manque s'affiche `—`.

---

## Sauvegarde

`Réglages → Sauvegarde` : export/import JSON (utile comme backup même en mode cloud).
