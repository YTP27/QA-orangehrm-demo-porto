const { test, expect } = require('@playwright/test');

const loginAndGoToRecruitment = async (page) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole('link', { name: 'Recruitment' }).click();
  await expect(page.locator('h5')).toContainText('Candidates');
};

test.beforeEach(async ({ page }) => {
  await loginAndGoToRecruitment(page);
});

test('TC_RC_001 - Akses halaman Candidates', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_002 - Filter berdasarkan Job Title', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').nth(0).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_003 - Filter berdasarkan Vacancy', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').nth(1).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_004 - Filter berdasarkan Hiring Manager', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').nth(2).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_005 - Filter berdasarkan Status', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').nth(3).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_006 - Filter berdasarkan Candidate Name', async ({ page }) => {
  await page.getByPlaceholder('Type for hints...').fill('Camilo Andres');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_007 - Filter berdasarkan Method of Application', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').nth(4).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_008 - Filter berdasarkan Keywords', async ({ page }) => {
  const input = page.getByPlaceholder('Enter comma separated words...');
  await expect(input).toBeVisible();
  await input.fill('DevOps');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_009 - Filter berdasarkan Date of Application', async ({ page }) => {
  await page.locator('input[placeholder="From"]').fill('2025-06-01');
  await page.locator('input[placeholder="To"]').fill('2025-06-19');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_010 - Klik tombol Reset', async ({ page }) => {
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByPlaceholder('Type for hints...')).toHaveValue('');
});

test('TC_RC_011 - Klik tombol + Add', async ({ page }) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.locator('h6', { hasText: 'Add Candidate' })).toBeVisible();
});

test('TC_RC_012 - Klik tombol View di baris kandidat', async ({ page }) => {
  const rows = page.locator('.oxd-table-body .oxd-table-row');
  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const viewButton = row.locator('button:has(i.bi-eye-fill)');
    if (await viewButton.isVisible()) {
      await viewButton.click();
      await expect(page.locator('h6')).toContainText('Candidate Profile');
      break;
    }
  }
});
;

test('TC_RC_013 - Klik tombol Delete', async ({ page }) => {
  const rows = page.locator('.oxd-table-body .oxd-table-row');
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const deleteButton = row.locator('button:has(i.bi-trash)');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      await page.getByRole('button', { name: 'Yes, Delete' }).click();
      await expect(page.locator('.oxd-toast')).toBeVisible();
      await expect(page.locator('.oxd-toast').locator('p.oxd-text--toast-message')).toContainText('Successfully Deleted');
      break;
    }
  }
});

test('TC_RC_014 - Klik tombol Download Resume', async ({ page }) => {
  const rows = page.locator('.oxd-table-body .oxd-table-row');
  const rowCount = await rows.count();
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const downloadButton = row.locator('button:has(i.bi-download)');
    if (await downloadButton.isVisible()) {
      const [ download ] = await Promise.all([
        page.waitForEvent('download', { timeout: 15000 }),
        downloadButton.click()
      ]);
      const suggestedName = await download.suggestedFilename();
      expect(suggestedName).toBeTruthy();
      break;
    }
  }
});

test('TC_RC_015 - Semua filter digunakan sekaligus', async ({ page }) => {
  for (let i = 0; i <= 4; i++) {
    await page.locator('.oxd-select-wrapper').nth(i).click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  }
  await page.getByPlaceholder('Type for hints...').fill('Camilo Andres');

  const keywordInput = page.locator('input[placeholder*="keyword"], input[placeholder*="comma"]');
  await keywordInput.waitFor({ state: 'visible', timeout: 5000 });
  await keywordInput.fill('DevOps');

  await page.locator('input[placeholder="From"]').fill('2025-06-01');
  await page.locator('input[placeholder="To"]').fill('2025-06-19');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_RC_016 - Urutkan tabel berdasarkan kolom', async ({ page }) => {
  await page.locator('div.oxd-table-header-cell:has-text("Vacancy")').click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});


test('TC_RC_0117 - Navigasi ke tab Vacancies', async ({ page }) => {
  await page.getByRole('link', { name: 'Vacancies' }).click();
  await expect(page.locator('h5')).toContainText('Vacancies');
});
