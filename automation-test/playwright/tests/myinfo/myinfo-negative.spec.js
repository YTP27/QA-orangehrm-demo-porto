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
  await expect(page.getByRole('heading', { name: 'Personal Details' })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await login(page);
  await navigateToMyInfo(page);
});

test('TC_PD_001_NEG - Kosongkan semua field mandatory lalu klik Save', async ({ page }) => {
  const firstNameInput = page.locator('input[name="firstName"]');
  const lastNameInput = page.locator('input[name="lastName"]');
  await page.waitForSelector('input[name="firstName"]');
  await page.waitForSelector('input[name="lastName"]');
  await firstNameInput.fill('');
  await firstNameInput.blur();
  await lastNameInput.fill('');
  await lastNameInput.blur();
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  // ❌ BUG: Data kosong tetap bisa disimpan
  await expect(page.locator('div.oxd-toast')).toBeVisible();
});

test('TC_PD_002_NEG - Isi Driver’s License Number dengan huruf', async ({ page }) => {
  await page.waitForSelector('input[name="licenseNumber"]');
  const licenseInput = page.locator('input[name="licenseNumber"]');
  await expect(licenseInput).toBeVisible();
  await licenseInput.fill('abcde');
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  // ❌ BUG: Format huruf tetap diterima
  await expect(page.locator('div.oxd-toast')).toBeVisible();
});

test('TC_PD_003_NEG - Isi License Expiry Date dengan format salah', async ({ page }) => {
  await page.waitForSelector('input[name="licenseExpiryDate"]');
  const expiryInput = page.locator('input[name="licenseExpiryDate"]');
  await expect(expiryInput).toBeVisible();
  await expiryInput.fill('04-12-2031');
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  // ❌ BUG: Format salah tetap diterima
  await expect(page.locator('div.oxd-toast')).toBeVisible();
});

test('TC_PD_004_NEG - Masukkan tanggal lahir tidak masuk akal', async ({ page }) => {
  await page.waitForSelector('input[name="dateOfBirth"]');
  const dobInput = page.locator('input[name="dateOfBirth"]');
  await expect(dobInput).toBeVisible();
  await dobInput.fill('2035-01-01');
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  // ❌ BUG: Tanggal lahir masa depan diterima
  await expect(page.locator('div.oxd-toast')).toBeVisible();
});

test('TC_PD_007_NEG - Isi angka di kolom nama', async ({ page }) => {
  await page.locator('input[name="firstName"]').fill('123');
  await page.locator('input[name="lastName"]').fill('456');
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  // ❌ BUG: Nama angka tetap bisa disimpan
  await expect(page.locator('div.oxd-toast')).toBeVisible();
});

test('TC_PD_008_NEG - Kosongkan custom field Test_Field', async ({ page }) => {
  await page.waitForSelector('input[name="custom1"]');
  const testFieldInput = page.locator('input[name="custom1"]');
  await expect(testFieldInput).toBeVisible();
  await testFieldInput.fill('');
  const saveBtn = page.locator('form:has-text("Custom Fields") button:has-text("Save")');
  await expect(saveBtn).toBeVisible();
  await saveBtn.click();
  await expect(page.locator('form:has-text("Custom Fields")')).toContainText('Required');
});

test('TC_PD_009_NEG - Input HTML/script di field nama', async ({ page }) => {
  const firstName = page.locator('input[name="firstName"]');
  await expect(firstName).toBeVisible();
  await firstName.fill("<script>alert('XSS')</script>");
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  await expect(page.locator('div.oxd-toast')).toBeVisible();
});

test('TC_PD_010_NEG - Klik Save tanpa perubahan apa pun', async ({ page }) => {
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeEnabled();
  await saveBtn.click();
  await expect(page.locator('div.oxd-toast')).toBeVisible();
});
