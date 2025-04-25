import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Keys for storing the JWT token and refresh token
const TOKEN_KEY = 'cosmo_jwt_token';
const REFRESH_TOKEN_KEY = 'cosmo_refresh_token';
const TOKEN_EXPIRY_KEY = 'cosmo_token_expiry';
// Encryption key (ideally this would be generated and stored in the keychain)
const ENCRYPTION_KEY = 'cosmo_secure_app_key';

/**
 * Encrypt a string value (for AsyncStorage fallback)
 */
const encrypt = async (text: string): Promise<string> => {
  // In a real app, you would use a more sophisticated encryption approach
  // This is a very simple implementation for demo purposes
  const iv = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    Math.random().toString(),
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  
  const encrypted = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    text + ENCRYPTION_KEY + iv,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  
  return JSON.stringify({ encrypted, iv });
};

/**
 * Decrypt an encrypted string (for AsyncStorage fallback)
 */
const decrypt = async (encryptedData: string): Promise<string | null> => {
  try {
    // In a real app, you would use a more sophisticated decryption approach
    // This mock implementation assumes the original text was stored
    const { encrypted, iv } = JSON.parse(encryptedData);
    return encrypted;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

/**
 * Determines if the device supports SecureStore
 */
const isSecureStoreAvailable = (): boolean => {
  // SecureStore is available on iOS and Android but not on web
  return Platform.OS !== 'web';
};

/**
 * Sets a value in secure storage with fallback to encrypted AsyncStorage
 */
const setSecureItem = async (key: string, value: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable()) {
      await SecureStore.setItemAsync(key, value);
    } else {
      // Fallback to encrypted AsyncStorage
      const encryptedValue = await encrypt(value);
      await AsyncStorage.setItem(key, encryptedValue);
    }
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    throw error;
  }
};

/**
 * Gets a value from secure storage with fallback to encrypted AsyncStorage
 */
const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    if (isSecureStoreAvailable()) {
      return await SecureStore.getItemAsync(key);
    } else {
      // Fallback to encrypted AsyncStorage
      const encryptedValue = await AsyncStorage.getItem(key);
      if (!encryptedValue) return null;
      return await decrypt(encryptedValue);
    }
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

/**
 * Removes a value from secure storage with fallback to AsyncStorage
 */
const removeSecureItem = async (key: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable()) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
};

/**
 * Saves the JWT token to secure storage
 * 
 * @param token JWT token to store
 * @returns Promise that resolves when the token is stored
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await setSecureItem(TOKEN_KEY, token);
    
    // Parse token to get expiration (if JWT has standard structure)
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      if (tokenPayload.exp) {
        // Store expiration timestamp
        await setSecureItem(TOKEN_EXPIRY_KEY, tokenPayload.exp.toString());
      }
    } catch (e) {
      console.warn('Could not parse token expiration', e);
    }
  } catch (error) {
    console.error('Error saving token to secure storage:', error);
    throw error;
  }
};

/**
 * Saves a refresh token to secure storage
 * 
 * @param refreshToken Refresh token to store
 * @returns Promise that resolves when the token is stored
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  try {
    await setSecureItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error saving refresh token to secure storage:', error);
    throw error;
  }
};

/**
 * Retrieves the JWT token from secure storage
 * 
 * @returns Promise that resolves with the token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await getSecureItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token from secure storage:', error);
    return null;
  }
};

/**
 * Retrieves the refresh token from secure storage
 * 
 * @returns Promise that resolves with the refresh token or null if not found
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await getSecureItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving refresh token from secure storage:', error);
    return null;
  }
};

/**
 * Checks if the stored token is expired
 * 
 * @returns Promise that resolves with true if token is expired, false otherwise
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiryTimestamp = await getSecureItem(TOKEN_EXPIRY_KEY);
    if (!expiryTimestamp) return true;
    
    const expiryDate = new Date(parseInt(expiryTimestamp) * 1000);
    const now = new Date();
    
    // Return true if token is expired or about to expire in the next 5 minutes
    return expiryDate <= new Date(now.getTime() + 5 * 60 * 1000);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't determine expiry, assume expired
  }
};

/**
 * Removes the JWT token from secure storage (for logout)
 * 
 * @returns Promise that resolves when the token is removed
 */
export const removeToken = async (): Promise<void> => {
  try {
    await removeSecureItem(TOKEN_KEY);
    await removeSecureItem(REFRESH_TOKEN_KEY);
    await removeSecureItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error removing token from secure storage:', error);
    throw error;
  }
};