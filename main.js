const { app, BrowserWindow, BrowserView, ipcMain, session, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({ name: 'profiles' });

let mainWindow;
let views = [];
let activeViewIndex = -1;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 480,
    minHeight: 320,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  const profiles = store.get('profiles', []);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('profiles-loaded', profiles);
  });

  mainWindow.on('resize', () => {
    resizeActiveView();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function resizeActiveView() {
  if (activeViewIndex >= 0 && views[activeViewIndex]) {
    const bounds = mainWindow.getBounds();
    const topOffset = 48;
    views[activeViewIndex].setBounds({
      x: 0,
      y: topOffset,
      width: bounds.width,
      height: bounds.height - topOffset,
    });
  }
}

function createProfileView(profileId) {
  const partition = `persist:profile-${profileId}`;
  const ses = session.fromPartition(partition, { cache: true });

  // Block WebRTC, telemetry, analytics
  ses.webRequest.onBeforeRequest({ urls: [
    '*://*/api/*/science*',
    '*://*/api/*/metrics*',
    '*://*.sentry.io/*',
    '*://*/api/*/experiments*',
  ]}, (details, cb) => {
    cb({ cancel: true });
  });

  // Stable User-Agent
  ses.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  );

  const view = new BrowserView({
    webPreferences: {
      partition: partition,
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  // Load Discord login page directly
  view.webContents.loadURL('https://discord.com/login');

  mainWindow.addBrowserView(view);
  view.setAutoResize({ width: false, height: false });
  view.setBounds({ x: 0, y: 48, width: 0, height: 0 });

  const v = { id: profileId, view, name: `Profile ${profileId}` };
  views.push(v);
  return v;
}

// IPC Handlers
ipcMain.on('add-profile', (event, { name }) => {
  const profiles = store.get('profiles', []);
  const id = Date.now().toString(36);
  profiles.push({ id, name });
  store.set('profiles', profiles);

  const v = createProfileView(id);
  v.name = name;
  switchToView(views.length - 1);

  event.reply('profile-added', { id, name });
  event.reply('profiles-updated', profiles);
  refreshTabs();
});

ipcMain.on('switch-profile', (event, index) => {
  if (index >= 0 && index < views.length) {
    switchToView(index);
  }
});

ipcMain.on('remove-profile', (event, profileId) => {
  const idx = views.findIndex((v) => v.id === profileId);
  if (idx >= 0) {
    mainWindow.removeBrowserView(views[idx].view);
    views.splice(idx, 1);
  }

  const profiles = store.get('profiles', []).filter((p) => p.id !== profileId);
  store.set('profiles', profiles);

  // Clear session data for removed profile
  session.fromPartition(`persist:profile-${profileId}`).clearStorageData();

  if (views.length > 0) {
    switchToView(Math.min(idx, views.length - 1));
  } else {
    activeViewIndex = -1;
  }

  event.reply('profiles-updated', profiles);
  refreshTabs();
});

ipcMain.on('mute-profile', (event, profileId) => {
  const v = views.find((v) => v.id === profileId);
  if (v) {
    v.view.webContents.setAudioMuted(!v.view.webContents.isAudioMuted());
  }
});

function switchToView(index) {
  if (activeViewIndex >= 0 && views[activeViewIndex]) {
    views[activeViewIndex].view.setBounds({ x: 0, y: 48, width: 0, height: 0 });
  }
  activeViewIndex = index;
  resizeActiveView();
  mainWindow.webContents.send('active-profile-changed', index);
}

function refreshTabs() {
  const tabs = views.map((v) => ({ id: v.id, name: v.name }));
  mainWindow.webContents.send('tabs-updated', tabs);
}

// Menu
const menuTemplate = [
  {
    label: 'Discord Multi',
    submenu: [
      { role: 'quit' },
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      {
        label: 'Compact Mode',
        type: 'checkbox',
        checked: false,
        click: (item) => {
          mainWindow.setSize(item.checked ? 600 : 1280, item.checked ? 500 : 800);
        },
      },
    ],
  },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  createWindow();

  // Restore saved profiles
  const profiles = store.get('profiles', []);
  profiles.forEach((p) => {
    const v = createProfileView(p.id);
    v.name = p.name;
  });

  if (views.length > 0) {
    switchToView(0);
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
