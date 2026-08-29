import { openDB } from 'idb';

const DB_NAME = 'GeniusBiologyDB';
const DB_VERSION = 2;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('questions')) {
        db.createObjectStore('questions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chapters')) {
        db.createObjectStore('chapters', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('lessons')) {
        db.createObjectStore('lessons', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
};

export const dbOperations = {
  async getAll(storeName) {
    const db = await initDB();
    return db.getAll(storeName);
  },
  async add(storeName, item) {
    const db = await initDB();
    return db.put(storeName, item);
  },
  async delete(storeName, id) {
    const db = await initDB();
    return db.delete(storeName, id);
  },
  async getSetting(key, defaultValue) {
    const db = await initDB();
    const res = await db.get('settings', key);
    return res ? res.value : defaultValue;
  },
  async setSetting(key, value) {
    const db = await initDB();
    return db.put('settings', { key, value });
  }
};
