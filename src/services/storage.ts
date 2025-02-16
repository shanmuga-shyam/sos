import AsyncStorage from '@react-native-async-storage/async-storage';

// Save data to AsyncStorage
export const saveData = async <T>(key: string, value: T): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error("Error saving data:", error);
    }
};

// Retrieve data from AsyncStorage
export const getData = async <T>(key: string): Promise<T | null> => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue ? JSON.parse(jsonValue) as T : null;
    } catch (error) {
        console.error("Error retrieving data:", error);
        return null;
    }
};

// Remove data from AsyncStorage
export const removeData = async (key: string): Promise<void> => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error("Error removing data:", error);
    }
};
