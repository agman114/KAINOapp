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

  const startTime = Date.now();
  let cookieHeader = '';

  const client = axios.create({
    baseURL: 'https://cabinet.kai.edu.ua',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'uk,en-US;q=0.7,en;q=0.3',
    },
    timeout: 20000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
  });

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
    // 1. Fetch CSRF token
    let loginPageResp;
    try {
      loginPageResp = await client.get('/login');
    } catch (e) {
      const err = new Error('[ERR-102] Сервер cabinet.kai.edu.ua недоступний або не відповідає на запити.');
      err.code = 'ERR_102';
      throw err;
    }

    const $login = cheerio.load(loginPageResp.data);
    const csrfToken = $login('input[name="_csrf-frontend"]').val();

    // 2. Submit login form
    const params = new URLSearchParams();
    params.append('_csrf-frontend', csrfToken || '');
    params.append('LoginForm[username]', username);
    params.append('LoginForm[password]', password);
    params.append('LoginForm[rememberMe]', '1');
    params.append('login-button', '');

    const loginRes = await client.post('/login', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://cabinet.kai.edu.ua/login',
      },
    });

    if (loginRes.data && (loginRes.data.includes('Неправильний логін або пароль') || loginRes.data.includes('LoginForm[password]'))) {
      const err = new Error('[ERR-101] Невірний логін або пароль на порталі КАИ.');
      err.code = 'ERR_101';
      throw err;
    }

    // 3. Fetch all 8 endpoints in parallel
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
    console.log(`=================== [SCRAPE SUCCESS: ${elapsed}ms] ===================\n`);

    return {
      contentProfile: profileResp.data,
      contentSchedule: scheduleResp.data,
      contentSession: sessionResp.data,
      contentSessionSchedule: sessionSchedResp.data,
      contentBypass: bypassResp.data,
      contentQualification: qualResp.data,
      contentElective: electiveResp.data,
      contentPoll: pollResp.data,
    };
  } catch (err) {
    if (!err.code) err.code = 'ERR_102';
    console.error(`[FAST SCRAPER ERROR ${err.code}]:`, err.message);
    throw err;
  }
}

module.exports = { scrapeKaiSchedule };
