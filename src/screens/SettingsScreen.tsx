"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { Feather } from "@expo/vector-icons"

const emergencySuggestions = [
  "I'm feeling unwell, need medical assistance.",
  "There's a fire in the building, please send help!",
  "I am stuck in the elevator, need assistance!",
  "Emergency in the hostel, urgent help needed!",
  "Security issue near the college gate, please respond!",
]

const SettingsScreen: React.FC = () => {
  const [message, setMessage] = useState("")
  const [contacts, setContacts] = useState<string[]>([])
  const [newContact, setNewContact] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      const savedMessage = await AsyncStorage.getItem("emergencyMessage")
      const savedContactsString = await AsyncStorage.getItem("favContacts")

      setMessage(savedMessage || "")
      setContacts(savedContactsString ? JSON.parse(savedContactsString) : [])
    }

    loadSettings()
  }, [])

  const saveSettings = async () => {
    await AsyncStorage.setItem("emergencyMessage", message)
    await AsyncStorage.setItem("favContacts", JSON.stringify(contacts))
    Alert.alert("Settings Saved", "Your emergency settings have been updated.")
  }

  const addOrUpdateContact = () => {
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(newContact.trim())) {
      Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number.")
      return
    }

    if (editingIndex !== null) {
      const updatedContacts = [...contacts]
      updatedContacts[editingIndex] = newContact.trim()
      setContacts(updatedContacts)
      setEditingIndex(null)
    } else {
      setContacts([...contacts, newContact.trim()])
    }

    setNewContact("")
  }

  const deleteContact = (index: number) => {
    Alert.alert("Delete Contact", "Are you sure you want to delete this contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => {
          const updatedContacts = contacts.filter((_, i) => i !== index)
          setContacts(updatedContacts)
        },
        style: "destructive",
      },
    ])
  }

  const editContact = (index: number) => {
    setNewContact(contacts[index])
    setEditingIndex(index)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.background} />
      <View style={styles.content}>
        <Text style={styles.title}>Emergency Settings</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Emergency Message</Text>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Enter emergency message"
            placeholderTextColor="#a0a0a0"
            multiline
          />

          <Text style={styles.sublabel}>Quick Messages</Text>
          <View style={styles.suggestionsContainer}>
            {emergencySuggestions.map((suggestion, index) => (
              <TouchableOpacity key={index} style={styles.suggestionItem} onPress={() => setMessage(suggestion)}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Emergency Contacts</Text>
          <View style={styles.addContactContainer}>
            <TextInput
              style={styles.addContactInput}
              value={newContact}
              onChangeText={setNewContact}
              placeholder="Add new contact"
              placeholderTextColor="#a0a0a0"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.addContactButton} onPress={addOrUpdateContact}>
              <Feather name={editingIndex !== null ? "check" : "plus"} size={20} color="white" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={contacts}
            renderItem={({ item, index }) => (
              <View style={styles.contactItem}>
                <Text style={styles.contactText}>{item}</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={() => editContact(index)} style={styles.iconButton}>
                    <Feather name="edit-2" size={16} color="#4c669f" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteContact(index)} style={styles.iconButton}>
                    <Feather name="trash-2" size={16} color="#DC3545" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  sublabel: {
    fontSize: 16,
    color: "white",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    padding: 12,
    color: "white",
    minHeight: 50,
  },
  suggestionsContainer: {
    borderRadius: 8,
    overflow: "hidden",
  },
  suggestionItem: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 12,
    marginBottom: 1,
  },
  suggestionText: {
    color: "#e0e0e0",
    fontSize: 15,
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    marginBottom: 8,
  },
  contactText: {
    color: "white",
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 6,
  },
  addContactContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  addContactInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    padding: 12,
    color: "white",
  },
  addContactButton: {
    backgroundColor: "#4c669f",
    width: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#4c669f",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
})

export default SettingsScreen

