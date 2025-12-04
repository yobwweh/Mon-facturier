// src/services/storage.js

// Détecte si on est dans Electron via le pont créé dans preload.cjs
const isElectron = window.electronAPI !== undefined;

export const storage = {
  // Sauvegarder une donnée
  async save(key, data) {
    const filename = `${key}.json`;
    if (isElectron) {
      await window.electronAPI.saveFile(filename, data);
    } else {
      console.log(`[Web Mode] Saving ${key} to localStorage`);
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  // Lire une donnée
  async get(key) {
    const filename = `${key}.json`;
    if (isElectron) {
      const data = await window.electronAPI.readFile(filename);
      return data;
    } else {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }
};