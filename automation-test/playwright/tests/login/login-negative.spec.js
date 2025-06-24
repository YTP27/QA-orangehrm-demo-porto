const { test, expect } = require('@playwright/test');

test('login dengan username & password salah', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  // isi username & password yang salah
  await page.getByPlaceholder('Username').fill('oduyzoudyz');
  await page.getByPlaceholder('Password').fill('admin123');

  // klik login
  await page.getByRole('button', { name: 'Login' }).click();

  // pastikan error muncul
  const errorMsg = page.locator('.oxd-alert-content-text');
  await expect(errorMsg).toBeVisible();
  await expect(errorMsg).toHaveText(/Invalid credentials/);
});
