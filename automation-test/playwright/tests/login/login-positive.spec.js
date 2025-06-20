const { test, expect } = require('@playwright/test');

test('login dengan username & password valid', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  await page.getByPlaceholder('Username').fill('yuddzzz');
  await page.getByPlaceholder('Password').fill('admin123');

  await page.getByRole('button', { name: 'Login' }).click();

  // pastikan redirect ke dashboard
  await expect(page).toHaveURL(/dashboard/);
});
