import { Page, Locator, expect } from '@playwright/test';

// Définition de la classe de base 'BasePage'
export class BasePage {
    protected page: Page;  // Déclaration d'une variable protected 'page' de type 'Page' pour représenter la page web

        // Constructeur de la classe 'BasePage' qui prend un objet 'Page' en paramètre
    constructor(page: Page) {
        this.page = page; // Initialisation de l'attribut 'page' avec l'objet 'Page' passé en paramètre
    }

    // Méthode pour vérifier la visibilité d'un élément
    async expectVisible(locator: Locator) {
        await expect(locator).toBeVisible();
    }

    // Méthode pour cliquer sur un élément
    async click(locator: Locator) {
        await locator.click();
    }

    // Méthode pour remplir un champ de texte
    async fillText(locator: Locator, text: string) {
        await locator.fill(text);
    }

    // Méthode pour sélectionner une option dans un menu déroulant
    async selectOption(locator: Locator, option: string) {
        await locator.selectOption(option);
    }

    // Méthode pour vérifier la valeur d'un champ
    async expectValue(locator: Locator, value: string) {
        await expect(locator).toHaveValue(value);
    }

    // Méthode pour attendre un certain temps
    async waitForTimeout(timeout: number) {
        await this.page.waitForTimeout(timeout);
    }

    // Méthode pour vérifier le style CSS d'un élément
    async expectCss(locator: Locator, property: string, value: string) {
        await expect(locator).toHaveCSS(property, value);
    }

}
