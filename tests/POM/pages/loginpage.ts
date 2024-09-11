import { Page, Locator } from '@playwright/test';
import { BasePage } from './basepage';

// Définition de la classe 'LoginPage' qui hérite de 'BasePage'
export class LoginPage extends BasePage {
        // Déclaration des variables privées de type 'Locator' pour chaque élément de la page de connexion
    private loginLink: Locator;
    private loginTitle: Locator;
    private emailField: Locator;
    private passwordField: Locator;
    private loginButton: Locator;
    private loggedInMessage: Locator;
    private deleteAccountLink: Locator;
    private accountDeletedMessage: Locator;
    private errorMessage: Locator;

        // Constructeur de la classe 'LoginPage' qui prend un objet 'Page' en paramètre
    constructor(page: Page) {
        super(page); // Appel du constructeur de la classe parente 'BasePage'

        // Initialisation des variables 'Locator' avec les éléments de la page
        this.loginLink = this.page.getByRole('link', { name: 'Signup / Login' });
        this.loginTitle = this.page.getByRole('heading', { name: 'Login to your account' });
        this.emailField = this.page.getByPlaceholder('Email Address').nth(0);
        this.passwordField = this.page.getByPlaceholder('Password');
        this.loginButton = this.page.getByRole('button', { name: 'Login' });
        this.loggedInMessage = this.page.getByText('Logged in as');
        this.deleteAccountLink = this.page.getByRole('link', { name: 'Delete Account' });
        this.accountDeletedMessage = this.page.getByRole('heading', { name: 'Account Deleted!' });
        this.errorMessage = this.page.getByText('Your email or password is incorrect!');
    }

        // Méthode pour naviguer vers la page de connexion
    async navigateToLogin() {
        await this.click(this.loginLink);
        await this.expectVisible(this.page.locator('role=heading[name="Login to your account"]'));
    }

    // Méthode pour remplir le formulaire de connexion avec l'email et le mot de passe
    async fillLoginForm(email: string, password: string) {
        await this.fillText(this.emailField, email);
        await this.fillText(this.passwordField, password);
    }

        // Méthode pour soumettre le formulaire de connexion
    async submitLogin() {
        await this.click(this.loginButton);
        await this.waitForTimeout(2000);
    }

        // Méthode pour supprimer le compte utilisateur
    async deleteAccount() {
        await this.click(this.deleteAccountLink);
        await this.waitForTimeout(2000);
    }

        // Méthode pour vérifier que le compte a été supprimé
    async verifyAccountDeleted() {
        await this.expectVisible(this.accountDeletedMessage);
        await this.expectCss(this.accountDeletedMessage, 'color', 'rgb(0, 128, 0)');
    }

        // Méthode pour vérifier que la connexion a réussi
    async verifyLoginSuccess() {
        await this.expectVisible(this.loggedInMessage);
    }

        // Méthode pour vérifier l'accès à la page de connexion
    async verifyAccessLoginPage() {
        await this.expectVisible(this.loginTitle);
    }

        // Méthode pour vérifier que la connexion a échoué
    async verifyLoginFailure() {
        await this.expectVisible(this.errorMessage);
        await this.expectCss(this.errorMessage, 'colo', 'rgb(255, 0, 0)');
    }
}


