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

        // ค้นหาสินค้า
        const targetSearch = 'อาหารแมว';
        await productsPage.filterByCategory(targetSearch);

        // 💡 แก้ไข: กรองหาการ์ดสินค้าตัวแรกที่มีปุ่ม "ใส่ตะกร้า" และ "ไม่ติดสถานะ disabled"
        const availableProductCard = productsPage.productCards.filter({
            has: page.locator('button:has-text("ใส่ตะกร้า"):not([disabled])')
        }).first();

        // รอให้การ์ดสินค้าพร้อมแสดงผล
        await expect(availableProductCard).toBeVisible();

        // ดึงชื่อสินค้าเพื่อนำไปใช้ตรวจสอบในตะกร้า
        const productTitleLocator = availableProductCard.locator('h3').first();
        await expect(productTitleLocator).toBeVisible();
        const productName = await productTitleLocator.innerText();

        // 💡 แก้ไข: ดึงปุ่มใส่ตะกร้า และใช้ expect บังคับรอให้ปุ่มใช้งานได้ชัวร์ๆ ก่อนค่อยกดคลิก
        const addToCartBtn = availableProductCard.locator('button:has-text("ใส่ตะกร้า")');
        await expect(addToCartBtn).toBeEnabled();
        await addToCartBtn.click();

        // 2. Go to Cart and Verify
        await cartPage.goto();
        await cartPage.verifyCartHasItem(productName);

        // 3. Proceed to Checkout
        await cartPage.proceedToCheckout();
        await expect(page).toHaveURL('/checkout');

        // 4. Fill Address and Place Order
        // (ตรวจสอบให้แน่ใจว่ามีการประกาศตัวแปร deliveryAddress ไว้ด้านบนของไฟล์ด้วยนะครับ)
        await checkoutPage.fillAddress(deliveryAddress);
        await checkoutPage.placeOrder();

        // 5. Verify Success
        await checkoutPage.verifySuccess();

        // 6. Go to Orders page
        await checkoutPage.goToOrders();
        await expect(page).toHaveURL('/orders');
    });
});
