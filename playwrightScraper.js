const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const DEBUG_DIR = path.join(__dirname, 'debug_output');
if (!fs.existsSync(DEBUG_DIR)) {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

async function scrapeKaiSchedule(username, password) {
  console.log(`\n=================== [MASTER SCRAPE START] ===================`);
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

    console.log('[SCRAPER LOG] 2. Entering credentials...');
    await page.fill('input[name="LoginForm[username]"]', username);
    await page.fill('input[name="LoginForm[password]"]', password);

    console.log('[SCRAPER LOG] 3. Submitting login form...');
    await page.click('button[name="login-button"]');
    await page.waitForTimeout(4000);

    // 1. Personal Info
    await page.goto('https://cabinet.kai.edu.ua/student/student/personal-info', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentProfile = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'profile.html'), contentProfile);

    // 2. Schedule
    await page.goto('https://cabinet.kai.edu.ua/student/schedule', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentSchedule = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'schedule.html'), contentSchedule);

    // 3. Session / Grades
    await page.goto('https://cabinet.kai.edu.ua/student/session', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentSession = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'session.html'), contentSession);

    // 4. Session Schedule
    await page.goto('https://cabinet.kai.edu.ua/student/session-schedule', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentSessionSchedule = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'session_schedule.html'), contentSessionSchedule);

    // 5. Bypass Sheet
    await page.goto('https://cabinet.kai.edu.ua/student/bypass-sheet', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentBypass = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'bypass_sheet.html'), contentBypass);

    // 6. Qualification Work
    await page.goto('https://cabinet.kai.edu.ua/student/qualification-work', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentQualification = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'qualification_work.html'), contentQualification);

    // 7. Elective Choice
    await page.goto('https://cabinet.kai.edu.ua/student/elective-choice', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentElective = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'elective_choice.html'), contentElective);

    // 8. Poll
    await page.goto('https://cabinet.kai.edu.ua/student/poll', { waitUntil: 'domcontentloaded', timeout: 30000 });
    const contentPoll = await page.content();
    fs.writeFileSync(path.join(DEBUG_DIR, 'poll.html'), contentPoll);

    await browser.close();
    console.log(`=================== [MASTER SCRAPE SUCCESS] ===================\n`);

    return {
      contentProfile,
      contentSchedule,
      contentSession,
      contentSessionSchedule,
      contentBypass,
      contentQualification,
      contentElective,
      contentPoll,
    };
  } catch (err) {
    console.error('[SCRAPER LOG MASTER ERROR]:', err);
    await browser.close();
    throw err;
  }
}

module.exports = { scrapeKaiSchedule };
