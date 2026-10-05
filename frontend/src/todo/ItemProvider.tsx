import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { ItemProps } from './ItemProps';
import { createItem, deleteItem, getItems, newWebSocket, updateItem } from './itemApi';

const log = getLogger('ItemProvider');

type SaveItemFn = (item: ItemProps) => Promise<any>;
type DeleteItemFn = (id: number) => Promise<any>;

export interface ItemsState {
  items?: ItemProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveItemFn,
  deleteItem?: DeleteItemFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ItemsState = {
  fetching: false,
  saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const DELETE_ITEM_SUCCEEDED = 'DELETE_ITEM_SUCCEEDED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_ITEMS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_ITEMS_SUCCEEDED:
        return { ...state, items: payload.items, fetching: false };
      case FETCH_ITEMS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_ITEM_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_ITEM_SUCCEEDED:
        const items = [...(state.items || [])];
        const item = payload.item;
        const index = items.findIndex(it => it.id === item.id);
        if (index === -1) {
          items.splice(0, 0, item);
        } else {
          items[index] = item;
        }
        return { ...state, items, saving: false };
      case SAVE_ITEM_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      case DELETE_ITEM_SUCCEEDED:
        return {
          ...state,
          items: state.items?.filter(it => it.id !== payload.id),
        };
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<ItemsState>(initialState);

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items, fetching, fetchingError, saving, savingError } = state;
  
  useEffect(getItemsEffect, []);
  useEffect(wsEffect, []);
  
  const saveItem = useCallback<SaveItemFn>(saveItemCallback, []);
  const removeItem = useCallback<DeleteItemFn>(deleteItemCallback, []);
  
  const value = { items, fetching, fetchingError, saving, savingError, saveItem, deleteItem: removeItem };
  
  log('returns');
  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );

  function getItemsEffect() {
    let canceled = false;
    fetchItems();
    return () => {
      canceled = true;
    }

    async function fetchItems() {
      try {
        log('fetchItems started');
        dispatch({ type: FETCH_ITEMS_STARTED });
        const fetchedItems = await getItems();
        log('fetchItems succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { items: fetchedItems } });
        }
      } catch (error) {
        log('fetchItems failed', error);
        dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
      }
    }
  }

  async function saveItemCallback(item: ItemProps) {
    try {
      log('saveItem started');
      dispatch({ type: SAVE_ITEM_STARTED });
      const savedItem = await (item.id ? updateItem(item) : createItem(item));
      log('saveItem succeeded');
      dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      log('saveItem failed');
      dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
    }
  }

  async function deleteItemCallback(id: number) {
    try {
      log('deleteItem started');
      await deleteItem(id);
      log('deleteItem succeeded');
      dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { id } });
    } catch (error) {
      log('deleteItem failed', error);
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { type, payload: item } = message;
      log(`ws message, item ${type}`);
      if (type === 'CREATED' || type === 'UPDATED') {
        dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
      } else if (type === 'DELETED') {
        dispatch({ type: DELETE_ITEM_SUCCEEDED, payload: { id: item.id } });
      }
    });
    
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};