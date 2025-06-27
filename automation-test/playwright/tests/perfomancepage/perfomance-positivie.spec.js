const { test, expect } = require('@playwright/test');

const login = async (page) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); 

    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForURL('**/web/index.php/dashboard/index', { timeout: 45000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); 
};

const navigateToPerformanceManageReviews = async (page) => {
    await page.getByRole('link', { name: 'Performance' }).click();
    
    await page.waitForSelector('.oxd-table-filter', { state: 'visible', timeout: 60000 });
    await page.waitForLoadState('networkidle'); 
    await page.waitForTimeout(3000); 

    await expect(page.getByPlaceholder('Type for hints...')).toBeVisible({ timeout: 30000 });
};

const verifySearchResults = async (page) => {
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
};

function isSortedAscending(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) {
            return false;
        }
    }
    return true;
}

function isSortedDescending(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < arr[i + 1]) {
            return false;
        }
    }
    return true;
}

test.describe('Performance Page Positive Scenarios', () => {

    test.beforeEach(async ({ page }) => {
        await login(page);
        await navigateToPerformanceManageReviews(page);
    });

    test('TC_PR_001 - Akses halaman Manage Reviews', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Employee Reviews' })).toBeVisible({ timeout: 10000 });
    });

    test('TC_PR_002 - Filter berdasarkan Employee Name', async ({ page }) => {
        await page.getByPlaceholder('Type for hints...').fill('Odis');
        await page.waitForTimeout(2000); 
        await page.locator('.oxd-autocomplete-option').first().click();
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page);
    });

    test('TC_PR_003 - Filter berdasarkan Job Title', async ({ page }) => {
        const jobTitleDropdownClickable = page.locator('.oxd-select-wrapper').nth(0).locator('.oxd-select-text-input');
        await expect(jobTitleDropdownClickable).toBeVisible({ timeout: 15000 });
        await jobTitleDropdownClickable.click(); 
        await page.waitForTimeout(1000); 

        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter'); 
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page);
    });

    test('TC_PR_004 - Filter berdasarkan Sub Unit', async ({ page }) => {
        const subUnitDropdownClickable = page.locator('.oxd-select-wrapper').nth(1).locator('.oxd-select-text-input');
        await expect(subUnitDropdownClickable).toBeVisible({ timeout: 15000 });
        await subUnitDropdownClickable.click(); 
        await page.waitForTimeout(1000);

        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter'); 
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page);
    });

    test('TC_PR_005 - Filter berdasarkan Review Status', async ({ page }) => {
        const reviewStatusDropdownClickable = page.locator('.oxd-select-wrapper').nth(3).locator('.oxd-select-text-input');
        await expect(reviewStatusDropdownClickable).toBeVisible({ timeout: 15000 });
        await reviewStatusDropdownClickable.click(); 
        await page.waitForTimeout(1000);

        await page.keyboard.press('ArrowDown'); 
        await page.keyboard.press('ArrowDown'); 
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter'); 
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page);
    });

    test('TC_PR_006 - Filter berdasarkan tanggal review', async ({ page }) => {
        const fromDateInput = page.locator('label:has-text("From Date") + div input');
        const toDateInput = page.locator('label:has-text("To Date") + div input');

        await expect(fromDateInput).toBeVisible({ timeout: 10000 });
        await fromDateInput.fill('2023-01-01');
        await page.keyboard.press('Escape'); 
        await page.waitForTimeout(500);

        await expect(toDateInput).toBeVisible({ timeout: 10000 });
        await toDateInput.fill('2023-12-31');
        await page.keyboard.press('Escape'); 
        await page.waitForTimeout(500);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page);
    });

    test('TC_PR_007 - Reset filter', async ({ page }) => {
        const employeeNameInput = page.getByPlaceholder('Type for hints...'); 
        await employeeNameInput.fill('Paul'); 
        await page.waitForTimeout(2000);
        await page.locator('.oxd-autocomplete-option').first().click();
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Reset' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await expect(employeeNameInput).toHaveValue(''); 
        await verifySearchResults(page); 
    });

    test('TC_PR_008 - Include: All Employees', async ({ page }) => {
        const includeDropdownClickable = page.locator('.oxd-select-wrapper').nth(2).locator('.oxd-select-text-input');
        await expect(includeDropdownClickable).toBeVisible({ timeout: 15000 });
        await includeDropdownClickable.click(); 
        await page.waitForTimeout(1000);

        await page.keyboard.press('ArrowUp'); 
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter'); 
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page);
    });

    test('TC_PR_009 - Include: Current Employees Only', async ({ page }) => {
        const includeDropdownClickable = page.locator('.oxd-select-wrapper').nth(2).locator('.oxd-select-text-input');
        await expect(includeDropdownClickable).toBeVisible({ timeout: 15000 });
        await includeDropdownClickable.click(); 
        await page.waitForTimeout(1000);

        await page.keyboard.press('ArrowDown'); 
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter'); 
        await page.waitForTimeout(1000);

        await page.getByRole('button', { name: 'Search' }).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        await verifySearchResults(page);
    });

    test('TC_PR_010 - Sort kolom Review Period', async ({ page }) => {
        const reviewPeriodHeader = page.locator('.oxd-table-header-cell').filter({ hasText: 'Review Period' });
        await expect(reviewPeriodHeader).toBeVisible({ timeout: 10000 });
        await reviewPeriodHeader.click(); 
        await page.waitForTimeout(1000);

        await page.locator('.oxd-table-header-sort-dropdown-item:has-text("Ascending")').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        const reviewPeriodsAsc = await page.locator('.oxd-table-body .oxd-table-row .oxd-table-cell:nth-child(4)').allTextContents();
        const filteredReviewPeriodsAsc = reviewPeriodsAsc.filter(text => text.trim() !== '');
        if (filteredReviewPeriodsAsc.length > 0) {
            expect(isSortedAscending(filteredReviewPeriodsAsc)).toBeTruthy();
        }
        await verifySearchResults(page); 

        await reviewPeriodHeader.click(); 
        await page.waitForTimeout(1000);
        
        await page.locator('.oxd-table-header-sort-dropdown-item:has-text("Descending")').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        const reviewPeriodsDesc = await page.locator('.oxd-table-body .oxd-table-row .oxd-table-cell:nth-child(4)').allTextContents();
        const filteredReviewPeriodsDesc = reviewPeriodsDesc.filter(text => text.trim() !== '');
        if (filteredReviewPeriodsDesc.length > 0) {
            expect(isSortedDescending(filteredReviewPeriodsDesc)).toBeTruthy();
        }
        await verifySearchResults(page); 
    });
});