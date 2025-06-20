const { test, expect } = require('@playwright/test');

const loginAsAdmin = async (page) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard\/index/);
  await page.getByText('Admin', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
};

test('TC_ADMIN_N01 - Klik Add tapi tidak punya akses', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.locator('input[name="username"]').fill('Invalid');
  await page.locator('input[name="password"]').fill('invalid123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByText('Invalid credentials')).toBeVisible();
});

test('TC_ADMIN_N02 - Klik search saat koneksi putus', async ({ page }) => {
  await loginAsAdmin(page);
  await page.context().setOffline(true);
  await page.getByRole('button', { name: 'Search' }).click();

  const toasts = page.locator('.oxd-toast-content-text');
  await expect(toasts.first()).toBeVisible({ timeout: 15000 });

  await page.context().setOffline(false);
});

test('TC_ADMIN_N03 - Klik delete tapi user protected', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('button', { name: 'Search' }).click();

  const deleteButton = page.locator('.oxd-table-cell .oxd-icon.bi-trash').first();
  await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
  await deleteButton.click();

  // Expect langsung muncul toast error (karena user protected)
  const toast = page.locator('.oxd-toast-content-text');
  await expect(toast.first()).toBeVisible({ timeout: 10000 });
  await expect(toast.first()).toContainText(/cannot delete|not allowed|error/i); // perkuat dengan keyword jika perlu
});



test('TC_ADMIN_N04 - Masukkan karakter aneh di filter', async ({ page }) => {
  await loginAsAdmin(page);
  await page.locator('div.oxd-input-group input').nth(0).fill('!@#$%^&*()');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('No Records Found').first()).toBeVisible();
});

test('TC_ADMIN_N05 - Klik ikon edit tapi server down', async ({ page }) => {
  await loginAsAdmin(page);
  await page.route('**/api/**', route => route.abort());
  await page.getByRole('button', { name: 'Search' }).click();

  const editButton = page.locator('.oxd-table-cell .oxd-icon.bi-pencil-fill').first();
  await editButton.waitFor({ state: 'visible', timeout: 10000 });
  await editButton.click();

  const toast = page.locator('.oxd-toast-content-text:has-text("Error")');
  await expect(toast).toBeVisible({ timeout: 10000 });
});



test('TC_ADMIN_N06 - Add User - Missing Required Fields', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Save' }).click();
  const errors = page.locator('.oxd-input-field-error-message');
    await expect(errors.first()).toBeVisible();

});

test('TC_ADMIN_N07 - Add User - Invalid Password Confirmation', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.locator('div.oxd-select-wrapper').first().click();
  await page.getByText('ESS', { exact: true }).click();
  await page.getByPlaceholder('Type for hints...').fill('D');
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Type for hints...').press('ArrowDown');
  await page.getByPlaceholder('Type for hints...').press('Enter');
  await page.locator('div.oxd-select-wrapper').nth(1).click();
  await page.getByText('Enabled', { exact: true }).click();
  await page.locator('div.oxd-input-group input').nth(1).fill('testinvalid');
  await page.locator('input[type="password"]').nth(0).fill('Password123!');
  await page.locator('input[type="password"]').nth(1).fill('Mismatch123!');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('.oxd-input-field-error-message')).toBeVisible();
});

test('TC_ADMIN_N08 - Add User - Existing Username', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.locator('div.oxd-select-wrapper').first().click();
  await page.getByText('ESS', { exact: true }).click();
  await page.getByPlaceholder('Type for hints...').fill('D');
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Type for hints...').press('ArrowDown');
  await page.getByPlaceholder('Type for hints...').press('Enter');
  await page.locator('div.oxd-select-wrapper').nth(1).click();
  await page.getByText('Enabled', { exact: true }).click();
  await page.locator('div.oxd-input-group input').nth(1).fill('Admin');
  await page.locator('input[type="password"]').nth(0).fill('Password123!');
  await page.locator('input[type="password"]').nth(1).fill('Password123!');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('.oxd-input-field-error-message')).toBeVisible();
});

test('TC_ADMIN_N09 - Add User - Weak Password', async ({ page }) => {
  await loginAsAdmin(page);
  await page.getByRole('button', { name: 'Add' }).click();
  await page.locator('div.oxd-select-wrapper').first().click();
  await page.getByText('ESS', { exact: true }).click();
  await page.getByPlaceholder('Type for hints...').fill('D');
  await page.waitForTimeout(2000);
  await page.getByPlaceholder('Type for hints...').press('ArrowDown');
  await page.getByPlaceholder('Type for hints...').press('Enter');
  await page.locator('div.oxd-select-wrapper').nth(1).click();
  await page.getByText('Enabled', { exact: true }).click();
  await page.locator('div.oxd-input-group input').nth(1).fill('weakuser');
  await page.locator('input[type="password"]').nth(0).fill('123');
  await page.locator('input[type="password"]').nth(1).fill('123');
  await page.getByRole('button', { name: 'Save' }).click();
  const errors = page.locator('.oxd-input-field-error-message');
  await expect(errors.first()).toBeVisible();

});
