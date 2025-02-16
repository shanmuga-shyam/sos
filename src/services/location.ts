import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

// Request location permission (Android only)
export const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "SOS App needs access to your location for emergency services.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (error) {
            console.error("Permission error:", error);
            return false;
        }
    }
    return true; // iOS gets permission automatically in most cases
};

// Get the current location of the user
export const getCurrentLocation = (callback: (location: { latitude: number; longitude: number } | null) => void): void => {
    requestLocationPermission().then((granted) => {
        if (granted) {
            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    callback({ latitude, longitude });
                },
                (error) => {
                    console.error("Location error:", error);
                    callback(null);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } else {
            console.warn("Location permission denied");
            callback(null);
        }
    });
};
