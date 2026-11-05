import { create } from 'zustand'

export const useUI = create((set) => ({
  ready: false, // preloader finished
  setReady: (ready) => set({ ready }),
  selectedPart: null,
  setSelectedPart: (selectedPart) => set({ selectedPart }),
  toast: null,
  showToast: (toast) => {
    set({ toast: { ...toast, id: Date.now() } })
  },
  clearToast: () => set({ toast: null }),
}))
