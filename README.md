# playwright_end2end
# Bon script pour generer et ouvrir automatiquement allure report après execution des tests 
"scripts": {
    "clean:allure": "rm -rf allure-results && rm -rf allure-report",
    "test": "playwright test",
    "allure:generate": "allure generate --clean",
    "allure:open": "allure open",
    "test:allure": "npm run clean:allure && npm run test && npm run allure:generate && npm run allure:open"  
  }

  # fichier yml avant modif
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
    