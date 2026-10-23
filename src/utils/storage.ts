import { RepairProject } from '../types';

const DB_NAME = 'SNAPs_Repair_DB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getAllProjectsFromStorage(): Promise<RepairProject[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readonly');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as RepairProject[]);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('IDB fallback to localStorage:', err);
    const local = localStorage.getItem('SNAPs_projects_fallback');
    return local ? JSON.parse(local) : [];
  }
}

export async function saveProjectToStorage(project: RepairProject): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.put(project);

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('IDB write failed, saving lightweight copy to localStorage:', err);
    try {
      // Clean large dataUrls for localstorage fallback if necessary
      const projects = await getAllProjectsFromStorage();
      const idx = projects.findIndex(p => p.id === project.id);
      if (idx >= 0) projects[idx] = project;
      else projects.push(project);
      localStorage.setItem('SNAPs_projects_fallback', JSON.stringify(projects));
    } catch (e) {
      console.error('LocalStorage quota exceeded:', e);
    }
  }
}

export async function deleteProjectFromStorage(projectId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.delete(projectId);

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Failed to delete project from IDB:', err);
  }
}

export async function clearAllProjectsFromStorage(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = transaction.objectStore(STORE_PROJECTS);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to clear IDB:', err);
  }
}
