import axios from 'axios';
import { baseUrl, getLogger, withLogs } from '../core';
import { ItemProps } from './ItemProps';
import { getMemoryToken } from '../auth/authApi';

const itemUrl = `http://${baseUrl}/api/todos`;

export const getItems: () => Promise<ItemProps[]> = () => {
  return withLogs(axios.get(itemUrl), 'getItems');
}

export const createItem: (item: ItemProps) => Promise<ItemProps> = (item) => {
  return withLogs(axios.post(itemUrl, item), 'createItem');
}

export const updateItem: (item: ItemProps) => Promise<ItemProps> = (item) => {
  return withLogs(axios.put(`${itemUrl}/${item.id}`, item), 'updateItem');
}

export const deleteItem: (id: number) => Promise<any> = (id) => {
  return withLogs(axios.delete(`${itemUrl}/${id}`), 'deleteItem');
}

interface MessageData {
  type: string;
  payload: ItemProps;
}

const log = getLogger('ws');

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const token = getMemoryToken();
  log('WebSocket attempting connection, token present:', !!token);
  
  const wsUrl = `ws://${baseUrl}/ws/todos${token ? `?token=${token}` : ''}`;
  log('WebSocket full URL constructed');
  
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage received raw:', messageEvent.data);
    try {
      const parsedData = JSON.parse(messageEvent.data);
      onMessage(parsedData);
    } catch (e) {
      log('Failed to parse websocket message', e);
    }
  };

  return () => {
    ws.close();
  };
}