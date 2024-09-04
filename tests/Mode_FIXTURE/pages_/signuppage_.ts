import { Page, Locator } from '@playwright/test';
import { BasePage } from './basepage_';

// Définition de la classe 'SignUpPage' qui hérite de 'BasePage'
export class SignUpPage extends BasePage {
        // Déclaration des variables de type 'Locator' pour chaque élément de la page d'inscription
    private signUpLink: Locator;
    private newUserHeading: Locator;
    private nameField: Locator;
    private emailField: Locator;
    private signUpButton: Locator;
    private nameValue: Locator;
    private emailValue: Locator;
    private titleMr: Locator;
    private passwordField: Locator;
    private daysSelect: Locator;
    private monthsSelect: Locator;
    private yearsSelect: Locator;
    private firstNameField: Locator;
    private lastNameField: Locator;
    private companyField: Locator;
    private address1Field: Locator;
    private address2Field: Locator;
    private countrySelect: Locator;
    private stateField: Locator;
    private cityField: Locator;
    private zipcodeField: Locator;
    private mobileNumberField: Locator;
    private createAccountButton: Locator;
    private accountCreatedMessage: Locator;
    private continueButton: Locator;
    private loggedInMessage: Locator;

        // Constructeur de la classe 'SignUpPage' qui prend un objet 'Page' comme paramètre
    constructor(page: Page) {
        super(page); // Appel du constructeur de la classe parente 'BasePage'

                // Initialisation des sélecteurs pour les éléments de la page
        this.signUpLink = this.page.getByRole('link', { name: 'Signup / Login' });
        this.newUserHeading = this.page.getByRole('heading', { name: 'New User Signup!' })
        this.nameField = this.page.getByPlaceholder('Name')
        this.emailField = this.page.getByPlaceholder('Email Address').nth(1);
        this.signUpButton = this.page.getByRole('button', { name: 'Signup' });
        //this.nameValue = this.page.locator('#name');
        this.nameValue = this.page.getByTestId('name'); //utiliser l'attribut 'data-qa'
        this.emailValue = this.page.locator('#email');
        this.titleMr = this.page.getByLabel('Mr.');
        this.passwordField = this.page.getByLabel('password');
        this.daysSelect = this.page.locator('#days');
        this.monthsSelect = this.page.locator('#months');
        this.yearsSelect = this.page.locator('#years');
        this.firstNameField = this.page.locator('#first_name');
        this.lastNameField = this.page.locator('#last_name');
        this.companyField = this.page.locator('#company');
        this.address1Field = this.page.locator('#address1');
        this.address2Field = this.page.locator('#address2');
        this.countrySelect = this.page.locator('#country');
        this.stateField = this.page.locator('#state');
        this.cityField = this.page.locator('#city');
        this.zipcodeField = this.page.locator('#zipcode');
        this.mobileNumberField = this.page.locator('#mobile_number');
        this.createAccountButton = this.page.getByRole('button', { name: 'Create Account' });
        this.accountCreatedMessage = this.page.getByText('Account Created!');
        this.continueButton = this.page.getByRole('link', { name: 'Continue' });
        this.loggedInMessage = this.page.getByText('Logged in as');
    }

    async navigateToSignUp() {
        await this.click(this.signUpLink);
        await this.expectVisible(this.newUserHeading);
    }

        // Méthode pour remplir le formulaire d'inscription avec les données de l'utilisateur
    async fillSignUpForm(dataUser: any) {
        await this.fillText(this.nameField, dataUser.fullname);
        await this.fillText(this.emailField, dataUser.email);
        await this.click(this.signUpButton);
        await this.waitForTimeout(2000);

            // Vérifie que les champs de nom et d'e-mail contiennent les bonnes valeurs
        await this.expectValue(this.nameValue, dataUser.fullname);
        await this.expectValue(this.emailValue, dataUser.email);

        await this.titleMr.check();
        await this.fillText(this.nameValue, dataUser.fullname);
        await this.fillText(this.passwordField, dataUser.password);
        await this.selectOption(this.daysSelect, dataUser.day);
        await this.selectOption(this.monthsSelect, dataUser.month);
        await this.selectOption(this.yearsSelect, '1995');
        await this.fillText(this.firstNameField, dataUser.first_name);
        await this.fillText(this.lastNameField, dataUser.last_name);
        await this.fillText(this.companyField, dataUser.company);
        await this.fillText(this.address1Field, dataUser.address1);
        await this.fillText(this.address2Field, dataUser.address2);
        await this.selectOption(this.countrySelect, 'Canada');
        await this.fillText(this.stateField, dataUser.state);
        await this.fillText(this.cityField, dataUser.city);
        await this.fillText(this.zipcodeField, dataUser.zip_code);
        await this.fillText(this.mobileNumberField, dataUser.mobile_number);
    }

    async submitSignUp() {
        await this.click(this.createAccountButton);
        await this.waitForTimeout(2000);
    }

    async verifyAccountCreation() {
        await this.expectVisible(this.accountCreatedMessage);
        await this.expectCss(this.accountCreatedMessage, 'color', 'rgb(0, 128, 0)');
        await this.click(this.continueButton);
    }

        // Méthode pour vérifier que l'utilisateur est connecté sous le bon nom
    async verifyLoggedInAs(fullname: string) {
        await this.expectVisible(this.loggedInMessage.locator(`text=${fullname}`)); // Vérifie que le message de connexion contient le nom de l'utilisateur
    }
}

