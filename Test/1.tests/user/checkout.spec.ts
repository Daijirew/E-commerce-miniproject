import { test, expect } from '../../3.fixtures/testFixtures';

test.describe('User Shopping & Checkout Tests', () => {
    const userEmail = 'daijirew123@gmail.com';
    const userPassword = '123456';
    const deliveryAddress = '123 Playwright St, Bangkok 10110';

    test.beforeEach(async ({ loginPage, page }) => {
        // Log in before each test as user
        await loginPage.goto();
        await loginPage.login(userEmail, userPassword);
        // Wait for redirect to home
        await expect(page).toHaveURL('/');
    });

    test('User can search product, add to cart, check cart, and checkout successfully', async ({
        productsPage,
        cartPage,
        checkoutPage,
        page
    }) => {
        // 1. Search and Add to Cart
        await productsPage.goto();

        // Find a specific product (assumes 'Cat Food' or similar exists)
        const targetSearch = 'อาหารแมว';
        await productsPage.filterByCategory(targetSearch);

        // Ensure there is at least one product card
        const firstProductCard = productsPage.productCards.first();
        await expect(firstProductCard).toBeVisible();

        // Get the product name to verify it later in the cart
        const productTitleLocator = firstProductCard.locator('h3').first();
        await expect(productTitleLocator).toBeVisible();
        const productName = await productTitleLocator.innerText();

        // Add to cart
        const addToCartBtn = firstProductCard.locator('button:has-text("ใส่ตะกร้า")');
        await addToCartBtn.click();

        // 2. Go to Cart and Verify
        await cartPage.goto();
        await cartPage.verifyCartHasItem(productName);

        // 3. Proceed to Checkout
        await cartPage.proceedToCheckout();
        await expect(page).toHaveURL('/checkout');

        // 4. Fill Address and Place Order
        await checkoutPage.fillAddress(deliveryAddress);
        await checkoutPage.placeOrder();

        // 5. Verify Success
        await checkoutPage.verifySuccess();

        // 6. Go to Orders page
        await checkoutPage.goToOrders();
        await expect(page).toHaveURL('/orders');
    });
});
