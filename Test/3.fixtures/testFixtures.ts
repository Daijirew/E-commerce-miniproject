import { test as base } from '@playwright/test';
import { LoginPage } from '../2.pages/LoginPage';
import { ProductsPage } from '../2.pages/ProductsPage';
import { AdminDashboardPage } from '../2.pages/AdminDashboardPage';
import { AdminProductsPage } from '../2.pages/AdminProductsPage';
import { AdminOrdersPage } from '../2.pages/AdminOrdersPage';
import { CartPage } from '../2.pages/CartPage';
import { CheckoutPage } from '../2.pages/CheckoutPage';

type MyFixtures = {
    loginPage: LoginPage;
    productsPage: ProductsPage;
    adminDashboardPage: AdminDashboardPage;
    adminProductsPage: AdminProductsPage;
    adminOrdersPage: AdminOrdersPage;
    cartPage: CartPage;
    checkoutPage: CheckoutPage;
};

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    productsPage: async ({ page }, use) => {
        await use(new ProductsPage(page));
    },
    adminDashboardPage: async ({ page }, use) => {
        await use(new AdminDashboardPage(page));
    },
    adminProductsPage: async ({ page }, use) => {
        await use(new AdminProductsPage(page));
    },
    adminOrdersPage: async ({ page }, use) => {
        await use(new AdminOrdersPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page));
    },
});

export { expect } from '@playwright/test';
