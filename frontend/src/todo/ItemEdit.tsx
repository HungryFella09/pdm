import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonImg,
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
import { useCamera } from './useCamera';
import { useFilesystem } from './useFilesystem';
import { useMyLocation } from './useMyLocation';
import MyMap from '../components/MyMap';

const log = getLogger('ItemEdit');

// Map center used only until a real location exists
const DEFAULT_LAT = 46.7712;
const DEFAULT_LNG = 23.6236;

const ItemEdit: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { items, saving, savingError, saveItem } = useContext(ItemContext);
  const { getPhoto } = useCamera();
  const { readFile, writeFile } = useFilesystem();
  const myLocation = useMyLocation();

  const [item, setItem] = useState<ItemProps>();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<number>(1);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [isCompleted, setIsCompleted] = useState(false);
  const [photoPath, setPhotoPath] = useState<string | undefined>();
  const [webviewPath, setWebviewPath] = useState<string | undefined>();

  // Undefined until the saved item, the user, or GPS provides a location
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();

  // Route we've already loaded the form for, so later re-renders don't overwrite edits
  const loadedKeyRef = useRef<string | null>(null);
  // Once true, GPS updates are ignored
  const locationSetRef = useRef(false);

  // Load the form once per route, after items are available
  useEffect(() => {
    const key = id ?? 'new';
    if (loadedKeyRef.current === key) return;

    if (!id) {
      loadedKeyRef.current = key;
      return;
    }

    const currentItem = items?.find(it => it.id === parseInt(id, 10));
    if (!currentItem) return; // items not loaded yet

    loadedKeyRef.current = key;
    setItem(currentItem);
    setTitle(currentItem.title);
    setPriority(currentItem.priority);
    setDueDate(currentItem.dueDate);
    setIsCompleted(currentItem.isCompleted);
    setPhotoPath(currentItem.photoPath);

    if (currentItem.lat != null && currentItem.lng != null) {
      setLat(currentItem.lat);
      setLng(currentItem.lng);
      locationSetRef.current = true;
    }

    if (currentItem.photoPath) {
      readFile(currentItem.photoPath)
        .then(data => setWebviewPath(`data:image/jpeg;base64,${data}`))
        .catch(err => log('could not load photo', err));
    }
  }, [id, items, readFile]);

  // Use GPS only until the item or the user has provided a location
  useEffect(() => {
    if (locationSetRef.current || !myLocation.position) return;
    locationSetRef.current = true;
    setLat(myLocation.position.coords.latitude);
    setLng(myLocation.position.coords.longitude);
  }, [myLocation.position]);

  // Stable callback so MyMap doesn't re-render needlessly
  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    locationSetRef.current = true;
    setLat(newLat);
    setLng(newLng);
  }, []);

  const handleTakePhoto = async () => {
    try {
      const photo = await getPhoto();
      const fileName = `${Date.now()}.jpeg`;
      await writeFile(fileName, photo.base64String!);
      setPhotoPath(fileName);
      setWebviewPath(`data:image/jpeg;base64,${photo.base64String}`);
    } catch (error) {
      log('Camera cancelled or failed', error);
    }
  };

  const handleSave = () => {
    const editedItem = item
      ? { ...item, title, priority, dueDate, isCompleted, photoPath, lat, lng }
      : { title, priority, dueDate, isCompleted, photoPath, lat, lng };

    saveItem?.(editedItem as ItemProps)
      .then(() => navigate(-1))
      .catch(err => log('save failed', err));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{item ? 'Edit Task' : 'New Task'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonInput
            label="Title"
            labelPlacement="stacked"
            value={title}
            onIonChange={e => setTitle(e.detail.value || '')}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Priority"
            labelPlacement="stacked"
            type="number"
            value={priority}
            onIonChange={e => setPriority(parseInt(e.detail.value || '1', 10))}
          />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Due Date</IonLabel>
          <IonDatetime
            presentation="date"
            value={dueDate}
            onIonChange={e =>
              setDueDate(typeof e.detail.value === 'string' ? e.detail.value.substring(0, 10) : dueDate)
            }
          />
        </IonItem>
        <IonItem>
          <IonCheckbox checked={isCompleted} onIonChange={e => setIsCompleted(e.detail.checked)}>
            Completed
          </IonCheckbox>
        </IonItem>

        {/* Camera */}
        <IonItem lines="none" style={{ marginTop: '16px' }}>
          <IonButton expand="block" onClick={handleTakePhoto}>Take Photo</IonButton>
        </IonItem>
        {webviewPath && (
          <IonItem>
            <IonImg src={webviewPath} style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }} />
          </IonItem>
        )}

        {/* Map */}
        <div style={{ padding: '16px 0', textAlign: 'center' }}>
          <h3>Task Location</h3>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {lat != null && lng != null
              ? `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
              : 'No location set. Tap the map to pick one.'}
          </p>
          <div style={{ height: '250px', width: '100%', padding: '0 16px' }}>
            <MyMap
              lat={lat ?? DEFAULT_LAT}
              lng={lng ?? DEFAULT_LNG}
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>
        <IonButton
          expand="block"
          fill="outline"
          disabled={item?.lat == null}
          onClick={() => navigate(`/item/${id}/map`)}
        >
          Show saved location on map
        </IonButton>

        <IonLoading isOpen={saving} />
        {savingError && (
          <div style={{ color: 'red', padding: '16px' }}>
            {savingError.message || 'Failed to save item'}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ItemEdit;