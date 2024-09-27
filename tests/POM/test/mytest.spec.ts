import { test, expect } from '@playwright/test';
import { SignUpPage } from '../pages/signuppage';
import { LoginPage } from '../pages/loginpage';
import { LogoutPage } from '../pages/logoutpage';
import { updateValidUsers, getValidUsers, checkAndClosePopup} from '../utils/helpers';
const { dataUser } = require('../utils/data_test')


test.beforeEach(async ({ page }) => {
    // Lancer le navigateur
    await page.goto('https://automationexercise.com/');
    // Définir la taille de la fenêtre du navigateur
    await page.setViewportSize({ width: 1415, height: 1080 });
    // Vérifier et passer le popup
     await checkAndClosePopup(page);    
    // Vérifier le lien Home de la page
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
});

/*
test('Test Case 01 : Register User', async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    await signUpPage.navigateToSignUp();
    await signUpPage.fillSignUpForm(dataUser);
    await signUpPage.submitSignUp();
    await signUpPage.verifyAccountCreation();
    await signUpPage.verifyLoggedInAs(dataUser.fullname);

    // Mettre à jour les informations de connexion de l'utilisateur dans le fichier 'validUser.json'
    updateValidUsers(dataUser.email, dataUser.password);
});


test('@KAN-2 Test Case 02 : Login User with correct email and password', async ({ page }) => {
    // Récupérer un utilisateur valide
const validUser = getValidUsers();
if (!validUser) {
    throw new Error('No valid user found. Make sure the user is registered first.');
}

const loginPage = new LoginPage(page); // Créer une instance de 'LoginPage' pour manipuler la page de connexion

await loginPage.navigateToLogin();
await loginPage.fillLoginForm(validUser.email, validUser.password);
await loginPage.submitLogin();
await loginPage.verifyLoginSuccess();
await loginPage.deleteAccount();
await loginPage.verifyAccountDeleted();
});


test('@KAN-3 Test Case 03 : Login User with incorrect email and password', async ({ page }) => {
const loginPage = new LoginPage(page);

await loginPage.navigateToLogin();
await loginPage.fillLoginForm('invalidUser@example.com', 'invalidPassword');
await loginPage.submitLogin();
await loginPage.verifyLoginFailure();
});


test('@KAN-4 Test Case 04 : Logout User', async ({ page }) => {
    const validUser = getValidUsers();
    if (!validUser) {
        throw new Error('No valid user found. Make sure the user is registered first.');
    }

    const logoutPage = new LogoutPage(page);

    await logoutPage.navigateToLogin();
    await logoutPage.login(validUser.email, validUser.password);
    await logoutPage.logout();
    await logoutPage.verifyLoggedOut();
});
*/

//Modification des 3 cas de test ci dessus pour inclure les steps "test.step()" à envoyer sur Xray comme étape de test dans les cas de test créés
test('Test Case 01 : Register User', async ({ page }) => {
    const signUpPage = new SignUpPage(page);

    
    await test.step('Navigate to the login page', async () => {
        await signUpPage.navigateToSignUp();
    });
    await test.step('Fill sign up form', async () => {
        await signUpPage.fillSignUpForm(dataUser);
    });
    await test.step('Submit login form', async () => {
        await signUpPage.submitSignUp();
    });
    await test.step('Verify account creation', async () => {
        await signUpPage.verifyAccountCreation();
    });
    await test.step('Verify logged in', async () => {
        await signUpPage.verifyLoggedInAs(dataUser.fullname);
    });
    
    
    // Mettre à jour les informations de connexion de l'utilisateur dans le fichier 'validUser.json'
    updateValidUsers(dataUser.email, dataUser.password);
});


test('Test Case 02 : Login User with incorrect email and password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await test.step('Navigate to the login page', async () => {
        await loginPage.navigateToLogin();
    });

    await test.step('Fill login form with invalid email and password', async () => {
        await loginPage.fillLoginForm('invalidUser@example.com', 'invalidPassword');
    });

    await test.step('Submit login form', async () => {
        await loginPage.submitLogin();
    });

    await test.step('Verify login failure', async () => {
        await loginPage.verifyLoginFailure();
    });
});


test('Test Case 03 : Login User with correct email and password', async ({ page }) => {
    // Récupérer un utilisateur valide
    const validUser = getValidUsers();
    if (!validUser) {
        throw new Error('No valid user found. Make sure the user is registered first.');
    }

    const loginPage = new LoginPage(page);

    await test.step('Navigate to the login page', async () => {
        await loginPage.navigateToLogin();
    });

    await test.step('Fill login form with valid email and password', async () => {
        await loginPage.fillLoginForm(validUser.password, validUser.password);
    });

    await test.step('Submit login form', async () => {
        await loginPage.submitLogin();
    });

    await test.step('Verify successful login', async () => {
        await loginPage.verifyLoginSuccess();
    });

    await test.step('Delete account after login', async () => {
        await loginPage.deleteAccount();
    });

    await test.step('Verify account is deleted', async () => {
        await loginPage.verifyAccountDeleted();
    });
});




