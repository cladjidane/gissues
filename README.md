# 🐛 Gissues - Rapports de Bugs Visuels Simplifiés

Extension Chrome pour signaler des bugs instantanément. Prenez des captures d'écran et créez des issues GitHub avec un seul raccourci clavier.

## ⚡ Démarrage Rapide

### 📥 Installation

**Option 1 : Téléchargement ZIP (Simple)**
1. **Télécharger** : Cliquez "Code" → "Download ZIP" sur GitHub
2. **Dézipper** : Extraire le fichier dans un dossier (ex: `Téléchargements/gissues/`)
3. **Chrome** : Aller sur `chrome://extensions/`
4. **Mode développeur** : Activer le mode développeur (toggle en haut à droite)
5. **Charger** : Cliquer "Charger l'extension non empaquetée" → sélectionner le dossier `gissues/`

**Option 2 : Clone Git (Recommandé pour les développeurs)**
```bash
git clone https://github.com/cladjidane/gissues.git
cd gissues
```
Puis suivre les étapes 3-5 ci-dessus.

> 💡 **Avantage du clone** : Mises à jour faciles avec `git pull` au lieu de retélécharger le ZIP à chaque fois.

> ⚠️ **Important** : Chrome ne peut pas charger directement un fichier ZIP, il faut l'extraire !

### ⚙️ Configuration
1. **Configuration** : Cliquer sur l'icône de l'extension → saisir token GitHub + dépôt
2. **Utilisation** : Appuyer `Ctrl+Shift+B` sur n'importe quel site → remplir le formulaire → créer l'issue

## 🔧 Configuration

### Token GitHub
1. Aller sur [Paramètres Token GitHub](https://github.com/settings/tokens/new?scopes=repo&description=Gissues%20Extension)
2. Créer un token avec le scope `repo`
3. Coller dans le popup de l'extension

### Format du Dépôt
`propriétaire/nom-du-depot` (ex: `monentreprise/webapp`)

## ✨ Fonctionnalités

- **Captures d'écran en un clic** avec `Ctrl+Shift+B`
- **Métadonnées automatiques** : URL, navigateur, résolution, erreurs console
- **Intégration GitHub** : Création directe d'issues
- **Mapping de domaines** : Sites différents → dépôts différents
- **Interface propre** : Modal Shadow DOM, aucune interférence

## 📁 Structure du Projet

```
gissues/
├── manifest.json           # Configuration extension
├── src/
│   ├── background/service-worker.js
│   ├── content/content.js
│   ├── popup/popup.html + popup.js
│   └── options/options.html + options.js
└── auto-generate-icons.html   # Générateur d'icônes
```

## 🎨 Configuration des Icônes

1. Ouvrir `auto-generate-icons.html`
2. Les icônes se téléchargent automatiquement
3. Déplacer dans le dossier `/icons/`
4. Copier le code généré dans `manifest.json`

## 🔄 Mises à Jour

### Méthode ZIP
1. Retélécharger le ZIP depuis GitHub
2. Remplacer l'ancien dossier
3. Recharger l'extension dans Chrome

### Méthode Clone Git (Recommandée)
```bash
cd gissues
git pull origin main
```
Puis recharger l'extension dans Chrome.

## 🐛 Dépannage

- **Pas de capture** : Fonctionne uniquement sur les sites normaux (pas chrome://)
- **Erreur GitHub** : Vérifier le scope du token et les permissions du dépôt
- **Modal manquante** : Actualiser la page et réessayer

## 🚀 Prêt pour Chrome Web Store

- Icônes professionnelles incluses
- Politique de confidentialité fournie
- Conforme Manifest V3
- Aucune dépendance externe

## 🚀 Gestion des Versions

Pour créer une nouvelle version :

```bash
# Version patch (1.0.0 → 1.0.1)
./release.sh patch

# Version mineure (1.0.0 → 1.1.0)  
./release.sh minor

# Version majeure (1.0.0 → 2.0.0)
./release.sh major
```

Le script automatise :
- Mise à jour de la version dans `manifest.json`
- Création du tag git avec notes de version
- Push vers GitHub avec tags
- Ouverture de la page GitHub Releases

## 🤝 Contribution

Les issues et pull requests sont les bienvenues ! Vérifiez d'abord les issues existantes.

## 📄 Licence

Licence MIT

---

**Construit avec** : Vanilla JS, Manifest V3, GitHub API, Tailwind CSS