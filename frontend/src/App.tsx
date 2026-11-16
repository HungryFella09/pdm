import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, createAnimation } from '@ionic/react';
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
import ItemMap from './todo/itemMap';

setupIonicReact();

const customTransition = (
  _: HTMLElement,
  opts: { enteringEl: HTMLElement; leavingEl: HTMLElement; direction?: string }
) => {
  const enteringEl = opts.enteringEl;
  const leavingEl = opts.leavingEl;

  const rootTransition = createAnimation()
    .duration(400)
    .easing('cubic-bezier(0.36, 0.66, 0.04, 1)');

  const enteringAnimation = createAnimation()
    .addElement(enteringEl)
    .fromTo('transform', 'translateY(100%)', 'translateY(0)')
    .fromTo('opacity', '0', '1');

  const leavingAnimation = createAnimation()
    .addElement(leavingEl)
    .fromTo('transform', 'translateY(0)', 'translateY(-20%)')
    .fromTo('opacity', '1', '0');

  if (opts.direction === 'back') {
    rootTransition.addAnimation([leavingAnimation, enteringAnimation]);
  } else {
    rootTransition.addAnimation([enteringAnimation, leavingAnimation]);
  }

  return rootTransition;
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <ItemProvider>
        <IonReactRouter>
          <IonRouterOutlet animation={customTransition}>
            <Route path="/login" element={<Login />} />
            <Route path="/items" element={<PrivateRoute element={<ItemList />} path="/items" />} />
            <Route path="/item" element={<PrivateRoute element={<ItemEdit />} path="/item" />} />
            <Route path="/item/:id" element={<PrivateRoute element={<ItemEdit />} path="/item/:id" />} />
            <Route path="/item/:id/map" element={<PrivateRoute path="/item/:id/map" element={<ItemMap />} />} />
            <Route path="/" element={<Navigate to="/items" replace />} />
          </IonRouterOutlet>
        </IonReactRouter>
      </ItemProvider>
    </AuthProvider>
  </IonApp>
);

export default App;