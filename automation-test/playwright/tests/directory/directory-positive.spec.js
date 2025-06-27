const { test, expect } = require('@playwright/test');


async function search(page) {
    await page.getByRole('button', { name: 'Search' }).click();

    await page.waitForLoadState('networkidle', { timeout: 30000 });
}

async function reset(page) {
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
}

test.beforeEach(async ({ page }) => {
    console.log('--- Running beforeEach: Logging in and navigating to Directory ---');
    
    await page.goto('https://opensource-demo.orangehrmlive.com/');
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 30000 });
    await page.locator('input[name="username"]').fill('Admin');
    await page.locator('input[name="password"]').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    console.log('✅ Login berhasil dan di halaman Dashboard.');

    await page.getByRole('link', { name: 'Directory' }).click();
    
    await expect(page.locator('.oxd-topbar-header-breadcrumb-module')).toHaveText('Directory', { timeout: 45000 });
    console.log('✅ Halaman Directory terbuka dan header "Directory" terlihat.');

    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');
    await expect(recordsFoundTextLocator).toBeVisible({ timeout: 60000 });
    await expect(recordsFoundTextLocator).toContainText('Records Found', { timeout: 60000 });
    console.log('✅ Teks "Records Found" terlihat, menunjukkan data karyawan sudah dimuat.');

    const employeeNameCardHeaderLocator = page.locator('.orangehrm-directory-card-header');
    await expect(employeeNameCardHeaderLocator.first()).toBeVisible({ timeout: 60000 });
    console.log('✅ Kartu karyawan pertama terlihat, menunjukkan daftar karyawan sudah dirender.');
    console.log('--- beforeEach finished: Directory page should be loaded and ready ---');
});

test('TC_DIR_001 - Akses halaman Directory', async ({ page }) => {
    const employeeCardsCount = await page.locator('.orangehrm-directory-card-header').count();
    expect(employeeCardsCount).toBeGreaterThan(0); 
    console.log(`👍 TC_DIR_001 passed: Ditemukan ${employeeCardsCount} kartu karyawan.`);
});

test('TC_DIR_002 - Pencarian berdasarkan nama (Ranga)', async ({ page }) => {
    const employeeName = 'Ranga'; 
    const employeeNameInput = page.getByPlaceholder('Type for hints...');
    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');
    const employeeCardHeader = page.locator('.orangehrm-directory-card-header');

    await employeeNameInput.clear(); 
    await employeeNameInput.fill(employeeName);
    await search(page);

    await expect(recordsFoundTextLocator).toContainText('Record Found', { timeout: 30000 });
    await expect(employeeCardHeader).toHaveText('Ranga', { timeout: 30000 }); 
    console.log(`👍 TC_DIR_002 passed: Pencarian "${employeeName}" berhasil, card Ranga yang muncul.`);
});

test('TC_DIR_003 - Filter berdasarkan Job Title (QA Engineer)', async ({ page }) => {
    const jobTitle = 'QA Engineer'; 
    const jobTitleDropdown = page.locator('.oxd-select-wrapper').first(); 
    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');

    await jobTitleDropdown.click();
    await page.keyboard.press('ArrowDown'); 
    await page.keyboard.press('ArrowDown'); 
    await page.keyboard.press('Enter'); 
    
    await search(page);

    await expect(recordsFoundTextLocator).toContainText('Records Found', { timeout: 30000 });
    expect(await recordsFoundTextLocator.textContent()).not.toContain('(0) Records Found');
    console.log(`👍 TC_DIR_003 passed: Filter Job Title "${jobTitle}" berhasil.`);
});

test('TC_DIR_004 - Filter berdasarkan lokasi (Texas R&D Center)', async ({ page }) => {
    const location = 'Texas R&D Center'; 
    const locationDropdown = page.locator('.oxd-select-wrapper').last(); 
    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');

    await locationDropdown.click();
    await page.keyboard.press('ArrowDown'); 
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter'); 
       
    await search(page);

    await expect(recordsFoundTextLocator).toContainText('Records Found', { timeout: 30000 });
    expect(await recordsFoundTextLocator.textContent()).not.toContain('(0) Records Found');
    console.log(`👍 TC_DIR_004 passed: Filter Lokasi "${location}" berhasil.`);
});

