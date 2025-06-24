const { test, expect } = require('@playwright/test');

const loginAndGoToRecruitment = async (page) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/', { timeout: 20000 });
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  await page.getByRole('link', { name: 'Recruitment' }).click();
  await expect(page.locator('h5')).toContainText('Candidates', { timeout: 10000 });
};

test.beforeEach(async ({ page }) => {
  await loginAndGoToRecruitment(page);
});

test.setTimeout(30000); // Set default timeout ke 30 detik untuk lebih cepat failure

test('TC_RC_NEG_001 - Masukkan Candidate Name yang tidak valid', async ({ page }) => {
  await page.getByPlaceholder('Type for hints...').fill('ZZZ_NamaTidakAda');
  await page.getByRole('button', { name: 'Search' }).click();
  const errorText = page.locator('.oxd-input-group__message');
  await expect(errorText).toHaveText('Invalid', { timeout: 5000 });
});

test('TC_RC_NEG_002 - Input karakter spesial di Candidate Name', async ({ page }) => {
  await page.getByPlaceholder('Type for hints...').fill('@#$%^&*()');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 5000 });
});

test('TC_RC_NEG_003 - Input terlalu panjang di Keywords', async ({ page }) => {
  const keywordInput = page.locator('input[placeholder*="keyword"], input[placeholder*="comma"]');
  await keywordInput.waitFor({ state: 'visible', timeout: 5000 });
  const longText = 'x'.repeat(600);
  await keywordInput.fill(longText);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 5000 });
});

test('TC_RC_NEG_004 - Input rentang tanggal yang salah (To < From)', async ({ page }) => {
  await page.locator('input[placeholder="From"]').fill('2025-06-20');
  await page.locator('input[placeholder="To"]').fill('2025-06-01');
  await page.getByRole('button', { name: 'Search' }).click();

  // Tunggu hingga hasil table muncul dan validasi apakah kosong
  const tableRows = page.locator('.oxd-table-body .oxd-table-row');
  await expect(tableRows).toHaveCount(0, { timeout: 5000 });
});

test('TC_RC_NEG_005 - Klik tombol Search tanpa mengisi apapun', async ({ page }) => {
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 5000 });
});

test('TC_RC_NEG_008 - Klik Delete lalu batalkan konfirmasi', async ({ page }) => {
  const rows = page.locator('.oxd-table-body .oxd-table-row');
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const deleteButton = row.locator('button:has(i.bi-trash)');
    if (await deleteButton.isVisible({ timeout: 2000 })) {
      await deleteButton.click();
      const cancel = page.getByRole('button', { name: 'Cancel' });
      await expect(cancel).toBeVisible({ timeout: 3000 });
      await cancel.click();
      await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 3000 });
      break;
    }
  }
});

test('TC_RC_NEG_009 - Input keyword dengan HTML atau script', async ({ page }) => {
  const keywordInput = page.locator('input[placeholder*="keyword"], input[placeholder*="comma"]');
  await keywordInput.waitFor({ state: 'visible', timeout: 5000 });
  await keywordInput.fill("<script>alert('XSS')</script>");
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 5000 });
});

test('TC_RC_NEG_010 - Klik semua action secara bersamaan', async ({ page }) => {
  const rows = page.locator('.oxd-table-body .oxd-table-row');
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const view = row.locator('button:has(i.bi-eye-fill)');
    const download = row.locator('button:has(i.bi-download)');
    const del = row.locator('button:has(i.bi-trash)');
    if (await view.isVisible()) view.click().catch(() => {});
    if (await download.isVisible()) download.click().catch(() => {});
    if (await del.isVisible()) del.click().catch(() => {});
  }
  await expect(page.locator('.oxd-table')).toBeVisible({ timeout: 5000 });
});
