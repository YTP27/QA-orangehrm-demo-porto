const { test, expect } = require('@playwright/test');


test('TC_DASH_001 - Akses dashboard tanpa login (direct URL)', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
  await expect(page).toHaveURL(/auth\/login/);
});

test('TC_DASH_002 - Dashboard error jika session expired', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Simulasi session timeout
  await page.waitForTimeout(60000); // 1 menit, bisa disesuaikan
  await page.reload();

  await expect(page).toHaveURL(/auth\/login/); // Redirect balik ke login
  await expect(page.locator('.oxd-text')).toContainText('Session');
});

test('TC_DASH_003 - Login dengan user disabled', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.getByPlaceholder('Username').fill('DisabledUser'); 
  await page.getByPlaceholder('Password').fill('somepassword');
  await page.getByRole('button', { name: 'Login' }).click();

  const errorMessage = page.locator('.oxd-alert-content-text');
  await expect(errorMessage).toBeVisible();
  await expect(errorMessage).toContainText('Invalid credentials');
});

test('TC_DASH_004 - Widget dashboard gagal load karena koneksi putus', async ({ page, context }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Simulasi koneksi internet putus
  await context.setOffline(true);

  // Akses dashboard (dalam keadaan offline)
  await page.reload();

  const error = page.locator('.orangehrm-dashboard-widget'); // contoh placeholder, sesuaikan
  await expect(error.first()).not.toBeVisible(); // atau cek error indicator kalau ada

  // Balikkan koneksi
  await context.setOffline(false);
});
