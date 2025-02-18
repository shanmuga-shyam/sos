import React, { useEffect, useState } from "react";
import { View, Text, PermissionsAndroid, Platform } from "react-native";
import { NetworkInfo } from "react-native-network-info";

/**
 * Request location permissions for Android 10+
 */
const requestPermissions = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "App needs access to your location to get WiFi BSSID.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Deny",
          buttonPositive: "Allow",
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Permission request error:", err);
      return false;
    }
  }
  return true;
};

export const getCurrentLocation = async (): Promise<string> => {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return "Location Permission Denied";
    }

    const bssid = await NetworkInfo.getBSSID();

    if (!bssid) {
      console.warn("No WiFi connection or BSSID unavailable.");
      return "Unknown Location (Not Connected to WiFi)";
    }

    console.log(`Connected BSSID: ${bssid}`);

    // Sample BSSID-to-Location Mapping
    const locationMapping: { [key: string]: string } = {
      "00:14:22:01:23:45": "8th Floor - Canteen",
      "00:14:22:01:23:46": "9th Floor - Lab 302",
      "00:14:22:01:23:47": "7th Floor - Classroom 204",
      "00:14:22:01:23:48": "Library - Ground Floor",
    };

    return locationMapping[bssid] || "Unknown Location";
  } catch (error) {
    console.error("Error fetching WiFi BSSID:", error);
    return "Unknown Location (Error Fetching BSSID)";
  }
};

const TestScreen = () => {
  const [location, setLocation] = useState<string>("Fetching...");

  useEffect(() => {
    getCurrentLocation().then(setLocation);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>WiFi Location:</Text>
      <Text style={{ fontSize: 18, marginTop: 10 }}>{location}</Text>
    </View>
  );
};

export default TestScreen;
