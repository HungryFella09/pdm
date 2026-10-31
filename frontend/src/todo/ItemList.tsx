import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonFab,
  IonFabButton,
  IonIcon,
  useIonViewDidEnter,
  createAnimation
} from '@ionic/react';
import { add, logOut } from 'ionicons/icons';
import { ItemContext } from './ItemProvider';
import { useFilesystem } from './useFilesystem';
import { AuthContext } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { getLogger } from '../core';

const log = getLogger('ItemList');
const PAGE_SIZE = 10;

const ItemList: React.FC = () => {
  const { items, fetching, fetchingError, isOnline } = useContext(ItemContext);
  const { logout } = useContext(AuthContext);
  const { readFile } = useFilesystem();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState(false);
  const [itemThumbnails, setItemThumbnails] = useState<{ [key: string]: string }>({});

  const listAnimRef = useRef<HTMLDivElement>(null);

  useIonViewDidEnter(() => {
    if (listAnimRef.current) {
      const animation = createAnimation()
        .addElement(listAnimRef.current)
        .duration(600)
        .fromTo('transform', 'translateY(30px)', 'translateY(0)')
        .fromTo('opacity', '0', '1');

      animation.play();
    }
  });

  useEffect(() => {
    if (!items) return;
    items.forEach(async (item) => {
      if (item.photoPath && !itemThumbnails[item.photoPath]) {
        try {
          const data = await readFile(item.photoPath);
          setItemThumbnails(prev => ({ ...prev, [item.photoPath!]: `data:image/jpeg;base64,${data}` }));
        } catch (e) {
          setItemThumbnails(prev => ({ ...prev, [item.photoPath!]: `http://localhost:8080/photos/${item.photoPath}` }));
        }
      }
    });
  }, [items, readFile]);

  const filteredItems = items?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? !item.isCompleted :
      item.isCompleted;
    return matchesSearch && matchesStatus;
  }) || [];

  const paginatedItems = filteredItems.slice(0, displayedCount);

  function loadData(ev: any) {
    setTimeout(() => {
      setDisplayedCount(prev => {
        const nextCount = prev + PAGE_SIZE;
        if (nextCount >= filteredItems.length) {
          setDisableInfiniteScroll(true);
        }
        return nextCount;
      });
      ev.target.complete();
    }, 500);
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Tasks {!isOnline && '(Offline Mode)'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => logout?.()}>
              <IonIcon icon={logOut} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            value={searchText}
            onIonInput={e => {
              setSearchText(e.detail.value || '');
              setDisplayedCount(PAGE_SIZE);
              setDisableInfiniteScroll(false);
            }}
            placeholder="Search tasks..."
          />
          <IonSegment
            value={statusFilter}
            onIonChange={e => {
              setStatusFilter(e.detail.value as any);
              setDisplayedCount(PAGE_SIZE);
              setDisableInfiniteScroll(false);
            }}
          >
            <IonSegmentButton value="all">All</IonSegmentButton>
            <IonSegmentButton value="active">Active</IonSegmentButton>
            <IonSegmentButton value="completed">Completed</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {/* Animated container wrapping the list */}
        <div ref={listAnimRef}>
          <IonList>
            {paginatedItems.map((item) => {
              const thumb = item.photoPath ? itemThumbnails[item.photoPath] || item.webviewPath : undefined;
              return (
                <IonItem key={item.id} routerLink={`/item/${item.id}`}>
                  {/* Photo Thumbnail Displayed in List */}
                  {thumb ? (
                    <img
                      slot="start"
                      src={thumb}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', margin: '8px 0' }}
                      alt="task thumbnail"
                    />
                  ) : (
                    <div slot="start" style={{ width: '50px', height: '50px' }} />
                  )}
                  
                  <IonLabel>
                    <h2>{item.title}</h2>
                    <p>
                      Priority: {item.priority} | Due: {item.dueDate} | {item.isCompleted ? 'Done' : 'Active'}
                      {item.pending && ' | Pending Sync'}
                    </p>
                    {item.lat != null && item.lng != null && (
                      <p> {item.lat.toFixed(5)}, {item.lng.toFixed(5)}</p>
                    )}
                  </IonLabel>
                </IonItem>
              );
            })}
          </IonList>
        </div>

        <IonInfiniteScroll
          onIonInfinite={loadData}
          disabled={disableInfiniteScroll}
        >
          <IonInfiniteScrollContent loadingText="Loading more tasks..." />
        </IonInfiniteScroll>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => navigate('/item')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export { ItemList };
export default ItemList;