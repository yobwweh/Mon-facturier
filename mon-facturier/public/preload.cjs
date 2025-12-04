// public/preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Fonction pour générer le PDF
  exportToPDF: (fileName) => ipcRenderer.invoke('export-pdf', fileName),
  
  // Fonctions pour la sauvegarde des données (optionnel mais recommandé)
  saveFile: (filename, data) => ipcRenderer.invoke('save-file', filename, data),
  readFile: (filename) => ipcRenderer.invoke('read-file', filename)
});