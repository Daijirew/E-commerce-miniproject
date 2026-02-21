import { Page, Locator, expect } from '@playwright/test';

export class ProductsPage {
    readonly page: Page;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly productsGrid: Locator;
    readonly productCards: Locator;
    readonly paginationNext: Locator;

    constructor(page: Page) {
        this.page = page;
        this.searchInput = page.locator('input[name="search"]');
        this.searchButton = page.locator('button:has-text("ค้นหา")');
        this.productsGrid = page.locator('.products-grid');
        this.productCards = page.locator('.product-card');
        this.paginationNext = page.locator('.pagination-btn:has-text("ถัดไป")');
    }

    async goto() {
        await this.page.goto('/products');
    }

    async searchProduct(name: string) {
        await this.searchInput.fill(name);
        await this.searchButton.click();
    }

    async filterByCategory(categoryName: string) {
        await this.page.locator(`.filter-btn:has-text("${categoryName}")`).click();
    }

    async expectProductVisible(name: string) {
        await expect(this.page.locator(`.product-card:has-text("${name}")`)).toBeVisible();
    }
}
