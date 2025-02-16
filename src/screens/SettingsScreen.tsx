import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/Button';

const SettingsScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [contacts, setContacts] = useState<string[]>([]);
  const [newContact, setNewContact] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track editing contact

  useEffect(() => {
    const loadSettings = async () => {
      const savedMessage = await AsyncStorage.getItem('emergencyMessage');
      const savedContactsString = await AsyncStorage.getItem('favContacts');

      setMessage(savedMessage || '');
      setContacts(savedContactsString ? JSON.parse(savedContactsString) : []);
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    await AsyncStorage.setItem('emergencyMessage', message);
    await AsyncStorage.setItem('favContacts', JSON.stringify(contacts));
    Alert.alert("Settings Saved", "Your emergency settings have been updated.");
  };

  const sendSOS = async () => {
    if (!message.trim()) {
      Alert.alert("Error", "Please set an emergency message.");
      return;
    }

    if (contacts.length === 0) {
      Alert.alert("Error", "No emergency contacts saved.");
      return;
    }

    const smsBody = encodeURIComponent(message);
    const phoneNumbers = contacts.join(','); // Combine contacts
    const smsURL = `sms:${phoneNumbers}?body=${smsBody}`;

    try {
      const supported = await Linking.canOpenURL(smsURL);
      if (supported) {
        await Linking.openURL(smsURL);
      } else {
        Alert.alert("Error", "SMS sending is not supported on this device.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to send SOS message.");
    }
  };

  const addOrUpdateContact = () => {
    const phoneRegex = /^[0-9]{10}$/; // Validate a 10-digit phone number
    if (!phoneRegex.test(newContact.trim())) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number.");
      return;
    }

    if (editingIndex !== null) {
      // Update existing contact
      const updatedContacts = [...contacts];
      updatedContacts[editingIndex] = newContact.trim();
      setContacts(updatedContacts);
      setEditingIndex(null);
    } else {
      // Add new contact
      setContacts([...contacts, newContact.trim()]);
    }

    setNewContact('');
  };

  const deleteContact = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
  };

  const editContact = (index: number) => {
    setNewContact(contacts[index]);
    setEditingIndex(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <Text>Emergency Message:</Text>
      <TextInput 
        style={styles.input} 
        value={message} 
        onChangeText={setMessage} 
        placeholder="Enter emergency message" 
      />

      <Text>Emergency Contacts:</Text>
      <FlatList
        data={contacts}
        renderItem={({ item, index }) => (
          <View style={styles.contactItem}>
            <Text>{item}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => editContact(index)} style={styles.editButton}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteContact(index)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <TextInput 
        style={styles.input} 
        value={newContact} 
        onChangeText={setNewContact} 
        placeholder="Add/Edit Contact (10-digit number)" 
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Button title={editingIndex !== null ? "Update Contact" : "Add Contact"} onPress={addOrUpdateContact} color={editingIndex !== null ? "#FFA500" : "#28A745"} />

      <Button title="Save Settings" onPress={saveSettings} color="#007BFF" />

      {/* SOS Button */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5, borderRadius: 5 },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#FFA500',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
