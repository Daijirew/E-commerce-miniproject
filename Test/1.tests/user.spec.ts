import { test, expect } from '../3.fixtures/testFixtures';

test.describe('User E2E Tests', () => {
    const userEmail = 'daijirew123@gmail.com';
    const userPassword = '123456';

    test('User can login and view products', async ({ loginPage, productsPage, page }) => {
        await loginPage.goto();
        await loginPage.login(userEmail, userPassword);

        // Verify redirect to home
        await expect(page).toHaveURL('/');

        // Go to products and search
        await productsPage.goto();
        await productsPage.searchProduct('Cat Food');
        await productsPage.expectProductVisible('Cat Food');
    });

    test('User can filter products by category', async ({ loginPage, productsPage, page }) => {
        await loginPage.goto();
        await loginPage.login(userEmail, userPassword);

        // Wait for login to complete and redirect to home
        await expect(page).toHaveURL('/');

        await productsPage.goto();
        await productsPage.filterByCategory('อาหารแมว');
        // Expect some products to be visible in this category
        await expect(productsPage.productCards.first()).toBeVisible();
    });
});
