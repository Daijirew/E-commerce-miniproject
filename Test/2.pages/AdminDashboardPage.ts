import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    readonly page: Page;
    readonly dashboardTitle: Locator;
    readonly statCards: Locator;
    readonly sideNavProducts: Locator;
    readonly sideNavOrders: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dashboardTitle = page.locator('h2:has-text("Dashboard")');
        this.statCards = page.locator('.stat-card');
        // Based on AdminLayout or Header components which might contain nav links
        this.sideNavProducts = page.locator('nav a[href="/admin/products"]');
        this.sideNavOrders = page.locator('nav a[href="/admin/orders"]');
    }

    async goto() {
        await this.page.goto('/admin');
    }

    async expectDashboardVisible() {
        await expect(this.dashboardTitle).toBeVisible();
    }

    async navigateToProducts() {
        // Fallback to direct navigation if link not found or complex selectors needed
        try {
            await this.sideNavProducts.click();
        } catch (e) {
            await this.page.goto('/admin/products');
        }
    }

    async navigateToOrders() {
        try {
            await this.sideNavOrders.click();
        } catch (e) {
            await this.page.goto('/admin/orders');
        }
    }
}
