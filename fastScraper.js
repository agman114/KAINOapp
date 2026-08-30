const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const DEBUG_DIR = path.join(__dirname, 'debug_output');
if (!fs.existsSync(DEBUG_DIR)) {
  fs.mkdirSync(DEBUG_DIR, { recursive: true });
}

async function scrapeKaiSchedule(username, password) {
  console.log(`\n=================== [ULTRA-FAST HTTP SCRAPE START] ===================`);
  console.log(`[FAST SCRAPER] Username: ${username}`);
  console.log(`[FAST SCRAPER] Time: ${new Date().toISOString()}`);

  const startTime = Date.now();
  let cookieHeader = '';

  const client = axios.create({
    baseURL: 'https://cabinet.kai.edu.ua',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'uk,en-US;q=0.7,en;q=0.3',
    },
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  // Авто-обработка куки
  client.interceptors.response.use((response) => {
    const setCookies = response.headers['set-cookie'];
    if (setCookies && Array.isArray(setCookies)) {
      const newCookies = setCookies.map(c => c.split(';')[0]).join('; ');
      cookieHeader = cookieHeader ? `${cookieHeader}; ${newCookies}` : newCookies;
    }
    return response;
  });

  client.interceptors.request.use((config) => {
    if (cookieHeader) {
      config.headers['Cookie'] = cookieHeader;
    }
    return config;
  });

  try {
    // 1. Запрос формы входа для получения _csrf-frontend
    console.log('[FAST SCRAPER] 1. Fetching login CSRF token...');
    const loginPageResp = await client.get('/login');
    const $login = cheerio.load(loginPageResp.data);
    const csrfToken = $login('input[name="_csrf-frontend"]').val();
    console.log(`[FAST SCRAPER] CSRF Token obtained: ${csrfToken ? csrfToken.substring(0, 15) : 'none'}...`);

    // 2. Отправка формы авторизации
    console.log('[FAST SCRAPER] 2. Submitting login credentials...');
    const params = new URLSearchParams();
    params.append('_csrf-frontend', csrfToken || '');
    params.append('LoginForm[username]', username);
    params.append('LoginForm[password]', password);
    params.append('LoginForm[rememberMe]', '1');
    params.append('login-button', '');

    await client.post('/login', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://cabinet.kai.edu.ua/login',
      },
    });

    console.log('[FAST SCRAPER] 3. Fetching all portal endpoints in parallel...');

    // 3. Параллельная выгрузка всех 8 страниц портала КАИ!
    const [
      profileResp,
      scheduleResp,
      sessionResp,
      sessionSchedResp,
      bypassResp,
      qualResp,
      electiveResp,
      pollResp,
    ] = await Promise.all([
      client.get('/student/student/personal-info'),
      client.get('/student/schedule'),
      client.get('/student/session'),
      client.get('/student/session-schedule'),
      client.get('/student/bypass-sheet'),
      client.get('/student/qualification-work'),
      client.get('/student/elective-choice'),
      client.get('/student/poll'),
    ]);

    const elapsed = Date.now() - startTime;
    console.log(`=================== [ULTRA-FAST SCRAPE SUCCESS: ${elapsed}ms] ===================\n`);

    const contentProfile = profileResp.data;
    const contentSchedule = scheduleResp.data;
    const contentSession = sessionResp.data;
    const contentSessionSchedule = sessionSchedResp.data;
    const contentBypass = bypassResp.data;
    const contentQualification = qualResp.data;
    const contentElective = electiveResp.data;
    const contentPoll = pollResp.data;

    fs.writeFileSync(path.join(DEBUG_DIR, 'profile.html'), contentProfile);
    fs.writeFileSync(path.join(DEBUG_DIR, 'schedule.html'), contentSchedule);
    fs.writeFileSync(path.join(DEBUG_DIR, 'session.html'), contentSession);
    fs.writeFileSync(path.join(DEBUG_DIR, 'session_schedule.html'), contentSessionSchedule);
    fs.writeFileSync(path.join(DEBUG_DIR, 'bypass_sheet.html'), contentBypass);
    fs.writeFileSync(path.join(DEBUG_DIR, 'qualification_work.html'), contentQualification);
    fs.writeFileSync(path.join(DEBUG_DIR, 'elective_choice.html'), contentElective);
    fs.writeFileSync(path.join(DEBUG_DIR, 'poll.html'), contentPoll);

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
    console.error('[FAST SCRAPER ERROR]:', err.message || err);
    throw err;
  }
}

module.exports = { scrapeKaiSchedule };
