import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getItems, createItem, updateItem, deleteItem, newWebSocket } from './itemApi';
import { ItemProps } from './ItemProps';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
import { getLogger } from '../core';

const log = getLogger('ItemProvider');

interface ItemState {
  items?: ItemProps[];
  fetching: boolean;
  fetchingError?: Error | null;
  saving: boolean;
  savingError?: Error | null;
  saveItem?: (item: ItemProps) => Promise<void>;
  deleteItem?: (id: number) => Promise<void>;
  isOnline: boolean;
}

const STORAGE_KEY = 'cached_items';

export const ItemContext = createContext<ItemState>({ fetching: false, saving: false, isOnline: true });

interface ItemProviderProps {
  children: React.ReactNode;
}

export const ItemProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const [items, setItems] = useState<ItemProps[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<Error | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingError, setSavingError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const checkNetwork = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };
    checkNetwork();

    const handler = Network.addListener('networkStatusChange', (status) => {
      log('network status changed', status.connected);
      setIsOnline(status.connected);
      if (status.connected) {
        loadItems();
      }
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, []);

  const loadItems = useCallback(async () => {
    try {
      setFetching(true);
      setFetchingError(null);
      const status = await Network.getStatus();
      
      if (status.connected) {
        log('Fetching items from server...');
        const fetchedItems = await getItems();
        setItems(fetchedItems);
        await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(fetchedItems) });
      } else {
        log('Offline mode: Loading items from local storage...');
        const cached = await Preferences.get({ key: STORAGE_KEY });
        if (cached.value) {
          setItems(JSON.parse(cached.value));
        }
      }
    } catch (error) {
      log('Fetch items failed, falling back to local cache', error);
      setFetchingError(error as Error);
      const cached = await Preferences.get({ key: STORAGE_KEY });
      if (cached.value) {
        setItems(JSON.parse(cached.value));
      }
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    let cancelWebSocket: (() => void) | undefined;
    if (isOnline) {
      log('Initializing WebSocket...');
      cancelWebSocket = newWebSocket(message => {
        log('websocket message received', message);
        const { type, payload: item } = message;
        if (type === 'created' || type === 'updated') {
          setItems(prevItems => {
            const index = prevItems?.findIndex(i => i.id === item.id);
            let updated: ItemProps[];
            if (index === -1) {
              updated = [item, ...(prevItems || [])];
            } else {
              updated = prevItems!.map(i => (i.id === item.id ? item : i));
            }
            Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updated) });
            return updated;
          });
        }
      });
    }
    return () => {
      if (cancelWebSocket) {
        cancelWebSocket();
      }
    };
  }, [isOnline]);

  const saveItemHandler = useCallback(async (item: ItemProps) => {
    try {
      setSaving(true);
      setSavingError(null);
      const status = await Network.getStatus();

      if (status.connected) {
        let savedItem: ItemProps;
        if (item.id) {
          savedItem = await updateItem(item);
        } else {
          savedItem = await createItem(item);
        }
        log('item saved successfully to server', savedItem);
        setItems(prevItems => {
          const index = prevItems?.findIndex(i => i.id === savedItem.id);
          let updated: ItemProps[];
          if (index === -1) {
            updated = [savedItem, ...(prevItems || [])];
          } else {
            updated = prevItems!.map(i => (i.id === savedItem.id ? savedItem : i));
          }
          Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updated) });
          return updated;
        });
      } else {
        log('Offline mode: saving item locally');
        const offlineItem = { ...item, id: item.id || Date.now() };
        setItems(prevItems => {
          const updated = [offlineItem, ...(prevItems || [])];
          Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updated) });
          return updated;
        });
      }
    } catch (error) {
      log('saveItem failed', error);
      setSavingError(error as Error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteItemHandler = useCallback(async (id: number) => {
    try {
      setSaving(true);
      const status = await Network.getStatus();
      if (status.connected) {
        await deleteItem(id);
      }
      setItems(prevItems => {
        const updated = prevItems?.filter(i => i.id !== id) || [];
        Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updated) });
        return updated;
      });
    } catch (error) {
      log('deleteItem failed', error);
    } finally {
      setSaving(false);
    }
  }, []);

  const value = {
    items,
    fetching,
    fetchingError,
    saving,
    savingError,
    saveItem: saveItemHandler,
    deleteItem: deleteItemHandler,
    isOnline,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
};

export const useItems = () => useContext(ItemContext);