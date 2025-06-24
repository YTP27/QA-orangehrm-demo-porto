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
  await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await login(page);
  await navigateToMyInfo(page);
});

test('TC_PD_001 - Akses halaman Personal Details', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'PIM' })).toBeVisible();
});

test('TC_PD_002 - Edit dan simpan nama lengkap', async ({ page }) => {
  await page.locator('input[name="firstName"]').fill('Roberto');
  await page.locator('input[name="middleName"]').fill('Vinicius');
  await page.locator('input[name="lastName"]').fill('Sincariuc');
  await page.locator('form:has-text("Employee Full Name") button:has-text("Save")').click();
});

test('TC_PD_003 - Edit dan simpan informasi lisensi', async ({ page }) => {
  const licenseInput = page.locator('input').nth(4);
  const expiryInput = page.locator('input').nth(5);
  await licenseInput.fill('12345678');
  await expiryInput.fill('2031-12-04');
  await page.locator('form:has-text("License Expiry Date") button:has-text("Save")').click();
});

test('TC_PD_004 - Edit informasi tanggal lahir', async ({ page }) => {
  const dobInput = page.locator('input[placeholder="yyyy-dd-mm"]').last();
  await dobInput.fill('1996-08-12');
  await page.locator('form:has-text("Date of Birth") button:has-text("Save")').click();
});

test('TC_PD_005 - Pilih gender dan marital status', async ({ page }) => {
  await page.getByRole('radio', { name: 'Male', exact: true }).check();
  await page.getByText('Single').click();
  await page.locator('form:has-text("Marital Status") button:has-text("Save")').click();
});

test('TC_PD_006 - Pilih nationality', async ({ page }) => {
  const nationalityDropdown = page.locator('div:has(label:has-text("Nationality")) .oxd-select-text').first();
  await nationalityDropdown.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.locator('form:has-text("Nationality") button:has-text("Save")').click();
});

test('TC_PD_007 - Simpan informasi di Custom Fields', async ({ page }) => {
  const bloodTypeDropdown = page.locator('div:has(label:has-text("Blood Type")) .oxd-select-text').first();
  await bloodTypeDropdown.click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  const testFieldInput = page.locator('div:has(label:text("Test_Field")) input');
  await expect(testFieldInput).toBeVisible();
  await testFieldInput.fill('2255');
  await page.locator('form:has-text("Custom Fields") button:has-text("Save")').click();
});

test('TC_PD_008 - Upload file attachment', async ({ page }) => {
  await page.locator('button.oxd-button--text:has(i.bi-plus)').click();
  await page.setInputFiles('input[type="file"]', 'tests/assets/test.png');
  await page.getByPlaceholder('Type comment here').fill('test');
  await expect(page.locator('form:has-text("Attachment") button:has-text("Save")')).toBeVisible();
  await page.locator('form:has-text("Attachment") button:has-text("Save")').click();
});

test('TC_PD_009 - Lihat file attachment', async ({ page }) => {
  const fileRow = page.locator('div.oxd-table-row:has(div:has-text("test.png"))');
  const downloadBtn = fileRow.locator('div.oxd-table-cell-actions button').last();
  await expect(downloadBtn).toBeVisible({ timeout: 10000 });
  await downloadBtn.click();
});

test('TC_PD_010 - Edit attachment description', async ({ page }) => {
  const fileRow = page.locator('div.oxd-table-row:has(div:has-text("test.png"))');
  const editButton = fileRow.locator('div.oxd-table-cell-actions button').first();
  await expect(editButton).toBeVisible();
  await editButton.click();

  const commentInput = page.getByPlaceholder('Type comment here');
  await expect(commentInput).toBeVisible();
  await commentInput.fill('updated');

  // Gunakan relasi DOM dari input -> tombol Save terdekat
  const formContainer = commentInput.locator('xpath=ancestor::form');
  const saveButton = formContainer.locator('button[type="submit"]:has-text("Save")');

  await expect(saveButton).toBeVisible({ timeout: 5000 });
  await saveButton.click();
});


test('TC_PD_011 - Hapus attachment', async ({ page }) => {
  const deleteButton = page.locator('div.oxd-table-cell-actions button:has(i.bi-trash)').first();
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await page.getByRole('button', { name: 'Yes, Delete' }).click();
});
