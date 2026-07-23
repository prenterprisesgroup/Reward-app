import { create } from 'zustand';
import { ToastType } from '../components/common/ui/Toast';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

export const useGlobalToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  showToast: (message: string, type: ToastType = 'info') => {
    set({ visible: true, message, type });
  },
  hideToast: () => {
    set({ visible: false });
  }
}));
