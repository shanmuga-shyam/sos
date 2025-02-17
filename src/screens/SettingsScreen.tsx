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

        <Text style={styles.label}>Emergency Message:</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter emergency message"
          placeholderTextColor="#a0a0a0"
        />

        <Text style={styles.label}>Emergency Contacts:</Text>
        <FlatList
          data={contacts}
          renderItem={({ item, index }) => (
            <View style={styles.contactItem}>
              <Text style={styles.contactText}>{item}</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={() => editContact(index)} style={styles.iconButton}>
                  <Feather name="edit" size={20} color="#FFA500" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteContact(index)} style={styles.iconButton}>
                  <Feather name="trash-2" size={20} color="#DC3545" />
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
          placeholderTextColor="#a0a0a0"
          keyboardType="phone-pad"
          maxLength={10}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: editingIndex !== null ? "#FFA500" : "#28A745" }]}
          onPress={addOrUpdateContact}
        >
          <Text style={styles.buttonText}>{editingIndex !== null ? "Update Contact" : "Add Contact"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveSettings}>
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
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "white",
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    color: "white",
  },
  contactItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 5,
    marginBottom: 10,
  },
  contactText: {
    color: "white",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#28A745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: "#007BFF",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default SettingsScreen

