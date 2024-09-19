import { mytest, expect } from '../utils_/fixture_'; // Importer les fixtures personnalisées
import { updateValidUsers, getValidUsers } from '../utils_/helpers_';
const { dataUser } = require('../utils_/data_test_');


//là ou j'ai regroupé tous mes cas de test
mytest('Test Case 01 : Register User', async ({ signUpPage }) => {
    await signUpPage.navigateToSignUp();
    await signUpPage.fillSignUpForm(dataUser);
    await signUpPage.submitSignUp();
    await signUpPage.verifyAccountCreation();
    await signUpPage.verifyLoggedInAs(dataUser.fullname);

    // Mettre à jour les credentials dans le fichier validUser.json
    updateValidUsers(dataUser.email, dataUser.password);
});

mytest('@KAN-3 Test Case 02 : Login User with correct email and password', async ({ loginPage }) => {
    const validUser = getValidUsers();
    if (!validUser) {
        throw new Error('No valid user found. Make sure the user is registered first.');
    }

    await loginPage.navigateToLogin();
    await loginPage.fillLoginForm(validUser.email, validUser.password);
    await loginPage.submitLogin();
    await loginPage.verifyLoginSuccess();
    await loginPage.deleteAccount();
    await loginPage.verifyAccountDeleted();
});

mytest('@KAN-4 Test Case 03 : Login User with incorrect email and password', async ({ loginPage }) => {
    await loginPage.navigateToLogin();
    await loginPage.fillLoginForm('invalidUserexample.com', 'invalidPassword');
    await loginPage.submitLogin();
    await loginPage.verifyLoginFailure();
});


mytest.skip('Test Case 04: Logout User', async ({ logoutPage }) => {
    // Effectuer la déconnexion
    await logoutPage.logout();
    await logoutPage.verifyLoggedOut();
  });

  //Avant Optimisation de  la FIXTURE logoutPage
 /* 
mytest('Test Case 01 : Logout User', async ({ logoutPage, signUpPage, loginPage }) => {
    // Naviguer à la page de login et effectuer l'inscription
    await signUpPage.navigateToSignUp();
    await signUpPage.fillSignUpForm(dataUser);
    await signUpPage.submitSignUp();
    await signUpPage.verifyAccountCreation();
    await signUpPage.verifyLoggedInAs(dataUser.fullname);

    // Mettre à jour les credentials dans le fichier validUser.json
    updateValidUsers(dataUser.email, dataUser.password);

    // Connexion de l'utilisateur
    const validUser = getValidUsers();
    await loginPage.navigateToLogin();
    await loginPage.fillLoginForm(validUser.email, validUser.password);
    await loginPage.submitLogin();
    await loginPage.verifyLoginSuccess();

    // Déconnexion de l'utilisateur
    await logoutPage.logout();
    await logoutPage.verifyLoggedOut();
});
*/


