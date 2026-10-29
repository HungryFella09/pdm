import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getItems, createItem, updateItem, deleteItem, newWebSocket } from './itemApi';
import { ItemProps } from './ItemProps';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
import { getLogger } from '../core';
import { AuthContext } from '../auth/AuthProvider';

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
  const { isAuthenticated } = useContext(AuthContext);
  const [items, setItems] = useState<ItemProps[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const [fetchingError, setFetchingError] = useState<Error | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingError, setSavingError] = useState<Error | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  
  const itemsRef = useRef<ItemProps[]>([]);

  const commit = useCallback((updated: ItemProps[]) => {
    itemsRef.current = updated;
    setItems(updated);
    Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(updated) });
  }, []);

  const hydrate = useCallback(async () => {
    const cached = await Preferences.get({ key: STORAGE_KEY });
    const list: ItemProps[] = cached.value ? JSON.parse(cached.value) : [];
    itemsRef.current = list;
    setItems(list);
  }, []);

  
  const upsert = useCallback((replaceId: number | undefined, saved: ItemProps) => {
    const current = itemsRef.current.filter(i => i.id === replaceId || i.id !== saved.id);
    const exists = current.some(i => i.id === replaceId);
    commit(exists
      ? current.map(i => (i.id === replaceId ? saved : i))
      : [saved, ...current]);
  }, [commit]);


  const syncPending = useCallback(async () => {
    for (const item of itemsRef.current.filter(i => i.pending)) {
      try {
        const { pending, ...payload } = item;
        const isServerItem = item.id !== undefined && item.id > 0;
        const saved = isServerItem
          ? await updateItem(payload)
          : await createItem({ ...payload, id: undefined });
        upsert(item.id, saved);
      } catch (error) {
        log('sync failed, will retry on next reconnect', item.id, error);
      }
    }
  }, [upsert]);

  const loadItems = useCallback(async () => {
    if (!isAuthenticated) {
      itemsRef.current = [];
      setItems([]);
      await Preferences.remove({ key: STORAGE_KEY });
      return;
    }
    setFetching(true);
    setFetchingError(null);
    try {
      await hydrate(); 
      const { connected } = await Network.getStatus();
      if (connected) {
        await syncPending();
        const pendingItems = itemsRef.current.filter(i => i.pending);
        const pendingIds = new Set(pendingItems.map(i => i.id));
        const fetched = await getItems();
        
        commit([
          ...pendingItems,
          ...fetched.filter(i => !pendingIds.has(i.id)),
        ]);
      } else {
        log('Offline mode: using local cache');
      }
    } catch (error) {
      log('Fetch items failed, using local cache', error);
      setFetchingError(error as Error);
    } finally {
      setFetching(false);
    }
  }, [isAuthenticated, hydrate, syncPending, commit]);

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
  }, [loadItems]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  useEffect(() => {
    if (!isOnline || !isAuthenticated) {
      return;
    }
    log('Initializing WebSocket...');
    const cancelWebSocket = newWebSocket(message => {
      log('websocket message received', message);
      const { type, payload: item } = message;
      if (type !== 'created' && type !== 'updated') {
        return;
      }
      const current = itemsRef.current;
      const existing = current.find(i => i.id === item.id);
      if (!existing) {
        commit([item, ...current]);
      } else if (!existing.pending) {
        
        commit(current.map(i => (i.id === item.id ? item : i)));
      }
    });
    return cancelWebSocket;
  }, [isOnline, isAuthenticated, commit]);

  
  const queueLocally = useCallback((item: ItemProps) => {
    const current = itemsRef.current;
    if (item.id === undefined) {
      const local: ItemProps = { ...item, id: -Date.now(), pending: true };
      commit([local, ...current]);
    } else {
      commit(current.map(i => (i.id === item.id ? { ...item, pending: true } : i)));
    }
  }, [commit]);

  const saveItemHandler = useCallback(async (item: ItemProps) => {
    setSaving(true);
    setSavingError(null);
    try {
      const { connected } = await Network.getStatus();
      if (connected) {
        try {
          const { pending, ...payload } = item;
          const isServerItem = item.id !== undefined && item.id > 0;
          const saved = isServerItem
            ? await updateItem(payload)
            : await createItem({ ...payload, id: undefined });
          upsert(item.id, saved);
          return;
        } catch (error) {
          log('REST save failed, storing locally', error);
        }
      }
      queueLocally(item);
    } catch (error) {
      log('saveItem failed', error);
      setSavingError(error as Error);
    } finally {
      setSaving(false);
    }
  }, [upsert, queueLocally]);

  const deleteItemHandler = useCallback(async (id: number) => {
    setSaving(true);
    try {
      const { connected } = await Network.getStatus();
      if (connected && id > 0) {
        await deleteItem(id);
      }
      commit(itemsRef.current.filter(i => i.id !== id));
    } catch (error) {
      log('deleteItem failed', error);
    } finally {
      setSaving(false);
    }
  }, [commit]);

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