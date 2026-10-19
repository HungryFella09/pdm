import React, { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Login');

export const Login: React.FC = () => {
  const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = useCallback(() => {
    log('handleLogin...');
    login?.(username, password);
  }, [username, password, login]);

  if (isAuthenticated) {
    navigate('/items', { replace: true });
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput placeholder="Username" value={username} onIonChange={e => setUsername(e.detail.value || '')} />
        <IonInput type="password" placeholder="Password" value={password} onIonChange={e => setPassword(e.detail.value || '')} />
        <IonLoading isOpen={isAuthenticating}/>
        {authenticationError && (
          <div style={{ color: 'red' }}>{authenticationError.message || 'Failed to authenticate'}</div>
        )}
        <IonButton expand="block" onClick={handleLogin}>Login</IonButton>
      </IonContent>
    </IonPage>
  );
};