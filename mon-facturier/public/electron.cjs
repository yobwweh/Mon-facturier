const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// -- DÉTECTION DU MODE (Développement vs Production) --
const isDev = !app.isPackaged;

// -- 1. GESTION DU DOSSIER DE DONNÉES --
const DATA_DIR = path.join(app.getPath('documents'), 'FacturierCI_Data');

// Création du dossier s'il n'existe pas
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let mainWindow;

function createWindow() {
  // --- MODIFICATION ICI : On désactive le menu ---
  Menu.setApplicationMenu(null);
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    title: "Mon Facturier CI",
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), // Charge le pont sécurisé
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'favicon.ico'),
    show: false // On cache la fenêtre tant qu'elle n'est pas prête
  });

  // -- CHARGEMENT DE L'INTERFACE --
  if (isDev) {
    // EN DÉVELOPPEMENT : On charge le serveur vite local
    mainWindow.loadURL('http://localhost:5173');
    
    // 🚧 J'AI DÉSACTIVÉ CETTE LIGNE POUR NE PLUS VOIR LA FENÊTRE À DROITE 🚧
    // mainWindow.webContents.openDevTools();
  } else {
    // EN PRODUCTION (EXE) : On charge le fichier index.html compilé
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Afficher la fenêtre uniquement quand elle est prête (évite l'écran blanc)
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });
}

// -- INITIALISATION DE L'APPLICATION --
app.whenReady().then(() => {
  createWindow();

  // -- A. SAUVEGARDE DES DONNÉES --
  ipcMain.handle('save-file', async (event, filename, data) => {
    try {
      const filePath = path.join(DATA_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return { success: true };
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      return { success: false, error: error.message };
    }
  });

  // -- B. LECTURE DES DONNÉES --
  ipcMain.handle('read-file', async (event, filename) => {
    try {
      const filePath = path.join(DATA_DIR, filename);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Erreur lecture:', error);
      return null;
    }
  });

  // -- C. EXPORT PDF --
  ipcMain.handle('export-pdf', async (event, defaultName) => {
    const pdfPath = await dialog.showSaveDialog(mainWindow, {
      title: 'Enregistrer le document PDF',
      defaultPath: path.join(app.getPath('documents'), `${defaultName}.pdf`),
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (pdfPath.canceled) return { success: false, reason: 'canceled' };

    try {
      const data = await mainWindow.webContents.printToPDF({
        printBackground: true,
        landscape: false,
        pageSize: 'A4',
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      });

      fs.writeFileSync(pdfPath.filePath, data);
      return { success: true, path: pdfPath.filePath };
    } catch (error) {
      console.error('Erreur PDF:', error);
      return { success: false, error: error.message };
    }
  });
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});