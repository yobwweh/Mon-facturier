const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs'); // <--- AJOUT IMPORTANT : Module pour vérifier les fichiers
const db = require('./database.cjs');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    // Icône pour Windows (ignorée sur Mac si non valide)
    icon: path.join(__dirname, '../public/favicon.ico'), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setMenu(null);
  win.maximize();

  // --- SPECIAL MAC : FORCER L'ICÔNE DU DOCK (SÉCURISÉ) ---
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '../public/icon.icns');
    
    // On vérifie si le fichier existe VRAIMENT avant de l'appliquer
    if (fs.existsSync(iconPath)) {
      try {
        app.dock.setIcon(iconPath);
        console.log("Icône Mac chargée avec succès.");
      } catch (e) {
        console.warn("Impossible de charger l'icône Mac :", e.message);
      }
    } else {
      console.warn("⚠️ Attention : Le fichier public/icon.icns est introuvable. L'icône par défaut sera utilisée.");
    }
  }
  // -------------------------------------------------------

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  // Sécurité BDD
  try {
    db.initDatabase();
  } catch (error) {
    dialog.showErrorBox("Erreur Démarrage", `Erreur BDD: ${error.message}`);
    app.quit();
    return;
  }

  // --- IPC HANDLERS ---
  ipcMain.handle('get-clients', () => db.getClients());
  ipcMain.handle('add-client', (event, client) => db.addClient(client));
  ipcMain.handle('delete-client', (event, id) => db.deleteClient(id));

  ipcMain.handle('get-products', () => db.getProducts());
  ipcMain.handle('add-product', (event, product) => db.addProduct(product));
  ipcMain.handle('delete-product', (event, id) => db.deleteProduct(id));

  ipcMain.handle('get-documents', () => db.getDocuments());
  ipcMain.handle('save-document', (event, doc) => db.saveDocument(doc));
  ipcMain.handle('delete-document', (event, docId) => db.deleteDocument(docId));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});