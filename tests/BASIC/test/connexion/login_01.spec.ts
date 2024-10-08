import { test, expect } from '@playwright/test';
//import { clickConsentButtonIfVisible } from '../../utils/helpers_01';
const { validUser,clickConsentButtonIfVisible } = require('../../utils/helpers_01');
const { dataUser } = require('../../data/data_test_01');


// Utilisation de la fonction `beforeEach` pour acceder à la home page avant le traitement des Test Cases
test.beforeEach(async ({ page }) => {
    // Lancer le navigateur
  await page.goto('https://automationexercise.com/');
  // Définir la taille de la fenêtre du navigateur
  await page.setViewportSize({ width: 1415, height: 1080 });  
  //Passer le popup
  // Vérifier si le popup est présent et cliquer sur le bouton consent
  await clickConsentButtonIfVisible(page);  
  //Vérifier le lien Home de la page
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });

test('Test Case 02 :  Login User with correct email and password', async ({ page }) => {
    
    //Cliquer sur le lien SignUp/Login
    await page.getByRole('link', { name: 'Signup / Login' }).click();
    //Vérifier le titre Login to your account
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    //Renseigner les valeurs
    await page.getByPlaceholder('Email Address').nth(0).fill(validUser.email); 
    await page.getByPlaceholder('Password').fill(validUser.password); 
    //Cliquer sur le boutton Login
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);
    //Vérifier que le logged in as $name... est visible
    await expect(page.getByText('Logged in as')).toBeVisible(); 
    //Cliquer sur delete account
    await page.getByRole('link', { name: 'Delete Account' }).click();
    await page.waitForTimeout(2000);
    //Vérifier que le texte Account Deleted! est visible avec la couleur verte
    await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toHaveCSS('color', 'rgb(0, 128, 0)');

});

test.only('Test Case 03 :  Login User with incorrect email and password', async ({ page }) => {
    
    //Cliquer sur le lien SignUp/Login
    await page.getByRole('link', { name: 'Signup / Login' }).click();
    //Vérifier le titre Login to your account
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    //Renseigner les valeurs "email et mdp" incorrect => on maintien les variables globales sachant que l'email n'existe plus prck le compte est supprimé dans le Test case 02
    await page.getByPlaceholder('Email Address').nth(0).fill(dataUser.email); 
    await page.getByPlaceholder('Password').fill(dataUser.password); 
    //Cliquer sur le boutton Login
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);
    //Vérifier le message d'erreur avec la couleur rouge du texte
    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
    await expect(page.getByText('Your email or password is incorrect!')).toHaveCSS('color', 'rgb(255, 0, 0)');
});