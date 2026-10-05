import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Item from './Item';
import { getLogger } from '../core';
import { ItemContext } from './ItemProvider';

const log = getLogger('ItemList');

const ItemList: React.FC = () => {
  const { items, fetching, fetchingError, deleteItem } = useContext(ItemContext);
  const navigate = useNavigate();
  log('render', fetching);
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>To-Do List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching items"/>
        {items && (
          <IonList>
            {items.map(({ id, title, priority, dueDate, isCompleted }) =>
              <Item 
                key={id} 
                id={id} 
                title={title} 
                priority={priority} 
                dueDate={dueDate} 
                isCompleted={isCompleted} 
                onEdit={itemId => navigate(`/item/${itemId}`)}
                onDelete={itemId => itemId && deleteItem?.(itemId)}
              />
            )}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch items'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => navigate('/item')}>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default ItemList;