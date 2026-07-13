import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/**
 * Cross-platform alert. React Native's Alert.alert is a silent no-op on web,
 * so fall back to window.alert/window.confirm there.
 */
export const showAlert = (title: string, message?: string, buttons?: AlertButton[]): void => {
  if (Platform.OS === 'web') {
    const text = message ? `${title}\n\n${message}` : title;
    if (buttons && buttons.length > 1) {
      const cancelButton = buttons.find((b) => b.style === 'cancel');
      const confirmButton = buttons.find((b) => b !== cancelButton) ?? buttons[0];
      // eslint-disable-next-line no-alert
      if (window.confirm(text)) {
        confirmButton.onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
    } else {
      // eslint-disable-next-line no-alert
      window.alert(text);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
