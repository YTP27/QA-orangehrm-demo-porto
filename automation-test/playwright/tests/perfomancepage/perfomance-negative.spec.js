const { test, expect } = require('@playwright/test');


const login = async (page) => {
    await test.step('Login to OrangeHRM', async () => {
        await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(1000); 

        await page.getByPlaceholder('Username').fill('Admin');
        await page.getByPlaceholder('Password').fill('admin123');
        await page.getByRole('button', { name: 'Login' }).click();

        await page.waitForURL('**/web/index.php/dashboard/index', { timeout: 45000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); 
    });
};

const navigateToPerformanceManageReviews = async (page) => {
    await test.step('Navigate to Performance > Manage Reviews', async () => {
        await page.getByRole('link', { name: 'Performance' }).click();
        
        await page.waitForSelector('.oxd-table-filter', { state: 'visible', timeout: 60000 });
        await page.waitForLoadState('networkidle'); 
        await page.waitForTimeout(3000); 

        await expect(page.getByPlaceholder('Type for hints...')).toBeVisible({ timeout: 30000 });

        await expect(page.locator('div.oxd-date-input input[placeholder="yyyy-dd-mm"]').first()).toBeVisible({ timeout: 30000 });
        await expect(page.locator('div.oxd-date-input input[placeholder="yyyy-dd-mm"]').last()).toBeVisible({ timeout: 30000 });
    });
};

const fillDateInput = async (page, locator, dateString) => {
    await test.step(`Fill date input with: ${dateString}`, async () => {
        await expect(locator).toBeVisible(); 
        await locator.click();
        await page.waitForTimeout(300); 

        await locator.clear();
        await page.waitForTimeout(300);

        await locator.fill(dateString);
        await page.waitForTimeout(500); 
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500); 
    });
};

const verifySearchResults = async (page) => {
    await test.step('Verify search results (table or "No Records Found")', async () => {
        const noRecordsFoundMessage = page.locator('span.oxd-text.oxd-text--span:has-text("No Records Found")');
        const tableBody = page.locator('.oxd-table-body');
        
        await page.waitForSelector('span.oxd-text.oxd-text--span:has-text("No Records Found"), .oxd-table-body', { state: 'visible', timeout: 20000 });
        await page.waitForLoadState('networkidle'); 
        await page.waitForTimeout(2000); 

        const isNoRecordsVisible = await noRecordsFoundMessage.isVisible();
        if (isNoRecordsVisible) {
            await expect(noRecordsFoundMessage).toBeVisible(); 
        } else {
            await expect(tableBody).toBeVisible(); 
        }
    });
};

test.describe('Performance Page Negative Scenarios', () => {

    test.beforeEach(async ({ page }) => {
        await login(page);
        await navigateToPerformanceManageReviews(page);
    });

    test('TC_PR_001_NEG - Format tanggal tidak valid', async ({ page }) => {
        const fromDateInput = page.locator('div.oxd-date-input input[placeholder="yyyy-dd-mm"]').first();
        
        await fillDateInput(page, fromDateInput, '31-12-2025'); 
        
        const errorMessage = page.locator('span.oxd-text.oxd-text--span.oxd-input-field-error-message');
        
        const isErrorVisible = await errorMessage.isVisible();
        const isEmpty = await fromDateInput.inputValue() === '';

        expect(isErrorVisible || isEmpty).toBeTruthy(); 
        if (isErrorVisible) {
            await expect(errorMessage).toBeVisible();
            await expect(errorMessage).toHaveText('Should be a valid date'); 
        } else {
            await expect(fromDateInput).toHaveValue(''); 
        }

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await verifySearchResults(page); 
    });

    test('TC_PR_002_NEG - To Date lebih kecil dari From Date', async ({ page }) => {
        const fromDateInput = page.locator('div.oxd-date-input input[placeholder="yyyy-dd-mm"]').first();
        const toDateInput = page.locator('div.oxd-date-input input[placeholder="yyyy-dd-mm"]').last();

        await fillDateInput(page, fromDateInput, '2025-12-31');
        await fillDateInput(page, toDateInput, '2025-01-01');

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const validationMessage = page.locator('span.oxd-text.oxd-text--span:has-text("To Date cannot be earlier than From Date")');
        await expect(validationMessage).toBeVisible({ timeout: 10000 });

        await expect(fromDateInput.locator('xpath=./ancestor::div[contains(@class, "oxd-input-group")]')).toHaveCSS('border-color', 'rgb(235, 9, 16)'); 
        await expect(toDateInput.locator('xpath=./ancestor::div[contains(@class, "oxd-input-group")]')).toHaveCSS('border-color', 'rgb(235, 9, 16)'); 

        await verifySearchResults(page); 
    });

    test('TC_PR_003_NEG - Pencarian dengan karakter aneh di nama', async ({ page }) => {
        const employeeNameInput = page.getByPlaceholder('Type for hints...'); 
        await employeeNameInput.fill('#@!$%^&*'); 
        await page.waitForTimeout(2000); 

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        const noRecordsFoundMessage = page.locator('span.oxd-text.oxd-text--span:has-text("No Records Found")');
        await expect(noRecordsFoundMessage).toBeVisible({ timeout: 10000 });
    });

    test('TC_PR_004_NEG - Semua field kosong lalu Klik Search', async ({ page }) => {
        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page); 
    });

    test('TC_PR_005_NEG - Isi field Job Title secara manual', async ({ page }) => {
        const jobTitleDropdownClickable = page.locator('.oxd-select-wrapper').filter({ has: page.locator('label:has-text("Job Title")') }).locator('.oxd-select-text-input');
        const jobTitleDropdownOptions = page.locator('.oxd-select-dropdown');

        await expect(jobTitleDropdownClickable).toBeVisible();
        
        await jobTitleDropdownClickable.click();
        await page.waitForTimeout(500); 

        await page.waitForTimeout(1000); 

        const noOptionsMessage = jobTitleDropdownOptions.locator('span.oxd-text.oxd-text--span:has-text("No Records Found")');
        const optionsPresent = await jobTitleDropdownOptions.locator('.oxd-select-option').isVisible();

        if (await noOptionsMessage.isVisible()) {
            await expect(noOptionsMessage).toBeVisible();
        } else {
            await expect(jobTitleDropdownOptions.locator('.oxd-select-option')).not.toBeVisible();
        }

        await page.keyboard.press('Escape'); 
        await page.waitForTimeout(500);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        const noRecordsFoundMessage = page.locator('span.oxd-text.oxd-text--span:has-text("No Records Found")');
        await expect(noRecordsFoundMessage).toBeVisible({ timeout: 10000 });
    });
});