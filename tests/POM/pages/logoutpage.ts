import { Page, Locator } from '@playwright/test';
import { BasePage } from '../pages/basepage';

// Définition de la classe 'LogoutPage' qui hérite de 'BasePage'
export class LogoutPage extends BasePage {
        // Déclaration des variables de type 'Locator' pour chaque élément de la page
    private signUpLoginLink: Locator;
    private loginHeading: Locator;
    private emailField: Locator;
    private passwordField: Locator;
    private loginButton: Locator;
    private loggedInMessage: Locator;
    private logoutLink: Locator;

        // Constructeur de la classe 'LogoutPage' qui prend un objet 'Page' comme paramètre
    constructor(page: Page) {
        super(page); // Appel du constructeur de la classe parente 'BasePage'

                // Initialisation des sélecteurs pour les éléments de la page
        this.signUpLoginLink = this.page.getByRole('link', { name: 'Signup / Login' });
        this.loginHeading = this.page.getByRole('heading', { name: 'Login to your account' });
        this.emailField = this.page.getByPlaceholder('Email Address').nth(0);
        this.passwordField = this.page.getByPlaceholder('Password');
        this.loginButton = this.page.getByRole('button', { name: 'Login' });
        this.loggedInMessage = this.page.getByText('Logged in as ');
        this.logoutLink = this.page.getByRole('link', { name: 'Logout' });
    }

    async navigateToLogin() {
        await this.click(this.signUpLoginLink);
        await this.expectVisible(this.loginHeading);
    }

    async login(email: string, password: string) {
        await this.fillText(this.emailField, email);
        await this.fillText(this.passwordField, password);
        await this.click(this.loginButton);
        await this.expectVisible(this.loggedInMessage);
    }

        // Méthode pour déconnecter l'utilisateur
    async logout() {
        await this.click(this.logoutLink);
        await this.waitForTimeout(2000);
    }

        // Méthode pour vérifier que l'utilisateur a bien été déconnecté
    async verifyLoggedOut() {
        await this.expectVisible(this.loginHeading);
    }
}
