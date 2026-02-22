import { test, expect } from '../../3.fixtures/testFixtures';

test.describe('Admin Product Management Tests', () => {
    const adminEmail = 'admin@admin.com';
    const adminPassword = '123456';

    const testProduct = {
        name: 'Auto Admin Product ' + Date.now(),
        price: '999',
        stock: '50',
        category: 'อาหารสุนัข'
    };

    test.beforeEach(async ({ loginPage }) => {
        // Log in before each test as admin
        await loginPage.goto();
        await loginPage.login(adminEmail, adminPassword);
    });

    test('Admin can add and delete a product successfully', async ({ adminDashboardPage, adminProductsPage, page }) => {
        // Wait for redirect to admin dash
        await expect(page).toHaveURL('/admin');


        await adminDashboardPage.navigateToProducts();

        // 1. Add Product
        await adminProductsPage.addProduct(testProduct);
        await adminProductsPage.expectProductVisible(testProduct.name);

        // 2. Delete the created Product
        await adminProductsPage.deleteProduct(testProduct.name);
        await expect(adminProductsPage.page.locator(`.product-card-admin:has-text("${testProduct.name}")`)).not.toBeVisible();
    });
});
