const { test, expect } = require('@playwright/test');

async function clickTimesheetFilterView(page) {
  await page.getByRole('button', { name: 'View', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');
  await page.locator('input[name="username"]').fill('Admin');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/dashboard/);
  await page.getByRole('link', { name: 'Time' }).click();
  await expect(page.locator('h6')).toContainText('Select Employee');
});

test('TC_TS_001 - Input nama yang tidak ada', async ({ page }) => {
  await page.getByPlaceholder('Type for hints...').fill('ZZZUserNotExist');
  await clickTimesheetFilterView(page);
  await expect(page.locator('.orangehrm-horizontal-padding')).toContainText('No Records Found');
});

test('TC_TS_002 - Input karakter spesial di Employee Name', async ({ page }) => {
  await page.getByPlaceholder('Type for hints...').fill('@#$%^&*');
  await clickTimesheetFilterView(page);
  await expect(page.locator('.orangehrm-horizontal-padding')).toContainText('No Records Found');
});

test('TC_TS_003 - Klik View saat server mati (simulasi offline)', async ({ page, context }) => {
  await page.route('**/api/**', route => route.abort());
  await page.getByPlaceholder('Type for hints...').fill('ala');
  await clickTimesheetFilterView(page);
  await expect(page).toHaveURL(/viewEmployeeTimesheet/);
});

test('TC_TS_004 - Klik View pada row data dengan ID tidak valid (simulasi)', async ({ page }) => {
  const name = 'ala';
  await page.getByPlaceholder('Type for hints...').fill(name);
  await page.locator('.oxd-autocomplete-option').first().click();
  await clickTimesheetFilterView(page);
  await page.evaluate(() => {
    const viewBtn = document.querySelector('.oxd-table-body .oxd-table-row button');
    if (viewBtn) viewBtn.setAttribute('data-id', 'invalid');
  });
  await page.locator('.oxd-table-body .oxd-table-row').first().getByRole('button', { name: 'View' }).click();
  await expect(page.locator('h6')).toBeVisible();
});

test('TC_TS_005 - Tekan Enter tanpa klik View', async ({ page }) => {
  await page.getByPlaceholder('Type for hints...').fill('ala');
  await page.keyboard.press('Enter');
  await expect(page.locator('.oxd-table-body')).not.toBeVisible();
});

test('TC_TS_006 - Input lebih dari 256 karakter', async ({ page }) => {
  const longInput = 'a'.repeat(300);
  await page.getByPlaceholder('Type for hints...').fill(longInput);
  await clickTimesheetFilterView(page);
  await expect(page.locator('.orangehrm-horizontal-padding')).toContainText('No Records Found');
});

test('TC_TS_007 - Klik View berulang dalam <1 detik', async ({ page }) => {
  const name = 'ala';
  await page.getByPlaceholder('Type for hints...').fill(name);
  await page.locator('.oxd-autocomplete-option').first().click();
  await clickTimesheetFilterView(page);
  const button = page.locator('.oxd-table-body .oxd-table-row').first().getByRole('button', { name: 'View' });
  await Promise.all([
    button.click(),
    button.click(),
    button.click()
  ]);
  await expect(page.locator('h6')).toContainText('Timesheet for');
});
