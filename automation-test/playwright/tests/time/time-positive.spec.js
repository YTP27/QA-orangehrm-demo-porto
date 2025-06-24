const { test, expect } = require('@playwright/test');

const login = async (page) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
};

const navigateToMyInfo = async (page) => {
  await page.getByRole('link', { name: 'My Info' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await login(page);
  await navigateToMyInfo(page);
});

test('TC_PD_001 - Akses halaman Personal Details', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
});

test('TC_PD_002 - Edit dan simpan nama lengkap', async ({ page }) => {
  const fields = page.locator('.orangehrm-edit-employee-name input');
  await fields.nth(0).fill('Roberto');
  await fields.nth(1).fill('Vinicius');
  await fields.nth(2).fill('Sincariuc');
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_003 - Edit dan simpan informasi lisensi', async ({ page }) => {
  await page.getByLabel("Driver's License Number").fill('12345678');
  await page.getByLabel('License Expiry Date').fill('2031-12-04');
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_004 - Edit informasi tanggal lahir', async ({ page }) => {
  await page.getByLabel('Date of Birth').fill('1996-08-12');
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_005 - Pilih gender dan marital status', async ({ page }) => {
  await page.getByLabel('Male').check();
  await page.getByText('Single').click();
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_006 - Pilih nationality', async ({ page }) => {
  await page.getByLabel('Nationality').click();
  await page.getByText('Brazilian').click();
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_007 - Simpan informasi di Custom Fields', async ({ page }) => {
  await page.getByLabel('Blood Type').click();
  await page.getByText('O+').click();
  await page.getByLabel('Test_Field').fill('2255');
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_008 - Upload file attachment', async ({ page }) => {
  await page.getByText('+ Add').click();
  await page.setInputFiles('input[type="file"]', 'tests/assets/test.png');
  await page.getByPlaceholder('Type comment here').fill('test');
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_009 - Lihat file attachment', async ({ page }) => {
  await expect(page.getByRole('cell', { name: 'test.png' })).toBeVisible();
  await page.getByRole('button', { name: 'Download' }).click();
});

test('TC_PD_010 - Edit attachment description', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByPlaceholder('Type comment here').fill('updated');
  await page.getByRole('button', { name: 'Save' }).click();
});

test('TC_PD_011 - Hapus attachment', async ({ page }) => {
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Yes, Delete' }).click();
});
