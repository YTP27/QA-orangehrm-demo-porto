// tests/directory/directory-negative.spec.js

const { test, expect } = require('@playwright/test');

// Fungsi helper sederhana untuk klik tombol Search
async function search(page) {
    await page.getByRole('button', { name: 'Search' }).click();
    // Tunggu hingga network activities stabil setelah search
    await page.waitForLoadState('networkidle', { timeout: 30000 });
}

// Fungsi helper sederhana untuk klik tombol Reset (mungkin tidak terlalu dibutuhkan untuk negative tests, tapi baik ada)
async function reset(page) {
    await page.getByRole('button', { name: 'Reset' }).click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
}

test.beforeEach(async ({ page }) => {
    console.log('--- Running beforeEach: Logging in and navigating to Directory ---');
    
    // Login Section
    await page.goto('https://opensource-demo.orangehrmlive.com/');
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 30000 });
    await page.locator('input[name="username"]').fill('Admin');
    await page.locator('input[name="password"]').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    console.log('✅ Login berhasil dan di halaman Dashboard.');

    // Navigasi ke halaman Directory
    await page.getByRole('link', { name: 'Directory' }).click();
    
    // Verifikasi bahwa halaman Directory sudah terbuka dengan elemen-elemennya
    await expect(page.locator('.oxd-topbar-header-breadcrumb-module')).toHaveText('Directory', { timeout: 45000 });
    console.log('✅ Halaman Directory terbuka dan header "Directory" terlihat.');

    // Pastikan tidak ada hasil yang ditampilkan dari sebelumnya, atau reset.
    // Untuk negative test, ini bisa diabaikan karena kita memang mencari "No Records Found".
    // Namun, reset bisa membantu memastikan kondisi awal bersih.
    await reset(page); // Reset semua filter sebelum setiap test case negatif
    console.log('--- beforeEach finished: Directory page should be loaded and ready ---');
});

test('TC_DIR_001_NEG - Pencarian nama dengan karakter spesial (@#%!)', async ({ page }) => {
    const invalidName = '@#%!'; // Test Data dari sheet
    const employeeNameInput = page.getByPlaceholder('Type for hints...');
    const noRecordsFoundText = page.locator('.oxd-text--span:has-text("No Records Found")');

    await employeeNameInput.clear();
    await employeeNameInput.fill(invalidName);
    await search(page);

    // Expected: Tidak ada hasil ditampilkan, muncul pesan "No Records Found"
    await expect(noRecordsFoundText).toBeVisible({ timeout: 30000 });
    console.log(`👍 TC_DIR_001_NEG passed: Pencarian dengan karakter spesial "${invalidName}" menampilkan "No Records Found".`);
});

test('TC_DIR_002_NEG - Nama tidak sesuai data manapun (Xyzabc)', async ({ page }) => {
    const nonExistentName = 'Xyzabc'; // Test Data dari sheet
    const employeeNameInput = page.getByPlaceholder('Type for hints...');
    const noRecordsFoundText = page.locator('.oxd-text--span:has-text("No Records Found")');

    await employeeNameInput.clear();
    await employeeNameInput.fill(nonExistentName);
    await search(page);

    // Expected: Tidak ada hasil ditampilkan, muncul pesan "No Records Found"
    await expect(noRecordsFoundText).toBeVisible({ timeout: 30000 });
    console.log(`👍 TC_DIR_002_NEG passed: Pencarian nama tidak ada "${nonExistentName}" menampilkan "No Records Found".`);
});

