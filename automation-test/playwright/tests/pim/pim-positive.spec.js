const { test, expect } = require('@playwright/test');

async function search(page) {
  await page.getByRole('button', { name: 'Search' }).click();
}

async function reset(page) {
  await page.getByRole('button', { name: 'Reset' }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByText('PIM').click();
  await expect(page.locator('h5')).toHaveText('Employee Information');
});

test('TC_PIM_POS_001 - Cari karyawan dengan Nama yang valid', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill('Bruce');
  await search(page);
  await expect(page.locator('.oxd-table-card').filter({ hasText: 'Bruce' }).first()).toContainText('Bruce');
});

test('TC_PIM_POS_002 - Cari karyawan dengan ID yang valid', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(1).fill('0378');
  await search(page);
  await expect(page.locator('.oxd-table-card').filter({ hasText: '0378' }).first()).toContainText('0378');
});

test('TC_PIM_POS_003 - Filter berdasarkan Status Karyawan', async ({ page }) => {
  const statusDropdown = page.locator('.oxd-select-wrapper').nth(1);
  await expect(statusDropdown).toBeVisible();
  await statusDropdown.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_004 - Filter berdasarkan Jabatan (Job Title)', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').nth(2).click();
  await page.getByRole('option').first().click();
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_005 - Filter berdasarkan Sub Unit', async ({ page }) => {
  await page.locator('.oxd-select-wrapper').nth(3).click();
  await page.getByRole('option').first().click();
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_006 - Kombinasi filter: Nama + Job Title', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill('Bruce');
  await page.locator('.oxd-select-wrapper').nth(2).click();
  await page.getByRole('option').first().click();
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_007 - Kombinasi filter: Nama + Status', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill('Bruce');
  await page.locator('.oxd-select-wrapper').nth(1).click();
  await page.getByRole('option').first().click();
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_008 - Kombinasi filter: Nama + Supervisor', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill('Bruce');
  const supervisorInputs = page.locator('input[placeholder="Type for hints..."]');
  const count = await supervisorInputs.count();
  if (count >= 3) {
    const supervisorInput = supervisorInputs.nth(2);
    await expect(supervisorInput).toBeVisible();
    await supervisorInput.fill('Odis');
    await search(page);
    await expect(page.locator('.oxd-table')).toBeVisible();
  } else {
    throw new Error('Supervisor input tidak ditemukan');
  }
});

test('TC_PIM_POS_009 - Tombol Reset menghapus semua filter', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill('Bruce');
  await reset(page);
  await expect(page.locator('input[placeholder="Type for hints..."]').nth(0)).toHaveValue('');
});

test('TC_PIM_POS_010 - Filter Include: Current and Past Employees', async ({ page }) => {
  const includeDropdowns = page.locator('.oxd-select-wrapper');
  const count = await includeDropdowns.count();
  if (count >= 4) {
    const includeDropdown = includeDropdowns.nth(3);
    await expect(includeDropdown).toBeVisible();
    await includeDropdown.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await search(page);
    await expect(page.locator('.oxd-table')).toBeVisible();
  } else {
    throw new Error('Include dropdown tidak ditemukan');
  }
});

test('TC_PIM_POS_011 - Filter Include: Past Employees Only', async ({ page }) => {
  const includeDropdowns = page.locator('.oxd-select-wrapper');
  const count = await includeDropdowns.count();
  if (count >= 4) {
    const includeDropdown = includeDropdowns.nth(3);
    await expect(includeDropdown).toBeVisible();
    await includeDropdown.click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await search(page);
    await expect(page.locator('.oxd-table')).toBeVisible();
  } else {
    throw new Error('Include dropdown tidak ditemukan');
  }
});

test('TC_PIM_POS_012 - Klik tombol "+ Add" membuka form tambah karyawan', async ({ page }) => {
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByRole('heading', { name: 'Add Employee' })).toBeVisible();
});

test('TC_PIM_POS_013 - Klik tombol Edit membuka halaman edit', async ({ page }) => {
  await search(page);
  await page.locator('.oxd-table .oxd-icon.bi-pencil-fill').first().click();
  await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
});

test('TC_PIM_POS_014 - Klik tombol Delete berhasil hapus karyawan', async ({ page }) => {
  await search(page);
  await page.locator('.oxd-icon.bi-trash').first().click();
  await page.getByRole('button', { name: 'Yes, Delete' }).click();
  await expect(page.locator('.oxd-toast')).toContainText('Successfully Deleted');
});

test('TC_PIM_POS_015 - Sorting kolom ID', async ({ page }) => {
  await page.getByRole('columnheader', { name: /Id/ }).nth(0).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_016 - Sorting kolom First & Middle Name', async ({ page }) => {
  await page.getByRole('columnheader', { name: 'First (& Middle) Name' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_017 - Sorting kolom Last Name', async ({ page }) => {
  await page.getByRole('columnheader', { name: 'Last Name' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_018 - Pagination (halaman selanjutnya)', async ({ page }) => {
  await page.locator('nav[role="navigation"] li').last().click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_POS_019 - Validasi input ID dengan format valid', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(1).fill('1234');
  await expect(page.locator('input[placeholder="Type for hints..."]').nth(1)).toHaveValue('1234');
});
