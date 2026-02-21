import { test, expect } from '../3.fixtures/testFixtures';

test.describe('Admin E2E Tests', () => {
    const adminEmail = 'admin@admin.com';
    const adminPassword = '123456';

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
        await loginPage.login(adminEmail, adminPassword);
    });

    test('Admin can access dashboard and see stats', async ({ adminDashboardPage, page }) => {
        await expect(page).toHaveURL('/admin');
        await adminDashboardPage.expectDashboardVisible();
        await expect(adminDashboardPage.statCards.first()).toBeVisible();
    });

    test('Admin can add and delete a product', async ({ adminDashboardPage, adminProductsPage }) => {
        await adminDashboardPage.navigateToProducts();

        const testProduct = {
            name: 'Playwright Test Product',
            price: '999',
            stock: '50',
            category: 'อาหารสุนัข'
        };

        await adminProductsPage.addProduct(testProduct);
        await adminProductsPage.expectProductVisible(testProduct.name);

        // Clean up
        await adminProductsPage.deleteProduct(testProduct.name);
        await expect(adminProductsPage.page.locator(`.product-card-admin:has-text("${testProduct.name}")`)).not.toBeVisible();
    });

    test('Admin can view order list', async ({ adminDashboardPage, adminOrdersPage }) => {
        await adminDashboardPage.navigateToOrders();
        await expect(adminOrdersPage.orderRows.first()).toBeVisible();
    });
});
