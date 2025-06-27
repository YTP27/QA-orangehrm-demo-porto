const { test, expect } = require('@playwright/test');
const path = require('path');

const TEST_ASSETS_DIR = path.join(__dirname, '..', 'assets');

test.beforeEach(async ({ page }) => {
    await page.goto('https://opensource-demo.orangehrmlive.com/');
    await expect(page.locator('input[name="username"]')).toBeVisible({ timeout: 30000 });
    await page.locator('input[name="username"]').fill('Admin');
    await page.locator('input[name="password"]').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 30000 });
    console.log('✅ Login berhasil dan di halaman Dashboard.'); 

    await page.getByRole('link', { name: 'Buzz' }).click();

    await expect(page.locator('.oxd-topbar-header-breadcrumb-module')).toHaveText('Buzz', { timeout: 45000 });
    console.log('✅ Halaman Buzz terbuka dan header "Buzz" terlihat.'); 

    await expect(page.getByPlaceholder("What's on your mind?")).toBeVisible({ timeout: 30000 });
    console.log('✅ Area posting status terlihat.'); 

    await page.locator('.orangehrm-buzz-newsfeed-posts').waitFor({ state: 'visible', timeout: 30000 });
    console.log('✅ Buzz newsfeed dimuat.'); 
    console.log('--- beforeEach finished: Buzz page should be loaded and ready ---');
});

test('TC_BUZZ_001_NEG - Verifikasi posting teks kosong', async ({ page }) => {
    console.log('Running TC_BUZZ_001_NEG - Verifikasi posting teks kosong');
    const postInput = page.getByPlaceholder("What's on your mind?");
    const postButton = page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main');

    await expect(postInput).toBeEmpty();
    await postButton.click();

    await expect(postButton).toBeDisabled({ timeout: 5000 }); 
    console.log('👍 TC_BUZZ_001_NEG passed: Tombol "Post" tetap disabled saat input kosong.');
});

test('TC_BUZZ_002_NEG - Verifikasi upload file non-gambar di "Share Photo"', async ({ page }) => {
    console.log('Running TC_BUZZ_002_NEG - Verifikasi upload file non-gambar di "Share Photo"');
    const photoButton = page.getByRole('button', { name: 'Share Photos' });
    const addPhotosModalTitle = page.getByText('Add Photos'); 

    await photoButton.click();
    await expect(addPhotosModalTitle).toBeVisible({ timeout: 15000 });

    const nonImagePath = path.join(TEST_ASSETS_DIR, 'dummy.pdf'); 
    console.log(`Mencoba mengunggah file non-gambar dari: ${nonImagePath}`);

    const fileInput = page.locator('input[type="file"].oxd-file-input');
    await expect(fileInput).toBeAttached({ timeout: 10000 }); 
    await fileInput.setInputFiles(nonImagePath);

    const errorMessageLocator = page.locator('.oxd-file-input-error');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText(/Invalid file type/i); 
    console.log('👍 TC_BUZZ_002_NEG passed: Pesan error tipe file tidak valid muncul.');

    const modalCloseButton = page.locator('.oxd-dialog-close-button');
    if (await modalCloseButton.isVisible()) {
        await modalCloseButton.click();
    }
});


test('TC_BUZZ_003_NEG - Verifikasi upload file non-video di "Share Video"', async ({ page }) => {
    console.log('Running TC_BUZZ_003_NEG - Verifikasi upload file non-video di "Share Video"');
    const videoButton = page.getByRole('button', { name: 'Share Video' });
    const shareVideoModalTitle = page.getByText('Share Video').first(); 

    await videoButton.click();
    await expect(shareVideoModalTitle).toBeVisible({ timeout: 15000 });

    const nonVideoPath = path.join(TEST_ASSETS_DIR, 'dummy.jpg'); 
    console.log(`Mencoba mengunggah file non-video dari: ${nonVideoPath}`);

    const fileInput = page.locator('input[type="file"].oxd-file-input');
    await expect(fileInput).toBeAttached({ timeout: 10000 });
    await fileInput.setInputFiles(nonVideoPath);

    const errorMessageLocator = page.locator('.oxd-file-input-error');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText(/Invalid file type/i); 
    console.log('👍 TC_BUZZ_003_NEG passed: Pesan error tipe file tidak valid muncul.');

    const modalCloseButton = page.locator('.oxd-dialog-close-button');
    if (await modalCloseButton.isVisible()) {
        await modalCloseButton.click();
    }
});

