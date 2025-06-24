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

  // Ubah bagian ini
  await page.locator('span:has-text("Leave")').click();
  await page.locator('a:has-text("Leave List")').click();
  await expect(page.locator('h5')).toHaveText('Leave List');
});


test('TC_LEAVE_POS_001 - Cari cuti berdasarkan tanggal valid', async ({ page }) => {
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(0).fill('2025-01-01');
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(1).fill('2025-12-31');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_POS_002 - Filter cuti berdasarkan Status', async ({ page }) => {
  await page.locator('.oxd-select-text').nth(0).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_POS_003 - Filter cuti berdasarkan Leave Type', async ({ page }) => {
  await page.locator('.oxd-select-text').nth(1).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_POS_004 - Filter cuti berdasarkan Nama Karyawan', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').fill('Div Automation');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_POS_005 - Kombinasi filter: Tanggal + Status', async ({ page }) => {
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(0).fill('2025-01-01');
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(1).fill('2025-12-31');
  await page.locator('.oxd-select-text').nth(0).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_POS_006 - Kombinasi filter: Nama + Leave Type', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').fill('Div Automation');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.locator('.oxd-select-text').nth(1).click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_POS_007 - Klik tombol Reset', async ({ page }) => {
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(0).fill('2025-01-01');
  await page.locator('input[placeholder="yyyy-mm-dd"]').nth(1).fill('2025-12-31');
  await reset(page);
  await expect(page.locator('input[placeholder="yyyy-mm-dd"]').nth(0)).toHaveValue('');
  await expect(page.locator('input[placeholder="yyyy-mm-dd"]').nth(1)).toHaveValue('');
});

test('TC_LEAVE_POS_008 - Aktifkan Include Past Employees', async ({ page }) => {
  const switchInput = page.locator('.oxd-switch-input');
  await switchInput.scrollIntoViewIfNeeded();
  await switchInput.click({ force: true });
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_LEAVE_POS_009 - Approve cuti status Pending', async ({ page }) => {
  await search(page);
  const approveBtn = page.getByRole('button', { name: 'Approve' });
  if (await approveBtn.isVisible()) {
    await approveBtn.click();
    await expect(page.getByText('Approved')).toBeVisible();
  }
});

test('TC_LEAVE_POS_010 - Reject cuti status Pending', async ({ page }) => {
  await search(page);
  const rejectBtn = page.getByRole('button', { name: 'Reject' });
  if (await rejectBtn.isVisible()) {
    await rejectBtn.click();
    await expect(page.getByText('Rejected')).toBeVisible();
  }
});

test('TC_LEAVE_POS_011 - Tampilkan list cuti saat halaman pertama kali dibuka', async ({ page }) => {
  await expect(page.locator('.oxd-table')).toBeVisible();
});
