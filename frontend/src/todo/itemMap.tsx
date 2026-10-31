import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { ItemContext } from './ItemProvider';
import MyMap from '../components/MyMap';

const ItemMap: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { items } = useContext(ItemContext);

  const item = items?.find(it => it.id === parseInt(id ?? '', 10));
  const hasLocation = item?.lat != null && item?.lng != null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/item/${id}`} />
          </IonButtons>
          <IonTitle>{item?.title ?? 'Task location'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {hasLocation ? (
          <>
            <p style={{ padding: '8px 16px', margin: 0, fontSize: '14px', color: '#666' }}>
              Saved at {item!.lat!.toFixed(5)}, {item!.lng!.toFixed(5)}
            </p>
            {/* Only mount the map once coordinates exist, since MyMap reads them on mount */}
            <div style={{ height: '70vh', width: '100%' }}>
              <MyMap readOnly lat={item!.lat!} lng={item!.lng!} />
            </div>
          </>
        ) : (
          <p style={{ padding: '16px' }}>This task has no saved location.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemMap;