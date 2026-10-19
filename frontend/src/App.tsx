import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { ItemList } from './todo';
import { ItemProvider } from './todo/ItemProvider';
import ItemEdit from './todo/ItemEdit';
import { AuthProvider, Login, PrivateRoute } from './auth';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <ItemProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route path="/login" element={<Login />} />
            <Route path="/items" element={<PrivateRoute element={<ItemList />} path="/items" />} />
            <Route path="/item" element={<PrivateRoute element={<ItemEdit />} path="/item" />} />
            <Route path="/item/:id" element={<PrivateRoute element={<ItemEdit />} path="/item/:id" />} />
            <Route path="/" element={<Navigate to="/items" replace />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </ItemProvider>
    </AuthProvider>
  </IonApp>
);

export default App;