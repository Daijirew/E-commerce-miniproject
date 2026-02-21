import { test, expect } from '../../3.fixtures/testFixtures';

test.describe('Authentication Tests', () => {

    test.describe('Positive Cases', () => {
        test('Admin can login successfully', async ({ loginPage, page }) => {
            await loginPage.goto();
            await loginPage.login('admin@admin.com', '123456');

            // Verify admin redirect
            await expect(page).toHaveURL('/admin');
        });

        test('User can login successfully', async ({ loginPage, page }) => {
            await loginPage.goto();
            await loginPage.login('daijirew123@gmail.com', '123456');

            // Verify user redirect
            await expect(page).toHaveURL('/');
        });
    });

    test.describe('Negative Cases', () => {
        test('Login fails with incorrect password', async ({ loginPage, page }) => {
            await loginPage.goto();
            await loginPage.login('daijirew123@gmail.com', 'wrongpassword');

            // ใช้ RegEx /.../ เพื่อตรวจสอบข้อความแบบ OR (เจออันใดอันหนึ่งก็ให้ผ่าน)
            await expect(page.locator('.error-message')).toContainText(
                /⚠️ Invalid email or password|⚠️ อีเมลหรือรหัสผ่านไม่ถูกต้อง/,
                { timeout: 10000 }
            );
        });

        test('Login fails with non-existent email', async ({ loginPage, page }) => {
            await loginPage.goto();
            await loginPage.login('notfound@fake.com', '123456');

            // ใช้ RegEx แบบเดียวกัน
            await expect(page.locator('.error-message')).toContainText(
                /⚠️ Invalid email or password|⚠️ อีเมลหรือรหัสผ่านไม่ถูกต้อง/,
                { timeout: 10000 }
            );
        });

        test('Login fails when fields are empty', async ({ loginPage }) => {
            await loginPage.goto();
            await loginPage.loginButton.click();

            // Should stay on login page or show HTML5 validation message (tested natively by browser)
            await expect(loginPage.page).toHaveURL('/login');
        });
    });
});
