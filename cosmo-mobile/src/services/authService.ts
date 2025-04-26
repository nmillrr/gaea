import { removeToken } from '../utils/secureStorage';

// This is a singleton service to handle authentication
// without creating circular dependencies
class AuthService {
  private static instance: AuthService;
  private logoutCallback: (() => void) | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a callback to be called when logout is needed
   */
  public registerLogoutCallback(callback: () => void): void {
    this.logoutCallback = callback;
  }

  /**
   * Perform logout
   */
  public async logout(): Promise<void> {
    // Clear token from secure storage
    await removeToken();
    
    // Call the registered callback if exists
    if (this.logoutCallback) {
      this.logoutCallback();
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
export default authService;