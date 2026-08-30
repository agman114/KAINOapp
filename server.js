const http = require('http');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { exec } = require('child_process');
const { scrapeKaiSchedule } = require('./playwrightScraper');

const PORT = 3000;
const DIST = path.join(__dirname, 'dist');
const LOCAL_DATA_FILE = path.join(__dirname, 'local_user_data.json');
const PACKAGE_JSON_PATH = path.join(__dirname, 'package.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
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

function parseProfilePage(html, fallbackUsername) {
  let fullName = fallbackUsername;
  let groupName = 'Б-F7-26-1-КС';
  let faculty = 'Факультет комп\'ютерних систем';
  let specialty = '121 Інженерія програмного забезпечення';

  if (html) {
    const $ = cheerio.load(html);
    const nameText = $('#userName').text().trim();
    if (nameText) fullName = nameText;

    const groupText = $('.group-name').text().trim();
    if (groupText) groupName = groupText;
  }

  return {
    fullName,
    groupName,
    faculty,
    specialty,
    course: 2,
    educationForm: 'Денна',
    isAuthenticated: true,
  };
}

const server = http.createServer(async (req, res) => {
  // Эндпоинты проверки и установки обновлений приложения (PC & Mobile)
  if (req.url === '/api/system/check-update' && req.method === 'GET') {
    const currentVer = getLocalVersion();
    
    // Выполняем git fetch origin main для проверки новых коммитов на GitHub
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
        const schedule = parseScheduleWithCheerio(pwResult.contentWeek1 || pwResult.contentWeek2);

        fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify({ profile, schedule }), 'utf-8');

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, profile, schedule }));
      } catch (err) {
        console.error('[SERVER LOG API ERROR]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message || String(err) }));
      }
    });
    return;
  }

  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading file');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`KAINOapp Server with Git Auto-Updater running at http://localhost:${PORT}/`);
});
