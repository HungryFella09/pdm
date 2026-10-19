import React, { useContext, useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonFab, 
  IonFabButton, 
  IonIcon, 
  IonLoading, 
  IonButton,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  useIonRouter
} from '@ionic/react';
import { add, logOut } from 'ionicons/icons';
import { ItemContext } from './ItemProvider';
import { AuthContext } from '../auth';

const PAGE_SIZE = 10;

export const ItemList: React.FC = () => {
  const { items, fetching, fetchingError, isOnline } = useContext(ItemContext);
  const { logout } = useContext(AuthContext);
  const router = useIonRouter();

  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [displayedCount, setDisplayedCount] = useState<number>(PAGE_SIZE);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

  const filteredItems = items?.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'completed' ? item.isCompleted :
      statusFilter === 'active' ? !item.isCompleted : true;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const paginatedItems = filteredItems.slice(0, displayedCount);

  const loadMoreData = async (event: CustomEvent<void>) => {
    setTimeout(() => {
      setDisplayedCount(prevCount => {
        const nextCount = prevCount + PAGE_SIZE;
        if (nextCount >= filteredItems.length) {
          setDisableInfiniteScroll(true);
        }
        return nextCount;
      });
      (event.target as HTMLIonInfiniteScrollElement).complete();
    }, 500);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My To-Do Tasks {!isOnline && '(Offline Mode)'}</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => logout && logout()}>
            <IonIcon icon={logOut} slot="icon-only" />
          </IonButton>
        </IonToolbar>

        <IonToolbar>
          <IonSearchbar 
            value={searchText} 
            onIonInput={e => setSearchText(e.detail.value || '')} 
            placeholder="Search tasks..." 
          />
        </IonToolbar>

        <IonToolbar>
          <IonSegment value={statusFilter} onIonChange={e => setStatusFilter(String(e.detail.value))}>
            <IonSegmentButton value="all">
              <IonLabel>All</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="active">
              <IonLabel>Active</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="completed">
              <IonLabel>Completed</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonLoading isOpen={fetching} message="Fetching tasks..." />
        
        {fetchingError && <div>{fetchingError.message}</div>}

        <IonList>
          {paginatedItems.map((item) => (
            <IonItem key={item.id} routerLink={`/item/${item.id}`}>
              <IonLabel>
                <h2>{item.title}</h2>
                <p>Priority: {item.priority} | Due: {item.dueDate} | {item.isCompleted ? 'Done' : 'Active'}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonInfiniteScroll 
          disabled={disableInfiniteScroll} 
          onIonInfinite={loadMoreData}
        >
          <IonInfiniteScrollContent 
            loadingSpinner="bubbles" 
            loadingText="Loading more tasks..." 
          />
        </IonInfiniteScroll>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => router.push('/item')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};