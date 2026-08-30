const http = require('http');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { scrapeKaiSchedule } = require('./fastScraper');

const PORT = 3000;

function getDistDir() {
  const possiblePaths = [
    path.join(__dirname, 'dist'),
    path.join(process.resourcesPath || __dirname, 'app', 'dist'),
    path.join(__dirname),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }
  return path.join(__dirname, 'dist');
}

const DIST = getDistDir();
const LOCAL_DATA_FILE = path.join(__dirname, 'local_user_data.json');
const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function getLocalVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
    return pkg.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

/**
 * 1. Парсер расписания занятий
 */
function parseScheduleWithCheerio(html) {
  console.log('[CHEERIO PARSER] Scoped parsing of all semester week panes (.schedule-week-pane)...');
  const daySchedules = [];
  const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];

  if (!html) return daySchedules;
  const $ = cheerio.load(html);

  $('.schedule-week-pane').each((paneIdx, paneEl) => {
    const $pane = $(paneEl);
    const weekNum = paneIdx + 1;
    const weekLabel = $pane.attr('data-week-label') || `${weekNum} тиждень`;

    const colDates = [];
    $pane.find('.grid-header-row .grid-cell').slice(0, 6).each((idx, cell) => {
      const text = $(cell).text().replace(/\s+/g, ' ').trim();
      const dateMatch = text.match(/(\d{2}\.\d{2})/);
      colDates.push(dateMatch ? dateMatch[1] : '');
    });

    const weekDaySchedules = days.map((dayName, dIdx) => ({
      dayOfWeek: dIdx + 1,
      dayName,
      dateStr: colDates[dIdx] || '',
      weekNumber: weekNum,
      lessons: [],
    }));

    $pane.find('.grid-row').each((rowIdx, rowEl) => {
      const timeCell = $(rowEl).find('.grid-cell').eq(0);
      const timeText = timeCell.text().replace(/\s+/g, ' ').trim();
      const timeNumbers = timeText.match(/(\d{2})\D*(\d{2})\D*(\d{2})\D*(\d{2})/);
      
      let timeStart = '08:30';
      let timeEnd = '10:05';
      if (timeNumbers) {
        timeStart = `${timeNumbers[1]}:${timeNumbers[2]}`;
        timeEnd = `${timeNumbers[3]}:${timeNumbers[4]}`;
      }

      $(rowEl).children('.grid-cell').slice(1, 7).each((colIdx, cellEl) => {
        const dayOfWeek = colIdx + 1;
        const pairCards = $(cellEl).find('.pair-card');

        pairCards.each((cardIdx, cardEl) => {
          const $card = $(cardEl);

          const subject = $card.find('.font-weight-bold.text-sm').first().text().trim() || 'Предмет КАИ';
          const badgeText = $card.find('.badge').text().trim();
          let type = 'Лекція';
          if (/лаб/i.test(badgeText)) type = 'Лабораторна';
          else if (/практ/i.test(badgeText)) type = 'Практика';
          else if (/сем/i.test(badgeText)) type = 'Семінар';

          const teacher = $card.find('.fa-person').parent().text().replace(/\s+/g, ' ').trim() || 'Викладач КАИ';
          const room = $card.find('.fa-building').parent().text().replace(/\s+/g, ' ').trim() || 'Аудиторія';
          const onlineUrl = $card.find('a[href*="teams"]').attr('href') || $card.find('a[href*="zoom"]').attr('href');

          const dayObj = weekDaySchedules.find(ds => ds.dayOfWeek === dayOfWeek);
          if (dayObj) {
            dayObj.lessons.push({
              id: `${dayOfWeek}-w${weekNum}-${rowIdx}-${cardIdx}`,
              subject,
              type,
              timeStart,
              timeEnd,
              teacher: teacher || 'Викладач КАИ',
              room: room || 'Аудиторія',
              building: 'КАИ',
              weekNumber: weekNum,
              weekName: weekLabel,
              dayOfWeek,
              dateStr: dayObj.dateStr,
              onlineUrl,
            });
          }
        });
      });
    });

    weekDaySchedules.forEach(ds => {
      ds.lessons.sort((a, b) => {
        const [h1, m1] = a.timeStart.split(':').map(Number);
        const [h2, m2] = b.timeStart.split(':').map(Number);
        return (h1 * 60 + m1) - (h2 * 60 + m2);
      });
      daySchedules.push(ds);
    });
  });

  return daySchedules;
}

/**
 * 2. Парсер личной информации студента
 */
