import { create } from 'zustand';

export interface ModalConfig {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' vuelve el botón confirmar rojo */
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ModalStore {
  isVisible: boolean;
  config: ModalConfig | null;
  /** Abre el modal con la configuración dada */
  confirm: (cfg: ModalConfig) => void;
  /** Cierra sin ejecutar ninguna acción */
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isVisible: false,
  config: null,
  confirm: (cfg) => set({ isVisible: true, config: cfg }),
  close: () => set({ isVisible: false, config: null }),
}));