const { test, expect } = require('@playwright/test');

async function filterByUsername(page, username) {
  await page.locator('div.oxd-input-group input').nth(0).fill(username);
}

async function search(page) {
  await page.getByRole('button', { name: 'Search' }).click();
}

async function reset(page) {
  await page.getByRole('button', { name: 'Reset' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 10000 });
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard\/index/);
  await page.getByText('Admin', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
});

test('TC_ADMIN_001 - Tombol Add berfungsi', async ({ page }) => {
  const addBtn = page.getByRole('button', { name: 'Add' });
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  await expect(page.getByText('Add User')).toBeVisible();
});


test('TC_ADMIN_002 - Add User - Positive (Valid Data)', async ({ page }) => {
  const addButton = page.getByRole('button', { name: 'Add' });
  await expect(addButton).toBeVisible({ timeout: 10000 });
  await addButton.click();

  await page.waitForSelector('h6:has-text("Add User")', { timeout: 10000 });

  await page.locator('div.oxd-select-wrapper').first().click();
  await page.getByText('ESS', { exact: true }).click();

  await page.getByPlaceholder('Type for hints...').fill('D');
  await page.waitForTimeout(5000);
  await page.getByPlaceholder('Type for hints...').press('ArrowDown');
  await page.getByPlaceholder('Type for hints...').press('Enter');

  await page.locator('div.oxd-select-wrapper').nth(1).click();
  await page.getByText('Enabled', { exact: true }).click();

  const inputs = page.locator('input.oxd-input');
  console.log('Jumlah input:', await inputs.count()); // debug

  await page.locator('div.oxd-input-group input').nth(1).fill('ajombo');
  await page.locator('div.oxd-input-group input[type="password"]').nth(0).fill('StrongPass123!');
  await page.locator('div.oxd-input-group input[type="password"]').nth(1).fill('StrongPass123!');

  // Klik Save
  await page.getByRole('button', { name: 'Save' }).click();

  // Validasi error field jika ada
  await expect(page.locator('.oxd-input-field-error-message')).toHaveCount(0);

  // Validasi tabel muncul
  await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 10000 });
});


test('TC_ADMIN_003 - Batalkan Add User', async ({ page }) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_ADMIN_004 - Cari user berdasarkan username', async ({ page }) => {
  await filterByUsername(page, 'Admin');
  await search(page);
  const firstUsername = await page.locator('.oxd-table-card .oxd-table-row').first().locator('div.oxd-table-cell').nth(1).innerText();
expect(firstUsername.toLowerCase()).toContain('admin');

});

test('TC_ADMIN_005 - Cari user berdasarkan user role', async ({ page }) => {
  await page.locator('div.oxd-select-wrapper').nth(0).click();
  await page.locator('div[role="option"] span').getByText('ESS').click();
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_ADMIN_006 - Cari user berdasarkan status', async ({ page }) => {
  await page.locator('div.oxd-select-wrapper').nth(1).click();
  await page.locator('div[role="option"] span').getByText('Enabled').click();
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_ADMIN_007 - Reset filter', async ({ page }) => {
  await filterByUsername(page, 'Admin');
  await reset(page);
  await expect(page.locator('div.oxd-input-group input').nth(0)).toHaveValue('');
});

test('TC_ADMIN_008 - Edit user', async ({ page }) => {
  await search(page);
  await page.locator('.oxd-table-cell .oxd-icon.bi-pencil-fill').first().click();
  await expect(page.getByText('Edit User')).toBeVisible();
});

test('TC_ADMIN_009 - Hapus user', async ({ page }) => {
  await search(page);
  await page.locator('.oxd-table-cell .oxd-icon.bi-trash').first().click();
  await page.getByRole('button', { name: 'Yes, Delete' }).click();
  await expect(page.getByText('Successfully Deleted')).toBeVisible();
});

test('TC_ADMIN_010 - User tidak ditemukan', async ({ page }) => {
  await filterByUsername(page, 'notexistuser');
  await search(page);
  const noRecord = page.locator('span.oxd-text:has-text("No Records Found")');
  await expect(noRecord).toBeVisible();
});

test('TC_ADMIN_011 - Default tampil semua user', async ({ page }) => {
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_ADMIN_012 - Kombinasi filter username + role', async ({ page }) => {
  await filterByUsername(page, 'Admin');
  await page.locator('div.oxd-select-wrapper').nth(0).click();
  await page.locator('div[role="option"] span').getByText(/^Admin$/).click();
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_ADMIN_013 - Verifikasi jumlah records', async ({ page }) => {
    const rowCount = await page.locator('.oxd-table-card').count();
    expect(rowCount).toBeGreaterThan(0);
});

