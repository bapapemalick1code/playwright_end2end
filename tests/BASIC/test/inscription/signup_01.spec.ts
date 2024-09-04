import { test, expect } from "@playwright/test";
const { dataUser } = require('../../data/data_test');
const { updateValidUser } = require('../../utils/helpers');

// Utilisation de la fonction `beforeEach` pour acceder à la home page avant le traitement des Test Cases
test.beforeEach(async ({ page }) => {
    // Lancer le navigateur
  await page.goto('https://automationexercise.com/');
  // Définir la taille de la fenêtre du navigateur
  await page.setViewportSize({ width: 1415, height: 1080 });  
  //Passer le popup
  await page.getByRole('button', { name: 'Consent' }).click();
  await page.getByRole('link', { name: 'Home' }).click();
  //Vérifier le lien Home de la page
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });

test('Test Case 01 : Register User', async ({ page }) => {

    //Cliquer sur le lien SignUp/Login
    await page.getByRole('link', { name: 'Signup / Login' }).click();
    //Vérifier le titre New User SignUp!
    await expect(page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();
    //Renseigner les valeurs
    await page.getByPlaceholder('Name').fill(dataUser.fullname); 
    await page.getByPlaceholder('Email Address').nth(1).fill(dataUser.email); 
    //Cliquer sur le boutton SignUp
    await page.getByRole('button', { name: 'Signup' }).click();
    await page.waitForTimeout(2000);
   //Vérifier les valeurs renseignés dans les champs
    await expect(page.locator('#name')).toHaveValue(dataUser.fullname);
    await expect(page.locator('#email')).toHaveValue(dataUser.email);
  //renseigner les valeurs dans les champs
    //selectionner radio button
    await page.getByLabel('Mr.').check();
    await page.locator('#name').fill(dataUser.fullname);
    await page.getByLabel('password').fill(dataUser.password);
    await page.locator('#days').selectOption(dataUser.day);
    await page.locator('#months').selectOption(dataUser.month);
    await page.locator('#years').selectOption('1995');
    await page.locator('#first_name').fill(dataUser.first_name);
    await page.locator('#last_name').fill(dataUser.last_name);
    await page.locator('#company').fill(dataUser.company);
    await page.locator('#address1').fill(dataUser.address1);
    await page.locator('#address2').fill(dataUser.address2);
    await page.locator('#country').selectOption('Canada');
    await page.locator('#state').fill(dataUser.state);
    await page.locator('#city').fill(dataUser.city);
    await page.locator('#zipcode').fill(dataUser.zip_code);
    await page.locator('#mobile_number').fill(dataUser.mobile_number);
    await page.waitForTimeout(2000);
    //cliquer sur le bouton Create Account
    await page.getByRole('button', { name: 'Create Account' }).click();
  
    //Vérifier que le texte Account Created! est visible avec la couleur verte
    await expect(page.getByText('Account Created!')).toBeVisible();
    await expect(page.getByText('Account Created!')).toHaveCSS('color', 'rgb(0, 128, 0)');
    await page.waitForTimeout(2000);
    //Cliquer sur le bouton Continue 
    await page.getByRole('link', { name: 'Continue' }).click();
    //Vérifier que le logged in as... est visible
    await expect(page.getByText(`Logged in as ${dataUser.fullname}`)).toBeVisible();
    
    ////////////////////////////////// commenter la suppresion du compte pour pouvoir faire les cas suivants  //////////////////////////////////
    /*
    //Cliquer sur delete account
    await page.getByRole('link', { name: 'Delete Account' }).click();
    await page.waitForTimeout(4000);
    //Vérifier que le texte Account Deleted! est visible avec la couleur verte
    await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toHaveCSS('color', 'rgb(0, 128, 0)');
    */

    // Mettre à jour les credentials globaux
    updateValidUser(dataUser.email, dataUser.password);  
  });



