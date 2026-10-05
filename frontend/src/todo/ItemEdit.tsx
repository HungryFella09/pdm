import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';
import { ItemProps } from './ItemProps';

const log = getLogger('ItemEdit');

const ItemEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { items, saving, savingError, saveItem } = useContext(ItemContext);
  
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [isCompleted, setIsCompleted] = useState(false);
  const [item, setItem] = useState<ItemProps>();

  useEffect(() => {
    log('useEffect');
    const routeId = id ? parseInt(id, 10) : undefined;
    const currentItem = items?.find(it => it.id === routeId);
    setItem(currentItem);
    if (currentItem) {
      setTitle(currentItem.title);
      setPriority(currentItem.priority);
      setDueDate(currentItem.dueDate);
      setIsCompleted(currentItem.isCompleted);
    }
  }, [id, items]);

  const handleSave = () => {
    const editedItem = item 
      ? { ...item, title, priority, dueDate, isCompleted } 
      : { title, priority, dueDate, isCompleted };
      
    saveItem && saveItem(editedItem as ItemProps).then(() => navigate(-1));
  };

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{item ? 'Edit Task' : 'New Task'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonInput label="Title" labelPlacement="stacked" value={title} onIonChange={e => setTitle(e.detail.value || '')} />
        </IonItem>
        <IonItem>
          <IonInput label="Priority" labelPlacement="stacked" type="number" value={priority} onIonChange={e => setPriority(parseInt(e.detail.value || '1', 10))} />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Due Date</IonLabel>
          <IonDatetime presentation="date" value={dueDate} onIonChange={e => setDueDate(typeof e.detail.value === 'string' ? e.detail.value.substring(0, 10) : dueDate)} />
        </IonItem>
        <IonItem>
          <IonCheckbox checked={isCompleted} onIonChange={e => setIsCompleted(e.detail.checked)}>Completed</IonCheckbox>
        </IonItem>

        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save item'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;