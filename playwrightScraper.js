const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DEBUG_DIR = path.join(__dirname, 'debug_output');
if (!fs.existsSync(DEBUG_DIR)) {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

async function scrapeKaiSchedule(username, password) {
  console.log(`\n=================== [LOGGING START] ===================`);
  console.log(`[SCRAPER LOG] Username: ${username}`);
  console.log(`[SCRAPER LOG] Time: ${new Date().toISOString()}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    console.log('[SCRAPER LOG] 1. Opening https://cabinet.kai.edu.ua/login...');
    const resp1 = await page.goto('https://cabinet.kai.edu.ua/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log(`[SCRAPER LOG] Login page status: ${resp1.status()}`);
    console.log(`[SCRAPER LOG] Login page title: "${await page.title()}"`);

    console.log('[SCRAPER LOG] 2. Entering login & password credentials...');
    await page.fill('input[name="LoginForm[username]"]', username);
    await page.fill('input[name="LoginForm[password]"]', password);

    console.log('[SCRAPER LOG] 3. Clicking login button...');
    await page.click('button[name="login-button"]');
    
    // Ждем навигацию или появление элементов после входа
    console.log('[SCRAPER LOG] Waiting 5 seconds after login click...');
    await page.waitForTimeout(5000);

    const currentUrlAfterLogin = page.url();
    console.log(`[SCRAPER LOG] URL after login submission: ${currentUrlAfterLogin}`);

    // Читаем возможный текст ошибки на форме входа
    const errorText = await page.evaluate(() => {
      const errEl = document.querySelector('.invalid-feedback, .alert-danger, .error-summary');
      return errEl ? errEl.innerText.trim() : null;
    });
    if (errorText) {
      console.log(`[SCRAPER ERROR LOG] Portal returned error message: "${errorText}"`);
    }

    console.log('[SCRAPER LOG] 4. Navigating to https://cabinet.kai.edu.ua/student/schedule?activeWeek=1+тиждень');
    await page.goto('https://cabinet.kai.edu.ua/student/schedule?activeWeek=1+тиждень', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentWeek1 = await page.content();
    console.log(`[SCRAPER LOG] Week 1 HTML length: ${contentWeek1.length} chars. Final URL: ${page.url()}`);
    fs.writeFileSync(path.join(DEBUG_DIR, 'week1.html'), contentWeek1);

    console.log('[SCRAPER LOG] 5. Navigating to https://cabinet.kai.edu.ua/student/schedule?activeWeek=2+тиждень');
    await page.goto('https://cabinet.kai.edu.ua/student/schedule?activeWeek=2+тиждень', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentWeek2 = await page.content();
    console.log(`[SCRAPER LOG] Week 2 HTML length: ${contentWeek2.length} chars. Final URL: ${page.url()}`);
    fs.writeFileSync(path.join(DEBUG_DIR, 'week2.html'), contentWeek2);

    console.log('[SCRAPER LOG] 6. Navigating to https://cabinet.kai.edu.ua/student/student/personal-info');
    await page.goto('https://cabinet.kai.edu.ua/student/student/personal-info', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentProfile = await page.content();
    console.log(`[SCRAPER LOG] Profile HTML length: ${contentProfile.length} chars. Final URL: ${page.url()}`);
    fs.writeFileSync(path.join(DEBUG_DIR, 'profile.html'), contentProfile);

    console.log(`=================== [LOGGING END SUCCESS] ===================\n`);
    await browser.close();
    return { success: true, contentWeek1, contentWeek2, contentProfile };
  } catch (err) {
    console.error('[SCRAPER FATAL ERROR]:', err);
    console.log(`=================== [LOGGING END ERROR] ===================\n`);
    await browser.close();
    throw err;
  }
}

module.exports = { scrapeKaiSchedule };
