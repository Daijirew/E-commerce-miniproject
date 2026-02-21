import { Page, Locator, expect } from '@playwright/test';

export class AdminProductsPage {
    readonly page: Page;
    readonly addButton: Locator;
    readonly searchInput: Locator;
    readonly productCards: Locator;
    readonly modalNameInput: Locator;
    readonly modalPriceInput: Locator;
    readonly modalStockInput: Locator;
    readonly modalCategorySelect: Locator;
    readonly modalSubmitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addButton = page.locator('button:has-text("เพิ่มสินค้า")');
        this.searchInput = page.locator('.search-box input');
        this.productCards = page.locator('.product-card-admin');
        this.modalNameInput = page.locator('input[name="name"]');
        this.modalPriceInput = page.locator('input[name="price"]');
        this.modalStockInput = page.locator('input[name="stock"]');
        this.modalCategorySelect = page.locator('select[name="category_id"]');
        this.modalSubmitButton = page.locator('button[type="submit"]');
    }

    async goto() {
        await this.page.goto('/admin/products');
    }

    async addProduct(details: { name: string, price: string, stock: string, category: string }) {
        await this.addButton.click();
        await this.modalNameInput.fill(details.name);
        await this.modalPriceInput.fill(details.price);
        await this.modalStockInput.fill(details.stock);
        await this.modalCategorySelect.selectOption({ label: details.category });
        await this.modalSubmitButton.click();
    }

    async deleteProduct(name: string) {
        const productCard = this.page.locator(`.product-card-admin:has-text("${name}")`);
        await productCard.locator('.btn-icon.delete').click();
        await this.page.locator('button:has-text("ลบสินค้า")').click();
    }

    async expectProductVisible(name: string) {
        await expect(this.page.locator(`.product-card-admin:has-text("${name}")`)).toBeVisible();
    }
}
