// fixtures.ts
import { test as base, expect, Page } from '@playwright/test';
import { LoginPage } from '../pages_/loginpage_';
import { SignUpPage } from '../pages_/signuppage_';
import { LogoutPage } from '../pages_/logoutpage_';
const { dataUser } = require('../utils_/data_test_'); //pour l'optimisation de la fixture logoutPage


// Déclaration du type pour les fixtures personnalisées
type MyFixtures = {
  loginPage: LoginPage;
  signUpPage: SignUpPage;
  logoutPage: LogoutPage;
};

// Définir des fixtures personnalisées en étendant les fixtures de base de Playwright
const mytest = base.extend<MyFixtures>({
  // Configuration de la fixture `page` pour chaque test
  page: async ({ page }, use) => {
    await page.goto('https://automationexercise.com/');
    await page.setViewportSize({ width: 1415, height: 1080 });
    // Gérer les popups ou les éléments initiaux de la page
    await page.locator('role=button[name="Consent"]').click();
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await use(page); // Permet à la page d'être utilisée dans les tests
  },

  // Configuration pour initialiser LoginPage
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage); // Permet à loginPage d'être utilisée dans les tests
  },

  // Configuration pour initialiser SignUpPage
  signUpPage: async ({ page }, use) => {
    const signUpPage = new SignUpPage(page);
    await use(signUpPage); // Permet à signUpPage d'être utilisée dans les tests
  },

  // Configuration pour initialiser LogoutPage
  //logoutPage: async ({ page }, use) => {
  //  const logoutPage = new LogoutPage(page);
  //  await use(logoutPage); // Permet à logoutPage d'être utilisée dans les tests
  //}

  // Optimiser la Configuration pour initialiser LogoutPage avec inscription et connexion
  logoutPage: async ({ page, signUpPage, loginPage}, use) => {
    const logoutPage = new LogoutPage(page);
    // Inscrire un nouvel utilisateur
    await signUpPage.navigateToSignUp();
    await signUpPage.fillSignUpForm(dataUser);
    await signUpPage.submitSignUp();
    await signUpPage.verifyAccountCreation();  

   await use(logoutPage); // Permet à logoutPage d'être utilisée dans les tests après l'inscription et la connexion

  }



});

export { mytest, expect };


//NOTES
/*
Fixtures dans Playwright sont des blocs de code réutilisables qui permettent d'initialiser 
des objets ou de configurer un environnement spécifique avant chaque test. Elles sont utiles
pour préparer l'état de l'application, configurer des données de test, ou partager des objets 
ou des configurations communes entre différents tests. Les fixtures améliorent la modularité, 
la réutilisabilité et la maintenance du code de test.
*/