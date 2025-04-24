import * as SecureStore from 'expo-secure-store';

// Key for storing the JWT token
const TOKEN_KEY = 'cosmo_jwt_token';

/**
 * Saves the JWT token to secure storage
 * 
 * @param token JWT token to store
 * @returns Promise that resolves when the token is stored
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token to secure storage:', error);
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
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error retrieving token from secure storage:', error);
    return null;
  }
};

/**
 * Removes the JWT token from secure storage (for logout)
 * 
 * @returns Promise that resolves when the token is removed
 */
export const removeToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token from secure storage:', error);
    throw error;
  }
};