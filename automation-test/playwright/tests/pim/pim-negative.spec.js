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

// NEGATIVE TEST CASES

test('TC_PIM_NEG_001 - Cari karyawan dengan Nama yang tidak valid', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill('NamaTidakValid123');
  await search(page);
  const toast = page.locator('#oxd-toaster_1');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('No Records Found');
});


test('TC_PIM_NEG_002 - Cari karyawan dengan ID yang tidak valid', async ({ page }) => {
  // Target input setelah label "Employee Id" menggunakan XPath
  const employeeIdInput = page.locator('//label[text()="Employee Id"]/following::input[1]');
  await employeeIdInput.fill('9999999999');

  await search(page);

  const toast = page.locator('#oxd-toaster_1');
  await toast.waitFor({ state: 'attached', timeout: 10000 });
  await expect(toast).toContainText(/no records found/i);
});


test('TC_PIM_NEG_003 - Input Nama Supervisor yang tidak valid', async ({ page }) => {
  const supervisorInputs = page.locator('input[placeholder="Type for hints..."]');
  if (await supervisorInputs.count() >= 3) {
    const supervisorInput = supervisorInputs.nth(2);
    await supervisorInput.fill('SupervisorTidakValid');
    await search(page);
    await expect(page.locator('.oxd-table-row.oxd-table-row--empty')).toBeVisible();
  } else {
    console.warn('Supervisor input tidak ditemukan, test dilewati');
  }
});

test('TC_PIM_NEG_004 - Input karakter khusus di field Nama', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill('#@!$%^&*');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_NEG_005 - Input karakter khusus di Employee ID', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(1).fill('#@!$%^&*');
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_NEG_006 - Input string panjang (> 255 karakter) di Nama', async ({ page }) => {
  const longString = 'a'.repeat(256);
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill(longString);
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_NEG_007 - Input string panjang di Nama Supervisor', async ({ page }) => {
  const supervisorInputs = page.locator('input[placeholder="Type for hints..."]');
  if (await supervisorInputs.count() >= 3) {
    const supervisorInput = supervisorInputs.nth(2);
    await supervisorInput.fill('x'.repeat(256));
    await search(page);
    await expect(page.locator('.oxd-table')).toBeVisible();
  } else {
    console.warn('Supervisor input tidak ditemukan, test dilewati');
  }
});

test('TC_PIM_NEG_008 - Hapus karyawan → batal konfirmasi', async ({ page }) => {
  await search(page);
  await page.locator('.oxd-icon.bi-trash').first().click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_NEG_009 - Klik tombol Search tanpa isi apapun', async ({ page }) => {
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_NEG_010 - Coba SQL Injection di field Nama', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill("'; DROP TABLE employee; --");
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});

test('TC_PIM_NEG_011 - Coba XSS di field Nama', async ({ page }) => {
  await page.locator('input[placeholder="Type for hints..."]').nth(0).fill("<script>alert('XSS')</script>");
  await search(page);
  await expect(page.locator('.oxd-table')).toBeVisible();
});



