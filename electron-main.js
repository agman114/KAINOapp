const { app, BrowserWindow, Tray, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');

// Start embedded server.js immediately at startup
try {
  require('./server.js');
  console.log('[ELECTRON MAIN] Embedded server.js initialized at startup.');
} catch (e) {
  console.error('[ELECTRON MAIN] Server initialization error:', e);
}

let mainWindow;
let tray;

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

  // Автоматический ретрай при старте сервера
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[ELECTRON LOAD FAIL] Code ${errorCode}: ${errorDescription} (${validatedURL}). Retrying in 1s...`);
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.loadURL('http://localhost:3000');
      }
    }, 1000);
  });

  mainWindow.loadURL('http://localhost:3000');

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
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
