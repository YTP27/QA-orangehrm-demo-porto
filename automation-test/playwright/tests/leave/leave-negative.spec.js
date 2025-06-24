const { test, expect } = require('@playwright/test');

async function search(page) {
  await page.getByRole('button', { name: 'Search' }).click();
}

async function reset(page) {
  await page.getByRole('button', { name: 'Reset' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.locator('span:has-text("Leave")').click();
  await page.locator('a:has-text("Leave List")').click();
  await expect(page.locator('h5')).toHaveText('Leave List');
});

test('TC_LEAVE_NEG_001 - Input From Date > To Date', async ({ page }) => {
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(0).fill('2025-12-31');
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(1).fill('2025-01-01');
  await search(page);
  await expect(page.locator('.oxd-table-cell')).toHaveCount(0);
});

test('TC_LEAVE_NEG_002 - Cari cuti dengan Status kosong', async ({ page }) => {
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_NEG_003 - Cari cuti dengan Leave Type kosong', async ({ page }) => {
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_NEG_004 - Input tanggal format tidak sesuai', async ({ page }) => {
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(0).fill('ABC123');
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(1).fill('!@#$%^');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible(); // bisa diganti jika ada validasi
});

test('TC_LEAVE_NEG_005 - Nama tidak ada di sistem', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').fill('ZZZZZZZ');
  await search(page);
  await expect(page.locator('.oxd-table-cell')).toHaveCount(0);
});

test('TC_LEAVE_NEG_006 - Approve cuti yang sudah Approved', async ({ page }) => {
  await search(page);
  const row = page.locator('.oxd-table-row').filter({ hasText: 'Approved' }).first();
  if (await row.locator('button:has-text("Approve")').isVisible()) {
    await row.locator('button:has-text("Approve")').click();
    await expect(page.getByText('Approved')).toBeVisible();
  }
});

test('TC_LEAVE_NEG_007 - Reject cuti yang sudah Rejected', async ({ page }) => {
  await search(page);
  const row = page.locator('.oxd-table-row').filter({ hasText: 'Rejected' }).first();
  if (await row.locator('button:has-text("Reject")').isVisible()) {
    await row.locator('button:has-text("Reject")').click();
    await expect(page.getByText('Rejected')).toBeVisible();
  }
});

test('TC_LEAVE_NEG_008 - Kombinasi filter kosong semua', async ({ page }) => {
  await reset(page);
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_NEG_009 - Search tanpa tanggal (From & To kosong)', async ({ page }) => {
  await reset(page);
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});
