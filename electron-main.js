const { app, BrowserWindow, Tray, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

const LOG_FILE = path.join(__dirname, 'electron_debug.log');

function logToFile(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(LOG_FILE, line, 'utf-8');
  } catch (e) {}
}

logToFile('=================== KAINOapp DESKTOP STARTUP ===================');
logToFile(`__dirname: ${__dirname}`);
logToFile(`process.cwd: ${process.cwd()}`);
logToFile(`resourcesPath: ${process.resourcesPath}`);

process.on('uncaughtException', (err) => {
  logToFile(`[MAIN UNCAUGHT EXCEPTION] ${err ? (err.stack || err.message || err) : 'Unknown error'}`);
});

// Start embedded server.js
try {
  logToFile('Initializing embedded server.js...');
  require('./server.js');
  logToFile('Embedded server.js initialized successfully.');
} catch (e) {
  logToFile(`[SERVER INIT ERROR] ${e ? (e.stack || e.message) : e}`);
}

let mainWindow;
let tray;

function createWindow() {
  logToFile('Creating BrowserWindow...');
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 760,
    minWidth: 800,
    minHeight: 600,
    title: 'KAINOapp — Кабінет студента КАИ',
    icon: path.join(__dirname, 'assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    backgroundColor: '#0f172a',
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    logToFile(`[RENDERER LOG lvl=${level}] ${message} (${sourceId}:${line})`);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    logToFile(`[DID FAIL LOAD] Code ${errorCode}: ${errorDescription} (${validatedURL}). Retrying...`);
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.loadURL('http://localhost:3000');
      }
    }, 1000);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    logToFile(`[RENDER PROCESS GONE] Reason: ${details.reason}, exitCode: ${details.exitCode}`);
  });

  const distHtmlPath = path.join(__dirname, 'dist', 'index.html');
  logToFile(`Checking local distHtmlPath: ${distHtmlPath}, Exists: ${fs.existsSync(distHtmlPath)}`);

  logToFile('Loading http://localhost:3000...');
  mainWindow.loadURL('http://localhost:3000');

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      if (Notification.isSupported()) {
        new Notification({
          title: 'KAINOapp працює у фоні 🎓',
          body: 'Додаток згорнуто в трей і продовжує надсилати сповіщення про пари.',
        }).show();
      }
    }
    return false;
  });
}

function createTray() {
  try {
    tray = new Tray(path.join(__dirname, 'assets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Показати KAINOapp',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: 'Оновити сторінку',
        click: () => {
          if (mainWindow) {
            mainWindow.reload();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Вийти з програми',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip('KAINOapp — КАИ Студент');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    logToFile(`Tray icon setup skipped: ${e.message}`);
  }
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
