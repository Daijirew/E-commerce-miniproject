import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
    readonly page: Page;
    readonly cartItems: Locator;
    readonly emptyCartMessage: Locator;
    readonly checkoutButton: Locator;
    readonly totalAmount: Locator;

    constructor(page: Page) {
        this.page = page;
        this.cartItems = page.locator('.cart-item');
        this.emptyCartMessage = page.locator('.empty-cart');
        this.checkoutButton = page.locator('button:has-text("ดำเนินการชำระเงิน →")');
        this.totalAmount = page.locator('.total-amount');
    }

    async goto() {
        await this.page.goto('/cart');
    }

    async verifyCartHasItem(itemName: string) {
        await expect(this.cartItems.filter({ hasText: itemName }).first()).toBeVisible();
    }

    async verifyCartIsEmpty() {
        await expect(this.emptyCartMessage).toBeVisible();
    }

    async proceedToCheckout() {
        await this.checkoutButton.click();
    }
}