test('TC_DIR_005 - Filter kombinasi nama + job title (Sebastian, Engineer)', async ({ page }) => {
    const employeeName = 'Sebastian'; 
    const jobTitle = 'Engineer'; 
    const employeeNameInput = page.getByPlaceholder('Type for hints...');
    const jobTitleDropdown = page.locator('.oxd-select-wrapper').first();
    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');
    const employeeCardHeader = page.locator('.orangehrm-directory-card-header');

    await employeeNameInput.clear();
    await employeeNameInput.fill(employeeName);

    await jobTitleDropdown.click();
    await page.keyboard.press('ArrowDown'); 
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter'); 
    await search(page);

    await expect(recordsFoundTextLocator).toContainText('Record Found', { timeout: 30000 }); 
    expect(await recordsFoundTextLocator.textContent()).not.toContain('(0) Records Found');
    await expect(employeeCardHeader).toHaveText(employeeName, { timeout: 30000 }); 
    console.log(`👍 TC_DIR_005 passed: Filter kombinasi Nama "${employeeName}" dan Job Title "${jobTitle}" berhasil.`);
});

test('TC_DIR_006 - Reset semua filter', async ({ page }) => {
    const employeeNameInput = page.getByPlaceholder('Type for hints...');
    const jobTitleDropdown = page.locator('.oxd-select-wrapper').first();
    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');

    await employeeNameInput.fill('Paul Collings'); 
    await jobTitleDropdown.click();
    await page.keyboard.press('ArrowDown'); 
    await page.keyboard.press('Enter'); 
    await search(page);
    await page.waitForLoadState('networkidle', { timeout: 30000 }); 

    console.log('Filter diterapkan sebelum reset.');

    await reset(page);

    await expect(employeeNameInput).toHaveValue(''); 
    await expect(jobTitleDropdown).toContainText('-- Select --'); 
    
    await expect(recordsFoundTextLocator).toContainText('Records Found', { timeout: 30000 });
    expect(await recordsFoundTextLocator.textContent()).not.toContain('(0) Records Found');
    const totalRecordsAfterReset = parseInt((await recordsFoundTextLocator.textContent()).match(/\((\d+)\) Records Found/)?.[1]);
    expect(totalRecordsAfterReset).toBeGreaterThan(1); 
    console.log(`👍 TC_DIR_006 passed: Filter berhasil direset. Total records: ${totalRecordsAfterReset}`);
});

test('TC_DIR_007 - Menampilkan seluruh data (298)', async ({ page }) => {
    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');

    await reset(page); 
    await search(page); 

    await expect(recordsFoundTextLocator).toContainText('Records Found', { timeout: 30000 });
    const currentRecordsCount = parseInt((await recordsFoundTextLocator.textContent()).match(/\((\d+)\) Records Found/)?.[1]);
    expect(currentRecordsCount).toBeGreaterThan(0);
    console.log(`👍 TC_DIR_007 passed: Seluruh data ditampilkan. Jumlah records: ${currentRecordsCount}`);
});

test('TC_DIR_008 - Tampilkan employee dengan nama ganda (Valentina)', async ({ page }) => {
    const employeeName = 'Valentina'; 
    const employeeNameInput = page.getByPlaceholder('Type for hints...');
    const recordsFoundTextLocator = page.locator('.orangehrm-horizontal-padding.orangehrm-vertical-padding .oxd-text--span');
    const employeeCardHeaders = page.locator('.orangehrm-directory-card-header'); 

    await employeeNameInput.clear();
    await employeeNameInput.fill(employeeName);
    await search(page);

    await page.waitForLoadState('networkidle', { timeout: 30000 });

    await expect(recordsFoundTextLocator).toContainText('Records Found', { timeout: 30000 });
    const recordsCount = parseInt((await recordsFoundTextLocator.textContent()).match(/\((\d+)\) Records Found/)?.[1]);
    expect(recordsCount).toBeGreaterThan(0); 
    
    const allNamesOnCards = await employeeCardHeaders.allTextContents();
    const namesWithValentina = allNamesOnCards.filter(name => name.includes(employeeName));
    
    expect(namesWithValentina.length).toBe(recordsCount); 
    console.log(`👍 TC_DIR_008 passed: Pencarian "${employeeName}" berhasil, ditemukan ${recordsCount} karyawan dengan nama Valentina.`);
});