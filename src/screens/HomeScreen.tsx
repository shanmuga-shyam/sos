import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [contacts, setContacts] = useState<string[]>([]);

  useEffect(() => {
    const fetchEmergencyContacts = async () => {
      const contactsString = await AsyncStorage.getItem('favContacts');
      setContacts(contactsString ? JSON.parse(contactsString) : []);
    };
    fetchEmergencyContacts();
  }, []);

  const sendSOS = async () => {
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.settingsText}>⚙️</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Welcome to SOS Emergency App</Text>

      <TouchableOpacity style={styles.sosButton} onPress={sendSOS}>
        <Text style={styles.sosText}>🚨 SOS</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  settingsButton: { position: 'absolute', top: 40, left: 20, padding: 10, backgroundColor: '#007BFF', borderRadius: 50 },
  settingsText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 50 },
  sosButton: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#DC3545', justifyContent: 'center', alignItems: 'center', elevation: 10 },
  sosText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
});

export default HomeScreen;
