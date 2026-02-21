import { Page, Locator, expect } from '@playwright/test';

export class AdminOrdersPage {
    readonly page: Page;
    readonly orderRows: Locator;
    readonly statusSelect: Locator;

    constructor(page: Page) {
        this.page = page;
        this.orderRows = page.locator('.admin-table tbody tr');
        this.statusSelect = page.locator('.status-select');
    }

    async goto() {
        await this.page.goto('/admin/orders');
    }

    async updateOrderStatus(orderId: string, status: string) {
        const row = this.page.locator(`tr:has-text("${orderId}")`);
        await row.locator('select.status-select').selectOption({ label: status });
    }

    async viewOrderDetail(orderId: string) {
        const row = this.page.locator(`tr:has-text("${orderId}")`);
        await row.locator('.btn-view-detail').click();
    }

    async expectOrderVisible(orderId: string) {
        await expect(this.page.locator(`tr:has-text("${orderId}")`)).toBeVisible();
    }
}
