import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
    readonly page: Page;
    readonly addressInput: Locator;
    readonly submitButton: Locator;
    readonly successModal: Locator;
    readonly viewOrdersButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addressInput = page.locator('textarea[placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้า..."]');
        this.submitButton = page.locator('button[type="submit"]:has-text("ยืนยันการสั่งซื้อ")');
        this.successModal = page.locator('.success-modal-content');
        this.viewOrdersButton = page.locator('button.success-btn');
    }

    async fillAddress(address: string) {
        await this.addressInput.fill(address);
    }

    async placeOrder() {
        await this.submitButton.click();
    }

    async verifySuccess() {
        await expect(this.successModal).toBeVisible({ timeout: 10000 });
    }

    async goToOrders() {
        await this.viewOrdersButton.click();
    }
}
