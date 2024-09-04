import { test, expect } from '@playwright/test';
const { validUser } = require('../../utils/helpers_01');

test('Test Case 04 : Logout User', async ({ page }) => {

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
    //Vérifier que le logged in as... est visible
    await expect(page.getByText('Logged in as ')).toBeVisible(); //je pouvais aussi variabliser le nom
    //Cliquer sur le boutton Logout
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.waitForTimeout(2000);
    //Vérifier que le user est sur le login page
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();

});