export interface IndexedDBItem {
    key: string;
    value: any;
    timestamp: number;
}

export class IndexedDBHelper {
    private dbName: string;
    private version: number;
    private storeName: string;

    constructor(dbName: string = 'GrandSlamDB', version: number = 1) {
        this.dbName = dbName;
        this.version = version;
        this.storeName = 'stateStore';
    }

    async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'key' });
                }
            };
        });
    }

    async setItem<T>(key: string, value: T): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            await new Promise<void>((resolve, reject) => {
                const request = store.put({ key, value, timestamp: Date.now() });
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            db.close();
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
            throw error;
        }
    }

    async getItem<T>(key: string): Promise<T | null> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);

            const result = await new Promise<IndexedDBItem | undefined>((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            db.close();
            return result ? result.value : null;
        } catch (error) {
            console.error('Error reading from IndexedDB:', error);
            return null;
        }
    }

    async removeItem(key: string): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            await new Promise<void>((resolve, reject) => {
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            db.close();
        } catch (error) {
            console.error('Error removing from IndexedDB:', error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            const db = await this.openDB();
            const transaction = db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);

            await new Promise<void>((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });

            db.close();
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
            throw error;
        }
    }
}