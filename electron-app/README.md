# UGP-GAVI Dashboard — Application Desktop (Windows / Mac)

Cette application "enveloppe" le tableau de bord en ligne (`https://tbordugpgavi.netlify.app`)
dans une vraie fenêtre native Windows/Mac (via Electron). Une connexion internet reste
nécessaire — les données continuent de vivre sur Netlify (Functions + Blobs), rien ne change
côté serveur.

## Compiler automatiquement avec GitHub Actions (recommandé)

C'est la méthode à utiliser car un `.dmg` Mac ne peut être produit que sur une vraie machine
macOS — GitHub fournit ça gratuitement.

1. Crée un nouveau repo sur GitHub (privé ou public), par exemple `ugp-gavi-desktop`.
2. Depuis ce dossier, pousse le code :
   ```bash
   git init
   git add .
   git commit -m "Initial Electron app"
   git branch -M main
   git remote add origin https://github.com/<ton-compte>/ugp-gavi-desktop.git
   git push -u origin main
   ```
3. Va dans l'onglet **Actions** de ton repo GitHub. Le workflow "Build UGP-GAVI Desktop App"
   se lance automatiquement à chaque `push` sur `main`.
4. Une fois le workflow terminé (icône verte ✅, ~5 min), clique dessus puis descends à la
   section **Artifacts** en bas de page :
   - `ugp-gavi-dashboard-windows-latest` → contient le `.exe` (installeur Windows)
   - `ugp-gavi-dashboard-macos-latest` → contient le `.dmg` (installeur Mac)
5. Télécharge, dézippe, et distribue ces fichiers à tes utilisateurs.

Pour relancer une compilation manuellement sans nouveau commit : onglet **Actions** →
sélectionne le workflow → **Run workflow**.

### Avertissements attendus au premier lancement

Comme l'app n'est pas signée avec un certificat payant (Apple ~99 $/an, Microsoft ~200-400 $/an) :
- **Windows** : SmartScreen affichera "Éditeur inconnu" → l'utilisateur doit cliquer sur
  "Informations complémentaires" puis "Exécuter quand même".
- **Mac** : Gatekeeper bloquera l'app au premier lancement → l'utilisateur doit faire
  **clic droit → Ouvrir** (au lieu d'un double-clic), une seule fois.

C'est normal et sans danger ; c'est uniquement lié à l'absence de certificat de signature payant.
Si tu veux éliminer ces messages, il faudra investir dans ces certificats — dis-le-moi si tu veux
qu'on configure ça plus tard.

## Compiler manuellement (si tu as un PC Windows ou un Mac sous la main)

```bash
npm install
npm run dist:win   # sur Windows, génère dist/*.exe
npm run dist:mac   # sur Mac, génère dist/*.dmg
```

## Modifier l'URL cible

Si l'adresse du site Netlify change, modifie la constante `APP_URL` en haut de `main.js`.

## Structure du projet

```
main.js                    → logique de la fenêtre Electron (charge le site en ligne)
package.json                → dépendances + config electron-builder (icônes, cibles win/mac)
build/icon.png/.ico/.icns   → icônes de l'application (générées depuis le logo UGP)
.github/workflows/build.yml → compilation automatique Windows + Mac via GitHub Actions
```