test('TC_DIR_003_NEG - Pilih lokasi tanpa employee terkait (Ghost Office)', async ({ page }) => {
    const nonExistentLocation = 'Ghost Office'; // Test Data dari sheet
    const locationDropdown = page.locator('.oxd-select-wrapper').last(); // Dropdown Location
    const noRecordsFoundText = page.locator('.oxd-text--span:has-text("No Records Found")');

    await locationDropdown.click();
    // Menggunakan fill dan keyboard.press karena kita tidak bisa mengklik opsi yang tidak ada.
    // Jika dropdown OrangeHRM memungkinkan mengetik dan kemudian tidak menemukan, ini akan bekerja.
    // Namun, jika dropdown hanya mengizinkan pilihan dari daftar, kita perlu pendekatan lain.
    // Berdasarkan pengalaman sebelumnya, Playwright bisa mengklik jika teks ada, tapi ini adalah negatif test.
    // Mari coba pendekatan umum, yaitu mengetik di input dropdown (jika ada) atau mencoba klik opsi yang tidak ada
    // dan mengharapkan "No Records Found".
    
    // Asumsi: Mungkin ada input di dalam dropdown yang bisa di-fill atau langsung mencari teks setelah dropdown diklik.
    // Coba fill di dalam dropdown itu sendiri jika ada inputnya.
    // Atau, jika 'Ghost Office' adalah opsi yang *tidak ada* di dropdown, Playwright akan gagal mengklik.
    // Cara paling aman untuk negative case ini: klik dropdown, lalu coba isi dengan nilai yang tidak ada,
    // kemudian search dan cek 'No Records Found'. Jika dropdown tidak memungkinkan ketik bebas:
    // Paling realistis adalah memilih Job Title/Location yang diketahui tidak memiliki karyawan (jika ada di data Anda),
    // atau memverifikasi bahwa opsi 'Ghost Office' tidak ada di daftar.
    
    // **************************************************************************
    // * KRITIS: Untuk test case ini, saya butuh konfirmasi: apakah "Ghost Office"
    // * adalah nama lokasi yang *memang ada di dropdown tapi tidak ada employeenya*
    // * ATAU "Ghost Office" adalah nama lokasi yang *TIDAK ADA SAMA SEKALI di dropdown*?
    // *
    // * Jika TIDAK ADA SAMA SEKALI, kita tidak bisa mengklik/memilihnya.
    // * Test case ini harus diverifikasi secara berbeda, misalnya:
    // * - Buka dropdown, cek bahwa "Ghost Office" tidak ada dalam opsi. (Ini agak di luar skenario "filter")
    // * - Atau, pilih lokasi yang ADA di dropdown, tapi Anda tahu tidak ada employeenya.
    // *
    // * Untuk sementara, saya asumsikan "Ghost Office" *tidak akan muncul sebagai opsi*
    // * atau tidak akan mengembalikan hasil saat diketik di input dropdown (jika ada).
    // * Kita akan coba fill pada input yang muncul setelah klik dropdown.
    // **************************************************************************

    // Mencari input di dalam dropdown setelah diklik (jika ada)
    const dropdownSearchInput = page.locator('.oxd-select-wrapper').last().locator('input'); 
    
    // Klik dropdown untuk membukanya
    await locationDropdown.click(); 
    // Tunggu dropdown options muncul
    await page.waitForTimeout(500); // Beri sedikit waktu untuk dropdown options muncul
    
    // Coba fill pada input yang muncul di dalam dropdown. (Ini adalah asumsi)
    // Beberapa dropdown punya input tersembunyi yang muncul saat diklik.
    // Jika tidak ada input, baris ini akan gagal.
    await dropdownSearchInput.fill(nonExistentLocation); 
    await page.keyboard.press('Enter'); // Tekan Enter untuk "memilih" atau mengkonfirmasi input

    await search(page);

    // Expected: Tidak ada hasil ditampilkan
    await expect(noRecordsFoundText).toBeVisible({ timeout: 30000 });
    console.log(`👍 TC_DIR_003_NEG passed: Filter lokasi "${nonExistentLocation}" menampilkan "No Records Found".`);
});

test('TC_DIR_004_NEG - Kombinasi nama dan lokasi tidak cocok (Valentina + Jakarta HQ)', async ({ page }) => {
    const employeeName = 'Valentina'; // Test Data dari sheet
    const nonMatchingLocation = 'Jakarta HQ'; // Test Data dari sheet
    const employeeNameInput = page.getByPlaceholder('Type for hints...');
    const locationDropdown = page.locator('.oxd-select-wrapper').last();
    const noRecordsFoundText = page.locator('.oxd-text--span:has-text("No Records Found")');

    await employeeNameInput.clear();
    await employeeNameInput.fill(employeeName);

    await locationDropdown.click();
    // Menggunakan fill pada input dropdown untuk lokasi
    const dropdownSearchInput = page.locator('.oxd-select-wrapper').last().locator('input'); 
    await page.waitForTimeout(500); // Beri sedikit waktu
    await dropdownSearchInput.fill(nonMatchingLocation);
    await page.keyboard.press('Enter');

    await search(page);

    // Expected: Tidak ada hasil, "No Records Found"
    await expect(noRecordsFoundText).toBeVisible({ timeout: 30000 });
    console.log(`👍 TC_DIR_004_NEG passed: Filter kombinasi "${employeeName}" dan lokasi tidak cocok "${nonMatchingLocation}" menampilkan "No Records Found".`);
});