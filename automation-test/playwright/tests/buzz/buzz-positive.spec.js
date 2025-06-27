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

    await page.getByRole('link', { name: 'Buzz' }).click();
    
    await expect(page.locator('.oxd-topbar-header-breadcrumb-module')).toHaveText('Buzz', { timeout: 45000 });
    
    await expect(page.getByPlaceholder("What's on your mind?")).toBeVisible({ timeout: 30000 });

    await page.locator('.orangehrm-buzz-newsfeed-posts').waitFor({ state: 'visible', timeout: 30000 });
});

test('TC_BUZZ_001 - Verifikasi posting status teks saja', async ({ page }) => {
    const postText = `Selamat pagi semua - ${Date.now()}`; 
    const postInput = page.getByPlaceholder("What's on your mind?");
    const postButton = page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main'); 

    await postInput.fill(postText);
    await postButton.click();

    await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 10000 });
});

test('TC_BUZZ_002 - Verifikasi posting teks dengan menyebutkan pengguna (mention)', async ({ page }) => {
    const postText = `Meeting nanti sore jam 3 dengan `;
    const mentionUser = 'Paul Collings'; 
    const expectedFullPostText = `${postText}@${mentionUser}`;
    
    const postInput = page.getByPlaceholder("What's on your mind?");
    const postButton = page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main');

    await postInput.fill(postText);
    
    await postInput.type('@'); 
    await page.waitForTimeout(1000); 
    
    await postInput.type('paul'); 
    
    const mentionOptionLocator = page.locator(`.oxd-mentions-dropdown-list-item:has-text("${mentionUser}")`).first();
    await expect(mentionOptionLocator).toBeVisible({ timeout: 10000 });
    await mentionOptionLocator.click();
    
    await postButton.click();

    await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 10000 });
});

test('TC_BUZZ_003 - Verifikasi posting dengan foto', async ({ page }) => {
    const photoButton = page.getByRole('button', { name: 'Share Photos' });
    const modalPostButton = page.locator('.orangehrm-buzz-post-modal-actions button[type="submit"]');

    const imageFileName = 'mobil.jpg'; 
    const imagePath = path.join(TEST_ASSETS_DIR, imageFileName); 

    await photoButton.click(); 

    await expect(page.getByText('Add Photos')).toBeVisible({ timeout: 15000 }); 

    const fileInput = page.locator('input[type="file"].oxd-file-input');
    await expect(fileInput).toBeAttached({ timeout: 15000 }); 

    await fileInput.setInputFiles(imagePath);

    await expect(modalPostButton).toBeEnabled({ timeout: 15000 }); 

    await modalPostButton.click(); 

    await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 20000 }); 
});

test('TC_BUZZ_004 - Verifikasi posting dengan video', async ({ page }) => {
    const videoButton = page.getByRole('button', { name: 'Share Video' });
    const modalPostButton = page.locator('.orangehrm-buzz-post-modal-actions button[type="submit"]');

    const videoFileName = 'nama_video_anda.mp4'; 
    const videoPath = path.join(TEST_ASSETS_DIR, videoFileName);

    await videoButton.click(); 

    await expect(page.getByText('Share Video')).toBeVisible({ timeout: 15000 }); 

    const fileInput = page.locator('input[type="file"].oxd-file-input');
    await expect(fileInput).toBeAttached({ timeout: 15000 }); 

    await fileInput.setInputFiles(videoPath);

    await expect(modalPostButton).toBeEnabled({ timeout: 15000 }); 

    await modalPostButton.click(); 

    await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 15000 }); 
});


test('TC_BUZZ_005 - Verifikasi fungsi like (suka)', async ({ page }) => {
    const firstPostLikeButton = page.locator('.orangehrm-buzz-post-actions button i.bi-heart-fill').first();
    const firstPostLikeCountLocator = page.locator('.orangehrm-buzz-post').first().locator('.orangehrm-buzz-stats-row .oxd-text--p'); 
    const firstPostTextLocator = page.locator('.orangehrm-buzz-post-body-text').first();

    if (!await firstPostTextLocator.isVisible()) {
        const postTextForLike = `Test Post for Liking! - ${Date.now()}`;
        await page.getByPlaceholder("What's on your mind?").fill(postTextForLike);
        await page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main').click();
        
        await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('#oxd-toaster_1')).toBeHidden({ timeout: 10000 });

        await page.waitForLoadState('networkidle', { timeout: 30000 });
        await page.waitForTimeout(3000); 
        await expect(firstPostTextLocator).toBeVisible({ timeout: 15000 });
        await firstPostLikeCountLocator.waitFor({ state: 'visible', timeout: 30000 }); 
        await firstPostLikeCountLocator.waitFor(async (locator) => (await locator.textContent()).trim() !== '', { timeout: 10000 });
    }
    
    let initialLikeCountText = await firstPostLikeCountLocator.textContent({ timeout: 10000 }); 
    let initialLikes = parseInt(initialLikeCountText.replace(/\D/g, '')); 

    await firstPostLikeButton.click();
    
    await page.waitForTimeout(1000); 
    await page.waitForLoadState('networkidle', { timeout: 30000 }); 

    await firstPostLikeCountLocator.waitFor(async (locator) => {
        const currentText = await locator.textContent();
        const currentLikes = parseInt(currentText.replace(/\D/g, ''));
        return currentLikes === initialLikes + 1 || currentLikes === initialLikes - 1; 
    }, { timeout: 15000 });

    let updatedLikeCountText = await firstPostLikeCountLocator.textContent({ timeout: 10000 }); 
    let updatedLikes = parseInt(updatedLikeCountText.replace(/\D/g, '')); 

    expect(updatedLikes).toBe(initialLikes + 1);
});

