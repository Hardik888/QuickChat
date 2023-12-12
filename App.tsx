import React, {useEffect} from 'react';

import {AuthProvider} from './src/authContext';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid} from 'react-native';
import LoginUser from './src/LoginUser';
import ChatScreen from './src/ChatScreen';

PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

function App() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <LoginUser />
    </AuthProvider>
  );
}
export default App;
