import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Linking, SafeAreaView, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';  // Import Audio API from expo-av

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [contacts, setContacts] = useState<string[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const fetchEmergencyContacts = async () => {
      const contactsString = await AsyncStorage.getItem('favContacts');
      setContacts(contactsString ? JSON.parse(contactsString) : []);
    };
    fetchEmergencyContacts();
  }, []);

  // Function to play the siren sound
  const playSiren = async () => {
    try {
      console.log("🔊 Playing siren...");
      const { sound } = await Audio.Sound.createAsync(
        require('../components/fire-truck-siren-29900.mp3'), // Adjust path to match your project structure
        { shouldPlay: true, isLooping: true }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error("❌ Error playing siren:", error);
    }
  };

  // Function to stop the siren
  const stopSiren = async () => {
    if (sound) {
      console.log("🔇 Stopping siren...");
      await sound.stopAsync();
      await sound.unloadAsync(); // Free up resources
      setSound(null);
    }
  };

  const sendSOS = async () => {
    await playSiren(); // Play siren sound when SOS is pressed

    if (contacts.length === 0) {
      Alert.alert("⚠️ No Contacts", "Please add emergency contacts in Settings.");
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Allow location access to send SOS.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    let locationLink = `https://www.google.com/maps/?q=${location.coords.latitude},${location.coords.longitude}`;

    let message = (await AsyncStorage.getItem('emergencyMessage')) || "Emergency! Please help.";
    let finalMessage = `${message} \n\n📍 Location: ${locationLink}`;

    const smsBody = encodeURIComponent(finalMessage);
    const phoneNumbers = contacts.join(',');
    const smsURL = `sms:${phoneNumbers}?body=${smsBody}`;

    try {
      const supported = await Linking.canOpenURL(smsURL);
      if (supported) {
        await Linking.openURL(smsURL);
        Alert.alert("✅ SOS Sent!", "Your emergency message with location has been sent.");
      } else {
        Alert.alert("❌ Error", "SMS is not available on this device.");
      }
    } catch (error) {
      Alert.alert("⚠️ Error", "Could not send SOS message.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#FF416C', '#FF4B2B']}
        style={styles.background}
      />
      <TouchableOpacity 
        style={styles.settingsButton} 
        onPress={() => navigation.navigate('Settings')}
      >
        <Feather name="settings" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>SOS Emergency</Text>
        <Text style={styles.subtitle}>Tap the button below in case of emergency</Text>

        <TouchableOpacity style={styles.sosButton} onPress={sendSOS}>
          <LinearGradient
            colors={['#FF0000', '#FF5733']}
            style={styles.sosGradient}
          >
            <Text style={styles.sosText}>SOS</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stopButton} onPress={stopSiren}>
          <Text style={styles.stopText}>Stop Siren</Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          This will send your location and a pre-set message to your emergency contacts.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 50,
    textAlign: 'center',
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sosGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  stopButton: {
    marginTop: 20,
    backgroundColor: 'black',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  stopText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  helpText: {
    marginTop: 30,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default HomeScreen;