test('TC_BUZZ_006 - Verifikasi fungsi komentar', async ({ page }) => {
    console.log('Running TC_BUZZ_006 - Verifikasi fungsi komentar');
    const commentText = `Mantap banget! - ${Date.now()}`;
    const firstPostCommentButton = page.locator('.orangehrm-buzz-post-actions button i.bi-chat-text-fill').first();
    const firstPostLocator = page.locator('.orangehrm-buzz-post').first();

    await expect(firstPostLocator).toBeVisible({ timeout: 30000 });
    console.log('Post pertama ditemukan.');

    await firstPostCommentButton.click();
    console.log('Tombol komentar diklik.');

    await page.waitForTimeout(2000);

    const commentInput = page.locator('textarea[placeholder="Write your comment..."]');

    await expect(commentInput).toBeVisible({ timeout: 20000 }); 
    await commentInput.fill(commentText);
    console.log(`Teks komentar "${commentText}" diisi.`);

    await commentInput.press('Enter');
    console.log('Tombol Enter ditekan.');

    await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#oxd-toaster_1')).toContainText('Successfully Added'); 
    console.log('✅ Toaster "Successfully Added" terlihat.');

});

test('TC_BUZZ_007 - Verifikasi fungsi share (bagikan)', async ({ page }) => {
    const firstPostShareButton = page.locator('.orangehrm-buzz-post-actions button i.bi-share-fill').first();
    const initialPostTextLocator = page.locator('.orangehrm-buzz-post-body-text').first();

    if (!await initialPostTextLocator.isVisible()) {
        const postTextForShare = `Original Post to Share! - ${Date.now()}`;
        await page.getByPlaceholder("What's on your mind?").fill(postTextForShare);
        await page.locator('.orangehrm-buzz-create-post-header-text .oxd-button--main').click();
        
        await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 10000 });
    }
    const originalPostText = await initialPostTextLocator.textContent();

    await firstPostShareButton.click();

    const shareConfirmButton = page.getByRole('button', { name: 'Share', exact: true }); 
    await expect(shareConfirmButton).toBeVisible({ timeout: 10000 });
    await shareConfirmButton.click();

    await expect(page.locator('#oxd-toaster_1')).toBeVisible({ timeout: 10000 });
});

test('TC_BUZZ_008 - Verifikasi filter “Most Recent Posts”', async ({ page }) => {
    const mostRecentButton = page.getByRole('button', { name: 'Most Recent Posts' });
    
    await mostRecentButton.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }); 

    await expect(mostRecentButton).toHaveClass(/oxd-button--label-warn/, { timeout: 10000 });

    const firstPostTime = page.locator('.orangehrm-buzz-post-time').first();
    await expect(firstPostTime).toBeVisible({ timeout: 30000 });
});

test('TC_BUZZ_009 - Verifikasi filter “Most Liked Posts”', async ({ page }) => {
    const mostLikedButton = page.getByRole('button', { name: 'Most Liked Posts' });
    const mostRecentButton = page.getByRole('button', { name: 'Most Recent Posts' }); 
    
    await mostLikedButton.click();
    await page.locator('.orangehrm-buzz-post').first().waitFor({ state: 'visible', timeout: 30000 }); 

    await expect(mostLikedButton).toHaveClass(/oxd-button--label-warn/, { timeout: 10000 });
    await expect(mostRecentButton).not.toHaveClass(/oxd-button--label-warn/, { timeout: 10000 });

    const likeCountsText = await page.locator('.orangehrm-buzz-stats-row .oxd-text--p:has-text("Likes")').allTextContents();
    const likeCounts = likeCountsText.map(text => parseInt(text.replace(/\D/g, '')) || 0); 
    
    if (likeCounts.length > 1) {
        for (let i = 0; i < likeCounts.length - 1; i++) {
            expect(likeCounts[i]).toBeGreaterThanOrEqual(likeCounts[i+1]);
        }
    } else {
    }
});

test('TC_BUZZ_010 - Verifikasi filter “Most Commented Posts”', async ({ page }) => {
    const mostCommentedButton = page.getByRole('button', { name: 'Most Commented Posts' });
    const mostRecentButton = page.getByRole('button', { name: 'Most Recent Posts' }); 
    
    await mostCommentedButton.click();
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    await expect(mostCommentedButton).toHaveClass(/oxd-button--label-warn/, { timeout: 10000 });
    await expect(mostRecentButton).not.toHaveClass(/oxd-button--label-warn/, { timeout: 10000 });

    const commentCountsText = await page.locator('.orangehrm-buzz-stats-row .oxd-text--p:has-text("Comments")').allTextContents();
    const commentCounts = commentCountsText.map(text => parseInt(text.replace(/\D/g, '')) || 0);

    if (commentCounts.length > 1) {
        for (let i = 0; i < commentCounts.length - 1; i++) {
            expect(commentCounts[i]).toBeGreaterThanOrEqual(commentCounts[i+1]);
        }
    } else {
    }
});