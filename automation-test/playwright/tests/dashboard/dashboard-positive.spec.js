const { test, expect } = require('@playwright/test');

// Helper: login sekali di awal tiap test
test.beforeEach(async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
});

test('TC_DASH_001 - Akses halaman dashboard setelah login', async ({ page }) => {
  const heading = page.locator('.oxd-topbar-header-breadcrumb > h6');
  await expect(heading).toHaveText('Dashboard', { timeout: 10000 });

  await expect(page).toHaveURL(/dashboard\/index/);
});

test('TC_DASH_002 - Verifikasi widget Quick Launch tampil', async ({ page }) => {
  const widgetTitle = page.getByText('Quick Launch', { exact: true });
  await expect(widgetTitle).toBeVisible();
  const icons = page.locator('.orangehrm-quick-launch-card');
  await expect(icons).toHaveCount(6);
});

test('TC_DASH_003 - Klik ikon "Assign Leave" dari Quick Launch', async ({ page }) => {
  await page.getByRole('button', { name: 'Assign Leave' }).click();
  await expect(page).toHaveURL(/assignLeave/);
});

test('TC_DASH_004 - Klik ikon "Leave List" dari Quick Launch', async ({ page }) => {
  await page.getByRole('button', { name: 'Leave List' }).click();
  await expect(page).toHaveURL(/viewLeaveList/);
});

test('TC_DASH_005 - Tampilan grafik leave muncul', async ({ page }) => {
  const leaveGraph = page.locator('canvas'); 
  await expect(leaveGraph.first()).toBeVisible(); 
});

test('TC_DASH_006 - Logout dari dashboard', async ({ page }) => {
  await page.locator('.oxd-userdropdown-name').click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/auth\/login/);
});

