// src/stores/alertStore.ts

import { create } from 'zustand';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  isVisible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
  showAlert: (title: string, message: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isVisible: false,
  title: '',
  message: '',
  buttons: [],
  showAlert: (title, message, buttons = [{ text: 'OK' }]) => {
    set({ isVisible: true, title, message, buttons });
  },
  hideAlert: () => {
    set({ isVisible: false });
  },
}));