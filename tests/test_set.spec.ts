import { test, expect } from '@playwright/test';

// Déclaration des variables globales 
let Email, Password;

// Fonction pour générer un email aléatoire
function generateRandomEmail() {
    const randomString = Math.random().toString(36).substring(2, 10); // Génère une chaîne aléatoire
    return `user_${randomString}@example.com`; // Retourne l'email avec la chaîne aléatoire
}


// Utilisation de la fonction `beforeAll` pour initialiser les variables avant tous les tests
test.beforeAll(async () => {
  //récuperer l'email aleatoire et le mdp
     Email = generateRandomEmail();
     Password = "P@sser123" ;
});


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
  await page.getByPlaceholder('Name').fill('Pape Malick BA'); 
  await page.getByPlaceholder('Email Address').nth(1).fill(Email); 
  //Cliquer sur le boutton SignUp
  await page.getByRole('button', { name: 'Signup' }).click();
  await page.waitForTimeout(2000);
 //Vérifier les valeurs renseignés dans les champs
  await expect(page.locator('#name')).toHaveValue('Pape Malick BA');
  await expect(page.locator('#email')).toHaveValue(Email);
//renseigner les valeurs dans les champs
  //selectionner radio button
  await page.getByLabel('Mr.').check();
  await page.locator('#name').fill('Pape Malick BA');
  await page.getByLabel('password').fill(Password);
  await page.locator('#days').selectOption('5');
  await page.locator('#months').selectOption('5');
  await page.locator('#years').selectOption('1993');
  await page.locator('#first_name').fill('Malick');
  await page.locator('#last_name').fill('BA');
  await page.locator('#company').fill('Atos');
  await page.locator('#address1').fill('28 rue gambetta Lezennes');
  await page.locator('#address2').fill('Lille');
  await page.locator('#country').selectOption('Canada');
  await page.locator('#state').fill('Toronto');
  await page.locator('#city').fill('Toronto');
  await page.locator('#zipcode').fill('59260');
  await page.locator('#mobile_number').fill('+33782890977');
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
  await expect(page.getByText('Logged in as pape')).toBeVisible();
  ////////////////////////////////// commenter la suppresion du compte pour pouvoir faire les cas suivants  //////////////////////////////////
  /*
  //Cliquer sur delete account
  await page.getByRole('link', { name: 'Delete Account' }).click();
  await page.waitForTimeout(4000);
  //Vérifier que le texte Account Deleted! est visible avec la couleur verte
  await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toHaveCSS('color', 'rgb(0, 128, 0)');
  */

});


//Lancer le cas de test 04 pour tester la decoonexion avant de supprimer le compte
test('Test Case 04 : Logout User', async ({ page }) => {

    //Cliquer sur le lien SignUp/Login
    await page.getByRole('link', { name: 'Signup / Login' }).click();
    //Vérifier le titre Login to your account
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    //Renseigner les valeurs
    await page.getByPlaceholder('Email Address').nth(0).fill(Email); 
    await page.getByPlaceholder('Password').fill(Password); 
    //Cliquer sur le boutton Login
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);
    //Vérifier que le logged in as... est visible
    await expect(page.getByText('Logged in as Pape Malick BA')).toBeVisible(); //je pouvais aussi variabliser le nom
    //Cliquer sur le boutton Logout
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.waitForTimeout(2000);
    //Vérifier que le user est sur le login page
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

});



test('Test Case 02 :  Login User with correct email and password', async ({ page }) => {
    
    //Cliquer sur le lien SignUp/Login
    await page.getByRole('link', { name: 'Signup / Login' }).click();
    //Vérifier le titre Login to your account
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    //Renseigner les valeurs
    await page.getByPlaceholder('Email Address').nth(0).fill(Email); 
    await page.getByPlaceholder('Password').fill(Password); 
    //Cliquer sur le boutton Login
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);
    //Vérifier que le logged in as... est visible
    await expect(page.getByText('Logged in as Pape Malick BA')).toBeVisible(); //je pouvais aussi variabliser le nom
    //Cliquer sur delete account
    await page.getByRole('link', { name: 'Delete Account' }).click();
    await page.waitForTimeout(2000);
    //Vérifier que le texte Account Deleted! est visible avec la couleur verte
    await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Account Deleted!' })).toHaveCSS('color', 'rgb(0, 128, 0)');

});


test('Test Case 03 :  Login User with incorrect email and password', async ({ page }) => {
    
    //Cliquer sur le lien SignUp/Login
    await page.getByRole('link', { name: 'Signup / Login' }).click();
    //Vérifier le titre Login to your account
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    //Renseigner les valeurs "email et mdp" incorrect => on maintien les variables globales sachant que l'email n'existe plus prck le compte est supprimé dans le Test case 02
    await page.getByPlaceholder('Email Address').nth(0).fill(Email); 
    await page.getByPlaceholder('Password').fill(Password); 
    //Cliquer sur le boutton Login
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(2000);
    //Vérifier le message d'erreur avec la couleur rouge du texte
    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
    await expect(page.getByText('Your email or password is incorrect!')).toHaveCSS('color', 'rgb(255, 0, 0)');
});





