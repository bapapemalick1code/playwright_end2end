# playwright_end2end
# Bon script pour generer et ouvrir automatiquement allure report après execution des tests 
"scripts": {
    "clean:allure": "rm -rf allure-results && rm -rf allure-report",
    "test": "playwright test",
    "allure:generate": "allure generate --clean",
    "allure:open": "allure open",
    "test:allure": "npm run clean:allure && npm run test && npm run allure:generate && npm run allure:open"  
  }