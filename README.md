# FIXTURE
​​Dans Playwright, les fixtures sont des objets ou des fonctions qui sont exécutés avant les tests pour préparer l'environnement de test. Elles peuvent être définies au niveau global ou au niveau de chaque fichier de test.

# playwright_end2end
# Bon script pour generer et ouvrir automatiquement allure report après execution des tests en local
"scripts": {
    "clean:allure": "rm -rf allure-results && rm -rf allure-report",
    "test": "playwright test",
    "allure:generate": "allure generate --clean",
    "allure:open": "allure open",
    "test:allure": "npm run clean:allure && npm run test && npm run allure:generate && npm run allure:open"  
  }
  # Bon script pour generer allure report après execution des tests depuis le CI et le "|| true" c'est pour continuer le lancement des commandes meme si les tests sont failed  
"scripts": {
    "clean:allure": "rm -rf allure-results && rm -rf allure-report",
    "test": "playwright test",
    "allure:generate": "allure generate --clean",
    "allure:open": "allure open",
    "test:allure": "npm run clean:allure && npm run test || true && npm run allure:generate" 
  }

  # fichier yml avant modif pour allure 
  name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Check out the repository
      uses: actions/checkout@v4 # Extraction du code source du dépôt
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: lts/*
    - name: Install dependencies
      run: npm install  # Installe les dépendances du projet
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
    - name: Run Playwright tests
      run: npx playwright test # Exécute les tests Playwright

# Github Pages
GitHub Pages est un service de GitHub qui vous permet d'héberger des sites web directement à partir d'un dépôt GitHub. C'est une excellente option pour héberger des sites statiques, des blogs ou de la documentation de projet.

Cependant nous allons utiliser GitHub Pages pour héberger les rapports de tests générés par Playwright, comme par exemple les rapports Allure ou les rapports HTML de Playwright.

# Générer et Déployer Allure Report dans github actions 
1. Créer un fichier .yml dans github/workflows pour Exécuter les Tests et Générer des Rapports Allure (A voir dans mon fichier playwright-allure.yml)
2. Configurer GitHub Pages dans votre Dépôt
   1. Accéder aux Paramètres du Dépôt :
      Allez dans Settings (Paramètres) de votre dépôt sur GitHub.
   2. Configurer GitHub Pages :
      Allez dans settings depuis github. Puis dans la section "Pages" sous "Code and automation", définissez la source comme la branche 'gh-pages' que vous allez créer au préalable.
3. Pousser vos Changements sur GitHub
Après avoir configuré GitHub Actions et GitHub Pages, assurez-vous que tous vos fichiers sont engagés et poussés sur GitHub.
4. Vérification du Déploiement
GitHub Pages va automatiquement déployer le contenu de la branche gh-pages. Une fois le workflow terminé avec succès, vous pourrez accéder à vos rapports via l'URL de GitHub Pages qui devrait ressembler à :
https://votre-nom-utilisateur.github.io/nom-du-repository/
Possibilité d'y acceder directement en consultant depuis github le workflow dans 'ACTIONS' sous le tag de github-pages

# NB: Voir le fichier .yml et le package.json la partie "scripts"


# Envoie de notification avec le rapport Allure généré dans un canal de communication (ex: Slack )
1. Créer un Webhook Slack 
2. Ajouter le Webhook Slack aux Secrets GitHub
3. Mettre à jour ton fichier .yml en ajoutant la partie d'envoie de notification à Slack

# Voici un exemple de la configuration d'un webhook Slack et de la manière dont tu peux l'utiliser pour envoyer des notifications :
1. Créer un Webhook Slack
        Accède à Slack API: https://api.slack.com/
        Clique sur "Your Apps" dans le menu en haut à droite.
        Clique sur "Create New App" et sélectionne "From scratch".
        Donne un nom à ton application et choisis le workspace où elle sera installée, puis clique sur "Create App".
        Dans le menu de gauche, sous "Features", clique sur "Incoming Webhooks".
        Active les "Incoming Webhooks" en utilisant le bouton "Activate Incoming Webhooks".
        Clique sur "Add New Webhook to Workspace".
        Choisis un canal où les notifications seront envoyées et clique sur "Allow".
        Copie l'URL du webhook généré. Cela ressemble à quelque chose comme : https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX.

2. Ajouter le Webhook Slack à GitHub Secrets
        Va dans le dépôt GitHub.
        Accède à Settings > Secrets and variables > Actions.
        Clique sur "New repository secret".
        Nomme le secret, par exemple, SLACK_WEBHOOK_URL, et colle l'URL du webhook Slack que tu as copié.
        Clique sur "Add secret".

3. Faire un push pour déclencher l'execution des tests depuis github actions

# Exemple d'Utilisation du Webhook Slack dans un Workflow GitHub Actions
Voici comment utiliser le webhook Slack pour envoyer une notification après l'exécution des tests dans le fichier .yml :

- name: Notify Slack
        run: |
          curl -X POST -H 'Content-type: application/json' --data '{"text":"Allure Report is available at: https://<ton-nom-utilisateur>.github.io/<nom-du-repo>/"}' ${{ secrets.SLACK_WEBHOOK_URL }}

# Explication de l'Étape Notify Slack
curl -X POST : Utilise curl pour envoyer une requête HTTP POST.
-H 'Content-type: application/json' : Définit l'en-tête de la requête pour indiquer que le corps de la requête est en JSON.
--data '{"text":"Allure Report is available at: https://<ton-nom-utilisateur>.github.io/<nom-du-repo>/"}' : Envoie un payload JSON avec le message que tu souhaites publier sur Slack.
{{ secrets.SLACK_WEBHOOK_URL }} : Utilise le secret GitHub pour obtenir l'URL du webhook Slack.

# NB 1:
En configurant cela correctement, tu devrais recevoir une notification Slack chaque fois que le workflow GitHub Actions se termine, te fournissant l'URL du rapport Allure.

# NB 2:
Pour envoyer un message Slack via webhook avec un texte personnalisé et un <lien cliquable>, tu peux formater le message JSON comme suit :

run: |
  curl -X POST -H 'Content-type: application/json' --data '{"text":"The Allure Report is available at: <https://bapapemalick1code.github.io/playwright_end2end/|Allure report>"}' {{ secrets.SLACK_WEBHOOK_URL }}

# Explication
<URL|Text> : La syntaxe <URL|Text> permet d'afficher un texte cliquable dans Slack. Le texte entre | est ce qui sera visible, et l'URL entre < et > est le lien cliquable.


# Configuration de Playwright avec Xray (Jira)
# Prérequis
  1. Avoir un compte JIRA
  2. Ajouter Xray dans Jira et recupérer les acces XRAY_ClIENT_ID et XRAY_ClIENT_SECRET
  3. Accès à Xray API : Vous aurez besoin des identifiants API (client_id, client_secret) pour Jira/Xray.
      chemin depuis Jira/Xray: APPS-> Gerer vos Apps -> Clé API -> Creer une clé Api -> Generer
      Lien des API Xray pour l'aythenfication, l'import des resultats etc... https://docs.getxray.app/display/XRAYCLOUD/Import+Execution+Results+-+REST+v2
  4. Créer des cas de test sur xray et ajouter des tags aux cas de test sur playwright pour le mapping
  5. installer axios pour les requetes HTTPS
  6. Dans votre fichier de configuration playwright.config.ts, ajoutez la référence au reporter personnalisé ['./xray-reporter.ts'] et le screenshot: 'only-on-failure' dans 'use'
  7. Créer un fichier xray-reporters.ts et faire les config (Voir le fichier)
  8. À la fin de chaque exécution de test, une nouvelle execution test sera créée depuis Xray avec l'ensemble des cas de test tagués et leur résultat avec les captures d'écran des tests échoués.


    

// Je dois voir comment importer avec des tests fails (mettre des steps dans les cas de tests depuis Xray)
// Je dois voir comment importer avec l'ensemble des infos qu'on doit avoir dans une execution test

// Je dois voir comment créer directement les cas de tests et une execution tests vers Xray
// Je dois implementer Cucumber 
// Integrer le CI
// Commenter le code pour mieux comprendre et faire une documentation dans le readme.

    