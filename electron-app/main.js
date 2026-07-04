const { app, BrowserWindow, shell, Menu, dialog } = require('electron');
const path = require('path');

const APP_URL = 'https://tbordugpgavi.netlify.app';
const APP_TITLE = 'UGP-GAVI Dashboard';

function getIconPath() {
  if (process.platform === 'win32') return path.join(__dirname, 'build', 'icon.ico');
  if (process.platform === 'darwin') return path.join(__dirname, 'build', 'icon.icns');
  return path.join(__dirname, 'build', 'icon.png');
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: APP_TITLE,
    icon: getIconPath(),
    backgroundColor: '#0B54C0',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadURL(APP_URL);

  // Ouvre les liens externes (ex: mailto, liens tiers) dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Page de repli simple en cas d'absence de connexion internet
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (errorCode === -106 || errorCode === -105 || errorCode === -2) {
      mainWindow.loadURL(
        'data:text/html;charset=utf-8,' +
          encodeURIComponent(`
        <html>
          <body style="font-family: -apple-system, Inter, sans-serif; background:#070F22; color:#fff; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
            <div style="text-align:center; max-width:420px;">
              <h2>Connexion indisponible</h2>
              <p style="opacity:0.8;">Impossible de joindre le tableau de bord UGP-GAVI. Vérifiez votre connexion internet, puis réessayez.</p>
              <button onclick="location.reload()" style="margin-top:16px; padding:10px 20px; border-radius:8px; border:none; background:#00A0E0; color:#fff; font-size:14px; cursor:pointer;">Réessayer</button>
            </div>
          </body>
        </html>
      `)
      );
    }
  });
}

function buildMenu() {
  const template = [
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Recharger',
          accelerator: 'CmdOrCtrl+R',
          click: () => mainWindow && mainWindow.loadURL(APP_URL),
        },
        { type: 'separator' },
        { role: 'quit', label: 'Quitter' },
      ],
    },
    {
      label: 'Affichage',
      submenu: [
        { role: 'reload', label: 'Actualiser' },
        { role: 'toggleDevTools', label: 'Outils de développement' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom par défaut' },
        { role: 'zoomIn', label: 'Zoomer' },
        { role: 'zoomOut', label: 'Dézoomer' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Plein écran' },
      ],
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos',
          click: () =>
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'À propos',
              message: APP_TITLE,
              detail: `Version ${app.getVersion()}\nSuivi du PTA GAVI 2026 (RSS, FAE, CDS, HPV)\nMSP Djibouti - UGP-GAVI`,
            }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