test('TC_BUZZ_004_NEG - Verifikasi komentar kosong', async ({ page }) => {
    console.log('Running TC_BUZZ_004_NEG - Verifikasi komentar kosong');
    const postInput = page.getByPlaceholder("What's on your mind?");
    const postButton = page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main');

    const dummyPostText = `Test Komentar Kosong - ${Date.now()}`;
    await postInput.fill(dummyPostText);
    await postButton.click();

    await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#oxd-toaster_1')).toBeHidden({ timeout: 10000 });


    const dummyPostLocator = page.locator(`.orangehrm-buzz-post-body-text:has-text("${dummyPostText}")`).first();
    await expect(dummyPostLocator).toBeVisible({ timeout: 15000 });

    const firstPostCommentButton = page.locator('.orangehrm-buzz-post-actions button i.bi-chat-text-fill').first();
    await firstPostCommentButton.click();

    const commentInput = page.locator('textarea[placeholder="Write your comment..."]');
    const commentSubmitButton = page.locator('.orangehrm-buzz-comment-box-slot button[type="submit"]');

    await expect(commentInput).toBeEmpty();
    await commentSubmitButton.click();

    await expect(commentSubmitButton).toBeDisabled({ timeout: 5000 });
    console.log('👍 TC_BUZZ_004_NEG passed: Tombol "Post" komentar tetap disabled saat input kosong.');
});


test('TC_BUZZ_005_NEG - Verifikasi posting teks terlalu panjang', async ({ page }) => {
    console.log('Running TC_BUZZ_005_NEG - Verifikasi posting teks terlalu panjang');
    const postInput = page.getByPlaceholder("What's on your mind?");
    const postButton = page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main');

    const longText = 'a'.repeat(2000); 
    await postInput.fill(longText);

    await postButton.click();

    const errorMessageLocator = page.locator('.oxd-input-group__message');
    await expect(errorMessageLocator).toBeVisible({ timeout: 10000 });
    await expect(errorMessageLocator).toHaveText(/The post must not be greater than 255 characters./i); 
    console.log('👍 TC_BUZZ_005_NEG passed: Pesan error batas karakter muncul.');
});

test('TC_BUZZ_006_NEG - Verifikasi posting tanpa koneksi internet', async ({ page }) => {
    console.log('Running TC_BUZZ_006_NEG - Verifikasi posting tanpa koneksi internet');
    await page.route('**/web/index.php/api/v2/buzz/posts', route => {
        route.abort('failed'); 
    });

    const postText = `Test Tanpa Koneksi - ${Date.now()}`;
    const postInput = page.getByPlaceholder("What's on your mind?");
    const postButton = page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main');

    await postInput.fill(postText);
    await postButton.click();

    const errorMessageLocator = page.locator('#oxd-toaster_1'); 
    await expect(errorMessageLocator).toBeVisible({ timeout: 15000 });
    await expect(errorMessageLocator).toHaveText(/Failed to add post|Network Error/i); 


    const newPostLocator = page.locator(`.orangehrm-buzz-post-body-text:has-text("${postText}")`).first();
    await expect(newPostLocator).not.toBeVisible({ timeout: 15000 }); 
    console.log('👍 TC_BUZZ_006_NEG passed: Pesan error koneksi muncul dan postingan tidak terbuat.');
});

test('TC_BUZZ_007_NEG - Verifikasi upload file ukuran besar', async ({ page }) => {
    console.log('Running TC_BUZZ_007_NEG - Verifikasi upload file ukuran besar');
    const videoButton = page.getByRole('button', { name: 'Share Video' });
    const shareVideoModalTitle = page.getByText('Share Video').first();

    await videoButton.click();
    await expect(shareVideoModalTitle).toBeVisible({ timeout: 15000 });

    const largeVideoPath = path.join(TEST_ASSETS_DIR, 'large_video.mp4');
    console.log(`Mencoba mengunggah file video besar dari: ${largeVideoPath}`);

    const fileInput = page.locator('input[type="file"].oxd-file-input');
    await expect(fileInput).toBeAttached({ timeout: 10000 });
    await fileInput.setInputFiles(largeVideoPath);

    const errorMessageLocator = page.locator('.oxd-file-input-error'); 
    await expect(errorMessageLocator).toBeVisible({ timeout: 30000 }); 
    await expect(errorMessageLocator).toHaveText(/The video must not be greater than/i); 
    console.log('👍 TC_BUZZ_007_NEG passed: Pesan error ukuran file terlalu besar muncul.');

    const modalCloseButton = page.locator('.oxd-dialog-close-button');
    if (await modalCloseButton.isVisible()) {
        await modalCloseButton.click();
    }
});


test('TC_BUZZ_008_NEG - Verifikasi share post gagal karena timeout', async ({ page }) => {
    console.log('Running TC_BUZZ_008_NEG - Verifikasi share post gagal karena timeout');
    await page.route('**/web/index.php/api/v2/buzz/posts', route => {
        route.abort(); 
    });

    const postText = `Test Timeout Share - ${Date.now()}`;
    const postInput = page.getByPlaceholder("What's on your mind?");
    const postButton = page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main');

    await postInput.fill(postText);
    await postButton.click();

    const errorMessageLocator = page.locator('#oxd-toaster_1'); 
    await expect(errorMessageLocator).toBeVisible({ timeout: 15000 });
    await expect(errorMessageLocator).toHaveText(/Failed to add post|Request timed out/i); 

    const newPostLocator = page.locator(`.orangehrm-buzz-post-body-text:has-text("${postText}")`).first();
    await expect(newPostLocator).not.toBeVisible({ timeout: 15000 });
    console.log('👍 TC_BUZZ_008_NEG passed: Postingan tidak muncul dan/atau pesan error timeout muncul.');
});