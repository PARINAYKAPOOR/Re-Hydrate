import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Container from './frontend/Container';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

export default function App() {

  useEffect(() => {
    // request notification permission
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('granted')
        alert('You need to enable permissions in settings');
      } else {
        console.log()
      }
    })();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  return (
    <View style={styles.container}>
      <Container />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
});