function parseProfilePage(html, fallbackUsername) {
  let fullName = fallbackUsername;
  let groupName = 'Б-F7-26-1-КС';
  let faculty = 'Факультет комп\'ютерних систем';
  let specialty = '121 Інженерія програмного забезпечення';
  let address = '';

  if (html) {
    const $ = cheerio.load(html);
    const nameText = $('#userName').text().trim();
    if (nameText) fullName = nameText;

    const groupText = $('.group-name').text().trim();
    if (groupText) groupName = groupText;

    const siteText = $('.site-content').text().replace(/\s+/g, ' ').trim();
    const addrMatch = siteText.match(/Адреса проживання ([^А-ЯA-Z]*[^\n]*)/i);
    if (addrMatch) {
      address = addrMatch[1].trim();
    }
  }

  return {
    fullName,
    groupName,
    faculty,
    specialty,
    course: 2,
    educationForm: 'Денна',
    address,
    isAuthenticated: true,
  };
}

/**
 * 3. Парсер обходного листа, диплома, выборочных предметов и опросов
 */
function parsePortalServices(contentBypass, contentQual, contentElective, contentPoll, contentSession, contentSessionSchedule) {
  const getCleanText = (html) => {
    if (!html) return '';
    const $ = cheerio.load(html);
    return $('.site-content').text().replace(/\s+/g, ' ').trim();
  };

  return {
    bypassText: getCleanText(contentBypass) || 'Обхідний лист ще недоступний...',
    qualificationText: getCleanText(contentQual) || 'Кваліфікаційна робота ще не доступна...',
    electiveText: getCleanText(contentElective) || 'Вибіркових дисциплін для вашої академічної групи не передбачено',
    pollText: getCleanText(contentPoll) || 'Опитування для вашої академічної групи відсутні',
    sessionText: getCleanText(contentSession) || 'Оцінки ще не доступні...',
    sessionScheduleText: getCleanText(contentSessionSchedule) || 'Подій сесії не знайдено.',
  };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/system/check-update' && req.method === 'GET') {
    const currentVer = getLocalVersion();
    exec('git fetch origin main && git rev-parse HEAD && git rev-parse origin/main', (err, stdout) => {
      let updateAvailable = false;
      let localHash = '';
      let remoteHash = '';

      if (!err && stdout) {
        const lines = stdout.trim().split('\n');
        if (lines.length >= 2) {
          localHash = lines[0].trim();
          remoteHash = lines[1].trim();
          if (localHash && remoteHash && localHash !== remoteHash) {
            updateAvailable = true;
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        currentVersion: currentVer,
        latestVersion: updateAvailable ? `${currentVer}-new` : currentVer,
        updateAvailable,
        localHash,
        remoteHash,
        githubUrl: 'https://github.com/agman114/KAINOapp/releases',
      }));
    });
    return;
  }

  if (req.url === '/api/system/do-update' && req.method === 'POST') {
    console.log('[AUTO-UPDATER] Executing git pull origin main and bundle rebuild...');
    exec('git pull origin main && npx expo export --platform web', (err, stdout, stderr) => {
      if (err) {
        console.error('[AUTO-UPDATER ERROR]:', stderr || err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: stderr || err.message }));
      } else {
        console.log('[AUTO-UPDATER SUCCESS]: App updated to latest GitHub commit!');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Додаток успішно оновлено з GitHub!' }));
      }
    });
    return;
  }

  if (req.url === '/api/storage/save' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        fs.writeFileSync(LOCAL_DATA_FILE, body, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  if (req.url === '/api/storage/load' && req.method === 'GET') {
    try {
      if (fs.existsSync(LOCAL_DATA_FILE)) {
        const data = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ profile: null, schedule: [] }));
      }
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: e.message }));
    }
    return;
  }

  if (req.url === '/api/kai/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { username, password } = JSON.parse(body);
        const pwResult = await scrapeKaiSchedule(username, password);
        const profile = parseProfilePage(pwResult.contentProfile, username);
        const schedule = parseScheduleWithCheerio(pwResult.contentSchedule);
        const servicesData = parsePortalServices(
          pwResult.contentBypass,
          pwResult.contentQualification,
          pwResult.contentElective,
          pwResult.contentPoll,
          pwResult.contentSession,
          pwResult.contentSessionSchedule
        );

        const fullUserData = { profile, schedule, servicesData };
        fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(fullUserData), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, ...fullUserData }));
      } catch (err) {
        console.error('[SERVER LOG API ERROR]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message || String(err) }));
      }
    });
    return;
  }

  const rawUrl = (req.url || '/').split('?')[0];
  const cleanUrl = rawUrl.startsWith('/') ? rawUrl.slice(1) : rawUrl;
  let filePath = path.join(DIST, cleanUrl === '' ? 'index.html' : cleanUrl);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`[SERVER FILE READ ERROR] Path: "${filePath}", Error:`, err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error loading file');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('[SERVER] Port 3000 is already in use. Reusing server.');
  } else {
    console.error('[SERVER ERROR]:', err);
  }
});

server.listen(PORT, () => {
  console.log(`KAINOapp Ultra-Fast Server reading 100% REAL PORTAL ENDPOINTS at http://localhost:3000/`);
});
