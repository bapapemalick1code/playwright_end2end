import { Page } from '@playwright/test'; // Importation du type Locator

//Déclarer les acces d'un user valide
let validUser = {
    email: 'validuser@example.com',
    password: 'validpassword123'
  };

  // Fonction asynchrone pour générer un email aléatoire
async function generateRandomEmail() {
    const randomString = Math.random().toString(36).substring(2, 10); // Génère une chaîne aléatoire
    return `user_${randomString}@example.com`; // Retourne l'email avec la chaîne aléatoire
}

// Vérifie si le popup est présent et clique sur le bouton si oui
 async function clickConsentButtonIfVisible(page: Page) {
  const btnConsent = page.locator('role=button[name="Consent"]');
  if (await btnConsent.isVisible()) {
    await btnConsent.click();
  }
}


  
// Exportation des données de test pour les rendre disponibles dans d'autres fichiers
module.exports = { 
    generateRandomEmail, 
    clickConsentButtonIfVisible,
    validUser,
    //Maj du user ayant des acces valides
    updateValidUser(newEmail: string, newPassword: string) {
      validUser.email = newEmail;
      validUser.password = newPassword;
    }};