import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'GrandSlamAppDB';
const STORE_NAME = 'keyval';
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
    if (dbPromise) {
        return dbPromise;
    }
    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
    return dbPromise;
};

const get = async <T>(key: IDBValidKey): Promise<T | undefined> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as T | undefined);
    });
};

const set = async <T>(key: IDBValidKey, value: T): Promise<void> => {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
};

export function useIndexedDBState<T>(key: string, initialValue: T) {
    const [state, setState] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;
        get<T>(key)
            .then(value => isMounted && value !== undefined && setState(value))
            .catch(err => isMounted && setError(err))
            .finally(() => isMounted && setIsLoading(false));

        return () => { isMounted = false; };
    }, [key]);

    const setDBState = useCallback((newValue: T | ((prevState: T) => T)) => {
        const valueToStore = newValue instanceof Function ? newValue(state) : newValue;
        setState(valueToStore);
        set(key, valueToStore).catch(setError);
    }, [key, state]);

    return { state, setState: setDBState, isLoading, error };
}