const { app, BrowserWindow, Tray, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { fork } = require('child_process');

let mainWindow;
let tray;
let serverProcess;

function startEmbeddedServer() {
  try {
    const serverPath = path.join(__dirname, 'server.js');
    console.log(`[ELECTRON] Starting embedded server.js from ${serverPath}...`);
    serverProcess = fork(serverPath);
  } catch (e) {
    console.error('[ELECTRON] Failed to start embedded server:', e);
  }
}

function createWindow() {
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
    },
    backgroundColor: '#0f172a',
  });

  const distHtmlPath = path.join(__dirname, 'dist/index.html');
  if (fs.existsSync(distHtmlPath)) {
    console.log(`[ELECTRON] Loading local HTML bundle: ${distHtmlPath}`);
    mainWindow.loadFile(distHtmlPath);
  } else {
    console.log('[ELECTRON] Fallback loading http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000');
  }

  // Скрытие в трей при закрытии окна
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
    console.log('Tray icon setup skipped.');
  }
}

app.whenReady().then(() => {
  startEmbeddedServer();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
